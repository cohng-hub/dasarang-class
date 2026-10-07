// Qwen3-TTS AI 목소리 복제 & 브라우저 귀여운 어린이 음성 구연 통합 서비스
export class TtsService {
  constructor() {
    const defaultHost = (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
      ? `http://${window.location.hostname}:8000`
      : 'http://127.0.0.1:8000';
    const safeGetStorage = (key, fallback = '') => (typeof localStorage !== 'undefined' && localStorage ? localStorage.getItem(key) || fallback : fallback);
    this.serverUrl = (safeGetStorage('qwen_tts_server_url', defaultHost)).trim();
    this.refText = (safeGetStorage('qwen_tts_ref_text', '어느 화창한 아침, 밝은미소 해솔반 김나연이 길을 나섰어요. 살랑살랑 부는 바람을 맞으며 무지개 피어난 초록 숲속으로 씩씩하게 걸어갔답니다.')).trim();
    this.hasVoice = safeGetStorage('qwen_tts_has_voice', 'false') === 'true';
    this.ttsMode = 'child'; // 기본값: 'child' (누르면 바로 읽어주는 귀여운 어린이 목소리, 대기시간 0초)
    this.currentAudio = null;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.cachedAudioUrls = new Map(); // pageIndex -> ObjectURL
    this.preSynthesizing = false;
    this.onStateChange = null; // (state: 'idle'|'loading'|'playing', mode: 'child'|'qwen'|'browser') => void
    this.selectedVoice = null;

    if (this.speechSynth) {
      this.initVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  /**
   * 브라우저에 등록된 최적의 한국어 음성 탐색 (맑고 또랑또랑한 음색 우선)
   */
  initVoices() {
    if (!this.speechSynth) return;
    try {
      const voices = this.speechSynth.getVoices() || [];
      if (voices.length === 0) return;

      const koVoices = voices.filter(v => v.lang && (v.lang.startsWith('ko') || v.lang.includes('KR')));
      const best = koVoices.find(v => v.name.includes('SunHi') && v.name.includes('Natural'))
        || koVoices.find(v => v.name.includes('SunHi'))
        || koVoices.find(v => v.name.includes('Heami'))
        || koVoices.find(v => v.name.includes('Google') || v.name.includes('한국'))
        || koVoices.find(v => v.name.includes('Yuna'))
        || koVoices[0]
        || voices.find(v => v.lang && v.lang.startsWith('ko'));

      if (best) {
        this.selectedVoice = best;
      }
    } catch (e) {
      console.warn('음성 목록 로딩 중 예외:', e);
    }
  }

  setServerUrl(url) {
    this.serverUrl = (url || '').trim().replace(/\/+$/, '');
    localStorage.setItem('qwen_tts_server_url', this.serverUrl);
    this.clearAudioCache();
  }

  setRefText(text) {
    this.refText = (text || '').trim();
    localStorage.setItem('qwen_tts_ref_text', this.refText);
  }

  clearAudioCache() {
    for (const url of this.cachedAudioUrls.values()) {
      try { URL.revokeObjectURL(url); } catch (e) {}
    }
    this.cachedAudioUrls.clear();
  }

  /**
   * 특정 페이지 텍스트 수정 시 캐시된 오디오 무효화
   */
  invalidatePage(pageIndex) {
    if (this.cachedAudioUrls.has(pageIndex)) {
      const url = this.cachedAudioUrls.get(pageIndex);
      try { URL.revokeObjectURL(url); } catch (e) {}
      this.cachedAudioUrls.delete(pageIndex);
    }
  }

  /**
   * 전체 책 5장면에 대해 백그라운드 선행 음성 합성 (클릭 시 0초 즉시 재생)
   */
  async preSynthesizeBook(renderedPages, storyData) {
    if (!this.serverUrl || this.preSynthesizing) return;
    this.preSynthesizing = true;
    console.log('⚡ 그림책 낭독 음성 백그라운드 사전 합성 시작...');

    const tasks = renderedPages.map(async (page, i) => {
      if (this.cachedAudioUrls.has(i)) return;
      const text = page.isCover
        ? `${storyData.title}. 글과 그림, ${storyData.author}.`
        : page.text;
      if (!text || !text.trim()) return;

      try {
        const audioUrl = this.ttsMode === 'child'
          ? await this.synthesizeChildVoice(text)
          : await this.synthesizeVoiceClone(text);
        if (audioUrl) {
          this.cachedAudioUrls.set(i, audioUrl);
          console.log(`✅ [${i}장] 어린이 목소리 음성 준비 완료`);
        }
      } catch (err) {
        console.warn(`[${i}장] 사전 합성 건너뜀 (클릭 시 자동 합성):`, err);
      }
    });

    await Promise.all(tasks);
    this.preSynthesizing = false;
  }

  /**
   * 맑고 사랑스러운 신경망 어린이 목소리 생성 (Edge-TTS 0.4초 초고속)
   */
  async synthesizeChildVoice(text) {
    if (!this.serverUrl) return null;
    const clean = (text || '')
      .replace(/["'“”‘’]/g, '')
      .replace(/\n+/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return null;

    const res = await fetch(`${this.serverUrl}/api/child-tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: clean,
        language: 'Korean'
      })
    });

    if (!res.ok) {
      const errDetail = await res.text();
      throw new Error(`어린이 TTS 생성 실패 (${res.status}): ${errDetail}`);
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  async synthesizeVoiceClone(text) {
    const res = await fetch(`${this.serverUrl}/api/voice-clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.trim(),
        language: 'Korean',
        ref_text: this.refText
      })
    });

    if (!res.ok) {
      const errDetail = await res.text();
      throw new Error(`Qwen3-TTS 생성 실패 (${res.status}): ${errDetail}`);
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  /**
   * Qwen3-TTS 서버 연결 테스트
   */
  async testServer(targetUrl = this.serverUrl) {
    const cleanUrl = (targetUrl || '').trim().replace(/\/+$/, '');
    if (!cleanUrl) {
      return { success: false, message: '서버 URL을 입력해 주세요.' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(`${cleanUrl}/api/health`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.has_voice) {
        this.hasVoice = true;
        localStorage.setItem('qwen_tts_has_voice', 'true');
      }
      return {
        success: true,
        data,
        message: `✅ Qwen3-TTS 서버 연결 성공! (GPU: ${data.device || 'cuda'}, 목소리 등록: ${data.has_voice ? '완료' : '필요'})`
      };
    } catch (err) {
      clearTimeout(timeoutId);
      return {
        success: false,
        message: `❌ 연결 실패: ${err.message || '네트워크 오류 또는 주소를 확인해주세요'}`
      };
    }
  }

  /**
   * 서버 상태 및 목소리 등록 여부 자동 동기화
   */
  async checkHealth() {
    if (!this.serverUrl) return null;
    try {
      const res = await fetch(`${this.serverUrl}/api/health`);
      if (res.ok) {
        const data = await res.json();
        if (data.has_voice) {
          this.hasVoice = true;
          localStorage.setItem('qwen_tts_has_voice', 'true');
        }
        return data;
      }
    } catch (e) {
      // 서버 오프라인
    }
    return null;
  }

  /**
   * 부모님 녹음 목소리 파일 서버에 등록
   * @param {Blob|File} audioBlob - 녹음된 오디오 파일
   * @param {string} refText - 녹음 시 발음한 대본
   */
  async registerVoice(audioBlob, refText = this.refText) {
    if (!this.serverUrl) {
      throw new Error('Qwen3-TTS 서버 주소를 먼저 설정해 주세요.');
    }

    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'parent_voice.wav');
    formData.append('ref_text', refText.trim());

    const res = await fetch(`${this.serverUrl}/api/register-voice`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`목소리 등록 실패 (${res.status}): ${errText}`);
    }

    this.hasVoice = true;
    localStorage.setItem('qwen_tts_has_voice', 'true');
    this.setRefText(refText);
    this.clearAudioCache();
    return await res.json();
  }

  /**
   * 현재 등록된 목소리 삭제 및 기본 음성 모드로 복원
   */
  clearVoice() {
    this.hasVoice = false;
    localStorage.removeItem('qwen_tts_has_voice');
    this.clearAudioCache();
  }

  /**
   * 동화 텍스트 소리내어 읽어주기
   * - 기본 모드: 어린아이 목소리로 0초 즉시 읽기 (대기시간 및 합성 지연 없음)
   * - 사용자 선택 시: Qwen3-TTS AI 부모님 목소리 복제 구연
   */
  async speak(text, pageIndex = -1) {
    this.stop();

    if (!text || text.trim().length === 0) return;

    // 1. 고품질 신경망 어린이 음성 또는 목소리 복제 오디오 재생 (서버 연결 시)
    if (this.serverUrl) {
      if (this.onStateChange) this.onStateChange('loading', this.ttsMode);

      try {
        let audioUrl = pageIndex >= 0 ? this.cachedAudioUrls.get(pageIndex) : null;

        if (!audioUrl) {
          audioUrl = this.ttsMode === 'child'
            ? await this.synthesizeChildVoice(text)
            : await this.synthesizeVoiceClone(text);
          if (pageIndex >= 0 && audioUrl) {
            this.cachedAudioUrls.set(pageIndex, audioUrl);
          }
        }

        if (audioUrl) {
          const audio = new Audio(audioUrl);
          this.currentAudio = audio;
          this.isPlaying = true;

          audio.onplay = () => {
            if (this.onStateChange) this.onStateChange('playing', this.ttsMode);
          };

          audio.onended = () => {
            this.isPlaying = false;
            if (this.onStateChange) this.onStateChange('idle', this.ttsMode);
          };

          audio.onerror = (e) => {
            console.warn('어린이 오디오 재생 오류, 브라우저 음성으로 전환합니다:', e);
            this.isPlaying = false;
            this.speakChildVoice(text);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('서버 어린이 음성 호출 실패, 브라우저 음성으로 대체합니다:', err);
      }
    }

    // 2. 서버 오프라인 시 브라우저 내장 음성 대체
    this.speakChildVoice(text);
  }

  /**
   * 0초 즉각 재생: 맑고 사랑스러운 6~7세 어린아이 목소리 동화 구연
   */
  speakChildVoice(text) {
    if (!this.speechSynth) {
      if (this.onStateChange) this.onStateChange('idle', 'child');
      return;
    }

    try {
      this.speechSynth.cancel();
      if (this.speechSynth.paused) {
        this.speechSynth.resume();
      }
    } catch (e) {}

    // 동화 구연 텍스트 정제 (불필요한 따옴표 제거 및 자연스러운 숨고르기 쉼표 처리)
    const cleanText = (text || '')
      .replace(/["'“”‘’]/g, '')
      .replace(/\n+/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      if (this.onStateChange) this.onStateChange('idle', 'child');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR';

    // 최적의 한국어 음성 연결
    if (!this.selectedVoice) {
      this.initVoices();
    }
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    // 🌟 귀여운 어린아이 목소리 음향 튜닝:
    // pitch 1.38 : 청량하고 귀여운 어린이 톤
    // rate 1.02 : 또랑또랑하고 활기찬 동화 구연 템포
    utterance.pitch = 1.38;
    utterance.rate = 1.02;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      this.isPlaying = true;
      if (this.onStateChange) this.onStateChange('playing', 'child');
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange('idle', 'child');
    };

    utterance.onerror = (e) => {
      console.warn('어린이 목소리 재생 중단/오류:', e);
      this.isPlaying = false;
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange('idle', 'child');
    };

    this.currentUtterance = utterance;
    this.speechSynth.speak(utterance);
  }

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }

    if (this.speechSynth && this.speechSynth.speaking) {
      try {
        this.speechSynth.cancel();
      } catch (e) {}
    }

    this.isPlaying = false;
    if (this.onStateChange) this.onStateChange('idle', this.ttsMode);
  }
}

export const ttsService = new TtsService();
