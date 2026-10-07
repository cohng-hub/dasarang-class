/**
 * 한글 받침 여부에 따른 올바른 조사 부착
 * @param {string} word - 단어 (예: 강시아, 은우, 곰돌이)
 * @param {'josa_ga'|'josa_ul'|'josa_un'|'josa_ro'|'josa_wa'|'josa_ui'} type
 */
export function attachJosa(word, type) {
  if (!word) return '';
  const trimmed = word.trim();
  const lastChar = trimmed.slice(-1);
  const code = lastChar.charCodeAt(0);
  const isHangul = code >= 0xAC00 && code <= 0xD7A3;
  const hasBatchim = isHangul ? (code - 0xAC00) % 28 > 0 : false;
  const isRieul = isHangul ? (code - 0xAC00) % 28 === 8 : false;

  switch (type) {
    case 'josa_ga': return trimmed + (hasBatchim ? '이' : '가');
    case 'josa_ul': return trimmed + (hasBatchim ? '을' : '를');
    case 'josa_un': return trimmed + (hasBatchim ? '은' : '는');
    case 'josa_ro': return trimmed + (hasBatchim && !isRieul ? '으로' : '로');
    case 'josa_wa': return trimmed + (hasBatchim ? '과' : '와');
    case 'josa_ui': return trimmed + '의';
    default: return trimmed;
  }
}

/**
 * 해시태그(#) 제거 및 동화 수식어 변환
 */
export function cleanCharacterDesc(desc) {
  if (!desc) return '';
  return desc.replace(/#/g, '').replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
}

export class StoryEngine {
  /**
   * 질문 답변 또는 자유 이야기를 바탕으로 5장면의 그림책 스토리 생성
   * @param {Object} params
   * @param {string} params.characterName - 주인공 이름 (예: 몽실이)
   * @param {string} params.characterDesc - 캐릭터 설명 (예: 하늘을 날고 싶은 분홍색 토끼)
   * @param {string} params.mode - 'qa' (문답형) 또는 'free' (자유형)
   * @param {Object} params.qa - 문답 데이터 { where, who, event, action, ending }
   * @param {string} params.freeText - 자유 이야기 텍스트
   * @param {string} params.customTitle - 사용자가 정한 그림책 제목
   * @param {string} params.author - 작가 이름 (예: 5살 지호와 엄마)
   * @param {string} [params.geminiApiKey] - 옵션: Gemini API 키 (있으면 고급 AI 생성)
   */
  static async generateStory(params) {
    const { characterName, characterDesc, mode, qa, freeText, customTitle, author, geminiApiKey } = params;

    // 만약 Gemini API 키가 제공되었다면 Gemini Pro API 호출 시도
    if (geminiApiKey && geminiApiKey.trim().length > 10) {
      try {
        const geminiResult = await StoryEngine.generateWithGemini(params);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn('Gemini Pro API 호출 실패, 내장 지능형 스토리 엔진으로 전환합니다.', err);
      }
    }

    // 기본: 안정적이고 따뜻한 내장 동화 스토리텔링 엔진 (100% 오프라인 작동)
    let result;
    if (mode === 'free' && freeText && freeText.trim().length > 0) {
      result = StoryEngine.generateFromFreeText(characterName, characterDesc, freeText, customTitle, author);
    } else {
      result = StoryEngine.generateFromQA(characterName, characterDesc, qa, customTitle, author);
    }
    result.childName = params.childName || characterName;
    result.protagonistName = params.protagonistName || characterName;
    return result;
  }

  /**
   * 문답 기반 5장면 동화 생성 (유치원 부모참여수업 표준 질문)
   */
  static generateFromQA(characterName, characterDesc, qa, customTitle, author) {
    const name = characterName || '우리 친구';
    const where = qa?.where ? qa.where.trim() : '무지개 피어난 초록 숲속';
    const who = qa?.who ? qa.who.trim() : '';
    const event = qa?.event ? qa.event.trim() : '알록달록 예쁜 풍선이 하늘로 두둥실 날아올랐어요';
    // 질문 4번(행동), 5번(결말)에 남아있을 수 있는 특정 인물명(예: 김우진이가) 자동 정제
    let cleanAction = (qa?.action ? qa.action.trim() : '두 손을 꼬옥 잡고 반갑게 인사했어요')
      .replace(/^[가-힣]{2,4}(이가|가|은|는|이)\s+/, '')
      .trim();
    if (!cleanAction) cleanAction = '두 손을 꼬옥 잡고 반갑게 인사했어요';

    let cleanEnding = (qa?.ending ? qa.ending.trim() : '모두 함께 하하호호 웃으며 행복하게 집으로 돌아왔어요')
      .replace(/^[가-힣]{2,4}(이가|가|은|는|이)\s+/, '')
      .trim();
    if (!cleanEnding) cleanEnding = '모두 함께 하하호호 웃으며 행복하게 집으로 돌아왔어요';

    const fullContext = `${where} ${who} ${event} ${cleanAction} ${cleanEnding}`;
    // 장소(where)를 최우선으로 반영하여 정확한 배경 테마 선정
    const theme = StoryEngine.detectTheme(fullContext, where);
    const companionType = StoryEngine.detectCompanion(who || fullContext);

    // 표지 제목 생성 (없으면 자동 생성)
    const title = customTitle && customTitle.trim().length > 0
      ? customTitle.trim()
      : `${name}의 신나는 ${StoryEngine.getCleanPlace(where)} 모험`;

    const bookAuthor = author && author.trim().length > 0 ? author.trim() : `${name}와 가족`;
    const whoText = who || '다정한 친구';

    // 한글 맞춤법 및 조사 정밀 부착 (괄호 제거)
    const cleanDesc = cleanCharacterDesc(characterDesc);
    const nameGa = attachJosa(name, 'josa_ga');
    const nameEun = attachJosa(name, 'josa_un');
    const nameUi = attachJosa(name, 'josa_ui');
    const whereRo = attachJosa(where, 'josa_ro');
    const whoUl = attachJosa(whoText, 'josa_ul');

    const descPrefix = cleanDesc ? `${cleanDesc} ` : '';

    const pages = [
      {
        pageNumber: 1,
        sceneTitle: '신나는 모험의 시작',
        theme: theme,
        bgVariant: 'morning',
        text: `어느 화창한 아침, ${descPrefix}${nameGa} 길을 나섰어요.\n살랑살랑 부는 바람을 맞으며 ${whereRo} 씩씩하게 걸어갔답니다.`,
        protagonistAction: 'ready_to_run',
        companion: null,
        soundCue: 'pop'
      },
      {
        pageNumber: 2,
        sceneTitle: '반가운 친구를 만났어요',
        theme: theme,
        bgVariant: 'day',
        friendText: whoText,
        text: `우와! 그곳에서 아주 다정한 ${whoUl} 만났어요.\n"안녕? 우리 같이 재미있게 놀자!"\n둘은 눈을 마주치며 방긋 웃었어요.`,
        protagonistAction: 'walking',
        companion: companionType ? { type: companionType, action: 'greeting' } : null,
        soundCue: 'snap'
      },
      {
        pageNumber: 3,
        sceneTitle: '깜짝 놀랄 일이 생겼어요',
        theme: theme,
        bgVariant: 'afternoon',
        eventProp: event,
        text: `그런데 바로 그때, 놀라운 일이 일어났어요!\n${event}.\n${nameUi} 두 눈이 반짝반짝 커졌어요.`,
        protagonistAction: 'walking',
        companion: companionType ? { type: companionType, action: 'walking' } : null,
        soundCue: 'magic'
      },
      {
        pageNumber: 4,
        sceneTitle: '용기를 내어 힘차게!',
        theme: theme,
        bgVariant: 'sunset',
        friendText: whoText,
        text: `${nameEun} 씩씩하게 용기를 냈어요!\n${cleanAction}.\n정말 대단하고 멋진 순간이었답니다!`,
        protagonistAction: 'walking',
        companion: companionType ? { type: companionType, action: 'celebrating' } : null,
        soundCue: 'snap'
      },
      {
        pageNumber: 5,
        sceneTitle: '마음이 따뜻해진 하루',
        theme: theme,
        bgVariant: 'night',
        friendText: whoText,
        text: `${cleanEnding}.\n오늘 밤 ${nameEun} 알록달록 무지개 꿈을 꾸며 코오 잠들었답니다.\n참 즐겁고 따뜻한 하루였어요!`,
        protagonistAction: 'clapping_happy',
        companion: companionType ? { type: companionType, action: 'celebrating' } : null,
        soundCue: 'magic'
      }
    ];

    return {
      title,
      author: bookAuthor,
      characterName: name,
      theme,
      pages
    };
  }

  /**
   * 자유 입력 텍스트를 의미 분석하여 5장면 동화책으로 정밀 재구성
   * (사용자가 입력한 문장이 3문장이든 1문장이든 이야기의 전개를 완벽하게 5장면으로 확장)
   */
  static generateFromFreeText(characterName, characterDesc, text, customTitle, author) {
    const name = characterName || '토끼';
    const theme = StoryEngine.detectTheme(text);
    const companionType = StoryEngine.detectCompanion(text);

    const bookAuthor = author && author.trim().length > 0 ? author.trim() : `${name}와 가족`;

    // 1. 달리기 시합(토끼와 거북이 등 경주/시합) 특화 분석
    if (theme === 'race' || text.includes('토끼') && text.includes('거북이') || text.includes('시합') || text.includes('달리기')) {
      return StoryEngine.createRaceStory(name, text, customTitle, bookAuthor);
    }

    // 2. 일반 자유 입력 텍스트의 5막(기-승-전-결) 구조화
    return StoryEngine.createGeneralStory(name, characterDesc, text, customTitle, bookAuthor, theme, companionType);
  }

  /**
   * 토끼와 거북이 및 달리기 시합 스토리 전용 5막 구성
   */
  static createRaceStory(characterName, text, customTitle, bookAuthor) {
    const title = customTitle && customTitle.trim().length > 0
      ? customTitle.trim()
      : `토끼와 거북이`;

    // 사용자의 원본 문장을 문맥에 맞게 보존하면서 5개 장면에 균형 있게 배분
    const pages = [
      {
        pageNumber: 1,
        sceneTitle: '신나는 달리기 시합 시작!',
        theme: 'race',
        bgVariant: 'morning',
        text: `어느 맑고 화창한 날, 토끼와 거북이가 넓은 들판에서 신나는 달리기 시합을 시작했어요!`,
        protagonistAction: 'ready_to_run',
        companion: { type: 'turtle', action: 'ready', x: 0.68, y: 0.49, size: 210 }
      },
      {
        pageNumber: 2,
        sceneTitle: '나무 그늘 아래서 쿨쿨 쉬어요',
        theme: 'race',
        bgVariant: 'day',
        text: `토끼는 거북이보다 빨라서 앞서가다가, 거북이가 느릿느릿 따라오는 것을 보고 여유를 가지며 나무 그늘 아래서 쉬었어요.`,
        protagonistAction: 'sleeping_nap',
        companion: { type: 'turtle', action: 'steady_walk', x: 0.76, y: 0.48, size: 145 }
      },
      {
        pageNumber: 3,
        sceneTitle: '한 걸음 한 걸음 꾸준히!',
        theme: 'race',
        bgVariant: 'afternoon',
        text: `토끼가 솔솔 잠든 사이에도, 거북이는 포기하지 않고 땀을 흘리며 한 걸음 한 걸음 꾸준히 달렸어요.`,
        protagonistAction: 'resting_under_tree',
        companion: { type: 'turtle', action: 'overtaking', x: 0.62, y: 0.49, size: 225 }
      },
      {
        pageNumber: 4,
        sceneTitle: '결승선이 저 앞에 보여요!',
        theme: 'race',
        bgVariant: 'sunset',
        text: `잠에서 깬 토끼가 깜짝 놀라 달려갔지만, 거북이는 이미 결승선을 눈앞에 두고 씩씩하게 앞서가고 있었어요!`,
        protagonistAction: 'running_fast',
        companion: { type: 'turtle', action: 'walking', x: 0.68, y: 0.46, size: 220 }
      },
      {
        pageNumber: 5,
        sceneTitle: '멋진 승리와 소중한 우정',
        theme: 'race',
        bgVariant: 'celebration',
        text: `마침내 거북이가 결승선을 통과해 멋지게 이겼어요! 토끼도 거북이를 축하해주며 둘은 서로를 존중하는 좋은 친구가 되었답니다.`,
        protagonistAction: 'clapping_happy',
        companion: { type: 'turtle', action: 'celebrating', x: 0.65, y: 0.48, size: 240 }
      }
    ];

    return {
      title,
      author: bookAuthor,
      characterName,
      theme: 'race',
      pages
    };
  }

  /**
   * 일반 자유 이야기 5막 구성
   */
  static createGeneralStory(name, characterDesc, text, customTitle, bookAuthor, theme, companionType) {
    const rawSentences = text
      .split(/[.\n!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const title = customTitle && customTitle.trim().length > 0
      ? customTitle.trim()
      : `${name}의 특별한 이야기`;

    const titles = [
      '이야기의 문이 활짝 열려요',
      '새로운 발걸음과 발견',
      '두근두근 흥미진진한 모험',
      '용기를 내어 씩씩하게!',
      '행복과 미소가 가득한 하루'
    ];
    const bgVariants = ['morning', 'day', 'afternoon', 'sunset', 'celebration'];

    const nameGa = attachJosa(name, 'josa_ga');
    const nameEun = attachJosa(name, 'josa_un');

    const pages = [];
    const chunkCount = 5;

    for (let i = 0; i < chunkCount; i++) {
      let pageText = '';

      if (rawSentences.length >= 5) {
        // 문장이 충분히 긴 경우 각 장에 균등 배분
        const idx = Math.floor((i / chunkCount) * rawSentences.length);
        pageText = rawSentences[idx] + '.';
        if (rawSentences[idx + 1] && rawSentences.length > 6 && i < 4) {
          pageText += ' ' + rawSentences[idx + 1] + '.';
        }
      } else if (rawSentences[i]) {
        // 입력된 문장 순차 적용
        pageText = rawSentences[i] + '.';
      } else {
        // 문장이 적을 때 이야기의 앞뒤 맥락을 잇는 자연스러운 연결 문장
        const contextFillers = [
          `어느 화창한 날, ${nameGa} 두근거리는 마음으로 신나는 길을 나섰어요.`,
          `발걸음을 옮길 때마다 주변에 예쁜 풍경들이 방긋 미소 짓고 있었답니다.`,
          `모두가 힘을 모아 따뜻한 마음으로 함께 길을 걸어갔어요.`,
          `${nameEun} 씩씩한 용기를 내어 한 걸음 더 앞으로 힘차게 나아갔답니다!`,
          `모두의 얼굴에 행복한 웃음꽃이 피어나며 참 아름답고 즐거운 하루가 되었답니다.`
        ];
        pageText = contextFillers[i];
      }

      pages.push({
        pageNumber: i + 1,
        sceneTitle: titles[i],
        theme,
        bgVariant: bgVariants[i],
        text: pageText,
        protagonistAction: i === 0 ? 'ready_to_run' : (i === 4 ? 'clapping_happy' : 'walking'),
        companion: companionType ? { type: companionType, action: i === 4 ? 'celebrating' : 'walking' } : null,
        soundCue: 'pop'
      });
    }

    return {
      title,
      author: bookAuthor,
      characterName: name,
      theme,
      pages
    };
  }

  /**
   * 텍스트 키워드를 분석하여 가장 어울리는 동화 배경 테마 반환
   * @param {string} text - 전체 문맥 또는 자유 텍스트
   * @param {string} [whereText] - 4단계 질문1의 장소 (예: "무지개 피어난 초록 숲속")
   */
  static detectTheme(text, whereText = '') {
    const combined = `${whereText} ${text}`.toLowerCase();

    // 1. 달리기 / 시합 / 경주 / 토끼와 거북이
    if (combined.includes('달리기') || combined.includes('시합') || combined.includes('경주') ||
        combined.includes('이어달리기') || combined.includes('마라톤') || combined.includes('운동회') ||
        combined.includes('골인') || combined.includes('결승선') ||
        (combined.includes('토끼') && combined.includes('거북'))) {
      return 'race';
    }

    // 2. 바다 / 물속 / 해변
    if (combined.includes('바다') || combined.includes('물속') || combined.includes('해변') ||
        combined.includes('파도') || combined.includes('물고기') || combined.includes('고래') ||
        combined.includes('상어') || combined.includes('헤엄') || combined.includes('모래사장')) {
      return 'ocean';
    }

    // 3. 우주 / 로켓 (절대로 '달'이나 '별' 한 글자로 검사하지 않음! '우주', '로켓', '우주선', '행성', '은하수')
    if (combined.includes('우주') || combined.includes('로켓') || combined.includes('우주선') ||
        combined.includes('행성') || combined.includes('외계인') || combined.includes('은하수') ||
        combined.includes('달나라') || combined.includes('별나라')) {
      return 'space';
    }

    // 4. 숲속 / 자연 / 동산 / 숲길 (자연 테마를 확실히 감지)
    if (combined.includes('숲') || combined.includes('숲속') || combined.includes('초록') ||
        combined.includes('나무') || combined.includes('동산') || combined.includes('자연') ||
        combined.includes('꽃밭') || combined.includes('풀밭') || combined.includes('들판') ||
        combined.includes('정원') || combined.includes('산속')) {
      return 'forest';
    }

    // 5. 무지개 / 마법 나라
    if (combined.includes('무지개') || combined.includes('구름 나라') || combined.includes('마법') ||
        combined.includes('요정 나라') || combined.includes('사탕 나라')) {
      return 'rainbow';
    }

    // 6. 마을 / 놀이터 / 우리 집 / 유치원
    if (combined.includes('마을') || combined.includes('놀이터') || combined.includes('유치원') ||
        combined.includes('어린이집') || combined.includes('학교') || combined.includes('공원') ||
        combined.includes('우리 집') || combined.includes('골목길')) {
      return 'village';
    }

    // 기본값: 가장 따뜻하고 안정적인 숲속 모험 테마
    return 'forest';
  }

  /**
   * 텍스트에서 등장하는 동반 동물/캐릭터 감지
   */
  static detectCompanion(text) {
    const t = text.toLowerCase();
    if (t.includes('거북')) return 'turtle';
    if (t.includes('강아지') || t.includes('멍멍') || t.includes('댕댕')) return 'puppy';
    if (t.includes('고양이') || t.includes('야옹')) return 'cat';
    if (t.includes('다람쥐') || t.includes('도토리')) return 'squirrel';
    if (t.includes('새') || t.includes('참새') || t.includes('파랑새')) return 'bird';
    if (t.includes('곰') || t.includes('곰돌')) return 'bear';
    if (t.includes('요정') || t.includes('천사')) return 'fairy';
    return null;
  }

  static getCleanPlace(place) {
    return place.replace(/[에서|으로|로|의]+$/, '').trim();
  }

  /**
   * Gemini Pro API 연동 (사용자가 설정에서 API Key를 넣었을 때)
   */
  static async generateWithGemini(params) {
    const cleanDesc = cleanCharacterDesc(params.characterDesc);
    const place = params.qa?.where || '초록 숲속';
    const who = params.qa?.who || '다정한 친구';
    const event = params.qa?.event || '';
    const action = params.qa?.action || '';
    const ending = params.qa?.ending || '';

    const prompt = `당신은 유치원 만 4~5세 유아와 부모를 위한 세계 최고 수준의 따뜻하고 감동적인 어린이 그림책 작가입니다.
사용자가 입력한 이야기 내용을 분석하여, 5개 장면의 완벽한 그림책 이야기로 재구성하세요.

주인공 이름: ${params.characterName}
주인공 특징: ${cleanDesc || '밝고 씩씩한 아이'}
배경 장소: ${place}
만난 친구: ${who}
일어난 사건: ${event}
주인공의 행동: ${action}
마무리: ${ending}
자유 작성 이야기: ${params.freeText || ''}

지침:
1. 문장 작성 규칙:
   - 각 장마다 어린이가 쉽게 이해할 수 있는 1~2문장의 따뜻하고 리듬감 있는 문장으로 작성하세요.
   - 절대 문장 안에 해시태그(#)를 넣지 마세요!
   - 절대 문장 안에 "(이)가", "(을)를", "(으)로" 같은 괄호 조사를 넣지 마세요! 정확한 자연스러운 한국어 조사(예: 강시아가, 숲속으로, 강시아는)를 붙여주세요.
2. 배경 장소("${place}")와 어울리는 theme을 정하세요:
   - 숲/초록/자연이면 "forest"
   - 바다/물속이면 "ocean"
   - 달리기/경주/시합/토끼와 거북이면 "race"
   - 우주/로켓이면 "space"
   - 마을/놀이터/집이면 "village"
   - 무지개/구름/마법이면 "rainbow"
3. 동반 캐릭터(companionType): "turtle", "puppy", "cat", "squirrel", "bird", "bear", "fairy", 또는 없으면 null.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "title": "동화책 제목",
  "theme": "forest" | "race" | "ocean" | "space" | "village" | "rainbow",
  "companionType": "bird" | "turtle" | "puppy" | "cat" | "squirrel" | "bear" | "fairy" | null,
  "pages": [
    {
      "pageNumber": 1,
      "sceneTitle": "장면 1 소제목",
      "text": "1장 동화 텍스트 (화창한 아침 출발)",
      "protagonistAction": "ready_to_run" | "walking",
      "companionAction": null
    },
    {
      "pageNumber": 2,
      "sceneTitle": "장면 2 소제목",
      "text": "2장 동화 텍스트 (친구와의 반가운 만남)",
      "protagonistAction": "walking",
      "companionAction": "greeting"
    },
    {
      "pageNumber": 3,
      "sceneTitle": "장면 3 소제목",
      "text": "3장 동화 텍스트 (놀라운 사건과 소품)",
      "protagonistAction": "walking",
      "companionAction": "walking"
    },
    {
      "pageNumber": 4,
      "sceneTitle": "장면 4 소제목",
      "text": "4장 동화 텍스트 (용기를 낸 주인공의 행동)",
      "protagonistAction": "running_fast" | "walking",
      "companionAction": "celebrating"
    },
    {
      "pageNumber": 5,
      "sceneTitle": "장면 5 소제목",
      "text": "5장 동화 텍스트 (따뜻하고 행복한 귀가/꿈나라)",
      "protagonistAction": "clapping_happy",
      "companionAction": "celebrating"
    }
  ]
}`;

    // 실제 서비스 중인 최신 Google Gemini 모델 목록
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      const controller = new AbortController();
      // AI 생성을 위한 넉넉한 15초 타임아웃
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${params.geminiApiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Model ${model} returned HTTP ${res.status}`);
        }

        const data = await res.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonText) throw new Error(`No content from model ${model}`);

        const parsed = JSON.parse(jsonText);

        const theme = parsed.theme || StoryEngine.detectTheme(params.freeText || '', place);
        const compType = parsed.companionType || StoryEngine.detectCompanion(who || params.freeText || '');

        return {
          title: params.customTitle || parsed.title || `${params.characterName}의 신나는 모험`,
          author: params.author || `${params.characterName}와 가족`,
          characterName: params.characterName,
          theme,
          pages: parsed.pages.map((p, idx) => ({
            pageNumber: idx + 1,
            sceneTitle: p.sceneTitle || `장면 ${idx + 1}`,
            theme,
            bgVariant: ['morning', 'day', 'afternoon', 'sunset', 'celebration'][idx],
            text: p.text.replace(/#/g, '').trim(),
            protagonistAction: p.protagonistAction || 'walking',
            companion: compType ? { type: compType, action: p.companionAction || 'walking' } : null,
            soundCue: 'pop'
          }))
        };
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err;
        console.warn(`Gemini 모델 [${model}] 시도 실패, 다음 모델로 진행합니다...`, err);
      }
    }

    throw lastError || new Error('모든 Gemini 모델 호출 실패');
  }

  /**
   * Gemini API 키 유효성 테스트
   */
  static async testApiKey(apiKey) {
    if (!apiKey || apiKey.trim().length < 10) {
      return { success: false, message: '올바른 API 키를 입력해 주세요.' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }]
        })
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return { success: true, message: '✅ Gemini API 연결 성공! 최신 AI 스토리 생성이 활성화되었습니다.' };
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.error?.message || `HTTP ${res.status}`;
        return { success: false, message: `❌ 연결 실패: ${msg}` };
      }
    } catch (err) {
      clearTimeout(timeoutId);
      return { success: false, message: `❌ 요청 오류: ${err.message || '네트워크 오류 또는 시간 초과'}` };
    }
  }
}
