// Qwen3-TTS AI 목소리 복제 & 6세 귀여운 어린이 신경망 음성 구연 통합 서비스
export class TtsService {
  constructor() {
    const isRemote = (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
    const defaultHost = isRemote ? '' : 'http://127.0.0.1:8000';
    const safeGetStorage = (key, fallback = '') => (typeof localStorage !== 'undefined' && localStorage ? localStorage.getItem(key) || fallback : fallback);
    let storedHost = (safeGetStorage('qwen_tts_server_url', defaultHost)).trim();
    if (isRemote && storedHost.includes(':8000')) {
      storedHost = '';
      if (typeof localStorage !== 'undefined') localStorage.setItem('qwen_tts_server_url', '');
    }
    this.serverUrl = storedHost;
    this.refText = (safeGetStorage('qwen_tts_ref_text', '어느 화창한 아침, 밝은미소 해솔반 김나연이 길을 나섰어요. 살랑살랑 부는 바람을 맞으며 무지개 피어난 초록 숲속으로 씩씩하게 걸어갔답니다.')).trim();
    this.hasVoice = safeGetStorage('qwen_tts_has_voice', 'false') === 'true';
    this.ttsMode = 'child'; // 기본 모드: 6세 어린아이 목소리로 모든 기기 통일
    this.currentAudio = null;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.cachedAudioUrls = new Map(); // pageIndex -> ObjectURL
    this.preSynthesizing = false;
    this.onStateChange = null; // (state: 'idle'|'loading'|'playing', mode: 'child') => void
    this.selectedVoice = null;
    this.isAudioUnlocked = false;

    // 모바일(iOS Safari, Android) 오디오 재생 잠금 해제 리스너
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const unlock = () => {
        if (this.isAudioUnlocked) return;
        this.isAudioUnlocked = true;
        try {
          const dummy = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
          dummy.play().catch(() => {});
        } catch (e) {}
      };
      document.addEventListener('touchstart', unlock, { once: true, passive: true });
      document.addEventListener('click', unlock, { once: true, passive: true });
    }

    if (this.speechSynth) {
      this.initVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  /**
   * 브라우저에 등록된 최적의 한국어 음성 탐색 (비상 로컬 폴백용)
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

  getCacheKey(text) {
    if (!text) return '';
    const clean = String(text)
      .replace(/["'“”‘’]/g, '')
      .replace(/\n+/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
    return `${this.ttsMode}:${clean}`;
  }

  clearAudioCache() {
    this.stop();
    for (const url of this.cachedAudioUrls.values()) {
      try { URL.revokeObjectURL(url); } catch (e) {}
    }
    this.cachedAudioUrls.clear();
    console.log('🧹 [TTS 캐시 완전 초기화] 이전 이야기 오디오 캐시 모두 삭제됨');
  }

  /**
   * 특정 페이지 텍스트 수정 시 캐시된 오디오 무효화
   */
  invalidatePage(pageIndex) {
    this.clearAudioCache();
  }

  invalidateText(text) {
    if (!text) return;
    const key = this.getCacheKey(text);
    if (this.cachedAudioUrls.has(key)) {
      const url = this.cachedAudioUrls.get(key);
      try { URL.revokeObjectURL(url); } catch (e) {}
      this.cachedAudioUrls.delete(key);
    }
  }

  /**
   * 엔드포인트 후보군 생성 (상대 경로 우선 - 모바일/터널/로컬 100% 호환)
   */
  getApiEndpoints(path = '/api/child-tts') {
    const endpoints = [path];
    if (this.serverUrl && typeof this.serverUrl === 'string' && this.serverUrl.trim() !== '') {
      const clean = this.serverUrl.trim().replace(/\/+$/, '');
      endpoints.unshift(`${clean}${path}`);
    }
    endpoints.push(`http://127.0.0.1:8000${path}`);
    return [...new Set(endpoints)];
  }

  /**
   * 전체 책 6장면(표지+5장)에 대해 백그라운드 선행 음성 합성 (클릭 시 0초 즉시 재생)
   */
  async preSynthesizeBook(renderedPages, storyData) {
    if (!renderedPages || !storyData) return;
    this.preSynthesizing = true;
    console.log('⚡ 6세 어린이 목소리 음성 백그라운드 사전 합성 시작...');

    const tasks = renderedPages.map(async (page, i) => {
      const text = page.isCover
        ? `${storyData.title}. 글과 그림, ${storyData.author}.`
        : page.text;
      if (!text || !text.trim()) return;

      const key = this.getCacheKey(text);
      if (this.cachedAudioUrls.has(key)) return;

      try {
        const audioUrl = await this.synthesizeChildVoice(text);
        if (audioUrl) {
          this.cachedAudioUrls.set(key, audioUrl);
          console.log(`✅ [${i}장] 6세 어린이 목소리 MP3 캐싱 완료 (${text.slice(0, 25)}...)`);
        }
      } catch (err) {
        console.warn(`[${i}장] 사전 합성 건너뜀 (클릭 시 실시간 합성):`, err);
      }
    });

    await Promise.all(tasks);
    this.preSynthesizing = false;
  }

  /**
   * 맑고 사랑스러운 6세 어린이 신경망 목소리 생성 (Edge-TTS SunHi Neural +38Hz)
   * - 모든 기기(아이폰, 갤럭시, 노트북 등)에서 완벽히 동일한 6세 어린이 음성 제공
   */
  async synthesizeChildVoice(text) {
    const clean = (text || '')
      .replace(/["'“”‘’]/g, '')
      .replace(/\n+/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return null;

    const endpoints = this.getApiEndpoints('/api/child-tts');

    for (const ep of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: clean,
            language: 'Korean'
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        }
      } catch (e) {
        // 다음 엔드포인트 시도
      }
    }
    return null;
  }

  async synthesizeVoiceClone(text) {
    const endpoints = this.getApiEndpoints('/api/voice-clone');
    for (const ep of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text.trim(),
            language: 'Korean',
            ref_text: this.refText
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        }
      } catch (e) {}
    }
    return null;
  }

  /**
   * Qwen3-TTS 서버 연결 테스트
   */
  async testServer(targetUrl = this.serverUrl) {
    const cleanUrl = (targetUrl || '').trim().replace(/\/+$/, '');
    const endpoints = cleanUrl ? [`${cleanUrl}/api/health`] : this.getApiEndpoints('/api/health');

    for (const ep of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(ep, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.has_voice) {
            this.hasVoice = true;
            localStorage.setItem('qwen_tts_has_voice', 'true');
          }
          return { success: true, data };
        }
      } catch (e) {}
    }

    return { success: false, message: '서버에 연결할 수 없습니다.' };
  }

  async registerVoice(audioBlob, refText) {
    const endpoints = this.getApiEndpoints('/api/register-voice');
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'parent_voice.wav');
    formData.append('ref_text', refText.trim());

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          this.hasVoice = true;
          localStorage.setItem('qwen_tts_has_voice', 'true');
          this.setRefText(refText);
          this.clearAudioCache();
          return await res.json();
        }
      } catch (e) {}
    }

    throw new Error('목소리 등록에 실패했습니다. 서버 상태를 확인해 주세요.');
  }

  clearVoice() {
    this.hasVoice = false;
    localStorage.removeItem('qwen_tts_has_voice');
    this.clearAudioCache();
  }

  /**
   * 동화 텍스트 소리내어 읽어주기 (모든 기기 6세 어린아이 목소리로 100% 통일)
   */
  async speak(text, pageIndex = -1) {
    this.stop();

    if (!text || text.trim().length === 0) return;

    if (this.onStateChange) this.onStateChange('loading', this.ttsMode);

    const key = this.getCacheKey(text);

    try {
      let audioUrl = key ? this.cachedAudioUrls.get(key) : null;

      if (!audioUrl) {
        console.log(`🎙️ 새 텍스트 실시간 음성 합성 진행: "${text.slice(0, 30)}..."`);
        audioUrl = this.ttsMode === 'child'
          ? await this.synthesizeChildVoice(text)
          : await this.synthesizeVoiceClone(text);
        if (key && audioUrl) {
          this.cachedAudioUrls.set(key, audioUrl);
        }
      }

      if (audioUrl) {
        if (!this.currentAudio) {
          this.currentAudio = new Audio();
        }
        this.currentAudio.src = audioUrl;
        this.currentAudio.currentTime = 0;

        this.currentAudio.onplay = () => {
          this.isPlaying = true;
          if (this.onStateChange) this.onStateChange('playing', this.ttsMode);
        };

        this.currentAudio.onended = () => {
          this.isPlaying = false;
          if (this.onStateChange) this.onStateChange('idle', this.ttsMode);
        };

        this.currentAudio.onerror = (e) => {
          console.warn('어린이 오디오 재생 오류, 비상 브라우저 음성 대체:', e);
          this.isPlaying = false;
          this.speakChildVoice(text);
        };

        const playPromise = this.currentAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        return;
      }
    } catch (err) {
      console.warn('서버 어린이 음성 호출 오류, 비상 브라우저 음성 대체:', err);
    }

    // 서버 오프라인 비상 시 브라우저 내장 음성 대체
    this.speakChildVoice(text);
  }

  /**
   * 오프라인 비상용 브라우저 음성 (어린이 음색 튜닝)
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

    if (!this.selectedVoice) {
      this.initVoices();
    }
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.pitch = 1.45;
    utterance.rate = 1.05;
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
      console.warn('브라우저 음성 재생 중단:', e);
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
    this.currentUtterance = null;
    if (this.onStateChange) this.onStateChange('idle', this.ttsMode);
  }
}

export const ttsService = new TtsService();
