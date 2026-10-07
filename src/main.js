// 메인 애플리케이션 진입점 및 컨트롤러
import confetti from 'canvas-confetti';
import { soundManager } from './soundEffects.js';
import { CharacterProcessor } from './characterProcessor.js';
import { haesolChildren, formatKoreanParticle } from './haesolChildren.js';
import { StoryEngine } from './storyEngine.js';
import { BookRenderer } from './bookRenderer.js';
import { ExportService } from './exportService.js';
import { TtsService } from './ttsService.js';
import { bookStorage } from './bookStorage.js';

class PictureBookApp {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 6;
    this.selectedChild = null;

    // 캐릭터 상태
    this.character = {
      rawImage: null,
      transparentCanvas: null,
      name: '강시아',
      description: '#사랑스러운 #해솔반',
      threshold: 45, // 기본 감도: 45% (도화지/배경 자동 제거 최적)
      isPhoto: false, // 배경 제거 다이컷 스티커 모드
      shapeMode: 'rounded',
      fillBodyWhite: true,
      activeTool: null
    };

    // 프리뷰 캔버스 좌표 매핑용
    this.previewRenderBounds = null;

    // 이야기 데이터 상태
    this.story = {
      mode: 'qa', // 'qa' | 'free'
      qa: {
        where: '무지개 피어난 초록 숲속',
        who: '노래하는 아기 새',
        event: '알록달록 예쁜 풍선이 두둥실 날아올랐어요',
        action: '폴짝폴짝 뛰어가 두 손을 꼬옥 잡아주었어요',
        ending: '모두 함께 하하호호 웃으며 행복하게 집으로 돌아왔어요'
      },
      freeText: '',
      title: '하늘을 나는 시아의 신나는 모험',
      author: '해솔반 강시아와 가족'
    };

    // 완성된 그림책 상태
    this.book = {
      storyData: null,
      renderedPages: [], // [ { pageNumber, isCover, title, text, canvas, dataUrl } ]
      currentPageIndex: 0
    };

    // 음성 TTS 서비스 (Qwen3-TTS AI 복제 & 브라우저 음성 구연 통합)
    this.ttsService = new TtsService();
    this.recordedVoiceBlob = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.speechSynth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.isSpeaking = false;

    // 환경설정
    this.settings = {
      geminiApiKey: localStorage.getItem('gemini_api_key') || ''
    };

    // 장면별 개별 사진 저장소
    this.pageCustomImages = {};

    // 다중 사진 관리 (최대 5장면 + 표지 매핑)
    this.uploadedPhotos = [];
    this.selectedPhotoIndex = 0;
    this.currentSavedBookId = null;
  }

  async init() {
    this.cacheDomElements();
    this.bindEvents();
    await bookStorage.init();
    this.renderChildrenGrid();

    // 초기 해솔반 첫 번째 원아(강시아) 기본 세팅 (스텝은 1 유지)
    if (haesolChildren.length > 0) {
      await this.selectChildProfile(haesolChildren[0], false);
      this.currentSavedBookId = null;
    }

    this.updateAiEngineStatusUI();
    this.updateStepUI();
    this.setupTtsService();
    this.updateVoiceCloneBadge();
    this.updateLibraryTotalBadge();
  }

  updateAiEngineStatusUI() {
    const hasKey = this.settings.geminiApiKey && this.settings.geminiApiKey.trim().length > 10;
    if (this.aiEngineBadgeTitle && this.aiEngineBadgeDesc) {
      if (hasKey) {
        this.aiEngineBadgeTitle.textContent = '🤖 AI 동화 스토리 엔진: Google Gemini Pro 활성화됨 ✨';
        this.aiEngineBadgeDesc.textContent = '* 최신 Gemini Pro가 직접 작성하신 이야기의 흐름과 감정을 분석하여 동화를 구성합니다.';
        this.aiEngineBadgeTitle.style.color = '#2B6CB0';
        this.aiEngineBadgeDesc.style.color = '#3182CE';
        if (this.aiEngineStatusCard) {
          this.aiEngineStatusCard.style.background = '#EBF8FF';
          this.aiEngineStatusCard.style.borderColor = '#63B3ED';
        }
      } else {
        this.aiEngineBadgeTitle.textContent = '🤖 AI 동화 스토리 엔진: 내장 스마트 분석 모드 (무료/오프라인)';
        this.aiEngineBadgeDesc.textContent = '* API 키 없이도 100% 무료로 5개 장면의 완벽한 그림책이 즉시 만들어집니다!';
        this.aiEngineBadgeTitle.style.color = '#22543D';
        this.aiEngineBadgeDesc.style.color = '#2F855A';
        if (this.aiEngineStatusCard) {
          this.aiEngineStatusCard.style.background = '#F0FFF4';
          this.aiEngineStatusCard.style.borderColor = '#68D391';
        }
      }
    }
  }

  cacheDomElements() {
    // 헤더 및 모달
    this.btnHomeLogo = document.getElementById('btn-home-logo');
    this.btnToggleSound = document.getElementById('btn-toggle-sound');
    this.soundIcon = document.getElementById('sound-icon');
    this.soundLabel = document.getElementById('sound-label');
    this.btnOpenGuide = document.getElementById('btn-open-guide');
    this.guideModal = document.getElementById('guide-modal');
    this.btnCloseGuide = document.getElementById('btn-close-guide');
    this.btnOpenSettings = document.getElementById('btn-open-settings');
    this.settingsModal = document.getElementById('settings-modal');
    this.btnCloseSettings = document.getElementById('btn-close-settings');
    this.settingGeminiKey = document.getElementById('setting-gemini-key');
    this.btnCancelSettings = document.getElementById('btn-cancel-settings');
    this.btnSaveSettings = document.getElementById('btn-save-settings');
    this.btnTestApiKey = document.getElementById('btn-test-api-key');
    this.btnClearApiKey = document.getElementById('btn-clear-api-key');
    this.apiTestStatus = document.getElementById('api-test-status');
    this.btnQuickApiSettings = document.getElementById('btn-quick-api-settings');
    this.aiEngineStatusCard = document.getElementById('ai-engine-status-card');
    this.aiEngineBadgeTitle = document.getElementById('ai-engine-badge-title');
    this.aiEngineBadgeDesc = document.getElementById('ai-engine-badge-desc');

    // 스텝 진행 바 (1~6단계)
    this.stepProgressFill = document.getElementById('step-progress-fill');
    this.stepButtons = [
      document.getElementById('step-btn-1'),
      document.getElementById('step-btn-2'),
      document.getElementById('step-btn-3'),
      document.getElementById('step-btn-4'),
      document.getElementById('step-btn-5'),
      document.getElementById('step-btn-6')
    ];

    // 스텝 1 (시작)
    this.btnStartMaking = document.getElementById('btn-start-making');

    // 스텝 2 (해솔반 친구 선택)
    this.childrenGridContainer = document.getElementById('children-grid-container');
    this.childrenSearchInput = document.getElementById('children-search-input');
    this.btnSkipToCustomUpload = document.getElementById('btn-skip-to-custom-upload');
    this.btnBackToStep1 = document.getElementById('btn-back-to-step1');

    // 스텝 3 (등장인물 스튜디오)
    this.dropzone = document.getElementById('character-dropzone');
    this.fileInput = document.getElementById('character-file-input');
    this.cameraInput = document.getElementById('character-camera-input');
    this.btnTriggerUpload = document.getElementById('btn-trigger-upload');
    this.btnTriggerCamera = document.getElementById('btn-trigger-camera');
    this.previewCanvas = document.getElementById('character-preview-canvas');
    this.inputCharName = document.getElementById('input-char-name');
    this.inputCharDesc = document.getElementById('input-char-desc');
    this.badgeCharName = document.getElementById('badge-char-name');
    this.btnBackToStep2 = document.getElementById('btn-back-to-step2');
    this.btnToStep4 = document.getElementById('btn-to-step-4');

    // 스텝 4 (우리 이야기)
    this.tabModeQa = document.getElementById('tab-mode-qa');
    this.tabModeFree = document.getElementById('tab-mode-free');
    this.qaContainer = document.getElementById('qa-mode-container');
    this.freeContainer = document.getElementById('free-mode-container');
    this.inputQaWhere = document.getElementById('qa-input-where');
    this.inputQaWho = document.getElementById('qa-input-who');
    this.inputQaEvent = document.getElementById('qa-input-event');
    this.inputQaAction = document.getElementById('qa-input-action');
    this.inputQaEnding = document.getElementById('qa-input-ending');
    this.inputFreeStory = document.getElementById('input-free-story');
    this.inputBookTitle = document.getElementById('input-book-title');
    this.inputBookAuthor = document.getElementById('input-book-author');
    this.btnBackToStep3 = document.getElementById('btn-back-to-step3');
    this.btnGenerateBook = document.getElementById('btn-generate-book');

    // 스텝 5 (마법 생성 로딩)
    this.loadingStatusText = document.getElementById('loading-status-text');
    this.magicProgressFill = document.getElementById('magic-progress-fill');

    // 스텝 6 (그림책 읽기 뷰어)
    this.viewerTitle = document.getElementById('viewer-book-title-display');
    this.viewerAuthor = document.getElementById('viewer-book-author-display');
    this.activePageCanvas = document.getElementById('active-page-canvas');
    this.btnPrevPage = document.getElementById('btn-prev-page');
    this.btnNextPage = document.getElementById('btn-next-page');
    this.thumbnailStrip = document.getElementById('page-thumbnail-strip');
    this.btnTtsSpeak = document.getElementById('btn-tts-speak');
    this.ttsIcon = document.getElementById('tts-icon');
    this.ttsLabel = document.getElementById('tts-label');
    this.btnEditTextDialog = document.getElementById('btn-edit-text-dialog');
    this.btnDownloadImage = document.getElementById('btn-download-image');
    this.btnSavePdf = document.getElementById('btn-save-pdf');
    this.btnPrintBook = document.getElementById('btn-print-book');
    this.btnRestartMaking = document.getElementById('btn-restart-making');
    this.btnReadFromStart = document.getElementById('btn-read-from-start');
    this.btnPickAnotherChild = document.getElementById('btn-pick-another-child');

    // 텍스트 수정 모달
    this.editTextModal = document.getElementById('edit-text-modal');
    this.modalEditTextarea = document.getElementById('modal-edit-textarea');
    this.btnCancelEdit = document.getElementById('btn-cancel-edit');
    this.btnSaveEdit = document.getElementById('btn-save-edit');

    // 장면별 개별 사진 변경
    this.btnChangePagePhoto = document.getElementById('btn-change-page-photo');
    this.pagePhotoInput = document.getElementById('page-photo-input');

    // Qwen3-TTS 내 목소리 복제 모달 및 컨트롤
    this.btnOpenVoiceModal = document.getElementById('btn-open-voice-modal');
    this.btnHeaderVoiceClone = document.getElementById('btn-header-voice-clone');
    this.voiceCloneBadge = document.getElementById('voice-clone-badge');
    this.voiceCloneModal = document.getElementById('voice-clone-modal');
    this.btnCloseVoiceModalX = document.getElementById('btn-close-voice-modal-x');
    this.btnCloseVoiceModal = document.getElementById('btn-close-voice-modal');
    this.ttsServerUrlInput = document.getElementById('tts-server-url');
    this.btnTestTtsServer = document.getElementById('btn-test-tts-server');
    this.ttsServerStatus = document.getElementById('tts-server-status');
    this.btnStartRecord = document.getElementById('btn-start-record');
    this.btnStopRecord = document.getElementById('btn-stop-record');
    this.voiceFileInput = document.getElementById('voice-file-input');
    this.recordStatusText = document.getElementById('record-status-text');
    this.voicePreviewAudio = document.getElementById('voice-preview-audio');
    this.btnSubmitRegisterVoice = document.getElementById('btn-submit-register-voice');
    this.btnClearRegisteredVoice = document.getElementById('btn-clear-registered-voice');
    this.voiceRegistrationStatus = document.getElementById('voice-registration-status');

    // 스텝 3 다중 사진 슬롯
    this.multiPhotoContainer = document.getElementById('multi-photo-container');
    this.multiPhotoCountBadge = document.getElementById('multi-photo-count-badge');
    this.photoSlotsGrid = document.getElementById('photo-slots-grid');

    // 스텝 6 보관함 저장 버튼 및 모달
    this.btnSaveToLibrary = document.getElementById('btn-save-to-library');
    this.btnOpenLibraryModal = document.getElementById('btn-open-library-modal');
    this.libraryTotalBadge = document.getElementById('library-total-badge');
    this.libraryModal = document.getElementById('library-modal');
    this.btnCloseLibraryModal = document.getElementById('btn-close-library-modal');
    this.libraryBooksList = document.getElementById('library-books-list');
    this.libraryModalTitle = document.getElementById('library-modal-title');
  }

  bindEvents() {
    // 효과음 토글
    this.btnToggleSound.addEventListener('click', () => {
      const isEnabled = soundManager.toggle();
      this.soundIcon.textContent = isEnabled ? '🔊' : '🔇';
      this.soundLabel.textContent = isEnabled ? '소리 켬' : '소리 끔';
      if (isEnabled) soundManager.playPop();
    });

    // 가이드 모달
    this.btnOpenGuide.addEventListener('click', () => {
      soundManager.playPop();
      this.guideModal.classList.add('open');
    });
    this.btnCloseGuide.addEventListener('click', () => {
      this.guideModal.classList.remove('open');
    });

    // 설정 모달
    // 설정 모달
    const openSettingsModal = () => {
      soundManager.playPop();
      this.settingGeminiKey.value = this.settings.geminiApiKey;
      if (this.apiTestStatus) this.apiTestStatus.style.display = 'none';
      this.settingsModal.classList.add('open');
    };

    this.btnOpenSettings.addEventListener('click', openSettingsModal);
    if (this.btnQuickApiSettings) {
      this.btnQuickApiSettings.addEventListener('click', openSettingsModal);
    }

    const closeSettingsModal = () => {
      this.settingsModal.classList.remove('open');
    };

    if (this.btnCloseSettings) {
      this.btnCloseSettings.addEventListener('click', closeSettingsModal);
    }
    if (this.btnCancelSettings) {
      this.btnCancelSettings.addEventListener('click', closeSettingsModal);
    }

    if (this.btnSaveSettings) {
      this.btnSaveSettings.addEventListener('click', () => {
        this.settings.geminiApiKey = this.settingGeminiKey.value.trim();
        localStorage.setItem('gemini_api_key', this.settings.geminiApiKey);
        this.settingsModal.classList.remove('open');
        this.updateAiEngineStatusUI();
        soundManager.playMagic();
        alert('Gemini API 설정이 저장되었습니다!');
      });
    }

    if (this.btnClearApiKey) {
      this.btnClearApiKey.addEventListener('click', () => {
        soundManager.playPop();
        this.settingGeminiKey.value = '';
        this.settings.geminiApiKey = '';
        localStorage.removeItem('gemini_api_key');
        if (this.apiTestStatus) {
          this.apiTestStatus.style.display = 'block';
          this.apiTestStatus.style.color = '#718096';
          this.apiTestStatus.textContent = 'API 키가 삭제되었습니다. 기본 내장 엔진으로 동작합니다.';
        }
        this.updateAiEngineStatusUI();
      });
    }

    if (this.btnTestApiKey) {
      this.btnTestApiKey.addEventListener('click', async () => {
        soundManager.playPop();
        const testKey = this.settingGeminiKey.value.trim();
        if (!testKey) {
          alert('테스트할 API 키를 먼저 입력해 주세요.');
          return;
        }

        if (this.apiTestStatus) {
          this.apiTestStatus.style.display = 'block';
          this.apiTestStatus.style.color = '#3182CE';
          this.apiTestStatus.textContent = '⏳ Google Gemini 서버에 연결 테스트 중...';
        }

        const res = await StoryEngine.testApiKey(testKey);
        if (this.apiTestStatus) {
          this.apiTestStatus.style.color = res.success ? '#22543D' : '#E53E3E';
          this.apiTestStatus.textContent = res.message;
        }
        if (res.success) {
          soundManager.playMagic();
        }
      });
    }

    // 상단 로고 클릭 -> 첫 화면으로 (새 책 시작을 위해 보관함 ID 초기화)
    this.btnHomeLogo.addEventListener('click', () => {
      soundManager.playPop();
      this.currentSavedBookId = null;
      this.goToStep(1);
    });

    // 상단 스텝 바 클릭 탐색
    this.stepButtons.forEach((btn, idx) => {
      if (btn) {
        btn.addEventListener('click', () => {
          const stepNum = idx + 1;
          if (this.currentStep === 5) return; // 로딩 중 이동 제한
          if (stepNum <= this.currentStep || this.book.renderedPages.length > 0) {
            soundManager.playPop();
            this.goToStep(stepNum);
          }
        });
      }
    });

    // 스텝 1: [그림책 만들기 시작!] 버튼 -> 스텝 2(해솔반 친구 선택)
    this.btnStartMaking.addEventListener('click', () => {
      soundManager.playPop();
      this.currentSavedBookId = null;
      this.goToStep(2);
    });

    // 스텝 2: 해솔반 원아 검색 입력
    if (this.childrenSearchInput) {
      this.childrenSearchInput.addEventListener('input', (e) => {
        this.renderChildrenGrid(e.target.value);
      });
    }

    // 스텝 2: 첫 화면으로 돌아가기
    if (this.btnBackToStep1) {
      this.btnBackToStep1.addEventListener('click', () => {
        soundManager.playPop();
        this.currentSavedBookId = null;
        this.goToStep(1);
      });
    }

    // 스텝 2: 다른 사진이나 손그림 직접 올리기로 건너뛰기
    if (this.btnSkipToCustomUpload) {
      this.btnSkipToCustomUpload.addEventListener('click', () => {
        soundManager.playPop();
        this.currentSavedBookId = null;
        this.goToStep(3);
      });
    }

    // 스텝 3: 파일 업로드 및 카메라
    this.btnTriggerUpload.addEventListener('click', (e) => {
      e.stopPropagation();
      this.fileInput.click();
    });
    this.btnTriggerCamera.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cameraInput.click();
    });
    this.dropzone.addEventListener('click', () => {
      this.fileInput.click();
    });

    const handleMultipleFiles = async (files) => {
      if (!files || files.length === 0) return;
      const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (validFiles.length === 0) return;

      if (this.multiPhotoCountBadge) {
        this.multiPhotoCountBadge.textContent = '⏳ AI 배경 지우는 중...';
        this.multiPhotoCountBadge.style.background = '#3182CE';
      }

      // 1. 즉시 모든 이미지 읽어 화면에 표시 (0.05초 즉각 반응)
      const newItems = [];
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const dataUrl = await new Promise((res) => {
          const reader = new FileReader();
          reader.onload = ev => res(ev.target.result);
          reader.readAsDataURL(file);
        });
        const img = await CharacterProcessor.loadImage(dataUrl);
        const tempCanvas = CharacterProcessor.removePaperBackground(img, 45, false, 'rounded');
        const slotIndex = this.uploadedPhotos.length + newItems.length;
        const initialName = this.extractFriendlyName(file.name, slotIndex);
        const hasProtagonist = this.uploadedPhotos.some(p => p.isProtagonist) || newItems.some(p => p.isProtagonist);
        const item = {
          id: 'photo_' + Date.now() + '_' + i,
          rawImage: img,
          transparentCanvas: tempCanvas,
          name: initialName,
          label: this.getSlotLabel(slotIndex),
          isProtagonist: !hasProtagonist
        };
        newItems.push(item);
      }

      const startIndex = this.uploadedPhotos.length;
      this.uploadedPhotos.push(...newItems);
      this.selectedPhotoIndex = startIndex;
      const proto = this.uploadedPhotos.find(p => p.isProtagonist) || this.uploadedPhotos[0];
      if (proto) {
        this.character.rawImage = proto.rawImage;
        this.character.transparentCanvas = proto.transparentCanvas;
        this.character.name = proto.name || this.character.name;
        if (this.badgeCharName) this.badgeCharName.textContent = this.character.name;
        this.updateDefaultTitles();
      }
      this.character.isPhoto = false;
      this.renderPreviewCanvas();
      this.renderPhotoSlots();
      this.updateWhoRecommendationChips();
      soundManager.playPop();

      // 2. 백그라운드에서 AI 누끼(0.24초 초고속) 실시간 교체
      const tasks = newItems.map(async (item) => {
        try {
          const aiCanvas = await CharacterProcessor.removeBackgroundWithAI(item.rawImage, this.ttsService.serverUrl);
          if (aiCanvas) {
            item.transparentCanvas = aiCanvas;
            if (this.uploadedPhotos[this.selectedPhotoIndex] === item) {
              this.character.transparentCanvas = aiCanvas;
              this.renderPreviewCanvas();
            }
            this.renderPhotoSlots();
          }
        } catch (err) {
          console.warn('AI 배경 지우기 실패:', err);
        }
      });

      await Promise.all(tasks);

      if (this.multiPhotoCountBadge) {
        this.multiPhotoCountBadge.textContent = `${this.uploadedPhotos.length}장 등록됨`;
        this.multiPhotoCountBadge.style.background = this.uploadedPhotos.length > 1 ? '#38A169' : 'var(--primary-coral)';
      }
      soundManager.playMagic();
    };

    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleMultipleFiles(e.target.files);
        e.target.value = '';
      }
    });
    this.cameraInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleMultipleFiles(e.target.files);
        e.target.value = '';
      }
    });

    // 드래그 앤 드롭
    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('drag-over');
    });
    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('drag-over');
    });
    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleMultipleFiles(e.dataTransfer.files);
      }
    });

    // 캐릭터 이름 및 설명 변경 (inputCharName이 있는 경우만)
    if (this.inputCharName) {
      this.inputCharName.addEventListener('input', (e) => {
        this.character.name = e.target.value.trim() || '우리 친구';
        this.badgeCharName.textContent = this.character.name;
        const proto = this.uploadedPhotos.find(p => p.isProtagonist) || this.uploadedPhotos[0];
        if (proto) {
          proto.name = this.character.name;
        }
        this.updateDefaultTitles();
        this.renderPhotoSlots();
      });
    }
    if (this.inputCharDesc) {
      this.inputCharDesc.addEventListener('input', (e) => {
        this.character.description = e.target.value.trim();
      });
    }

    // 성격 태그 칩 클릭
    document.querySelectorAll('.tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        soundManager.playPop();
        const tagText = chip.getAttribute('data-tag');
        const current = this.inputCharDesc.value;
        this.inputCharDesc.value = current ? `${current}, ${tagText}` : tagText;
        this.character.description = this.inputCharDesc.value;
      });
    });

    // 스텝 3 -> 2 (친구 다시 선택), 3 -> 4 (우리 이야기 만들기)
    if (this.btnBackToStep2) {
      this.btnBackToStep2.addEventListener('click', () => {
        soundManager.playPop();
        this.goToStep(2);
      });
    }
    if (this.btnToStep4) {
      this.btnToStep4.addEventListener('click', () => {
        soundManager.playPop();
        this.goToStep(4);
      });
    }

    // 스텝 4: 모드 전환 탭 (문답 vs 자유)
    this.tabModeQa.addEventListener('click', () => {
      soundManager.playPop();
      this.story.mode = 'qa';
      this.tabModeQa.classList.add('active');
      this.tabModeFree.classList.remove('active');
      this.qaContainer.style.display = 'flex';
      this.freeContainer.style.display = 'none';
    });
    this.tabModeFree.addEventListener('click', () => {
      soundManager.playPop();
      this.story.mode = 'free';
      this.tabModeFree.classList.add('active');
      this.tabModeQa.classList.remove('active');
      this.qaContainer.style.display = 'none';
      this.freeContainer.style.display = 'block';
    });

    // 문답 원터치 추천 선택지 칩 바인딩
    document.querySelectorAll('.choice-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        soundManager.playPop();
        const targetId = chip.getAttribute('data-target');
        const val = chip.getAttribute('data-val');
        const targetInput = document.getElementById(targetId);
        if (targetInput) {
          targetInput.value = val;
          this.syncStoryInputs();
        }
      });
    });

    // 입력 필드 변경 동기화
    [this.inputQaWhere, this.inputQaWho, this.inputQaEvent, this.inputQaAction, this.inputQaEnding, this.inputFreeStory, this.inputBookTitle, this.inputBookAuthor].forEach(el => {
      if (el) el.addEventListener('input', () => this.syncStoryInputs());
    });

    // 스텝 4 -> 3 (주인공 확인으로)
    if (this.btnBackToStep3) {
      this.btnBackToStep3.addEventListener('click', () => {
        soundManager.playPop();
        this.goToStep(3);
      });
    }

    // 그림책 생성 트리거!
    this.btnGenerateBook.addEventListener('click', () => {
      soundManager.playPop();
      this.startBookGeneration();
    });

    // 뷰어 페이지 넘김
    this.btnPrevPage.addEventListener('click', () => {
      this.navigatePage(-1);
    });
    this.btnNextPage.addEventListener('click', () => {
      this.navigatePage(1);
    });

    // 모바일 터치 좌우 스와이프로 책장 넘기기 (Touch Swipe)
    let touchStartX = 0;
    let touchStartY = 0;
    const stageWrapper = document.getElementById('book-display-wrapper');
    if (stageWrapper) {
      stageWrapper.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      stageWrapper.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length === 1) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          // 가로 스와이프 판정 (최소 40px, 세로 이동보다 가로 이동이 명확할 때)
          if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
            if (deltaX < 0) {
              this.navigatePage(1); // 왼쪽으로 밀기 -> 다음 장
            } else {
              this.navigatePage(-1); // 오른쪽으로 밀기 -> 이전 장
            }
          }
        }
      }, { passive: true });
    }

    // 키보드 좌우 화살표로도 페이지 넘김 지원
    window.addEventListener('keydown', (e) => {
      if (this.currentStep === 6 && !this.editTextModal.classList.contains('open')) {
        if (e.key === 'ArrowLeft') this.navigatePage(-1);
        if (e.key === 'ArrowRight') this.navigatePage(1);
      }
    });

    // TTS 동화 구연 읽어주기
    this.btnTtsSpeak.addEventListener('click', () => {
      this.toggleSpeech();
    });

    // 이야기 텍스트 인라인 수정 다이얼로그
    this.btnEditTextDialog.addEventListener('click', () => {
      soundManager.playPop();
      const currentPage = this.book.renderedPages[this.book.currentPageIndex];
      if (!currentPage) return;
      this.modalEditTextarea.value = currentPage.text;
      this.editTextModal.classList.add('open');
    });
    this.btnCancelEdit.addEventListener('click', () => {
      this.editTextModal.classList.remove('open');
    });
    this.btnSaveEdit.addEventListener('click', () => {
      const newText = this.modalEditTextarea.value.trim();
      if (newText) {
        this.updateCurrentPageText(newText);
      }
      this.editTextModal.classList.remove('open');
      soundManager.playMagic();
    });

    // 장면별 사진 바꾸기 이벤트
    this.btnChangePagePhoto.addEventListener('click', () => {
      soundManager.playPop();
      this.pagePhotoInput.value = '';
      this.pagePhotoInput.click();
    });

    this.pagePhotoInput.addEventListener('change', async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const img = await CharacterProcessor.loadImage(ev.target.result);
          // AI 배경 제거
          const processed = await CharacterProcessor.removeBackgroundWithAI(img, this.ttsService.serverUrl);
          const pageIdx = this.book.currentPageIndex;
          this.pageCustomImages[pageIdx] = processed;
          this.reRenderCurrentPage();
          soundManager.playMagic();
        };
        reader.readAsDataURL(file);
      }
    });

    // 그림책 보관함에 저장하기
    if (this.btnSaveToLibrary) {
      this.btnSaveToLibrary.addEventListener('click', () => {
        this.saveCurrentBookToLibrary();
      });
    }

    // 그림책 보관함 모달 열기/닫기
    if (this.btnOpenLibraryModal) {
      this.btnOpenLibraryModal.addEventListener('click', () => {
        this.openLibraryModal(null);
      });
    }
    if (this.btnCloseLibraryModal) {
      this.btnCloseLibraryModal.addEventListener('click', () => {
        this.closeLibraryModal();
      });
    }
    if (this.libraryModal) {
      this.libraryModal.addEventListener('click', (e) => {
        if (e.target === this.libraryModal) this.closeLibraryModal();
      });
    }

    // 내보내기 버튼들
    this.btnDownloadImage.addEventListener('click', () => {
      soundManager.playPop();
      const page = this.book.renderedPages[this.book.currentPageIndex];
      ExportService.downloadPageImage(page, this.story.title);
    });

    this.btnSavePdf.addEventListener('click', async () => {
      soundManager.playMagic();
      await ExportService.saveAsPDF(this.book.renderedPages, this.story.title);
    });

    this.btnPrintBook.addEventListener('click', () => {
      soundManager.playPop();
      ExportService.printBook(this.book.renderedPages);
    });

    // 처음부터 다시 만들기 (보관함 ID 초기화하여 새 책으로 생성)
    this.btnRestartMaking.addEventListener('click', () => {
      if (confirm('처음부터 새로운 그림책을 만드시겠어요?')) {
        soundManager.playPop();
        this.currentSavedBookId = null;
        this.goToStep(1);
      }
    });

    // 뷰어에서 다른 해솔반 친구 책 만들기 바로가기 (보관함 ID 초기화)
    if (this.btnPickAnotherChild) {
      this.btnPickAnotherChild.addEventListener('click', () => {
        soundManager.playPop();
        this.currentSavedBookId = null;
        this.goToStep(2);
      });
    }

    // 표지부터 다시 읽기
    this.btnReadFromStart.addEventListener('click', () => {
      soundManager.playPageFlip();
      this.showPage(0);
    });

    // ==========================================
    // Qwen3-TTS 내 목소리 복제 이벤트 바인딩
    // ==========================================
    if (this.voiceCloneModal) {
      const openVoiceModal = () => {
        soundManager.playPop();
        if (this.ttsServerUrlInput) {
          this.ttsServerUrlInput.value = this.ttsService.serverUrl || 'http://127.0.0.1:8000';
        }
        this.voiceCloneModal.classList.add('open');
      };

      if (this.btnOpenVoiceModal) this.btnOpenVoiceModal.addEventListener('click', openVoiceModal);
      if (this.btnHeaderVoiceClone) this.btnHeaderVoiceClone.addEventListener('click', openVoiceModal);

      const closeVoiceModal = () => {
        this.voiceCloneModal.classList.remove('open');
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      };

      if (this.btnCloseVoiceModalX) this.btnCloseVoiceModalX.addEventListener('click', closeVoiceModal);
      if (this.btnCloseVoiceModal) this.btnCloseVoiceModal.addEventListener('click', closeVoiceModal);
      this.voiceCloneModal.addEventListener('click', (e) => {
        if (e.target === this.voiceCloneModal) closeVoiceModal();
      });

      // 서버 연결 테스트
      if (this.btnTestTtsServer && this.ttsServerUrlInput && this.ttsServerStatus) {
        this.btnTestTtsServer.addEventListener('click', async () => {
          const url = this.ttsServerUrlInput.value.trim();
          this.ttsServerStatus.textContent = '⏳ 서버 연결 확인 중...';
          this.ttsServerStatus.style.color = '#3182CE';
          const res = await this.ttsService.testServer(url);
          this.ttsServerStatus.textContent = res.message;
          this.ttsServerStatus.style.color = res.success ? '#22543D' : '#C53030';
          if (res.success) {
            this.ttsService.setServerUrl(url);
            soundManager.playMagic();
          }
        });
      }

      // 마이크 녹음 시작/중지 (MediaRecorder API)
      if (this.btnStartRecord && this.btnStopRecord) {
        this.btnStartRecord.addEventListener('click', async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recordedChunks = [];
            this.mediaRecorder = new MediaRecorder(stream);

            this.mediaRecorder.ondataavailable = (e) => {
              if (e.data.size > 0) this.recordedChunks.push(e.data);
            };

            this.mediaRecorder.onstop = () => {
              stream.getTracks().forEach(track => track.stop());
              this.recordedVoiceBlob = new Blob(this.recordedChunks, { type: 'audio/wav' });
              if (this.voicePreviewAudio) {
                this.voicePreviewAudio.src = URL.createObjectURL(this.recordedVoiceBlob);
                this.voicePreviewAudio.style.display = 'block';
              }
              if (this.recordStatusText) {
                this.recordStatusText.textContent = '✅ 녹음 완료! 아래에서 미리 듣거나 등록하세요.';
                this.recordStatusText.style.color = '#2F855A';
              }
              soundManager.playPop();
            };

            this.mediaRecorder.start();
            this.btnStartRecord.style.display = 'none';
            this.btnStopRecord.style.display = 'inline-block';
            if (this.recordStatusText) {
              this.recordStatusText.textContent = '🔴 녹음 중... (대본을 3~10초간 읽은 후 중지 버튼을 누르세요)';
              this.recordStatusText.style.color = '#E53E3E';
            }
          } catch (err) {
            alert('마이크 접근 권한이 필요합니다: ' + err.message);
          }
        });

        this.btnStopRecord.addEventListener('click', () => {
          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.btnStopRecord.style.display = 'none';
            this.btnStartRecord.style.display = 'inline-block';
          }
        });
      }

      // 오디오 파일 직접 첨부
      if (this.voiceFileInput) {
        this.voiceFileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            this.recordedVoiceBlob = file;
            if (this.voicePreviewAudio) {
              this.voicePreviewAudio.src = URL.createObjectURL(file);
              this.voicePreviewAudio.style.display = 'block';
            }
            if (this.recordStatusText) {
              this.recordStatusText.textContent = `📁 파일 선택됨: ${file.name}`;
              this.recordStatusText.style.color = '#2B6CB0';
            }
            soundManager.playPop();
          }
        });
      }

      // 목소리 AI 등록 제출
      if (this.btnSubmitRegisterVoice && this.voiceRegistrationStatus) {
        this.btnSubmitRegisterVoice.addEventListener('click', async () => {
          if (!this.recordedVoiceBlob) {
            alert('먼저 3초 이상 마이크로 녹음하거나 오디오 파일을 선택해 주세요!');
            return;
          }

          const serverUrl = (this.ttsServerUrlInput.value || '').trim();
          this.ttsService.setServerUrl(serverUrl);

          this.voiceRegistrationStatus.style.display = 'block';
          this.voiceRegistrationStatus.textContent = '⏳ Qwen3-TTS 서버로 목소리를 전송하고 등록하는 중입니다...';
          this.voiceRegistrationStatus.style.color = '#3182CE';

          try {
            const res = await this.ttsService.registerVoice(this.recordedVoiceBlob);
            this.voiceRegistrationStatus.textContent = `🎉 ${res.message || '목소리가 성공적으로 등록되었습니다!'}`;
            this.voiceRegistrationStatus.style.color = '#22543D';
            this.updateVoiceCloneBadge();
            soundManager.playMagic();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          } catch (err) {
            this.voiceRegistrationStatus.textContent = `❌ 등록 실패: ${err.message}`;
            this.voiceRegistrationStatus.style.color = '#C53030';
          }
        });
      }

      // 등록 음성 초기화
      if (this.btnClearRegisteredVoice) {
        this.btnClearRegisteredVoice.addEventListener('click', () => {
          if (confirm('등록된 내 목소리를 삭제하고 기본 브라우저 음성으로 전환하시겠습니까?')) {
            this.ttsService.clearVoice();
            this.recordedVoiceBlob = null;
            if (this.voicePreviewAudio) {
              this.voicePreviewAudio.src = '';
              this.voicePreviewAudio.style.display = 'none';
            }
            if (this.recordStatusText) this.recordStatusText.textContent = '녹음 대기 중';
            if (this.voiceRegistrationStatus) this.voiceRegistrationStatus.style.display = 'none';
            this.updateVoiceCloneBadge();
            soundManager.playPop();
          }
        });
      }
    }
  }

  /**
   * 해솔반 20명 원아 카드 그리드 동적 렌더링
   */
  renderChildrenGrid(filterText = '') {
    if (!this.childrenGridContainer) return;
    this.childrenGridContainer.innerHTML = '';

    const query = filterText.trim().toLowerCase();
    const filtered = haesolChildren.filter(c => {
      if (!query) return true;
      return c.name.toLowerCase().includes(query) || (c.tag && c.tag.toLowerCase().includes(query));
    });

    if (filtered.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.style.gridColumn = '1 / -1';
      emptyBox.style.padding = '40px 20px';
      emptyBox.style.textAlign = 'center';
      emptyBox.style.color = 'var(--text-muted)';
      emptyBox.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 10px;">🔍</div>
        <div style="font-size: 16px; font-weight: 700; color: var(--text-dark);">‘${filterText}’ 친구를 찾지 못했어요.</div>
        <div style="font-size: 13px; margin-top: 6px;">이름을 다시 한번 확인해 주시거나 다른 친구 이름을 검색해 보세요!</div>
      `;
      this.childrenGridContainer.appendChild(emptyBox);
      return;
    }

    filtered.forEach(child => {
      const isSelected = this.selectedChild && this.selectedChild.name === child.name;
      const card = document.createElement('div');
      card.className = `child-card ${isSelected ? 'selected' : ''}`;
      card.setAttribute('data-name', child.name);

      const imgSrc = child.photo || child.image;
      const tagText = child.tag || '#해솔반';

      // 보관된 그림책 권수 계산
      const savedBooks = this.getSavedBooks().filter(b => b.childName === child.name);
      const booksBadgeHtml = savedBooks.length > 0
        ? `<button type="button" class="child-books-count btn-open-child-library" data-name="${child.name}" title="${savedBooks.length}권의 완성된 그림책 보기" style="cursor: pointer; border: none;">📚 ${savedBooks.length}권</button>`
        : '';

      card.innerHTML = `
        ${booksBadgeHtml}
        <div class="child-avatar-wrap">
          <img src="${imgSrc}" alt="${child.name}" class="child-avatar-img" loading="lazy" />
          <span class="child-sparkle-badge">⭐</span>
        </div>
        <div class="child-card-name">${child.name}</div>
        <div class="child-card-desc">${tagText}</div>
        <button type="button" class="btn-select-child">
          <span>${child.name} 주인공 선택</span> <span>💖</span>
        </button>
      `;

      // 보관함 배지 클릭 시에만 보관함 팝업 열기
      const badgeBtn = card.querySelector('.btn-open-child-library');
      if (badgeBtn) {
        badgeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openLibraryModal(child.name);
        });
      }

      // 프로필 카드 클릭 시 무조건 주인공으로 선택하고 3단계로 즉시 이동!
      card.addEventListener('click', () => {
        this.selectChildProfile(child, true);
      });

      this.childrenGridContainer.appendChild(card);
    });
  }

  /**
   * 특정 해솔반 원아 프로필 선택
   */
  async selectChildProfile(child, autoAdvance = true) {
    this.currentSavedBookId = null; // 새 책 작성을 위해 저장 ID 초기화
    this.selectedChild = child;
    this.character.name = child.name;
    this.character.description = child.tag || '#해솔반 사랑스러운 친구';
    this.character.isPhoto = false;
    this.character.shapeMode = 'rounded';
    this.character.threshold = 45;

    if (this.inputCharName) this.inputCharName.value = child.name;
    if (this.inputCharDesc) this.inputCharDesc.value = this.character.description;
    if (this.badgeCharName) this.badgeCharName.textContent = child.name;

    // 자연스러운 한국어 조사 적용
    const subj = formatKoreanParticle(child.name, 'subj');
    const poss = formatKoreanParticle(child.name, 'poss');

    if (this.inputBookTitle) {
      this.inputBookTitle.value = `하늘을 나는 ${poss} 신나는 모험`;
      this.story.title = this.inputBookTitle.value;
    }
    if (this.inputBookAuthor) {
      this.inputBookAuthor.value = `해솔반 ${child.name}와 가족`;
      this.story.author = this.inputBookAuthor.value;
    }

    if (this.inputQaAction) {
      this.inputQaAction.value = `두 손을 꼬옥 잡고 반갑게 인사했어요`;
      this.story.qa.action = this.inputQaAction.value;
    }
    if (this.inputQaEnding) {
      this.inputQaEnding.value = `모두 함께 하하호호 웃으며 행복하게 집으로 돌아왔어요`;
      this.story.qa.ending = this.inputQaEnding.value;
    }

    // 카드 그리드 선택 하이라이트 갱신
    const cards = document.querySelectorAll('.child-card');
    cards.forEach(card => {
      card.classList.toggle('selected', card.getAttribute('data-name') === child.name);
    });

    // 🚀 [초고속 반응]: 클릭 즉시 3단계로 화면 전환 (0초 지연)
    if (autoAdvance) {
      soundManager.playMagic();
      this.goToStep(3);
    }

    // 원아 사진 즉시 로드 및 표시
    const imgSrc = child.photo || child.image;
    try {
      const img = await CharacterProcessor.loadImage(imgSrc);
      this.character.rawImage = img;

      // 1. 빠른 로컬 모드로 캔버스 즉각 렌더링 (화면 공백 방지)
      this.reprocessCharacterImage();
      this.uploadedPhotos = [{
        id: 'photo_main',
        rawImage: img,
        transparentCanvas: this.character.transparentCanvas,
        name: child.name,
        label: '1장: 표지·출발',
        isProtagonist: true
      }];
      this.selectedPhotoIndex = 0;
      this.renderPhotoSlots();
      this.updateWhoRecommendationChips();
      this.renderPreviewCanvas();

      // 2. 백그라운드에서 고화질 AI 누끼 비동기 처리 (UI 멈춤 방지)
      CharacterProcessor.removeBackgroundWithAI(img, this.ttsService.serverUrl).then(aiCanvas => {
        if (aiCanvas && this.character.name === child.name) {
          this.character.transparentCanvas = aiCanvas;
          if (this.uploadedPhotos[0]) {
            this.uploadedPhotos[0].transparentCanvas = aiCanvas;
          }
          this.renderPhotoSlots();
          this.renderPreviewCanvas();
        }
      }).catch(err => {
        console.warn('AI 배경 제거 비동기 처리 실패(로컬 유지):', err);
      });
    } catch (err) {
      console.error('원아 사진 로드 실패:', err);
      this.reprocessCharacterImage();
    }
  }

  reprocessCharacterImage() {
    if (!this.character.rawImage) return;

    // 종이 배경 스마트 투명화 및 크롭
    const processed = CharacterProcessor.removePaperBackground(
      this.character.rawImage,
      this.character.threshold,
      this.character.isPhoto,
      this.character.shapeMode,
      {
        fillBodyWhite: this.character.fillBodyWhite,
        smartEnhance: true
      }
    );
    this.character.transparentCanvas = processed;
    this.renderPreviewCanvas();
  }

  renderPreviewCanvas() {
    if (!this.character.transparentCanvas) return;
    const processed = this.character.transparentCanvas;

    const ctx = this.previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

    const aspect = processed.width / processed.height;
    let pw = 200;
    let ph = 200 / aspect;
    if (ph > 220) {
      ph = 220;
      pw = ph * aspect;
    }
    if (pw > 250) {
      pw = 250;
      ph = pw / aspect;
    }
    const px = (this.previewCanvas.width - pw) / 2;
    const py = (this.previewCanvas.height - ph) / 2;

    this.previewRenderBounds = {
      px, py, pw, ph,
      origW: processed.width,
      origH: processed.height
    };

    CharacterProcessor.renderCharacterWithStickerEffect(
      ctx,
      processed,
      px,
      py,
      pw,
      ph,
      {
        withSticker: true,
        stickerColor: '#ffffff',
        stickerWidth: 7,
        shadowBlur: 12,
        isPhoto: false
      }
    );
  }

  updateDefaultTitles() {
    const protoName = this.character.name || '우리 친구';
    const poss = formatKoreanParticle(protoName, 'poss');
    this.inputBookTitle.value = `하늘을 나는 ${poss} 신나는 모험`;
    this.story.title = this.inputBookTitle.value;
    const creatorChild = (this.selectedChild && this.selectedChild.name) ? this.selectedChild.name : protoName;
    if (this.inputBookAuthor) {
      this.inputBookAuthor.value = `해솔반 ${creatorChild}와 가족`;
      this.story.author = this.inputBookAuthor.value;
    }
  }

  syncStoryInputs() {
    this.story.qa.where = this.inputQaWhere.value.trim();
    this.story.qa.who = this.inputQaWho.value.trim();
    this.story.qa.event = this.inputQaEvent.value.trim();
    this.story.qa.action = this.inputQaAction.value.trim();
    this.story.qa.ending = this.inputQaEnding.value.trim();
    this.story.freeText = this.inputFreeStory.value.trim();
    this.story.title = this.inputBookTitle.value.trim() || '나만의 그림책';
    const creatorChild = (this.selectedChild && this.selectedChild.name) ? this.selectedChild.name : (this.character.name || '우리 친구');
    this.story.author = this.inputBookAuthor.value.trim() || `해솔반 ${creatorChild}와 가족`;
  }

  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.totalSteps) return;
    if (stepNumber <= 2) {
      this.currentSavedBookId = null;
    }
    this.currentStep = stepNumber;
    if (stepNumber === 4) {
      this.updateWhoRecommendationChips();
      // 업로드된 등장인물(주인공이 아닌 사진)이 있고 질문2가 기본값이면 첫 번째 등장인물 이름으로 추천/입력
      const firstFriend = this.uploadedPhotos.find(p => !p.isProtagonist && p.name && p.name.trim());
      if (firstFriend) {
        const friendName = firstFriend.name.trim();
        if (friendName && (!this.inputQaWho.value || this.inputQaWho.value === '노래하는 아기 새')) {
          this.inputQaWho.value = friendName;
          this.story.qa.who = friendName;
        }
      }

      // 4번(행동), 5번(결말)에 남아있을 수 있는 이전 원아 이름(예: '김우진이가 ', '강시아가 ') 자동 삭제
      if (this.inputQaAction) {
        this.inputQaAction.value = this.inputQaAction.value
          .replace(/^[가-힣]{2,4}(이가|가|은|는|이)\s+/, '')
          .trim();
        if (!this.inputQaAction.value) {
          this.inputQaAction.value = '두 손을 꼬옥 잡고 반갑게 인사했어요';
        }
        this.story.qa.action = this.inputQaAction.value;
      }
      if (this.inputQaEnding) {
        this.inputQaEnding.value = this.inputQaEnding.value
          .replace(/^[가-힣]{2,4}(이가|가|은|는|이)\s+/, '')
          .trim();
        if (!this.inputQaEnding.value) {
          this.inputQaEnding.value = '모두 함께 하하호호 웃으며 행복하게 집으로 돌아왔어요';
        }
        this.story.qa.ending = this.inputQaEnding.value;
      }
    }
    this.updateStepUI();
  }

  updateStepUI() {
    // 패널 전환
    for (let i = 1; i <= this.totalSteps; i++) {
      const panel = document.getElementById(`step-${i}`);
      if (panel) {
        panel.classList.toggle('active', i === this.currentStep);
      }
    }

    // 스텝 인디케이터 갱신
    this.stepButtons.forEach((btn, idx) => {
      if (btn) {
        const stepIdx = idx + 1;
        btn.classList.toggle('active', stepIdx === this.currentStep);
        btn.classList.toggle('completed', stepIdx < this.currentStep);
      }
    });

    const progressPercent = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
    this.stepProgressFill.style.width = `${progressPercent}%`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * 그림책 생성 워크플로
   */
  async startBookGeneration() {
    try {
      this.syncStoryInputs();
      this.goToStep(5); // 5단계: 마법 생성 로딩

      // 1단계: 상상 모으기
      this.updateLoadingProgress(25, '어린이의 재미있는 상상을 동화 이야기로 엮는 중이에요...');
      await new Promise(r => setTimeout(r, 400));

      // 이야기 생성 (로컬 유아 엔진 또는 Gemini API)
      const creatorChild = (this.selectedChild && this.selectedChild.name) ? this.selectedChild.name : this.character.name;
      const storyData = await StoryEngine.generateStory({
        characterName: this.character.name,
        characterDesc: this.character.description,
        childName: creatorChild,
        protagonistName: this.character.name,
        mode: this.story.mode,
        qa: this.story.qa,
        freeText: this.story.freeText,
        customTitle: this.story.title,
        author: this.story.author,
        geminiApiKey: this.settings.geminiApiKey
      });
      storyData.childName = creatorChild;
      storyData.protagonistName = this.character.name;
      this.book.storyData = storyData;

      // 2단계: 그림 캐릭터 배경 합성
      this.updateLoadingProgress(60, '어린이의 소중한 그림을 동화 속 멋진 주인공으로 초대하고 있어요...');
      await new Promise(r => setTimeout(r, 400));

      // 3단계: 고화질 6개 페이지 캔버스 렌더링
      this.updateLoadingProgress(90, '무지개 마법 물감으로 그림책 표지와 책장을 완성하는 중이에요...');
      await new Promise(r => setTimeout(r, 150));

      // 주인공 사진 캔버스 동기화 (isProtagonist가 설정된 사진)
      const protoPhoto = this.uploadedPhotos.find(p => p.isProtagonist) || this.uploadedPhotos[0];
      if (protoPhoto && protoPhoto.transparentCanvas) {
        this.character.transparentCanvas = protoPhoto.transparentCanvas;
        this.character.name = protoPhoto.name || this.character.name;
      }

      const pages = await BookRenderer.renderEntireBook(
        storyData,
        this.character.transparentCanvas,
        {
          withSticker: true,
          isPhoto: false,
          uploadedPhotos: this.uploadedPhotos,
          pageImages: this.pageCustomImages
        }
      );
      this.book.renderedPages = pages;

      // TTS 백그라운드 사전 합성 시작 (0ms 즉시 재생)
      if (this.ttsService) {
        this.ttsService.preSynthesizeBook(pages, this.book.storyData);
      }

      // 4단계: 완료!
      this.updateLoadingProgress(100, '짜잔! 나만의 그림책이 완성되었습니다!');
      await new Promise(r => setTimeout(r, 300));

      // 축하 효과 (Confetti & Magic Sound)
      try {
        soundManager.playMagic();
        this.fireCelebrationConfetti();
      } catch (e) {
        console.warn('효과음/폭죽 건너뜀:', e);
      }

      // 뷰어 준비 및 이동 (6단계: 그림책 읽기)
      this.setupBookViewer();
      this.goToStep(6);
    } catch (err) {
      console.error('그림책 생성 중 오류:', err);
      this.updateLoadingProgress(100, '오류가 발생하여 중단되었습니다.');
      alert('그림책 생성 중 문제가 발생했습니다: ' + (err.message || err));
      this.goToStep(4);
    }
  }

  updateLoadingProgress(percent, text) {
    this.magicProgressFill.style.width = `${percent}%`;
    this.loadingStatusText.textContent = text;
  }

  fireCelebrationConfetti() {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  /**
   * 뷰어 초기화
   */
  setupBookViewer() {
    const creatorName = (this.selectedChild && this.selectedChild.name) ? this.selectedChild.name : this.character.name;
    this.viewerTitle.textContent = this.book.storyData.title;
    if (this.character.name && this.character.name !== creatorName) {
      this.viewerAuthor.textContent = `글·그림: 해솔반 ${creatorName}와 가족 (주인공: 👑 ${this.character.name})`;
    } else {
      this.viewerAuthor.textContent = `글·그림: ${this.book.storyData.author}`;
    }

    // 하단 썸네일 스트립 생성
    this.thumbnailStrip.innerHTML = '';
    this.book.renderedPages.forEach((page, idx) => {
      const thumb = document.createElement('div');
      thumb.className = `thumb-item ${idx === 0 ? 'active' : ''}`;
      thumb.innerHTML = `
        <img src="${page.dataUrl}" alt="${page.title}" />
        <span class="thumb-badge">${page.isCover ? '표지' : idx + '장'}</span>
      `;
      thumb.addEventListener('click', () => {
        soundManager.playPageFlip();
        this.showPage(idx);
      });
      this.thumbnailStrip.appendChild(thumb);
    });

    this.showPage(0);
  }

  /**
   * 특정 페이지 화면 표시
   */
  showPage(index) {
    if (index < 0 || index >= this.book.renderedPages.length) return;
    this.book.currentPageIndex = index;

    // 현재 낭독 중지
    this.stopSpeech();

    const page = this.book.renderedPages[index];

    // 메인 전시대 캔버스 복사
    const ctx = this.activePageCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.activePageCanvas.width, this.activePageCanvas.height);
    ctx.drawImage(page.canvas, 0, 0);

    // 이전/다음 버튼 가시성
    this.btnPrevPage.style.visibility = index === 0 ? 'hidden' : 'visible';
    this.btnNextPage.style.visibility = index === this.book.renderedPages.length - 1 ? 'hidden' : 'visible';

    // 썸네일 활성화 업데이트
    const thumbs = this.thumbnailStrip.querySelectorAll('.thumb-item');
    thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
  }

  navigatePage(delta) {
    const nextIdx = this.book.currentPageIndex + delta;
    if (nextIdx >= 0 && nextIdx < this.book.renderedPages.length) {
      soundManager.playPageFlip();
      this.showPage(nextIdx);
    }
  }

  setupTtsService() {
    this.ttsService.onStateChange = (state, mode) => {
      if (state === 'playing') {
        this.isSpeaking = true;
        if (this.ttsIcon) this.ttsIcon.textContent = '⏹️';
        if (this.ttsLabel) this.ttsLabel.textContent = '낭독 멈추기';
      } else if (state === 'loading') {
        if (this.ttsIcon) this.ttsIcon.textContent = '⏳';
        if (this.ttsLabel) this.ttsLabel.textContent = '목소리 준비 중...';
      } else {
        this.isSpeaking = false;
        if (this.ttsIcon) this.ttsIcon.textContent = '👧';
        if (this.ttsLabel) this.ttsLabel.textContent = '어린이 목소리로 읽기';
      }
    };
  }

  updateVoiceCloneBadge() {
    if (!this.voiceCloneBadge) return;
    if (this.ttsService && this.ttsService.hasVoice) {
      this.voiceCloneBadge.textContent = '🎙️ 내 목소리 모드 (Qwen-TTS)';
      this.voiceCloneBadge.style.background = '#C6F6D5';
      this.voiceCloneBadge.style.color = '#22543D';
    } else {
      this.voiceCloneBadge.textContent = '기본 음성 모드';
      this.voiceCloneBadge.style.background = '#E2E8F0';
      this.voiceCloneBadge.style.color = '#4A5568';
    }
  }

  /**
   * TTS 동화 구연 소리내어 읽어주기
   */
  async toggleSpeech() {
    if (this.ttsService.isPlaying || this.isSpeaking) {
      this.stopSpeech();
      return;
    }

    const page = this.book.renderedPages[this.book.currentPageIndex];
    if (!page) return;

    const readText = page.isCover
      ? `${this.book.storyData.title}. 글과 그림, ${this.book.storyData.author}.`
      : page.text;

    await this.ttsService.speak(readText, this.book.currentPageIndex);
  }

  stopSpeech() {
    this.ttsService.stop();
    if (this.speechSynth && this.isSpeaking) {
      this.speechSynth.cancel();
    }
    this.isSpeaking = false;
    if (this.ttsIcon) this.ttsIcon.textContent = '👧';
    if (this.ttsLabel) this.ttsLabel.textContent = '어린이 목소리로 읽기';
  }

  /**
   * 현재 보고 있는 페이지를 최신 데이터와 이미지로 다시 렌더링
   */
  reRenderCurrentPage() {
    const idx = this.book.currentPageIndex;
    const page = this.book.renderedPages[idx];
    if (!page) return;

    if (page.isCover) {
      const activeChar = (this.pageCustomImages && this.pageCustomImages[0])
        ? this.pageCustomImages[0]
        : this.character.transparentCanvas;
      page.canvas = BookRenderer.renderCover(
        this.book.storyData,
        activeChar,
        1200,
        900,
        { withSticker: true, isPhoto: false }
      );
    } else {
      const pageInfo = this.book.storyData.pages[idx - 1];
      // 이야기 문단 텍스트를 실시간 재분석하여 알맞은 캐릭터 자동 매칭
      const charMatch = BookRenderer.matchCharactersForPage(
        pageInfo,
        this.uploadedPhotos,
        this.character.transparentCanvas
      );

      const activeChar = (this.pageCustomImages && this.pageCustomImages[idx])
        ? this.pageCustomImages[idx]
        : (charMatch.protagonistCanvas || this.character.transparentCanvas);

      page.canvas = BookRenderer.renderScenePage(
        pageInfo,
        activeChar,
        1200,
        900,
        {
          withSticker: true,
          isPhoto: false,
          uploadedPhotos: this.uploadedPhotos,
          companionCanvases: charMatch.companionCanvases,
          companionCanvas: charMatch.companionCanvas,
          matchedFriendNames: charMatch.matchedFriendNames,
          matchedFriendName: charMatch.matchedFriendName
        }
      );
    }

    page.dataUrl = page.canvas.toDataURL('image/png');
    this.showPage(idx);

    // 썸네일도 갱신
    const thumbImg = this.thumbnailStrip.querySelectorAll('.thumb-item img')[idx];
    if (thumbImg) thumbImg.src = page.dataUrl;
  }

  /**
   * 현재 페이지 텍스트 인라인 수정 후 재렌더링
   */
  updateCurrentPageText(newText) {
    const idx = this.book.currentPageIndex;
    const page = this.book.renderedPages[idx];
    if (!page) return;

    page.text = newText;

    if (page.isCover) {
      this.book.storyData.title = newText;
      page.title = newText;
      this.viewerTitle.textContent = newText;
    } else {
      const pageInfo = this.book.storyData.pages[idx - 1];
      pageInfo.text = newText;
    }

    // TTS 캐시 무효화 및 새로운 대본으로 백그라운드 즉각 재합성
    if (this.ttsService) {
      this.ttsService.invalidatePage(idx);
      const readText = page.isCover
        ? `${this.book.storyData.title}. 글과 그림, ${this.book.storyData.author}.`
        : page.text;
      this.ttsService.synthesizeVoiceClone(readText).then(blob => {
        if (blob) this.ttsService.audioCache.set(idx, blob);
      }).catch(err => console.warn('텍스트 수정 후 TTS 재합성:', err));
    }

    this.reRenderCurrentPage();

    // 보관함에 이미 저장된 그림책이면 보관함 데이터도 즉시 동기화
    if (this.currentSavedBookId) {
      this.syncCurrentBookToStorage();
    }
  }

  // ========================================================
  // 다중 사진 슬롯 관리 기능
  // ========================================================
  getSlotLabel(idx) {
    const labels = [
      '1장: 표지·출발',
      '2장: 친구와의 만남',
      '3장: 신기한 사건',
      '4장: 용기있는 행동',
      '5장: 행복한 마무리',
      '추가 사진'
    ];
    return labels[idx] || `${idx + 1}번째 사진`;
  }

  extractFriendlyName(fileName, index) {
    if (!fileName) return index === 0 ? '우리 친구' : `친구 ${index}`;
    let base = fileName.replace(/\.[^/.]+$/, '').trim();
    if (/^(kakaotalk|img_|screenshot_|photo_|image_|\d{8}_\d{6})/i.test(base)) {
      return index === 0 ? '우리 친구' : `친구 ${index}`;
    }
    const lower = base.toLowerCase();
    if (lower.includes('giraffe') || lower.includes('기린')) return '기린';
    if (lower.includes('rabbit') || lower.includes('bunny') || lower.includes('토끼')) return '토끼';
    if (lower.includes('cat') || lower.includes('kitty') || lower.includes('고양이')) return '고양이';
    if (lower.includes('dog') || lower.includes('puppy') || lower.includes('강아지')) return '강아지';
    if (lower.includes('bear') || lower.includes('곰')) return '곰돌이';
    if (lower.includes('bird') || lower.includes('새')) return '아기 새';
    if (lower.includes('lion') || lower.includes('사자')) return '사자';
    if (lower.includes('tiger') || lower.includes('호랑이')) return '호랑이';
    if (lower.includes('elephant') || lower.includes('코끼리')) return '코끼리';

    base = base.replace(/[_-]/g, ' ').trim();
    base = base.replace(/(그림|사진|누끼|투명|작품)$/g, '').trim();
    return base || (index === 0 ? '우리 친구' : `친구 ${index}`);
  }

  updateWhoRecommendationChips() {
    const whoChipsBox = document.querySelector('#qa-mode-container .qa-card:nth-child(2) .recommend-chips-box');
    if (!whoChipsBox) return;

    // 기존의 커스텀 사진 추천 칩 제거
    whoChipsBox.querySelectorAll('.custom-photo-chip').forEach(c => c.remove());

    // 업로드된 등장인물(주인공이 아닌 모든 사진들) 이름 칩 동적 추가
    if (this.uploadedPhotos && this.uploadedPhotos.length > 1) {
      const friendPhotos = this.uploadedPhotos.filter(p => !p.isProtagonist);
      // 역순으로 prepend하여 첫 번째 친구가 맨 앞에 오도록 함
      for (let i = friendPhotos.length - 1; i >= 0; i--) {
        const p = friendPhotos[i];
        if (!p.name || !p.name.trim()) continue;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice-chip custom-photo-chip';
        btn.setAttribute('data-target', 'qa-input-who');
        btn.setAttribute('data-val', p.name);
        btn.style.borderColor = '#FF7052';
        btn.style.background = '#FFF5F2';
        btn.style.color = '#DD6B20';
        btn.style.fontWeight = '700';
        btn.innerHTML = `🎨 ${p.name}`;

        btn.addEventListener('click', () => {
          soundManager.playPop();
          if (this.inputQaWho) {
            this.inputQaWho.value = p.name;
            this.syncStoryInputs();
          }
        });

        // '어린이 추천 콕!:' 라벨 바로 뒤에 삽입
        const label = whoChipsBox.querySelector('.recommend-label');
        if (label && label.nextSibling) {
          whoChipsBox.insertBefore(btn, label.nextSibling);
        } else {
          whoChipsBox.appendChild(btn);
        }
      }
    }
  }

  setProtagonist(index) {
    if (index < 0 || index >= this.uploadedPhotos.length) return;
    this.uploadedPhotos.forEach((p, i) => {
      p.isProtagonist = (i === index);
    });
    this.selectedPhotoIndex = index;
    const proto = this.uploadedPhotos[index];
    this.character.name = proto.name || '우리 친구';
    this.character.rawImage = proto.rawImage;
    this.character.transparentCanvas = proto.transparentCanvas;
    if (this.badgeCharName) this.badgeCharName.textContent = this.character.name;
    this.updateDefaultTitles();
    this.renderPreviewCanvas();
    this.renderPhotoSlots();
    this.updateWhoRecommendationChips();
    soundManager.playMagic();
  }

  renderPhotoSlots() {
    if (!this.photoSlotsGrid) return;
    this.photoSlotsGrid.innerHTML = '';

    if (this.multiPhotoCountBadge) {
      this.multiPhotoCountBadge.textContent = `${this.uploadedPhotos.length}장 등록됨`;
      this.multiPhotoCountBadge.style.background = this.uploadedPhotos.length > 1 ? '#38A169' : 'var(--primary-coral)';
    }

    if (this.uploadedPhotos.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.style.fontSize = '12px';
      emptyMsg.style.color = '#8C6D3B';
      emptyMsg.style.padding = '8px';
      emptyMsg.textContent = '사진을 올리시면 여기에 장면별 슬롯이 나타납니다.';
      this.photoSlotsGrid.appendChild(emptyMsg);
      return;
    }

    this.uploadedPhotos.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `photo-slot-card ${index === this.selectedPhotoIndex ? 'active' : ''}`;
      
      const thumbUrl = item.transparentCanvas ? item.transparentCanvas.toDataURL('image/png') : '';

      card.innerHTML = `
        <div class="photo-protagonist-selector">
          <label class="protagonist-checkbox-label ${item.isProtagonist ? 'is-selected' : ''}" title="체크하여 동화의 주인공으로 지정하세요">
            <input type="checkbox" class="protagonist-checkbox" data-index="${index}" ${item.isProtagonist ? 'checked' : ''} />
            <span class="checkbox-role-text">${item.isProtagonist ? '👑 주인공' : '주인공 선택'}</span>
          </label>
        </div>
        <div class="photo-slot-thumb-wrap">
          <img src="${thumbUrl}" alt="${item.name || '사진'}" />
        </div>
        <div class="photo-slot-name-wrap" title="이름을 직접 수정할 수 있습니다">
          <span class="photo-slot-name-icon">✏️</span>
          <input type="text" class="photo-slot-name-input" value="${item.name || ''}" placeholder="${item.isProtagonist ? '주인공 이름' : '등장인물 이름'}" maxlength="15" title="이야기 문단에서 이 이름을 인식하여 해당 장면에만 등장합니다" />
        </div>
        ${this.uploadedPhotos.length > 1 ? `<button type="button" class="photo-slot-remove-btn" title="이 사진 삭제">&times;</button>` : ''}
      `;

      // 주인공 체크박스 선택 이벤트
      const checkbox = card.querySelector('.protagonist-checkbox');
      const checkboxLabel = card.querySelector('.protagonist-checkbox-label');
      if (checkbox) {
        checkbox.addEventListener('click', (e) => e.stopPropagation());
        checkbox.addEventListener('change', (e) => {
          e.stopPropagation();
          if (e.target.checked) {
            this.setProtagonist(index);
          } else {
            // 주인공 해제 시 다른 사진을 주인공으로 자동 지정
            const otherIdx = this.uploadedPhotos.findIndex((p, i) => i !== index);
            if (otherIdx >= 0) {
              this.setProtagonist(otherIdx);
            } else {
              // 사진이 1장일 경우 계속 주인공 유지
              e.target.checked = true;
            }
          }
        });
      }
      if (checkboxLabel) {
        checkboxLabel.addEventListener('click', (e) => e.stopPropagation());
      }

      // 텍스트 인풋 포커스/입력 시 카드 선택 방지 및 이름 실시간 동기화
      const nameInput = card.querySelector('.photo-slot-name-input');
      if (nameInput) {
        nameInput.addEventListener('click', (e) => {
          e.stopPropagation();
        });
        nameInput.addEventListener('input', (e) => {
          item.name = e.target.value.trim();
          if (item.isProtagonist) {
            this.character.name = item.name || '우리 친구';
            if (this.badgeCharName) this.badgeCharName.textContent = this.character.name;
            this.updateDefaultTitles();
          }
          this.updateWhoRecommendationChips();
        });
      }

      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('photo-slot-remove-btn')) return;
        if (e.target.classList.contains('photo-slot-name-input')) return;
        if (e.target.closest('.photo-protagonist-selector')) return;
        this.selectPhotoSlot(index);
      });

      const removeBtn = card.querySelector('.photo-slot-remove-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removePhotoSlot(index);
        });
      }

      this.photoSlotsGrid.appendChild(card);
    });
  }

  /**
   * 선택한 사진을 유일한 주인공(👑)으로 지정
   */
  setProtagonist(index) {
    if (index < 0 || index >= this.uploadedPhotos.length) return;
    this.uploadedPhotos.forEach((p, i) => {
      p.isProtagonist = (i === index);
    });
    this.selectedPhotoIndex = index;
    const proto = this.uploadedPhotos[index];
    this.character.rawImage = proto.rawImage;
    this.character.transparentCanvas = proto.transparentCanvas;
    if (proto.name) {
      this.character.name = proto.name;
      if (this.badgeCharName) this.badgeCharName.textContent = this.character.name;
      this.updateDefaultTitles();
    }
    this.renderPreviewCanvas();
    this.renderPhotoSlots();
    this.updateWhoRecommendationChips();
    soundManager.playPop();
  }

  selectPhotoSlot(index) {
    if (index < 0 || index >= this.uploadedPhotos.length) return;
    this.selectedPhotoIndex = index;
    const photo = this.uploadedPhotos[index];
    this.character.rawImage = photo.rawImage;
    this.character.transparentCanvas = photo.transparentCanvas;
    this.renderPreviewCanvas();
    this.renderPhotoSlots();
    soundManager.playSnap();
  }

  removePhotoSlot(index) {
    if (this.uploadedPhotos.length <= 1) {
      alert('최소 1장의 사진은 필요합니다.');
      return;
    }
    this.uploadedPhotos.splice(index, 1);
    if (this.selectedPhotoIndex >= this.uploadedPhotos.length) {
      this.selectedPhotoIndex = this.uploadedPhotos.length - 1;
    }
    const current = this.uploadedPhotos[this.selectedPhotoIndex];
    this.character.rawImage = current.rawImage;
    this.character.transparentCanvas = current.transparentCanvas;
    this.renderPreviewCanvas();
    this.renderPhotoSlots();
    this.updateWhoRecommendationChips();
    soundManager.playPop();
  }

  // ========================================================
  // 그림책 보관함 (영구 저장, 다시보기, 수정, 삭제) 기능
  // ========================================================
  getSavedBooks(filterChildName = null) {
    return bookStorage.getBooks(filterChildName);
  }

  async saveBookToStorage(savedBook) {
    try {
      await bookStorage.saveBook(savedBook);
      this.updateLibraryTotalBadge();
      this.renderChildrenGrid();
      return true;
    } catch (e) {
      console.error('보관함 저장 실패:', e);
      alert('저장 공간이 부족하거나 오류가 발생했습니다: ' + e.message);
      return false;
    }
  }

  async deleteBookFromStorage(bookId) {
    try {
      await bookStorage.deleteBook(bookId);
      this.updateLibraryTotalBadge();
      this.renderChildrenGrid();
      return true;
    } catch (e) {
      console.error('보관함 삭제 실패:', e);
      return false;
    }
  }

  updateLibraryTotalBadge() {
    const books = this.getSavedBooks();
    if (this.libraryTotalBadge) {
      this.libraryTotalBadge.textContent = `${books.length}권`;
    }
  }

  openLibraryModal(filterChildName = null) {
    soundManager.playPop();
    if (this.libraryModalTitle) {
      const count = filterChildName ? this.getSavedBooks(filterChildName).length : this.getSavedBooks().length;
      this.libraryModalTitle.textContent = filterChildName
        ? `👦👧 해솔반 ${filterChildName} 어린이의 그림책 보관함 (${count}권)`
        : `📚 해솔반 전체 그림책 보관함 (${count}권)`;
    }
    this.renderLibraryList(filterChildName);
    if (this.libraryModal) {
      this.libraryModal.classList.add('open');
    }
  }

  closeLibraryModal() {
    if (this.libraryModal) {
      this.libraryModal.classList.remove('open');
    }
  }

  renderLibraryList(filterChildName = null) {
    if (!this.libraryBooksList) return;
    this.libraryBooksList.innerHTML = '';

    const allBooks = this.getSavedBooks();
    const books = filterChildName
      ? allBooks.filter(b => b.childName === filterChildName)
      : allBooks;

    if (filterChildName) {
      // 해당 아이로 새 책 만들기 바로가기 버튼 추가
      const newBookBtn = document.createElement('button');
      newBookBtn.type = 'button';
      newBookBtn.className = 'btn-primary';
      newBookBtn.style.padding = '10px 18px';
      newBookBtn.style.fontSize = '14px';
      newBookBtn.style.marginBottom = '12px';
      newBookBtn.innerHTML = `<span>✨</span> <span>${filterChildName}의 새로운 그림책 만들기</span> <span>➡️</span>`;
      newBookBtn.addEventListener('click', () => {
        this.currentSavedBookId = null;
        this.closeLibraryModal();
        const child = haesolChildren.find(c => c.name === filterChildName);
        if (child) this.selectChildProfile(child, true);
      });
      this.libraryBooksList.appendChild(newBookBtn);
    }

    if (books.length === 0) {
      const empty = document.createElement('div');
      empty.style.padding = '36px 16px';
      empty.style.textAlign = 'center';
      empty.style.color = 'var(--text-muted)';
      empty.innerHTML = `
        <div style="font-size: 38px; margin-bottom: 8px;">📖</div>
        <div style="font-weight: 700; font-size: 15px; color: var(--text-dark);">아직 보관된 그림책이 없어요.</div>
        <div style="font-size: 13px; margin-top: 4px;">멋진 이야기를 완성한 후 [💾 그림책 보관함에 저장]을 눌러보세요!</div>
      `;
      this.libraryBooksList.appendChild(empty);
      return;
    }

    books.forEach(b => {
      const item = document.createElement('div');
      item.className = 'library-book-item';
      const isAnimal = b.protagonistName && b.protagonistName !== b.childName;
      const protagonistBadge = isAnimal
        ? `<span style="background: #FEFCBF; color: #744210; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px;">👑 주인공: ${b.protagonistName}</span>`
        : `<span style="background: #EBF8FF; color: #2B6CB0; padding: 2px 8px; border-radius: 9999px; font-weight: 700; font-size: 11px;">👑 주인공: ${b.childName}</span>`;

      item.innerHTML = `
        <div class="library-book-thumb">
          <img src="${b.coverThumbnail || ''}" alt="${b.title}" />
        </div>
        <div class="library-book-info">
          <div class="library-book-title">${b.title}</div>
          <div class="library-book-meta" style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 4px;">
            <span style="font-weight: 700; color: #DD6B20;">🧒 해솔반 ${b.childName} 작가님</span>
            ${protagonistBadge}
            <span>•</span>
            <span>📅 ${b.createdAt || '최근 저장'}</span>
            <span>•</span>
            <span>총 6장 (표지+5장면)</span>
          </div>
        </div>
        <div class="library-book-actions">
          <button type="button" class="btn-library-open" data-id="${b.id}">
            <span>📖</span> <span>열기 / 수정</span>
          </button>
          <button type="button" class="btn-library-delete" data-id="${b.id}">
            <span>🗑️ 삭제</span>
          </button>
        </div>
      `;

      item.querySelector('.btn-library-open').addEventListener('click', () => {
        this.loadSavedBookIntoViewer(b);
      });

      item.querySelector('.btn-library-delete').addEventListener('click', async () => {
        if (confirm(`'${b.title}' 그림책을 보관함에서 삭제하시겠습니까?`)) {
          await this.deleteBookFromStorage(b.id);
          this.renderLibraryList(filterChildName);
          soundManager.playPop();
        }
      });

      this.libraryBooksList.appendChild(item);
    });
  }

  async loadSavedBookIntoViewer(savedBook) {
    this.closeLibraryModal();
    soundManager.playMagic();
    this.goToStep(5);
    this.updateLoadingProgress(50, `‘${savedBook.title}’ 그림책을 책장에서 꺼내오는 중이에요...`);

    try {
      this.currentSavedBookId = savedBook.id;
      this.book.storyData = savedBook.storyData;
      this.character.name = savedBook.protagonistName || savedBook.childName;
      this.selectedChild = haesolChildren.find(c => c.name === savedBook.childName) || { name: savedBook.childName };
      this.story.title = savedBook.title;
      this.story.author = savedBook.author;

      // 캐릭터 복원
      let charCanvas = null;
      if (savedBook.characterImage) {
        const charImg = await CharacterProcessor.loadImage(savedBook.characterImage);
        charCanvas = document.createElement('canvas');
        charCanvas.width = charImg.width;
        charCanvas.height = charImg.height;
        charCanvas.getContext('2d').drawImage(charImg, 0, 0);
        this.character.transparentCanvas = charCanvas;
      }

      // 페이지별 개별 이미지 복원
      this.pageCustomImages = {};
      if (savedBook.pageImages) {
        for (const [pNum, dataUrl] of Object.entries(savedBook.pageImages)) {
          if (dataUrl) {
            const img = await CharacterProcessor.loadImage(dataUrl);
            const cvs = document.createElement('canvas');
            cvs.width = img.width;
            cvs.height = img.height;
            cvs.getContext('2d').drawImage(img, 0, 0);
            this.pageCustomImages[pNum] = cvs;
          }
        }
      }

      // 렌더링
      const pages = await BookRenderer.renderEntireBook(
        this.book.storyData,
        charCanvas || this.character.transparentCanvas,
        {
          withSticker: true,
          isPhoto: false,
          pageImages: this.pageCustomImages
        }
      );
      this.book.renderedPages = pages;

      // TTS 백그라운드 사전 합성
      if (this.ttsService) {
        this.ttsService.preSynthesizeBook(pages, this.book.storyData);
      }

      this.setupBookViewer();
      this.goToStep(6);
    } catch (err) {
      console.error('보관된 그림책 열기 실패:', err);
      alert('그림책을 불러오는 중 오류가 발생했습니다: ' + err.message);
      this.goToStep(2);
    }
  }

  async saveCurrentBookToLibrary() {
    if (!this.book.storyData || this.book.renderedPages.length === 0) {
      alert('먼저 그림책을 완성해 주세요!');
      return;
    }

    soundManager.playMagic();
    const bookId = this.currentSavedBookId || ('book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
    this.currentSavedBookId = bookId;

    // 1. 압축 썸네일 생성 (320x240 JPEG 0.75 - 약 15KB)
    const coverCanvas = this.book.renderedPages[0]?.canvas;
    let thumbDataUrl = '';
    if (coverCanvas) {
      const tc = document.createElement('canvas');
      tc.width = 320;
      tc.height = 240;
      tc.getContext('2d').drawImage(coverCanvas, 0, 0, 320, 240);
      thumbDataUrl = tc.toDataURL('image/jpeg', 0.75);
    }

    // 2. 캐릭터 투명 이미지 압축 (최대 320px 리사이즈 - 약 35KB)
    let charImgData = null;
    if (this.character.transparentCanvas) {
      const cc = this.character.transparentCanvas;
      const maxDim = 320;
      const scale = Math.min(1, maxDim / Math.max(cc.width, cc.height));
      const cCanvas = document.createElement('canvas');
      cCanvas.width = Math.round(cc.width * scale);
      cCanvas.height = Math.round(cc.height * scale);
      cCanvas.getContext('2d').drawImage(cc, 0, 0, cCanvas.width, cCanvas.height);
      charImgData = cCanvas.toDataURL('image/png');
    }

    // 3. 페이지별 개별 이미지 압축 (최대 320px 리사이즈 - 약 35KB)
    const pageImgsData = {};
    Object.entries(this.pageCustomImages || {}).forEach(([k, cvs]) => {
      if (cvs && cvs.width) {
        const maxDim = 320;
        const scale = Math.min(1, maxDim / Math.max(cvs.width, cvs.height));
        const pc = document.createElement('canvas');
        pc.width = Math.round(cvs.width * scale);
        pc.height = Math.round(cvs.height * scale);
        pc.getContext('2d').drawImage(cvs, 0, 0, pc.width, pc.height);
        pageImgsData[k] = pc.toDataURL('image/png');
      }
    });

    const creatorChild = (this.selectedChild && this.selectedChild.name) ? this.selectedChild.name : (this.character.name || '우리 친구');
    const protagonist = this.character.name || creatorChild;

    const savedBook = {
      id: bookId,
      childName: creatorChild,
      protagonistName: protagonist,
      title: this.book.storyData.title,
      author: this.book.storyData.author,
      createdAt: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: Date.now(),
      storyData: JSON.parse(JSON.stringify(this.book.storyData)),
      coverThumbnail: thumbDataUrl,
      characterImage: charImgData,
      pageImages: pageImgsData
    };

    const success = await this.saveBookToStorage(savedBook);
    if (success) {
      if (this.btnSaveToLibrary) {
        this.btnSaveToLibrary.textContent = '✅ 보관함 저장 완료!';
        this.btnSaveToLibrary.style.background = '#2F855A';
        setTimeout(() => {
          if (this.btnSaveToLibrary) {
            this.btnSaveToLibrary.textContent = '💾 그림책 보관함에 저장';
            this.btnSaveToLibrary.style.background = 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)';
          }
        }, 3000);
      }
      this.fireCelebrationConfetti();
      alert(`🎉 [${savedBook.title}] 그림책이 해솔반 ${creatorChild} 작가님의 보관함에 안전하게 저장되었습니다!\n\n기존 이야기와 함께 누적 보관되어 언제든 2단계 친구 선택 화면에서 다시 열어보거나 수정할 수 있습니다.`);
    }
  }

  async syncCurrentBookToStorage() {
    if (!this.currentSavedBookId) return;
    const books = this.getSavedBooks();
    const idx = books.findIndex(b => b.id === this.currentSavedBookId);
    if (idx >= 0) {
      const book = books[idx];
      book.title = this.book.storyData.title;
      book.storyData = JSON.parse(JSON.stringify(this.book.storyData));
      // 커버 썸네일도 갱신
      const coverCanvas = this.book.renderedPages[0]?.canvas;
      if (coverCanvas) {
        const tc = document.createElement('canvas');
        tc.width = 320;
        tc.height = 240;
        tc.getContext('2d').drawImage(coverCanvas, 0, 0, 320, 240);
        book.coverThumbnail = tc.toDataURL('image/jpeg', 0.75);
      }
      await this.saveBookToStorage(book);
    }
  }
}

// 애플리케이션 시작
window.addEventListener('DOMContentLoaded', () => {
  const app = new PictureBookApp();
  app.init();
  window.__PICTURE_BOOK_APP__ = app;
});
