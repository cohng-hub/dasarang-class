// 고화질 그림책 캔버스 렌더러 (스토리 액션, 친구 캐릭터, 소품, 코스튬 완벽 결합)
import { SceneTemplates } from './sceneTemplates.js';
import { CharacterProcessor } from './characterProcessor.js';
import { SceneActors } from './sceneActors.js';

export class BookRenderer {
  /**
   * 문단 텍스트 및 페이지 정보를 정밀 분석하여 해당 장면에 맞는 주인공 및 모든 친구 사진 매칭
   * @param {Object} pageInfo - 페이지 정보 (text, friendText, sceneTitle 등)
   * @param {Array<Object>} uploadedPhotos - 업로드된 사진 목록 [{ id, name, transparentCanvas, isProtagonist }]
   * @param {HTMLCanvasElement} defaultProtagonistCanvas - 기본 주인공 캔버스
   * @returns {{ protagonistCanvas: HTMLCanvasElement, companionCanvases: Array<HTMLCanvasElement>, matchedFriendNames: Array<string>, companionCanvas: HTMLCanvasElement|null, matchedFriendName: string|null }}
   */
  static matchCharactersForPage(pageInfo, uploadedPhotos = [], defaultProtagonistCanvas = null) {
    // 1. 주인공 사진 및 캔버스 찾기 (isProtagonist 플래그 우선)
    let protagonistPhoto = (uploadedPhotos || []).find(p => p.isProtagonist);
    if (!protagonistPhoto && uploadedPhotos && uploadedPhotos.length > 0) {
      protagonistPhoto = uploadedPhotos[0];
    }
    const protagonistCanvas = protagonistPhoto?.transparentCanvas || defaultProtagonistCanvas;

    if (!uploadedPhotos || uploadedPhotos.length === 0) {
      return {
        protagonistCanvas,
        companionCanvases: [],
        matchedFriendNames: [],
        companionCanvas: null,
        matchedFriendName: null
      };
    }

    // 2. 검색 대상 텍스트 결합 (페이지 문단 본문이 최우선)
    const pageText = (pageInfo.text || '').trim();
    const friendText = (pageInfo.friendText || '').trim();
    const titleText = (pageInfo.sceneTitle || '').trim();
    const fullText = `${pageText} ${friendText} ${titleText}`.toLowerCase();

    // 3. 주인공을 제외한 모든 등장인물 사진에 대해 문단 텍스트 매칭 검사 (모든 친구 탐색)
    const companionCanvases = [];
    const matchedFriendNames = [];

    const candidatePhotos = uploadedPhotos.filter(p => p !== protagonistPhoto);

    for (const photo of candidatePhotos) {
      if (!photo.name || !photo.transparentCanvas) continue;
      const rawName = photo.name.trim();
      if (!rawName) continue;

      // 이름 정규화 (공백 및 특수문자 정리)
      const cleanName = rawName.replace(/[^가-힣a-zA-Z0-9]/g, '').toLowerCase();
      if (!cleanName) continue;

      // 한국어 호칭/받침 변형 처리: '기린이' -> '기린', '토끼야' -> '토끼', '고양이야' -> '고양이'
      const baseName = (cleanName.endsWith('이') && cleanName.length >= 2)
        ? cleanName.slice(0, -1)
        : cleanName;

      // 문단 본문에서 검색:
      // (1) 전체 이름 포함 여부 (예: '고양이' in '고양이와 토끼가')
      // (2) 기본 어간 포함 여부 (예: '기린' in '기린과 함께')
      // (3) 정규식 한국어 조사 패턴
      let isMentioned = fullText.includes(cleanName) || fullText.includes(baseName);
      if (!isMentioned && baseName.length >= 2) {
        try {
          const reg = new RegExp(`${baseName}(?:이|가|을|를|은|는|와|과|랑|이랑|에게|야|아)?`, 'i');
          isMentioned = reg.test(fullText);
        } catch (e) {
          // ignore regex error
        }
      }

      if (isMentioned) {
        if (!companionCanvases.includes(photo.transparentCanvas)) {
          companionCanvases.push(photo.transparentCanvas);
          matchedFriendNames.push(rawName);
        }
        // 🌟 break 하지 않고 언급된 모든 친구 캐릭터를 목록에 수집!
      }
    }

    return {
      protagonistCanvas,
      companionCanvases,
      matchedFriendNames,
      companionCanvas: companionCanvases.length > 0 ? companionCanvases[0] : null,
      matchedFriendName: matchedFriendNames.join(', ')
    };
  }

  /**
   * 전체 책 페이지(표지 1장 + 본문 5장 = 총 6장) 렌더링
   * @param {Object} storyData - StoryEngine에서 생성된 스토리 데이터
   * @param {HTMLCanvasElement|HTMLImageElement} characterCanvas - 투명화된 어린이 원본 그림
   * @param {Object} options - 옵션 (페이지별 개별 사진 매핑, 업로드 사진 목록 등)
   * @returns {Promise<Array<{pageNumber: number, title: string, text: string, canvas: HTMLCanvasElement, dataUrl: string}>>}
   */
  static async renderEntireBook(storyData, characterCanvas, options = {}) {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const pages = [];
    const width = 1200;
    const height = 900;

    // 1. 표지 렌더링 (Page 0)
    const coverCanvas = BookRenderer.renderCover(storyData, characterCanvas, width, height, options);
    pages.push({
      pageNumber: 0,
      isCover: true,
      title: storyData.title,
      text: `${storyData.author}의 첫 번째 그림책`,
      canvas: coverCanvas,
      dataUrl: coverCanvas.toDataURL('image/png')
    });

    // 2. 본문 5장 렌더링 (Page 1 ~ 5)
    for (let i = 0; i < storyData.pages.length; i++) {
      const pageInfo = storyData.pages[i];

      // 문단 텍스트 및 페이지 정보를 정밀 분석하여 알맞은 캐릭터 자동 매칭
      const charMatch = BookRenderer.matchCharactersForPage(
        pageInfo,
        options.uploadedPhotos || [],
        characterCanvas
      );

      const activeChar = (options.pageImages && options.pageImages[pageInfo.pageNumber])
        ? options.pageImages[pageInfo.pageNumber]
        : (charMatch.protagonistCanvas || characterCanvas);

      const pageOptions = {
        ...options,
        companionCanvases: charMatch.companionCanvases,
        companionCanvas: charMatch.companionCanvas,
        matchedFriendNames: charMatch.matchedFriendNames,
        matchedFriendName: charMatch.matchedFriendName
      };

      const pageCanvas = BookRenderer.renderScenePage(pageInfo, activeChar, width, height, pageOptions);
      pages.push({
        pageNumber: i + 1,
        isCover: false,
        title: pageInfo.sceneTitle,
        text: pageInfo.text,
        canvas: pageCanvas,
        dataUrl: pageCanvas.toDataURL('image/png')
      });
    }

    return pages;
  }

  /**
   * 표지 렌더링
   */
  static renderCover(storyData, characterCanvas, w = 1200, h = 900, options = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // 1. 표지 전용 테마 배경 렌더링 (pageNumber: 0)
    SceneTemplates.renderBackground(ctx, w, h, storyData.theme || 'forest', 'morning', 0);

    // 2. 동화책 장식 프레임 테두리
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    ctx.strokeStyle = 'rgba(255, 218, 121, 0.85)';
    ctx.lineWidth = 4;
    ctx.strokeRect(42, 42, w - 84, h - 84);

    const corners = [
      { x: 42, y: 42 },
      { x: w - 42, y: 42 },
      { x: 42, y: h - 42 },
      { x: w - 42, y: h - 42 }
    ];
    ctx.fillStyle = '#ffd32a';
    for (const c of corners) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. 그림책 제목 카드
    ctx.save();
    const titleBoxY = 98;
    const titleBoxH = 130;

    // 상단 원아 작가 배지 (무조건 선택된 원아의 이름 명시)
    let childAuthorName = storyData.childName;
    if (!childAuthorName && storyData.author) {
      childAuthorName = storyData.author.replace(/^(해솔반\s*)/, '').replace(/와\s*가족$/, '').trim();
    }
    if (!childAuthorName) childAuthorName = '우리 친구';

    ctx.fillStyle = '#C05621';
    ctx.font = 'bold 22px "Jua", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`✨ 해솔반 ${childAuthorName} 작가님의 그림책 ✨`, w / 2, 68);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    const titleW = Math.min(w * 0.82, 950);
    const titleX = (w - titleW) / 2;
    BookRenderer.roundRect(ctx, titleX, titleBoxY, titleW, titleBoxH, 24);
    ctx.fill();

    ctx.strokeStyle = '#f5cd79';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#2c3e50';
    ctx.font = '46px "Jua", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(storyData.title, w / 2, titleBoxY + titleBoxH / 2);
    ctx.restore();

    // 4. 주인공: 어린이가 그린 원본 그림을 중앙에 크게 배치!
    if (characterCanvas) {
      const charSize = Math.min(w * 0.42, 420);
      const aspect = characterCanvas.width / characterCanvas.height;
      let drawW = charSize;
      let drawH = charSize / aspect;
      if (drawH > 440) {
        drawH = 440;
        drawW = drawH * aspect;
      }
      const charX = (w - drawW) / 2;
      const charY = 270 + (440 - drawH) / 2;

      CharacterProcessor.renderCharacterWithStickerEffect(
        ctx,
        characterCanvas,
        charX,
        charY,
        drawW,
        drawH,
        {
          withSticker: true,
          stickerColor: '#ffffff',
          stickerWidth: 8,
          shadowBlur: 16,
          rotation: 0,
          isPhoto: options.isPhoto
        }
      );
    }

    // 5. 하단 작가 명패 (어린이 작가 이름 강조)
    ctx.save();
    const authorBoxY = h - 130;
    ctx.font = '24px "Jua", "Noto Sans KR", sans-serif';
    let authorText = `글·그림 : ${storyData.author || ('해솔반 ' + childAuthorName + '와 가족')}`;
    if (storyData.protagonistName && storyData.protagonistName !== childAuthorName) {
      if (!authorText.includes(storyData.protagonistName)) {
        authorText += ` (주인공: 👑 ${storyData.protagonistName})`;
      }
    }
    const authorTextW = ctx.measureText(authorText).width;
    const authorBoxW = Math.max(520, authorTextW + 70);
    const authorBoxX = (w - authorBoxW) / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    BookRenderer.roundRect(ctx, authorBoxX, authorBoxY, authorBoxW, 58, 29);
    ctx.fill();
    ctx.strokeStyle = '#e0af68';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#2D3748';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(authorText, w / 2, authorBoxY + 29);
    ctx.restore();

    return canvas;
  }

  /**
   * 본문 페이지 렌더링 (각 장면에 맞춘 주인공, 동반 캐릭터, 소품, 자동 줄바꿈 텍스트 카드)
   */
  static renderScenePage(pageInfo, characterCanvas, w = 1200, h = 900, options = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const pNum = pageInfo.pageNumber;
    const theme = pageInfo.theme || 'forest';

    // 1. 각 페이지별 테마 배경 렌더링
    SceneTemplates.renderBackground(ctx, w, h, theme, pageInfo.bgVariant || 'day', pNum);

    // 2. 소품 그리기 (배경 소품: 출발선 배너, 결승선 리본 등)
    BookRenderer.renderSceneProps(ctx, pageInfo, pNum, theme, w, h);

    // 3. 페이지별 주인공 위치, 크기, 포즈 계산
    const { poseX, poseY, scale, rotation, flipH } = BookRenderer.getCharacterPoseForScene(pNum, w, h, pageInfo, options);

    let charDrawX = 0, charDrawY = 0, drawW = 0, drawH = 0;

    if (characterCanvas) {
      const aspect = characterCanvas.width / characterCanvas.height;
      const baseSize = 340 * scale;
      drawW = baseSize;
      drawH = baseSize / aspect;

      charDrawX = poseX - drawW / 2;
      charDrawY = poseY - drawH / 2;

      // 아이 그림 / 사진 캐릭터 그리기 (둥근 모서리 & 스티커 테두리)
      CharacterProcessor.renderCharacterWithStickerEffect(
        ctx,
        characterCanvas,
        charDrawX,
        charDrawY,
        drawW,
        drawH,
        {
          withSticker: true,
          stickerColor: '#ffffff',
          stickerWidth: 7,
          shadowBlur: 14,
          rotation: rotation,
          flipH: flipH,
          borderRadius: 22,
          isPhoto: options.isPhoto
        }
      );
    }

    // 4. 주인공 부가 액션 (얼굴을 가리지 않는 은은한 파티클/땀방울/먼지/zZz 효과)
    if (characterCanvas) {
      SceneActors.drawCharacterActionAndCostume(
        ctx,
        pNum,
        charDrawX,
        charDrawY,
        drawW,
        drawH,
        pageInfo
      );
    }

    // 5. 동반 캐릭터 (동화 문단에 매칭된 사용자 업로드 친구 사진들 또는 기본 테마 동물) 렌더링
    const companionList = (options.companionCanvases && options.companionCanvases.length > 0)
      ? options.companionCanvases
      : (options.companionCanvas ? [options.companionCanvas] : []);

    if (companionList.length > 0) {
      // 🌟 문단 텍스트에서 인식된 모든 등장인물 사진을 우측에 조화롭게 렌더링!
      const count = companionList.length;

      for (let ci = 0; ci < count; ci++) {
        const compCanvas = companionList[ci];
        if (!compCanvas) continue;

        let compCenterX, compCenterY, maxW, maxH;

        if (count === 1) {
          compCenterX = w * 0.72;
          compCenterY = h * 0.48;
          maxW = 340;
          maxH = 380;
        } else if (count === 2) {
          // 2명인 경우 (예: 고양이와 토끼): 좌우로 나란히 균형있게 배치
          compCenterX = (ci === 0) ? w * 0.65 : w * 0.88;
          compCenterY = (ci === 0) ? h * 0.49 : h * 0.47;
          maxW = 280;
          maxH = 330;
        } else {
          // 3명 이상인 경우: w * 0.58 ~ w * 0.92 사이에 고르게 분배
          const startX = w * 0.58;
          const endX = w * 0.92;
          compCenterX = startX + (ci / (count - 1)) * (endX - startX);
          compCenterY = h * 0.48 + (ci % 2 === 0 ? 0 : -15);
          maxW = Math.min(240, 600 / count);
          maxH = 290;
        }

        const compAspect = compCanvas.width / compCanvas.height;
        let compDrawW = maxW;
        let compDrawH = maxW / compAspect;
        if (compDrawH > maxH) {
          compDrawH = maxH;
          compDrawW = compDrawH * compAspect;
        }
        if (compDrawW > maxW) {
          compDrawW = maxW;
          compDrawH = compDrawW / compAspect;
        }

        const compX = compCenterX - compDrawW / 2;
        const compY = compCenterY - compDrawH / 2;

        CharacterProcessor.renderCharacterWithStickerEffect(
          ctx,
          compCanvas,
          compX,
          compY,
          compDrawW,
          compDrawH,
          {
            withSticker: true,
            stickerColor: '#ffffff',
            stickerWidth: 7,
            shadowBlur: 14,
            rotation: (ci % 2 === 0 ? -1 : 1.5),
            flipH: false,
            isPhoto: false
          }
        );
      }
    } else {
      // 업로드된 친구 매칭이 없을 때만 기본 테마 동물/소품 렌더링
      BookRenderer.renderCompanionCharacter(ctx, pageInfo, pNum, theme, w, h);
    }

    // 6. 하단 이야기 텍스트 카드 (단어 단위 자동 줄바꿈 & 폰트 크기 자동 조절)
    BookRenderer.renderStoryTextCard(ctx, pageInfo.text, pNum, w, h);

    return canvas;
  }

  /**
   * 장면 배경 소품 렌더링 (출발 배너, 결승 리본, 축하 꽃가루 등)
   */
  static renderSceneProps(ctx, pageInfo, pNum, theme, w, h) {
    const isRace = theme === 'race';

    if (isRace) {
      if (pNum === 1) {
        // 1장: 출발선 배너
        SceneActors.drawStartBanner(ctx, w * 0.50, h * 0.62, 380);
      } else if (pNum === 5) {
        // 5장: 결승선 리본 & 축하 꽃가루
        SceneActors.drawFinishRibbon(ctx, w * 0.50, h * 0.60, 420);
        SceneActors.drawCelebrationConfetti(ctx, w, h);
      }
    } else if (pageInfo.eventProp && pageInfo.eventProp.trim().length > 0) {
      // 일반 테마에서 사용자가 직접 입력한 이벤트 소품
      if (typeof SceneActors.drawEventProp === 'function') {
        SceneActors.drawEventProp(ctx, pageInfo.eventProp, w * 0.50, h * 0.35, 200);
      }
    }
  }

  /**
   * 동반 캐릭터 렌더링 (이야기에 등장하는 동물/친구만 정확히 그리기)
   */
  static renderCompanionCharacter(ctx, pageInfo, pNum, theme, w, h) {
    const isRace = theme === 'race';

    // 1. 스토리 데이터에 직접 지정된 companion 정보가 있는 경우
    if (pageInfo.companion) {
      const comp = pageInfo.companion;
      if (!comp.type) return;
      const cx = comp.x !== undefined ? (comp.x <= 1 ? comp.x * w : comp.x) : w * 0.65;
      const cy = comp.y !== undefined ? (comp.y <= 1 ? comp.y * h : comp.y) : h * 0.48;
      const cSize = comp.size || 220;
      const cAction = comp.action || 'walking';
      SceneActors.drawFriendCharacter(ctx, comp.type, cx, cy, cSize, cAction);
      return;
    }

    // 2. 달리기 시합(race) 테마 기본 동반 캐릭터: 거북이
    if (isRace) {
      switch (pNum) {
        case 1:
          // 1장: 출발선에서 토끼 옆에 나란히 서서 머리띠 매고 출발 준비!
          SceneActors.drawFriendCharacter(ctx, '거북이', w * 0.68, h * 0.49, 210, 'ready');
          break;
        case 2:
          // 2장: 저 멀리 뒤쪽 언덕길에서 땀 흘리며 꾸준히 걸어오는 거북이
          SceneActors.drawFriendCharacter(ctx, '거북이', w * 0.76, h * 0.48, 145, 'steady_walk');
          break;
        case 3:
          // 3장: 쉬고 있는 토끼를 씩씩하게 앞질러 달리는 거북이
          SceneActors.drawFriendCharacter(ctx, '거북이', w * 0.62, h * 0.49, 225, 'overtaking');
          break;
        case 4:
          // 4장: 결승선을 눈앞에 두고 씩씩하게 달려가는 거북이
          SceneActors.drawFriendCharacter(ctx, '거북이', w * 0.68, h * 0.46, 220, 'walking');
          break;
        case 5:
          // 5장: 1등 금메달을 목에 걸고 양손 번쩍 만세하는 승리의 거북이!
          SceneActors.drawFriendCharacter(ctx, '거북이', w * 0.65, h * 0.48, 240, 'celebrating');
          break;
      }
      return;
    }

    // 3. 일반 테마: friendText에 실제 동물이 명시된 경우에만 2장/4장에 그림
    if (pageInfo.friendText && pageInfo.friendText.trim().length > 0) {
      const ft = pageInfo.friendText.toLowerCase();
      // 언급된 동물이 있을 때만 렌더링 (다람쥐 강제 등장 방지)
      if (ft.includes('거북') || ft.includes('강아지') || ft.includes('개') || ft.includes('고양이') ||
          ft.includes('새') || ft.includes('곰') || ft.includes('다람쥐') || ft.includes('요정')) {
        if (pNum === 2) {
          SceneActors.drawFriendCharacter(ctx, pageInfo.friendText, w * 0.68, h * 0.44, 230, 'greeting');
        } else if (pNum === 4) {
          SceneActors.drawFriendCharacter(ctx, pageInfo.friendText, w * 0.68, h * 0.40, 220, 'celebrating');
        }
      }
    }
  }

  /**
   * 장면에 따른 주인공의 위치 및 스케일
   */
  static getCharacterPoseForScene(pageNumber, w, h, pageInfo = {}, options = {}) {
    // 1. pageInfo에 커스텀 주인공 위치가 지정되어 있는 경우
    if (pageInfo.protagonist) {
      const p = pageInfo.protagonist;
      return {
        poseX: p.x !== undefined ? (p.x <= 1 ? p.x * w : p.x) : w * 0.32,
        poseY: p.y !== undefined ? (p.y <= 1 ? p.y * h : p.y) : h * 0.49,
        scale: p.scale || 0.88,
        rotation: p.rotation || 0,
        flipH: !!p.flipH
      };
    }

    const hasCompanion = (options.companionCanvases && options.companionCanvases.length > 0) || !!options.companionCanvas;
    const isRace = pageInfo.theme === 'race';

    if (isRace) {
      switch (pageNumber) {
        case 1: // 1장: 출발선 좌측에서 씩씩하게 준비
          return { poseX: w * 0.32, poseY: h * 0.49, scale: 0.88, rotation: 2, flipH: false };
        case 2: // 2장: 나무 그늘 아래서 여유롭게 쉬는 토끼
          return { poseX: w * 0.32, poseY: h * 0.52, scale: 0.86, rotation: 0, flipH: false };
        case 3: // 3장: 뒤쪽에서 여전히 쉬고/자고 있는 토끼
          return { poseX: w * 0.25, poseY: h * 0.52, scale: 0.72, rotation: 2, flipH: false };
        case 4: // 4장: 뒤늦게 잠에서 깨어 부리나케 달리는 토끼
          return { poseX: w * 0.28, poseY: h * 0.48, scale: 0.85, rotation: -3, flipH: false };
        case 5: // 5장: 결승선에서 거북이 옆에 서서 활짝 웃으며 축하해주는 토끼
          return { poseX: w * 0.32, poseY: h * 0.48, scale: 0.86, rotation: 0, flipH: false };
      }
    }

    // 기본 위치 (우측에 친구 사진이 있을 경우 주인공을 좌측에 자연스럽게 배치)
    switch (pageNumber) {
      case 1:
        return { poseX: hasCompanion ? w * 0.28 : w * 0.32, poseY: h * 0.49, scale: 0.88, rotation: 2, flipH: false };
      case 2:
        return { poseX: w * 0.26, poseY: h * 0.49, scale: 0.86, rotation: -2, flipH: false };
      case 3:
        return { poseX: hasCompanion ? w * 0.26 : w * 0.28, poseY: h * 0.49, scale: 0.85, rotation: 2, flipH: false };
      case 4:
        return { poseX: hasCompanion ? w * 0.28 : w * 0.34, poseY: h * 0.40, scale: 0.88, rotation: -3, flipH: false };
      case 5:
      default:
        return { poseX: hasCompanion ? w * 0.28 : w * 0.46, poseY: h * 0.50, scale: 0.86, rotation: 0, flipH: false };
    }
  }

  /**
   * 하단 동화 텍스트 카드 렌더링
   * 긴 문장도 화면 밖으로 잘리지 않도록 단어 단위 자동 줄바꿈 & 폰트 크기 자동 조절
   */
  static renderStoryTextCard(ctx, text, pageNumber, w, h) {
    ctx.save();
    const cardMarginX = 65;
    const cardY = h - 230;
    const cardW = w - cardMarginX * 2;
    const cardH = 175;

    // 1. 카드 그림자 및 둥근 흰색 배경
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 6;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    BookRenderer.roundRect(ctx, cardMarginX, cardY, cardW, cardH, 22);
    ctx.fill();

    // 2. 따뜻한 파스텔 금빛 테두리
    ctx.strokeStyle = 'rgba(241, 196, 15, 0.65)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // 3. 지능형 단어 줄바꿈 & 폰트 자동 스케일링
    const maxTextWidth = cardW - 100; // 좌우 50px 여백 보장
    const maxTextHeight = cardH - 50;  // 상하 및 페이지 번호 여백 보장

    const fontSizes = [32, 28, 25, 22, 20];
    let chosenLines = [];
    let chosenFontSize = 24;
    let chosenLineHeight = 36;

    for (const fSize of fontSizes) {
      ctx.font = `${fSize}px "Jua", "Noto Sans KR", sans-serif`;
      const lines = BookRenderer.wrapKoreanText(ctx, text || '', maxTextWidth);
      const lHeight = Math.round(fSize * 1.45);
      if (lines.length * lHeight <= maxTextHeight) {
        chosenLines = lines;
        chosenFontSize = fSize;
        chosenLineHeight = lHeight;
        break;
      }
      chosenLines = lines;
      chosenFontSize = fSize;
      chosenLineHeight = lHeight;
    }

    ctx.font = `${chosenFontSize}px "Jua", "Noto Sans KR", sans-serif`;
    ctx.fillStyle = '#2f3542';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const totalH = chosenLines.length * chosenLineHeight;
    const startY = cardY + (cardH - 26 - totalH) / 2 + chosenLineHeight / 2 + 6;

    chosenLines.forEach((line, idx) => {
      ctx.fillText(line, w / 2, startY + idx * chosenLineHeight);
    });

    // 4. 페이지 번호 (1 / 5)
    ctx.fillStyle = '#a4b0be';
    ctx.font = '20px "Jua", "Noto Sans KR", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${pageNumber} / 5`, w - cardMarginX - 25, cardY + cardH - 26);

    ctx.restore();
  }

  /**
   * 한국어 자연스러운 단어 단위 줄바꿈 알고리즘
   */
  static wrapKoreanText(ctx, text, maxWidth) {
    if (!text) return [''];
    const paragraphs = text.split('\n');
    const resultLines = [];

    paragraphs.forEach(paragraph => {
      const words = paragraph.split(' ').filter(w => w.length > 0);
      if (words.length === 0) return;

      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width <= maxWidth) {
          currentLine = testLine;
        } else {
          resultLines.push(currentLine);
          currentLine = words[i];
        }
      }
      if (currentLine) {
        resultLines.push(currentLine);
      }
    });

    // 만약 한 줄도 생성되지 않았다면 글자 단위 분할
    if (resultLines.length === 0) {
      resultLines.push(text);
    }

    return resultLines;
  }

  static roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
