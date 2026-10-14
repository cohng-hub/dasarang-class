// 동화책 장면별(1~5장 및 표지) 테마 특화 배경 캔버스 렌더러
// {{그림체}} 따뜻하고 사랑스러운 파스텔 동화책 일러스트 스타일 100% 유지

export class SceneTemplates {
  /**
   * 페이지 번호(1~5장 또는 표지)와 테마에 맞추어 이야기 흐름에 완벽히 일치하는 고유 배경 렌더링
   */
  static renderBackground(ctx, width, height, theme = 'forest', variant = 'day', pageNumber = 1) {
    ctx.save();

    const t = (theme || 'forest').toLowerCase();

    if (t === 'race' || t === 'running') {
      SceneTemplates.renderRaceTheme(ctx, width, height, pageNumber);
    } else if (t === 'ocean' || t === 'sea') {
      SceneTemplates.renderOceanTheme(ctx, width, height, pageNumber);
    } else if (t === 'space') {
      SceneTemplates.renderSpaceTheme(ctx, width, height, pageNumber);
    } else if (t === 'snow' || t === 'winter' || t === 'ice') {
      SceneTemplates.renderSnowTheme(ctx, width, height, pageNumber);
    } else if (t === 'garden' || t === 'farm' || t === 'vegetable') {
      SceneTemplates.renderGardenTheme(ctx, width, height, pageNumber);
    } else if (t === 'village' || t === 'town' || t === 'playground') {
      SceneTemplates.renderVillageTheme(ctx, width, height, pageNumber);
    } else if (t === 'rainbow') {
      SceneTemplates.renderRainbowTheme(ctx, width, height, pageNumber);
    } else {
      // 기본 자연 숲속/피크닉 모험 테마
      SceneTemplates.renderForestTheme(ctx, width, height, pageNumber);
    }

    // 부드러운 고급 동화책 종이 질감 오버레이
    SceneTemplates.drawPaperTexture(ctx, width, height);

    ctx.restore();
  }

  // ==========================================
  // [THEME 1] 달리기 시합 & 경주 (토끼와 거북이 특화)
  // ==========================================
  static renderRaceTheme(ctx, w, h, pageNumber) {
    switch (pageNumber) {
      case 0: // 표지
        SceneTemplates.drawRaceCover(ctx, w, h);
        break;
      case 1: // 1장: 출발선과 START 트랙
        SceneTemplates.drawRaceStep1Start(ctx, w, h);
        break;
      case 2: // 2장: 완만한 언덕길과 커다란 쉼터 그늘 나무
        SceneTemplates.drawRaceStep2RestingTree(ctx, w, h);
        break;
      case 3: // 3장: 따뜻한 오후 햇살 아래 끈기 있게 앞지르는 트랙
        SceneTemplates.drawRaceStep3SteadyTrack(ctx, w, h);
        break;
      case 4: // 4장: 결승선이 보이는 노을빛 언덕길
        SceneTemplates.drawRaceStep4SunsetTrack(ctx, w, h);
        break;
      case 5: // 5장: 결승선 통과와 승리의 축하 광장
        SceneTemplates.drawRaceStep5VictoryPlaza(ctx, w, h);
        break;
      default:
        SceneTemplates.drawRaceStep1Start(ctx, w, h);
        break;
    }
  }

  // 표지: 화창한 하늘과 완만한 초록 언덕, 곡선 트랙과 만국기
  static drawRaceCover(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#FFE8D6');
    sky.addColorStop(0.5, '#FFF1E6');
    sky.addColorStop(1, '#E8F4FD');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 무지개 아치 & 햇살
    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.95, w * 0.55);
    SceneTemplates.drawSun(ctx, w * 0.85, 120, 50, '#FFA502');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.22, 110, 60);

    // 언덕
    ctx.fillStyle = '#A3E4D7';
    SceneTemplates.drawHill(ctx, 0, h * 0.52, w, 90, 3);
    ctx.fillStyle = '#7DCEA0';
    SceneTemplates.drawHill(ctx, 0, h * 0.60, w, 110, 2);

    // 달리기 트랙 (흙빛 곡선 길)
    ctx.fillStyle = '#52BE80';
    ctx.fillRect(0, h * 0.66, w, h * 0.34);

    ctx.fillStyle = '#F5CBA7';
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h);
    ctx.quadraticCurveTo(w * 0.4, h * 0.76, w * 0.5, h * 0.72);
    ctx.quadraticCurveTo(w * 0.7, h * 0.68, w * 0.9, h * 0.66);
    ctx.lineTo(w * 0.82, h * 0.66);
    ctx.quadraticCurveTo(w * 0.62, h * 0.72, w * 0.35, h * 0.80);
    ctx.lineTo(w * 0.2, h);
    ctx.closePath();
    ctx.fill();

    // 상단 만국기 가랜드
    SceneTemplates.drawBuntingFlags(ctx, w, 40, 22);
    SceneTemplates.drawTwinkles(ctx, 25, w, h * 0.7);
  }

  // 1장: 출발선과 모래 트랙
  static drawRaceStep1Start(ctx, w, h) {
    // 맑고 싱그러운 아침 하늘
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#A0E4F1');
    sky.addColorStop(0.5, '#D0F0FD');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, 130, 110, 48, '#FFA502');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.48, h * 0.15, 65);
    SceneTemplates.drawFluffyCloud(ctx, w * 0.82, h * 0.20, 50);

    // 먼 초록 언덕
    ctx.fillStyle = '#A3E4D7';
    SceneTemplates.drawHill(ctx, 0, h * 0.46, w, 100, 3);
    ctx.fillStyle = '#7DCEA0';
    SceneTemplates.drawHill(ctx, 0, h * 0.54, w, 110, 2);

    // 잔디 필드
    ctx.fillStyle = '#52BE80';
    ctx.fillRect(0, h * 0.60, w, h * 0.40);

    // 넓은 달리기 시합 모래 트랙
    ctx.fillStyle = '#F5CBA7';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.62);
    ctx.bezierCurveTo(w * 0.35, h * 0.60, w * 0.7, h * 0.64, w, h * 0.62);
    ctx.lineTo(w, h * 0.80);
    ctx.bezierCurveTo(w * 0.7, h * 0.82, w * 0.35, h * 0.78, 0, h * 0.80);
    ctx.closePath();
    ctx.fill();

    // 트랙의 하얀색 레인 구분선 (대시 라인)
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.71);
    ctx.bezierCurveTo(w * 0.35, h * 0.69, w * 0.7, h * 0.73, w, h * 0.71);
    ctx.stroke();
    ctx.restore();

    // 상단 축하 만국기 가랜드 (출발 응원 분위기)
    SceneTemplates.drawBuntingFlags(ctx, w, 35, 18);

    // 잔디밭 들꽃들
    SceneTemplates.drawFlowersAndMushrooms(ctx, w, h, 'day');
  }

  // 2장: 큰 그늘 나무와 언덕길 (토끼가 여유 부리며 쉬는 쉼터)
  static drawRaceStep2RestingTree(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#85C1E9');
    sky.addColorStop(1, '#EBF5FB');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 따스한 태양
    SceneTemplates.drawSun(ctx, w * 0.88, 110, 45, '#FFA502');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.35, 100, 60);

    // 푸른 언덕 곡선
    ctx.fillStyle = '#7DCEA0';
    SceneTemplates.drawHill(ctx, 0, h * 0.48, w, 110, 2);

    // 전경 완만한 언덕 잔디밭
    ctx.fillStyle = '#52BE80';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.62);
    ctx.bezierCurveTo(w * 0.3, h * 0.56, w * 0.7, h * 0.65, w, h * 0.58);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 뒤쪽에서 완만하게 올라오는 달리기 흙길 트랙
    ctx.fillStyle = '#F5CBA7';
    ctx.beginPath();
    ctx.moveTo(w * 0.55, h);
    ctx.quadraticCurveTo(w * 0.70, h * 0.78, w * 0.85, h * 0.68);
    ctx.lineTo(w * 0.95, h * 0.68);
    ctx.quadraticCurveTo(w * 0.80, h * 0.80, w * 0.65, h);
    ctx.closePath();
    ctx.fill();

    // 좌측: 시원한 그늘을 드리우는 아름다운 큰 나무
    ctx.save();
    const treeX = w * 0.22;
    const treeY = h * 0.62;
    // 줄기
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.moveTo(treeX - 40, treeY);
    ctx.quadraticCurveTo(treeX - 25, treeY - 140, treeX - 50, h * 0.18);
    ctx.lineTo(treeX + 50, h * 0.18);
    ctx.quadraticCurveTo(treeX + 35, treeY - 140, treeX + 45, treeY);
    ctx.closePath();
    ctx.fill();

    // 시원하고 둥글둥글한 풍성한 나뭇잎
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.arc(treeX, h * 0.22, 135, 0, Math.PI * 2);
    ctx.arc(treeX - 65, h * 0.28, 95, 0, Math.PI * 2);
    ctx.arc(treeX + 65, h * 0.26, 105, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(treeX - 20, h * 0.20, 110, 0, Math.PI * 2);
    ctx.arc(treeX + 35, h * 0.22, 90, 0, Math.PI * 2);
    ctx.fill();

    // 나무 그늘 (바닥에 드리워진 시원한 푸른 그림자)
    ctx.fillStyle = 'rgba(46, 125, 50, 0.35)';
    ctx.beginPath();
    ctx.ellipse(treeX + 60, treeY + 10, 160, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 나비와 들꽃
    SceneTemplates.drawFlowersAndMushrooms(ctx, w, h, 'day');
  }

  // 3장: 따뜻한 오후 햇살 아래 꾸준히 달리는 트랙 (거북이가 앞지르는 순간)
  static drawRaceStep3SteadyTrack(ctx, w, h) {
    // 따뜻한 오후 하늘
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#74B9FF');
    sky.addColorStop(0.5, '#DFE6E9');
    sky.addColorStop(1, '#FFEAA7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 오후의 따뜻한 햇살
    SceneTemplates.drawSun(ctx, w * 0.5, 95, 45, '#FDCB6E');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.18, 120, 55);
    SceneTemplates.drawFluffyCloud(ctx, w * 0.80, 110, 65);

    // 부드러운 산등성이
    ctx.fillStyle = '#81ECEC';
    SceneTemplates.drawHill(ctx, 0, h * 0.45, w, 90, 3);
    ctx.fillStyle = '#55EFC4';
    SceneTemplates.drawHill(ctx, 0, h * 0.52, w, 110, 2);

    // 잔디 들판
    ctx.fillStyle = '#00B894';
    ctx.fillRect(0, h * 0.58, w, h * 0.42);

    // 넓게 펼쳐진 곡선형 러닝 트랙 (앞지르기 좋은 넓은 코스)
    ctx.fillStyle = '#FAB1A0';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.64);
    ctx.quadraticCurveTo(w * 0.4, h * 0.58, w * 0.65, h * 0.62);
    ctx.quadraticCurveTo(w * 0.85, h * 0.65, w, h * 0.60);
    ctx.lineTo(w, h * 0.78);
    ctx.quadraticCurveTo(w * 0.85, h * 0.82, w * 0.65, h * 0.80);
    ctx.quadraticCurveTo(w * 0.4, h * 0.76, 0, h * 0.82);
    ctx.closePath();
    ctx.fill();

    // 트랙 중앙 점선
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.setLineDash([22, 16]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.73);
    ctx.quadraticCurveTo(w * 0.4, h * 0.67, w * 0.65, h * 0.71);
    ctx.quadraticCurveTo(w * 0.85, h * 0.74, w, h * 0.69);
    ctx.stroke();
    ctx.restore();

    // 트랙 옆 응원 깃발들 (작은 삼각형 깃발들)
    ctx.save();
    const flagColors = ['#FF7675', '#74B9FF', '#FDCB6E', '#55EFC4'];
    for (let i = 0; i < 7; i++) {
      const fx = w * (0.12 + i * 0.13);
      const fy = h * 0.58;
      ctx.strokeStyle = '#636E72';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx, fy - 35);
      ctx.stroke();

      ctx.fillStyle = flagColors[i % flagColors.length];
      ctx.beginPath();
      ctx.moveTo(fx, fy - 35);
      ctx.lineTo(fx + 22, fy - 26);
      ctx.lineTo(fx, fy - 17);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 4장: 결승선이 보이는 노을빛 언덕길 (스퍼트와 대역전의 순간)
  static drawRaceStep4SunsetTrack(ctx, w, h) {
    // 감동적인 주황-분홍 노을빛 하늘
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#FF7675');
    sky.addColorStop(0.4, '#FAB1A0');
    sky.addColorStop(1, '#FFEAA7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 노을지는 커다랗고 부드러운 해
    SceneTemplates.drawSun(ctx, w * 0.82, 130, 52, '#FF9F43');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.25, 110, 65);

    // 은은한 파스텔 무지개 아치
    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.90, w * 0.50);

    // 언덕
    ctx.fillStyle = '#6AB04C';
    SceneTemplates.drawHill(ctx, 0, h * 0.48, w, 110, 2);

    ctx.fillStyle = '#26DE81';
    ctx.fillRect(0, h * 0.58, w, h * 0.42);

    // 결승선으로 쭉 뻗어가는 직선 트랙
    ctx.fillStyle = '#F5CBA7';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.62);
    ctx.lineTo(w, h * 0.62);
    ctx.lineTo(w, h * 0.80);
    ctx.lineTo(0, h * 0.80);
    ctx.closePath();
    ctx.fill();

    // 트랙의 속도감 넘치는 흰색 가이드선
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.62);
    ctx.lineTo(w, h * 0.62);
    ctx.moveTo(0, h * 0.80);
    ctx.lineTo(w, h * 0.80);
    ctx.stroke();

    ctx.setLineDash([25, 18]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.71);
    ctx.lineTo(w, h * 0.71);
    ctx.stroke();
    ctx.restore();

    // 저 멀리 결승선 아치 실루엣
    ctx.save();
    const archX = w * 0.88;
    const archY = h * 0.52;
    ctx.fillStyle = '#EB4D4B';
    SceneTemplates.roundRect(ctx, archX - 25, archY - 50, 50, 10, 4);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('FINISH', archX - 18, archY - 42);
    ctx.restore();
  }

  // 5장: 결승선 통과와 승리의 축제 광장 (FINISH 아치, 메달, 꽃가루)
  static drawRaceStep5VictoryPlaza(ctx, w, h) {
    // 화려하고 영광스러운 아침/축제 그라데이션 하늘
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    sky.addColorStop(0, '#A8EDEA');
    sky.addColorStop(0.5, '#FED6E3');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 대형 축하 무지개
    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.85, w * 0.52);
    SceneTemplates.drawSun(ctx, w * 0.88, 110, 48, '#FFD700');

    // 축하 언덕
    ctx.fillStyle = '#2ED573';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.60);
    ctx.bezierCurveTo(w * 0.3, h * 0.54, w * 0.7, h * 0.62, w, h * 0.56);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 결승 지점 체크무늬 바닥
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, h * 0.64, w, h * 0.16);
    ctx.fillStyle = '#2F3542';
    const checkSize = 24;
    for (let cx = 0; cx < w; cx += checkSize * 2) {
      for (let cy = h * 0.64; cy < h * 0.80; cy += checkSize) {
        const offset = ((cy - h * 0.64) / checkSize) % 2 === 0 ? 0 : checkSize;
        ctx.fillRect(cx + offset, cy, checkSize, checkSize);
      }
    }

    // 만국기 가랜드
    SceneTemplates.drawBuntingFlags(ctx, w, 40, 24);

    // 양옆의 대형 축하 꽃들
    SceneTemplates.drawBigCelebrationFlowers(ctx, w, h);
  }

  // ==========================================
  // [THEME 2] 자연과 숲속 모험 테마 (기본)
  // ==========================================
  static renderForestTheme(ctx, w, h, pageNumber) {
    switch (pageNumber) {
      case 0:
        SceneTemplates.drawCoverBackground(ctx, w, h, 'forest');
        break;
      case 1:
        SceneTemplates.drawStep1PathMorning(ctx, w, h);
        break;
      case 2:
        SceneTemplates.drawStep2OakMeeting(ctx, w, h);
        break;
      case 3:
        // [수정] 어두운 제단 대신 밝고 싱그러운 비밀의 숲속 공터
        SceneTemplates.drawStep3ForestClearing(ctx, w, h);
        break;
      case 4:
        SceneTemplates.drawStep4RainbowMeadow(ctx, w, h);
        break;
      case 5:
        SceneTemplates.drawStep5CozyHomeNight(ctx, w, h);
        break;
      default:
        SceneTemplates.drawStep1PathMorning(ctx, w, h);
        break;
    }
  }

  // 3장 수정본: 어두운 방/열쇠 제단이 아닌, 햇살 쏟아지는 싱그러운 숲속 꽃밭 공터
  static drawStep3ForestClearing(ctx, w, h) {
    // 화사한 낮 하늘
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#81ECEC');
    sky.addColorStop(0.6, '#DFE6E9');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 햇살 쏟아지는 빛줄기
    ctx.save();
    SceneTemplates.drawSun(ctx, w * 0.5, 90, 48, '#FDCB6E');
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(w * 0.5, 90);
      ctx.lineTo(w * (0.15 + i * 0.18), h);
      ctx.lineTo(w * (0.28 + i * 0.18), h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 숲속 나무들 실루엣
    ctx.fillStyle = '#55EFC4';
    SceneTemplates.drawHill(ctx, 0, h * 0.46, w, 110, 3);
    ctx.fillStyle = '#00B894';
    SceneTemplates.drawHill(ctx, 0, h * 0.55, w, 120, 2);

    // 싱그러운 꽃잔디밭
    ctx.fillStyle = '#2ED573';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);

    // 맑은 숲속 시냇물
    ctx.fillStyle = '#74B9FF';
    ctx.beginPath();
    ctx.moveTo(w * 0.40, h * 0.62);
    ctx.quadraticCurveTo(w * 0.55, h * 0.72, w * 0.45, h);
    ctx.lineTo(w * 0.62, h);
    ctx.quadraticCurveTo(w * 0.70, h * 0.72, w * 0.50, h * 0.62);
    ctx.closePath();
    ctx.fill();

    // 반짝이는 요정 가루 & 들꽃
    SceneTemplates.drawTwinkles(ctx, 35, w, h * 0.65);
    SceneTemplates.drawFlowersAndMushrooms(ctx, w, h, 'day');
  }

  // ==========================================
  // [THEME 3] 바다 & 물속 모험 테마 (Ocean)
  // ==========================================
  static renderOceanTheme(ctx, w, h, pageNumber) {
    switch (pageNumber) {
      case 0:
        SceneTemplates.drawOceanCover(ctx, w, h);
        break;
      case 1:
        SceneTemplates.drawOceanStep1Morning(ctx, w, h);
        break;
      case 2:
        SceneTemplates.drawOceanStep2Reef(ctx, w, h);
        break;
      case 3:
        SceneTemplates.drawOceanStep3Treasure(ctx, w, h);
        break;
      case 4:
        SceneTemplates.drawOceanStep4Sunset(ctx, w, h);
        break;
      case 5:
        SceneTemplates.drawOceanStep5Night(ctx, w, h);
        break;
      default:
        SceneTemplates.drawOceanStep1Morning(ctx, w, h);
        break;
    }
  }

  static drawOceanCover(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#74B9FF');
    sky.addColorStop(0.5, '#A0E4F1');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.95, w * 0.55);
    SceneTemplates.drawSun(ctx, w * 0.85, 110, 48, '#FFA502');

    // 푸른 바다 파도
    ctx.fillStyle = '#0984E3';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.62);
    ctx.bezierCurveTo(w * 0.3, h * 0.58, w * 0.7, h * 0.66, w, h * 0.60);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 황금빛 모래사장
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.quadraticCurveTo(w * 0.4, h * 0.68, w, h * 0.75);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    SceneTemplates.drawTwinkles(ctx, 30, w, h * 0.6);
  }

  static drawOceanStep1Morning(ctx, w, h) {
    // 1장: 맑고 눈부신 아침 바닷가
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#81ECEC');
    sky.addColorStop(0.6, '#DFE6E9');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, 130, 110, 48, '#FFA502');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.45, h * 0.16, 60);
    SceneTemplates.drawFluffyCloud(ctx, w * 0.80, h * 0.18, 50);

    // 에메랄드빛 바다
    ctx.fillStyle = '#00CEC9';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.58);
    ctx.bezierCurveTo(w * 0.35, h * 0.55, w * 0.7, h * 0.62, w, h * 0.56);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 백사장 모래밭
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.68);
    ctx.quadraticCurveTo(w * 0.5, h * 0.64, w, h * 0.70);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 불가사리와 조개껍데기
    const shellColors = ['#FF7675', '#FD79A8', '#FDCB6E'];
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = shellColors[i % shellColors.length];
      ctx.beginPath();
      ctx.arc(w * (0.15 + i * 0.14), h * 0.76, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  static drawOceanStep2Reef(ctx, w, h) {
    // 2장: 산호초 바닷속
    const water = ctx.createLinearGradient(0, 0, 0, h);
    water.addColorStop(0, '#74B9FF');
    water.addColorStop(0.4, '#0984E3');
    water.addColorStop(1, '#00CEC9');
    ctx.fillStyle = water;
    ctx.fillRect(0, 0, w, h);

    // 물방울 거품
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc((i * 83) % w, (i * 61) % (h * 0.75) + 30, (i % 3) * 5 + 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 산호 언덕
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.75);
    ctx.quadraticCurveTo(w * 0.4, h * 0.70, w, h * 0.76);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // 알록달록 산호 군락
    const corals = ['#FF7675', '#FD79A8', '#FDCB6E', '#00B894'];
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = corals[i % corals.length];
      ctx.beginPath();
      ctx.arc(w * (0.08 + i * 0.14), h * 0.75, 28, Math.PI, 0);
      ctx.fill();
    }
  }

  static drawOceanStep3Treasure(ctx, w, h) {
    // 3장: 반짝이는 진주 바다
    const water = ctx.createLinearGradient(0, 0, 0, h);
    water.addColorStop(0, '#0984E3');
    water.addColorStop(0.6, '#00CEC9');
    water.addColorStop(1, '#55EFC4');
    ctx.fillStyle = water;
    ctx.fillRect(0, 0, w, h);

    // 물빛 광선
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(w * (0.1 + i * 0.16), 0);
      ctx.lineTo(w * (0.2 + i * 0.16), h);
      ctx.lineTo(w * (0.06 + i * 0.16), h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = '#F5CD79';
    ctx.fillRect(0, h * 0.74, w, h * 0.26);
    SceneTemplates.drawTwinkles(ctx, 35, w, h * 0.7);
  }

  static drawOceanStep4Sunset(ctx, w, h) {
    // 4장: 노을빛 찬란한 바다
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#FF7675');
    sky.addColorStop(0.5, '#FAB1A0');
    sky.addColorStop(1, '#FFEAA7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, w * 0.82, 130, 52, '#FF9F43');
    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.90, w * 0.50);

    // 붉은빛 노을 파도
    ctx.fillStyle = '#E17055';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.62);
    ctx.bezierCurveTo(w * 0.35, h * 0.58, w * 0.7, h * 0.65, w, h * 0.60);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FAB1A0';
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
  }

  static drawOceanStep5Night(ctx, w, h) {
    // 5장: 은은한 달빛 밤바다
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0F2027');
    sky.addColorStop(0.5, '#203A43');
    sky.addColorStop(1, '#2C5364');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSmilingMoon(ctx, w * 0.8, h * 0.18, 55);
    SceneTemplates.drawTwinkles(ctx, 60, w, h * 0.65);

    // 밤바다 수면 반사
    ctx.fillStyle = 'rgba(255, 234, 167, 0.15)';
    ctx.fillRect(w * 0.72, h * 0.65, 120, h * 0.35);

    ctx.fillStyle = '#1B263B';
    ctx.fillRect(0, h * 0.70, w, h * 0.30);
  }

  // ==========================================
  // [THEME 4] 신비한 우주 & 별나라 테마 (Space)
  // ==========================================
  static renderSpaceTheme(ctx, w, h, pageNumber) {
    switch (pageNumber) {
      case 0:
        SceneTemplates.drawSpaceCover(ctx, w, h);
        break;
      case 1:
        SceneTemplates.drawSpaceStep1Launch(ctx, w, h);
        break;
      case 2:
        SceneTemplates.drawSpaceStep2Orbit(ctx, w, h);
        break;
      case 3:
        SceneTemplates.drawSpaceStep3Comet(ctx, w, h);
        break;
      case 4:
        SceneTemplates.drawSpaceStep4AlienPlanet(ctx, w, h);
        break;
      case 5:
        SceneTemplates.drawSpaceStep5Return(ctx, w, h);
        break;
      default:
        SceneTemplates.drawSpaceStep1Launch(ctx, w, h);
        break;
    }
  }

  static drawSpaceCover(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#1A1A40');
    sky.addColorStop(0.5, '#270082');
    sky.addColorStop(1, '#7A0BC0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawTwinkles(ctx, 60, w, h * 0.75);
    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.95, w * 0.52);

    // 빛나는 토성
    SceneTemplates.drawSaturnPlanet(ctx, w * 0.82, h * 0.22, 60);
  }

  static drawSpaceStep1Launch(ctx, w, h) {
    // 1장: 신비한 우주 은하수와 발사 플랫폼 (잔디밭 전면 제거, 완전한 우주 배경)
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    sky.addColorStop(0, '#0B0C10');
    sky.addColorStop(0.5, '#1B1464');
    sky.addColorStop(1, '#2E1A47');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 반짝이는 무수한 은하수 별빛
    SceneTemplates.drawTwinkles(ctx, 80, w, h * 0.7);

    // 저 멀리 떠 있는 환상적인 토성과 신비한 푸른 행성
    SceneTemplates.drawSaturnPlanet(ctx, w * 0.82, h * 0.20, 52);

    // 달나라/신비한 행성 오라
    ctx.save();
    const planetAura = ctx.createRadialGradient(w * 0.20, h * 0.22, 10, w * 0.20, h * 0.22, 50);
    planetAura.addColorStop(0, '#00F2FE');
    planetAura.addColorStop(0.6, '#4FACFE');
    planetAura.addColorStop(1, 'transparent');
    ctx.fillStyle = planetAura;
    ctx.beginPath();
    ctx.arc(w * 0.20, h * 0.22, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 미래형 우주 기지 / 달표면 플랫폼 (어두운 메탈릭 슬레이트 + 네온 가이드라인)
    ctx.fillStyle = '#1A1C29';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.62);
    ctx.bezierCurveTo(w * 0.35, h * 0.59, w * 0.7, h * 0.64, w, h * 0.60);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#121420';
    ctx.fillRect(0, h * 0.72, w, h * 0.28);

    // 우주 활주로 네온 가이드 라인 (사이버 민트/시안)
    ctx.save();
    ctx.strokeStyle = '#00F2FE';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00F2FE';
    ctx.shadowBlur = 12;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.lineTo(w, h * 0.72);
    ctx.stroke();

    // 우주 기지 발사대 안테나 실루엣
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(w * 0.85, h * 0.38, 14, h * 0.26);
    ctx.fillRect(w * 0.82, h * 0.44, 30, 6);
    ctx.fillRect(w * 0.82, h * 0.52, 30, 6);
    // 안테나 상단 반짝이는 비콘 불빛
    ctx.fillStyle = '#FF4757';
    ctx.beginPath();
    ctx.arc(w * 0.85 + 7, h * 0.38 - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  static drawSpaceStep2Orbit(ctx, w, h) {
    // 2장: 지구 궤도 (파란 지구와 밝은 별빛)
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0B0C10');
    sky.addColorStop(0.6, '#1F2833');
    sky.addColorStop(1, '#0C1033');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawTwinkles(ctx, 60, w, h * 0.7);

    // 거대한 푸른 지구 실루엣
    ctx.save();
    const earthGrad = ctx.createRadialGradient(w * 0.5, h + 200, 100, w * 0.5, h + 200, 500);
    earthGrad.addColorStop(0, '#66D3FA');
    earthGrad.addColorStop(0.4, '#1E90FF');
    earthGrad.addColorStop(1, '#001E6C');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(w * 0.5, h + 200, 500, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }

  static drawSpaceStep3Comet(ctx, w, h) {
    // 3장: 혜성과 보석 소행성
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0C1033');
    sky.addColorStop(0.5, '#4A3E87');
    sky.addColorStop(1, '#2D3436');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawTwinkles(ctx, 80, w, h * 0.75);

    // 알록달록 꼬리 혜성
    ctx.save();
    const cometGrad = ctx.createLinearGradient(w * 0.2, 50, w * 0.7, h * 0.4);
    cometGrad.addColorStop(0, 'rgba(255, 234, 167, 0.8)');
    cometGrad.addColorStop(0.5, 'rgba(255, 118, 117, 0.4)');
    cometGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = cometGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.7, h * 0.35);
    ctx.lineTo(w * 0.2, 60);
    ctx.lineTo(w * 0.3, 100);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#2D3436';
    ctx.fillRect(0, h * 0.70, w, h * 0.30);
  }

  static drawSpaceStep4AlienPlanet(ctx, w, h) {
    // 4장: 신비한 노을빛 행성
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#2C061F');
    sky.addColorStop(0.5, '#8739FA');
    sky.addColorStop(1, '#E17055');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSaturnPlanet(ctx, w * 0.80, h * 0.24, 65);
    SceneTemplates.drawTwinkles(ctx, 50, w, h * 0.65);

    // 보랏빛 크리스탈 언덕
    ctx.fillStyle = '#6C5CE7';
    SceneTemplates.drawHill(ctx, 0, h * 0.58, w, 110, 2);
    ctx.fillStyle = '#341F97';
    ctx.fillRect(0, h * 0.68, w, h * 0.32);
  }

  static drawSpaceStep5Return(ctx, w, h) {
    // 5장: 은하수 쏟아지는 찬란한 우주 축제 (잔디/오두막 제거, 완전한 우주 축하 배경)
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0F0C29');
    sky.addColorStop(0.5, '#302B63');
    sky.addColorStop(1, '#24243E');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 거대한 은하수 무지개 오로라 아치
    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.88, w * 0.52);

    // 웃고 있는 달님과 별무리
    SceneTemplates.drawSmilingMoon(ctx, w * 0.82, h * 0.18, 55);
    SceneTemplates.drawTwinkles(ctx, 90, w, h * 0.7);

    // 반짝이는 별가루 크리스탈 바닥
    ctx.fillStyle = '#1B1734';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.bezierCurveTo(w * 0.3, h * 0.60, w * 0.7, h * 0.68, w, h * 0.62);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#130F26';
    ctx.fillRect(0, h * 0.73, w, h * 0.27);

    // 바닥에 흩뿌려진 별가루 & 크리스탈 반사
    ctx.save();
    const starColors = ['#FFD32A', '#00F2FE', '#FF6B81', '#A29BFE'];
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = starColors[i % starColors.length];
      const sx = (i * 53) % w;
      const sy = h * 0.74 + (i * 29) % (h * 0.22);
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  static drawSaturnPlanet(ctx, x, y, r) {
    ctx.save();
    const planetGrad = ctx.createRadialGradient(x - 12, y - 12, 10, x, y, r);
    planetGrad.addColorStop(0, '#FFEAA7');
    planetGrad.addColorStop(0.7, '#FDCB6E');
    planetGrad.addColorStop(1, '#E17055');
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // 행성 고리
    ctx.strokeStyle = 'rgba(255, 234, 167, 0.65)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.6, r * 0.45, -0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ==========================================
  // [THEME 4-B] 눈나라 & 겨울왕국 테마 (Snow)
  // ==========================================
  static renderSnowTheme(ctx, w, h, pageNumber) {
    switch (pageNumber) {
      case 0:
        SceneTemplates.drawSnowCover(ctx, w, h);
        break;
      case 1:
        SceneTemplates.drawSnowStep1Morning(ctx, w, h);
        break;
      case 2:
        SceneTemplates.drawSnowStep2IceLake(ctx, w, h);
        break;
      case 3:
        SceneTemplates.drawSnowStep3Igloo(ctx, w, h);
        break;
      case 4:
        SceneTemplates.drawSnowStep4SunsetAurora(ctx, w, h);
        break;
      case 5:
        SceneTemplates.drawSnowStep5StarryNight(ctx, w, h);
        break;
      default:
        SceneTemplates.drawSnowStep1Morning(ctx, w, h);
        break;
    }
  }

  static drawSnowCover(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#D4E6F1');
    sky.addColorStop(0.5, '#EBF5FB');
    sky.addColorStop(1, '#FFF5F5');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.95, w * 0.55);
    SceneTemplates.drawSun(ctx, w * 0.85, 110, 48, '#FDCB6E');

    // 포근한 흰 눈 언덕
    ctx.fillStyle = '#D6EAF8';
    SceneTemplates.drawHill(ctx, 0, h * 0.50, w, 100, 3);
    ctx.fillStyle = '#EBF5FB';
    SceneTemplates.drawHill(ctx, 0, h * 0.58, w, 110, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, h * 0.66, w, h * 0.34);

    // 귀여운 눈사람
    SceneTemplates.drawSnowman(ctx, w * 0.82, h * 0.55, 90);
    SceneTemplates.drawSnowflakes(ctx, 40, w, h * 0.8);
  }

  static drawSnowStep1Morning(ctx, w, h) {
    // 1장: 상쾌하고 반짝이는 눈부신 아침 눈동산
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#A9CCE3');
    sky.addColorStop(0.5, '#D4E6F1');
    sky.addColorStop(1, '#EBF5FB');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, 130, 110, 48, '#F39C12');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.45, h * 0.16, 60);

    // 저 멀리 눈 덮인 설산
    ctx.fillStyle = '#AED6F1';
    ctx.beginPath();
    ctx.moveTo(w * 0.60, h * 0.60);
    ctx.lineTo(w * 0.75, h * 0.30);
    ctx.lineTo(w * 0.90, h * 0.60);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(w * 0.70, h * 0.40);
    ctx.lineTo(w * 0.75, h * 0.30);
    ctx.lineTo(w * 0.80, h * 0.40);
    ctx.closePath();
    ctx.fill();

    // 부드러운 눈 언덕
    ctx.fillStyle = '#D6EAF8';
    SceneTemplates.drawHill(ctx, 0, h * 0.50, w, 100, 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);

    SceneTemplates.drawSnowCoveredPine(ctx, w * 0.86, h * 0.38, 110);
    SceneTemplates.drawSnowflakes(ctx, 35, w, h * 0.75);
  }

  static drawSnowStep2IceLake(ctx, w, h) {
    // 2장: 반짝반짝 얼음 호수와 투명한 고드름
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#7FB3D5');
    sky.addColorStop(1, '#D4E6F1');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, w * 0.85, 100, 44, '#F1C40F');

    ctx.fillStyle = '#EBF5FB';
    SceneTemplates.drawHill(ctx, 0, h * 0.48, w, 90, 2);

    const ice = ctx.createLinearGradient(0, h * 0.60, 0, h);
    ice.addColorStop(0, '#5DADE2');
    ice.addColorStop(0.5, '#76D7C4');
    ice.addColorStop(1, '#A9DFBF');
    ctx.fillStyle = ice;
    ctx.fillRect(0, h * 0.60, w, h * 0.40);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.70);
    ctx.lineTo(w * 0.35, h * 0.73);
    ctx.lineTo(w * 0.45, h * 0.71);
    ctx.moveTo(w * 0.6, h * 0.78);
    ctx.lineTo(w * 0.75, h * 0.75);
    ctx.stroke();
    ctx.restore();

    SceneTemplates.drawTwinkles(ctx, 40, w, h * 0.8);
    SceneTemplates.drawSnowflakes(ctx, 25, w, h * 0.7);
  }

  static drawSnowStep3Igloo(ctx, w, h) {
    // 3장: 따뜻한 불빛의 아담한 이글루 마을
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#85C1E9');
    sky.addColorStop(0.6, '#D4E6F1');
    sky.addColorStop(1, '#FFF5EE');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, w * 0.5, 90, 48, '#F39C12');

    ctx.fillStyle = '#D6EAF8';
    SceneTemplates.drawHill(ctx, 0, h * 0.48, w, 100, 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);

    SceneTemplates.drawIgloo(ctx, w * 0.75, h * 0.48, 160);
    SceneTemplates.drawSnowflakes(ctx, 35, w, h * 0.7);
  }

  static drawSnowStep4SunsetAurora(ctx, w, h) {
    // 4장: 핑크빛 노을과 신비로운 오로라 눈밭
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    sky.addColorStop(0, '#6C5CE7');
    sky.addColorStop(0.3, '#FD79A8');
    sky.addColorStop(0.7, '#FAB1A0');
    sky.addColorStop(1, '#FFEAA7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    const aurora = ctx.createLinearGradient(0, 0, w, h * 0.5);
    aurora.addColorStop(0, 'rgba(85, 239, 196, 0)');
    aurora.addColorStop(0.4, 'rgba(85, 239, 196, 0.45)');
    aurora.addColorStop(0.7, 'rgba(129, 236, 236, 0.3)');
    aurora.addColorStop(1, 'rgba(85, 239, 196, 0)');
    ctx.fillStyle = aurora;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.25);
    ctx.bezierCurveTo(w * 0.3, h * 0.10, w * 0.7, h * 0.35, w, h * 0.18);
    ctx.lineTo(w, h * 0.45);
    ctx.bezierCurveTo(w * 0.7, h * 0.55, w * 0.3, h * 0.35, 0, h * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FADBD8';
    SceneTemplates.drawHill(ctx, 0, h * 0.52, w, 100, 2);
    ctx.fillStyle = '#FDEBD0';
    ctx.fillRect(0, h * 0.64, w, h * 0.36);

    SceneTemplates.drawSnowCoveredPine(ctx, w * 0.85, h * 0.42, 115);
    SceneTemplates.drawSnowflakes(ctx, 30, w, h * 0.7);
  }

  static drawSnowStep5StarryNight(ctx, w, h) {
    // 5장: 은은한 달빛과 포근한 눈 내리는 밤
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0F2027');
    sky.addColorStop(0.5, '#203A43');
    sky.addColorStop(1, '#2C5364');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSmilingMoon(ctx, w * 0.82, h * 0.18, 55);
    SceneTemplates.drawTwinkles(ctx, 60, w, h * 0.65);

    ctx.fillStyle = '#2C3E50';
    SceneTemplates.drawHill(ctx, 0, h * 0.55, w, 100, 2);
    ctx.fillStyle = '#D6EAF8';
    ctx.fillRect(0, h * 0.68, w, h * 0.32);

    SceneTemplates.drawCozyNightCottage(ctx, w * 0.18, h * 0.52, 160, 130);
    SceneTemplates.drawSnowflakes(ctx, 50, w, h * 0.85);
  }

  // ==========================================
  // [THEME 4-C] 싱그러운 텃밭 & 채소밭 테마 (Garden)
  // ==========================================
  static renderGardenTheme(ctx, w, h, pageNumber) {
    switch (pageNumber) {
      case 0:
        SceneTemplates.drawGardenCover(ctx, w, h);
        break;
      case 1:
        SceneTemplates.drawGardenStep1Sprouts(ctx, w, h);
        break;
      case 2:
        SceneTemplates.drawGardenStep2Vegetables(ctx, w, h);
        break;
      case 3:
        SceneTemplates.drawGardenStep3Sunflower(ctx, w, h);
        break;
      case 4:
        SceneTemplates.drawGardenStep4SunsetHarvest(ctx, w, h);
        break;
      case 5:
        SceneTemplates.drawGardenStep5FireflyNight(ctx, w, h);
        break;
      default:
        SceneTemplates.drawGardenStep1Sprouts(ctx, w, h);
        break;
    }
  }

  static drawGardenCover(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#FFE8D6');
    sky.addColorStop(0.5, '#FFF1E6');
    sky.addColorStop(1, '#E8F4FD');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.95, w * 0.55);
    SceneTemplates.drawSun(ctx, w * 0.85, 110, 48, '#FFA502');

    SceneTemplates.drawPicketFence(ctx, w, h * 0.50);
    ctx.fillStyle = '#795548';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);

    SceneTemplates.drawVegetableRows(ctx, w, h);
  }

  static drawGardenStep1Sprouts(ctx, w, h) {
    // 1장: 상쾌한 아침의 비옥한 텃밭 두둑과 파릇파릇 새싹
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#81ECEC');
    sky.addColorStop(0.6, '#DFE6E9');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, 130, 110, 48, '#FFA502');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.65, 120, 60);

    SceneTemplates.drawPicketFence(ctx, w, h * 0.48);

    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(0, h * 0.60, w, h * 0.40);

    ctx.fillStyle = '#5D4037';
    for (let r = 0; r < 3; r++) {
      const ry = h * (0.64 + r * 0.11);
      ctx.beginPath();
      ctx.ellipse(w * 0.5, ry, w * 0.55, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    SceneTemplates.drawVegetableRows(ctx, w, h);
  }

  static drawGardenStep2Vegetables(ctx, w, h) {
    // 2장: 탐스러운 토마토와 둥글둥글 호박 넝쿨 밭
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#74B9FF');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, w * 0.85, 110, 45, '#FFA502');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.35, 100, 55);

    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(0, h * 0.58, w, h * 0.42);

    SceneTemplates.drawPumpkinAndTomato(ctx, w, h);
  }

  static drawGardenStep3Sunflower(ctx, w, h) {
    // 3장: 해바라기 방긋 웃는 꽃밭과 꿀벌
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#81ECEC');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, w * 0.5, 90, 48, '#FDCB6E');

    ctx.fillStyle = '#2ED573';
    ctx.fillRect(0, h * 0.60, w, h * 0.40);

    SceneTemplates.drawSunflower(ctx, w * 0.78, h * 0.32, 50);
    SceneTemplates.drawSunflower(ctx, w * 0.88, h * 0.36, 42);

    SceneTemplates.drawBuntingFlags(ctx, w, 35, 18);
  }

  static drawGardenStep4SunsetHarvest(ctx, w, h) {
    // 4장: 노을빛 풍성한 가을 수확 텃밭
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#FF7675');
    sky.addColorStop(0.5, '#FAB1A0');
    sky.addColorStop(1, '#FFEAA7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, w * 0.82, 120, 52, '#FF9F43');
    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.90, w * 0.50);

    ctx.fillStyle = '#5D4037';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);

    SceneTemplates.drawVegetableRows(ctx, w, h);
  }

  static drawGardenStep5FireflyNight(ctx, w, h) {
    // 5장: 은은한 달빛 아래 반딧불이가 춤추는 밤의 텃밭
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0F2027');
    sky.addColorStop(0.5, '#203A43');
    sky.addColorStop(1, '#2C5364');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSmilingMoon(ctx, w * 0.8, h * 0.18, 55);
    SceneTemplates.drawTwinkles(ctx, 50, w, h * 0.65);

    ctx.fillStyle = '#3E2723';
    ctx.fillRect(0, h * 0.66, w, h * 0.34);

    ctx.save();
    for (let i = 0; i < 20; i++) {
      const fx = (i * 67) % w;
      const fy = h * 0.58 + (i * 37) % (h * 0.35);
      const fGlow = ctx.createRadialGradient(fx, fy, 2, fx, fy, 15);
      fGlow.addColorStop(0, 'rgba(118, 255, 3, 0.9)');
      fGlow.addColorStop(1, 'rgba(118, 255, 3, 0)');
      ctx.fillStyle = fGlow;
      ctx.beginPath();
      ctx.arc(fx, fy, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    SceneTemplates.drawCozyNightCottage(ctx, w * 0.18, h * 0.52, 160, 130);
  }

  // ==========================================
  // [THEME 5] 따뜻한 마을 & 놀이터 테마 (Village)
  // ==========================================
  static renderVillageTheme(ctx, w, h, pageNumber) {
    switch (pageNumber) {
      case 0:
        SceneTemplates.drawVillageCover(ctx, w, h);
        break;
      case 1:
        SceneTemplates.drawVillageStep1Morning(ctx, w, h);
        break;
      case 2:
        SceneTemplates.drawVillageStep2Park(ctx, w, h);
        break;
      case 3:
        SceneTemplates.drawVillageStep3Market(ctx, w, h);
        break;
      case 4:
        SceneTemplates.drawVillageStep4Sunset(ctx, w, h);
        break;
      case 5:
        SceneTemplates.drawVillageStep5Night(ctx, w, h);
        break;
      default:
        SceneTemplates.drawVillageStep1Morning(ctx, w, h);
        break;
    }
  }

  static drawVillageCover(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#FFE8D6');
    sky.addColorStop(0.5, '#FFF1E6');
    sky.addColorStop(1, '#E8F4FD');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.95, w * 0.55);
    SceneTemplates.drawSun(ctx, w * 0.85, 110, 48, '#FFA502');

    SceneTemplates.drawVillageHouses(ctx, w, h * 0.50);
    ctx.fillStyle = '#55EFC4';
    ctx.fillRect(0, h * 0.64, w, h * 0.36);
    SceneTemplates.drawBuntingFlags(ctx, w, 40, 20);
  }

  static drawVillageStep1Morning(ctx, w, h) {
    // 1장: 상쾌한 아침 마을 길
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#A0E4F1');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, 130, 110, 48, '#FFA502');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.75, 120, 55);

    SceneTemplates.drawVillageHouses(ctx, w, h * 0.48);
    ctx.fillStyle = '#55EFC4';
    ctx.fillRect(0, h * 0.60, w, h * 0.40);
    SceneTemplates.drawFlowersAndMushrooms(ctx, w, h, 'day');
  }

  static drawVillageStep2Park(ctx, w, h) {
    // 2장: 신나는 놀이터와 알록달록 미끄럼틀 & 그네
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#85C1E9');
    sky.addColorStop(1, '#EBF5FB');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, w * 0.85, 110, 45, '#FFA502');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.35, 100, 60);

    ctx.fillStyle = '#7DCEA0';
    SceneTemplates.drawHill(ctx, 0, h * 0.48, w, 110, 2);
    ctx.fillStyle = '#52BE80';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);

    // 모래놀이터
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.ellipse(w * 0.28, h * 0.76, 140, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // 알록달록 미끄럼틀 & 그네
    SceneTemplates.drawPlaygroundSlide(ctx, w * 0.78, h * 0.44, 190);
    SceneTemplates.drawSwingSet(ctx, w * 0.46, h * 0.42, 170);

    SceneTemplates.drawFlowersAndMushrooms(ctx, w, h, 'day');
  }

  static drawVillageStep3Market(ctx, w, h) {
    // 3장: 활기찬 마을 상점가 거리
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#81ECEC');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, w * 0.5, 90, 46, '#FDCB6E');
    SceneTemplates.drawVillageHouses(ctx, w, h * 0.46);

    ctx.fillStyle = '#FAB1A0';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);
    SceneTemplates.drawBuntingFlags(ctx, w, 35, 18);
  }

  static drawVillageStep4Sunset(ctx, w, h) {
    // 4장: 노을빛 마을 언덕
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#FF7675');
    sky.addColorStop(0.5, '#FAB1A0');
    sky.addColorStop(1, '#FFEAA7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, w * 0.82, 130, 52, '#FF9F43');
    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.90, w * 0.50);

    ctx.fillStyle = '#E17055';
    SceneTemplates.drawHill(ctx, 0, h * 0.50, w, 100, 2);
    ctx.fillStyle = '#C0392B';
    ctx.fillRect(0, h * 0.64, w, h * 0.36);
  }

  static drawVillageStep5Night(ctx, w, h) {
    // 5장: 따뜻한 밤의 마을
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0F2027');
    sky.addColorStop(0.5, '#203A43');
    sky.addColorStop(1, '#2C5364');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSmilingMoon(ctx, w * 0.8, h * 0.18, 55);
    SceneTemplates.drawTwinkles(ctx, 55, w, h * 0.65);

    ctx.fillStyle = '#11221F';
    ctx.fillRect(0, h * 0.68, w, h * 0.32);
    SceneTemplates.drawCozyNightCottage(ctx, w * 0.18, h * 0.52, 160, 130);
  }

  static drawVillageHouses(ctx, w, hy) {
    ctx.save();
    const houseColors = ['#FF7675', '#74B9FF', '#FDCB6E', '#55EFC4'];
    for (let i = 0; i < 4; i++) {
      const hx = w * (0.10 + i * 0.23);
      ctx.fillStyle = houseColors[i % houseColors.length];
      ctx.fillRect(hx, hy, 100, 75);
      // 지붕
      ctx.fillStyle = '#D63031';
      ctx.beginPath();
      ctx.moveTo(hx - 10, hy);
      ctx.lineTo(hx + 50, hy - 40);
      ctx.lineTo(hx + 110, hy);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // ==========================================
  // [THEME 6] 환상적인 무지개 & 동화 테마 (Rainbow)
  // ==========================================
  static renderRainbowTheme(ctx, w, h, pageNumber) {
    switch (pageNumber) {
      case 0:
        SceneTemplates.drawRainbowCover(ctx, w, h);
        break;
      case 1:
        SceneTemplates.drawRainbowStep1Morning(ctx, w, h);
        break;
      case 2:
        SceneTemplates.drawRainbowStep2Clouds(ctx, w, h);
        break;
      case 3:
        SceneTemplates.drawRainbowStep3Waterfall(ctx, w, h);
        break;
      case 4:
        SceneTemplates.drawRainbowStep4SunsetCastle(ctx, w, h);
        break;
      case 5:
        SceneTemplates.drawRainbowStep5Night(ctx, w, h);
        break;
      default:
        SceneTemplates.drawRainbowStep1Morning(ctx, w, h);
        break;
    }
  }

  static drawRainbowCover(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#FF9A8B');
    sky.addColorStop(0.5, '#FF6A88');
    sky.addColorStop(1, '#FF99AC');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.88, w * 0.52);
    SceneTemplates.drawSun(ctx, w * 0.85, 120, 50, '#FFD700');
    SceneTemplates.drawMagicCandies(ctx, w, h);

    ctx.fillStyle = '#2ED573';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);
    SceneTemplates.drawBigCelebrationFlowers(ctx, w, h);
  }

  static drawRainbowStep1Morning(ctx, w, h) {
    // 1장: 상쾌한 아침 무지개 다리
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#A0E4F1');
    sky.addColorStop(0.5, '#FED6E3');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, 130, 110, 48, '#FFA502');
    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.92, w * 0.52);

    ctx.fillStyle = '#55EFC4';
    SceneTemplates.drawHill(ctx, 0, h * 0.52, w, 100, 3);
    ctx.fillStyle = '#2ED573';
    ctx.fillRect(0, h * 0.64, w, h * 0.36);
    SceneTemplates.drawFlowersAndMushrooms(ctx, w, h, 'day');
  }

  static drawRainbowStep2Clouds(ctx, w, h) {
    // 2장: 솜사탕 구름 동산
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#74B9FF');
    sky.addColorStop(0.5, '#A0E4F1');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, w * 0.85, 110, 48, '#FDCB6E');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.25, h * 0.20, 70);
    SceneTemplates.drawFluffyCloud(ctx, w * 0.65, h * 0.24, 80);

    ctx.fillStyle = '#A3E4D7';
    SceneTemplates.drawHill(ctx, 0, h * 0.48, w, 110, 2);
    ctx.fillStyle = '#7DCEA0';
    ctx.fillRect(0, h * 0.60, w, h * 0.40);
    SceneTemplates.drawMagicCandies(ctx, w, h);
  }

  static drawRainbowStep3Waterfall(ctx, w, h) {
    // 3장: 반짝이는 무지개 폭포 공터
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#81ECEC');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawRainbowArch(ctx, w * 0.4, h * 0.85, w * 0.45);
    SceneTemplates.drawTwinkles(ctx, 40, w, h * 0.65);

    ctx.fillStyle = '#2ED573';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);
    SceneTemplates.drawBigCelebrationFlowers(ctx, w, h);
  }

  static drawRainbowStep4SunsetCastle(ctx, w, h) {
    // 4장: 노을빛 무지개 궁전
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#FF7675');
    sky.addColorStop(0.5, '#FD79A8');
    sky.addColorStop(1, '#FFEAA7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, w * 0.82, 120, 52, '#FF9F43');
    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.90, w * 0.48);

    ctx.fillStyle = '#6C5CE7';
    SceneTemplates.drawHill(ctx, 0, h * 0.52, w, 110, 2);
    ctx.fillStyle = '#2ED573';
    ctx.fillRect(0, h * 0.64, w, h * 0.36);
  }

  static drawRainbowStep5Night(ctx, w, h) {
    // 5장: 꿈나라 무지개 별밤
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0F2027');
    sky.addColorStop(0.5, '#203A43');
    sky.addColorStop(1, '#2C5364');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSmilingMoon(ctx, w * 0.8, h * 0.18, 55);
    SceneTemplates.drawTwinkles(ctx, 60, w, h * 0.65);

    ctx.fillStyle = '#11221F';
    ctx.fillRect(0, h * 0.68, w, h * 0.32);
    SceneTemplates.drawCozyNightCottage(ctx, w * 0.18, h * 0.52, 160, 130);
  }

  // ==========================================
  // [0장] 표지 배경
  // ==========================================
  static drawCoverBackground(ctx, w, h, theme) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#FFE8D6');
    grad.addColorStop(0.5, '#FFF1E6');
    grad.addColorStop(1, '#E8F4FD');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 은은한 파스텔 무지개 빛과 별빛
    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.95, w * 0.55);
    SceneTemplates.drawTwinkles(ctx, 35, w, h * 0.7);
  }

  // ==========================================
  // [1장 배경] 오솔길 (숲속 팻말 문자 없음)
  // ==========================================
  static drawStep1PathMorning(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#A0E4F1');
    sky.addColorStop(0.5, '#D0F0FD');
    sky.addColorStop(1, '#FFFDE4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSun(ctx, 140, 110, 48, '#FFA502');
    SceneTemplates.drawFluffyCloud(ctx, w * 0.45, h * 0.15, 65);
    SceneTemplates.drawFluffyCloud(ctx, w * 0.82, h * 0.2, 50);

    ctx.fillStyle = '#A3E4D7';
    SceneTemplates.drawHill(ctx, 0, h * 0.48, w, 110, 3);
    ctx.fillStyle = '#7DCEA0';
    SceneTemplates.drawHill(ctx, 0, h * 0.56, w, 130, 2);

    ctx.fillStyle = '#52BE80';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);

    // 흙길
    ctx.fillStyle = '#F5CBA7';
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h);
    ctx.quadraticCurveTo(w * 0.35, h * 0.76, w * 0.5, h * 0.72);
    ctx.quadraticCurveTo(w * 0.75, h * 0.68, w * 0.95, h * 0.62);
    ctx.lineTo(w * 0.88, h * 0.62);
    ctx.quadraticCurveTo(w * 0.65, h * 0.7, w * 0.4, h * 0.78);
    ctx.lineTo(w * 0.2, h);
    ctx.closePath();
    ctx.fill();

    // 꽃과 풀
    SceneTemplates.drawFlowersAndMushrooms(ctx, w, h, 'day');
  }

  // ==========================================
  // [2장 배경] 큰 참나무 쉼터
  // ==========================================
  static drawStep2OakMeeting(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#85C1E9');
    sky.addColorStop(1, '#EBF5FB');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // 우측 거대한 참나무
    ctx.save();
    const treeX = w * 0.82;
    const treeY = h * 0.65;
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.moveTo(treeX - 45, treeY);
    ctx.quadraticCurveTo(treeX - 25, treeY - 140, treeX - 55, h * 0.2);
    ctx.lineTo(treeX + 65, h * 0.2);
    ctx.quadraticCurveTo(treeX + 45, treeY - 140, treeX + 60, treeY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(treeX, h * 0.25, 140, 0, Math.PI * 2);
    ctx.arc(treeX - 70, h * 0.32, 100, 0, Math.PI * 2);
    ctx.arc(treeX + 70, h * 0.3, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.66);
    ctx.bezierCurveTo(w * 0.3, h * 0.62, w * 0.7, h * 0.68, w, h * 0.64);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    SceneTemplates.drawMushroomGroup(ctx, w * 0.65, h * 0.68);
  }

  // ==========================================
  // [4장 배경] 무지개 언덕
  // ==========================================
  static drawStep4RainbowMeadow(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, '#FF9A8B');
    sky.addColorStop(0.4, '#FF6A88');
    sky.addColorStop(1, '#FF99AC');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawRainbowArch(ctx, w * 0.5, h * 0.88, w * 0.48);
    SceneTemplates.drawSun(ctx, w * 0.85, h * 0.2, 52, '#FFD700');
    SceneTemplates.drawMagicCandies(ctx, w, h);

    ctx.fillStyle = '#2ED573';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.bezierCurveTo(w * 0.25, h * 0.58, w * 0.6, h * 0.72, w, h * 0.62);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    SceneTemplates.drawBigCelebrationFlowers(ctx, w, h);
  }

  // ==========================================
  // [5장 배경] 따뜻한 불빛의 집과 밤
  // ==========================================
  static drawStep5CozyHomeNight(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0F2027');
    sky.addColorStop(0.5, '#203A43');
    sky.addColorStop(1, '#2C5364');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    SceneTemplates.drawSmilingMoon(ctx, w * 0.8, h * 0.18, 55);
    SceneTemplates.drawTwinkles(ctx, 55, w, h * 0.65);

    ctx.fillStyle = '#11221F';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.68);
    ctx.bezierCurveTo(w * 0.4, h * 0.64, w * 0.7, h * 0.72, w, h * 0.66);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    const houseX = w * 0.18;
    const houseY = h * 0.52;
    SceneTemplates.drawCozyNightCottage(ctx, houseX, houseY, 160, 130);
  }

  // --- 드로잉 헬퍼 ---

  static drawSun(ctx, cx, cy, r, color = '#FFC048') {
    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.8);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  static drawSmilingMoon(ctx, cx, cy, r) {
    ctx.save();
    ctx.fillStyle = '#FFD32A';
    ctx.beginPath();
    ctx.arc(cx, cy, r, -0.2 * Math.PI, 1.2 * Math.PI, false);
    ctx.bezierCurveTo(cx - r * 0.4, cy + r * 0.4, cx - r * 0.4, cy - r * 0.4, cx, cy - r);
    ctx.closePath();
    ctx.fill();

    // 볼터치 & 웃는 눈
    ctx.fillStyle = '#FF7675';
    ctx.beginPath();
    ctx.arc(cx - 10, cy + 10, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#574B90';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 8, 7, 0.2 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  static drawFluffyCloud(ctx, cx, cy, size) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.4, cy - size * 0.2, size * 0.45, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.8, cy, size * 0.4, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.4, cy + size * 0.2, size * 0.4, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  static drawHill(ctx, startX, startY, width, height, curves = 3) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    const step = width / curves;
    for (let i = 0; i < curves; i++) {
      const cx1 = startX + step * i + step * 0.5;
      const cy1 = startY - (i % 2 === 0 ? height : height * 0.6);
      const ex = startX + step * (i + 1);
      const ey = startY;
      ctx.quadraticCurveTo(cx1, cy1, ex, ey);
    }
    ctx.lineTo(startX + width, startY + 500);
    ctx.lineTo(startX, startY + 500);
    ctx.closePath();
    ctx.fill();
  }

  static drawRainbowArch(ctx, cx, cy, r) {
    ctx.save();
    const colors = [
      'rgba(255, 71, 87, 0.8)',
      'rgba(255, 165, 2, 0.8)',
      'rgba(238, 220, 0, 0.8)',
      'rgba(46, 213, 115, 0.8)',
      'rgba(30, 144, 255, 0.8)',
      'rgba(154, 85, 255, 0.8)'
    ];
    ctx.lineWidth = 14;
    for (let i = 0; i < colors.length; i++) {
      ctx.strokeStyle = colors[i];
      ctx.beginPath();
      ctx.arc(cx, cy, r - i * 14, Math.PI * 1.05, Math.PI * 1.95, false);
      ctx.stroke();
    }
    ctx.restore();
  }

  static drawBuntingFlags(ctx, w, y = 35, count = 18) {
    ctx.save();
    const colors = ['#FF4757', '#2ED573', '#1E90FF', '#FFA502', '#9B59B6', '#FFD32A'];
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(w / 2, y + 25, w, y);
    ctx.stroke();

    const flagW = w / count;
    for (let i = 0; i < count; i++) {
      const fx = i * flagW;
      const progress = i / count;
      const curveY = y + Math.sin(progress * Math.PI) * 25;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(fx, curveY);
      ctx.lineTo(fx + flagW, curveY + 2);
      ctx.lineTo(fx + flagW / 2, curveY + 24);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  static drawMagicCandies(ctx, w, h) {
    ctx.save();
    const colors = ['#FF4757', '#2ED573', '#1E90FF', '#FFA502', '#9B59B6'];
    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = colors[i % colors.length];
      const cx = (i * 137) % w;
      const cy = (i * 83) % (h * 0.65) + 30;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  static drawFlowersAndMushrooms(ctx, w, h, variant) {
    ctx.save();
    const colors = ['#FF6B81', '#FFA502', '#FFFFFF', '#70A1FF'];
    for (let i = 0; i < 14; i++) {
      const fx = w * (0.05 + i * 0.07);
      const fy = h * (0.68 + (i % 3) * 0.03);
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(fx, fy, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  static drawMushroomGroup(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#FFF';
    ctx.fillRect(x, y, 12, 22);
    ctx.fillStyle = '#FF4757';
    ctx.beginPath();
    ctx.arc(x + 6, y, 18, Math.PI, 0, false);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x + 6, y - 8, 3, 0, Math.PI * 2);
    ctx.arc(x, y - 4, 2, 0, Math.PI * 2);
    ctx.arc(x + 12, y - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  static drawBigCelebrationFlowers(ctx, w, h) {
    ctx.save();
    const flowerXs = [w * 0.1, w * 0.22, w * 0.78, w * 0.9];
    flowerXs.forEach(fx => {
      ctx.strokeStyle = '#27AE60';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(fx, h * 0.78);
      ctx.lineTo(fx, h * 0.65);
      ctx.stroke();

      ctx.fillStyle = '#FFD700';
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.arc(fx + Math.cos(a) * 16, h * 0.65 + Math.sin(a) * 16, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#E67E22';
      ctx.beginPath();
      ctx.arc(fx, h * 0.65, 12, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  static drawCozyNightCottage(ctx, x, y, width, height) {
    ctx.save();
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = '#C0392B';
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + width / 2, y - 60);
    ctx.lineTo(x + width + 20, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#795548';
    ctx.fillRect(x + width - 40, y - 75, 20, 35);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(x + width - 30, y - 90, 10, 0, Math.PI * 2);
    ctx.arc(x + width - 20, y - 110, 15, 0, Math.PI * 2);
    ctx.fill();

    const winX = x + 35;
    const winY = y + 30;
    const winS = 45;
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(winX, winY, winS, winS);

    const glow = ctx.createRadialGradient(winX + winS / 2, winY + winS / 2, 10, winX + winS / 2, winY + winS / 2, 90);
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(winX - 45, winY - 45, winS + 90, winS + 90);

    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 3;
    ctx.strokeRect(winX, winY, winS, winS);
    ctx.beginPath();
    ctx.moveTo(winX + winS / 2, winY);
    ctx.lineTo(winX + winS / 2, winY + winS);
    ctx.moveTo(winX, winY + winS / 2);
    ctx.lineTo(winX + winS, winY + winS / 2);
    ctx.stroke();

    ctx.restore();
  }

  static drawTwinkles(ctx, count, w, maxH) {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < count; i++) {
      const tx = (i * 137) % w;
      const ty = (i * 89) % maxH;
      const r = (i % 3) + 2;
      ctx.beginPath();
      ctx.arc(tx, ty, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  static drawSnowflakes(ctx, count, w, maxH) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < count; i++) {
      const sx = (i * 127) % w;
      const sy = (i * 73) % maxH;
      const sr = (i % 3) + 2.5;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  static drawSnowman(ctx, x, y, size) {
    ctx.save();
    // 몸통
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y + size * 0.40, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    // 머리
    ctx.beginPath();
    ctx.arc(x, y - size * 0.15, size * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // 모자
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(x - size * 0.28, y - size * 0.45, size * 0.56, size * 0.12);
    ctx.fillRect(x - size * 0.18, y - size * 0.72, size * 0.36, size * 0.30);
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(x - size * 0.18, y - size * 0.48, size * 0.36, size * 0.08);

    // 당근 코
    ctx.fillStyle = '#E67E22';
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.16);
    ctx.lineTo(x + size * 0.30, y - size * 0.12);
    ctx.lineTo(x, y - size * 0.08);
    ctx.closePath();
    ctx.fill();

    // 눈 & 미소
    ctx.fillStyle = '#2C3E50';
    ctx.beginPath();
    ctx.arc(x - size * 0.10, y - size * 0.22, 3.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.10, y - size * 0.22, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 빨간 목도리
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.10, size * 0.28, size * 0.10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + size * 0.08, y + size * 0.10, size * 0.12, size * 0.25);
    ctx.restore();
  }

  static drawSnowCoveredPine(ctx, x, y, size) {
    ctx.save();
    // 나무 기둥
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x - size * 0.08, y + size * 0.55, size * 0.16, size * 0.35);

    // 3단 잎사귀 + 눈 모자
    const tiers = [
      { yOffset: y + size * 0.35, w: size * 0.55, h: size * 0.35 },
      { yOffset: y + size * 0.10, w: size * 0.45, h: size * 0.32 },
      { yOffset: y - size * 0.15, w: size * 0.35, h: size * 0.30 }
    ];

    for (const t of tiers) {
      // 초록 잎
      ctx.fillStyle = '#2E7D32';
      ctx.beginPath();
      ctx.moveTo(x, t.yOffset - t.h);
      ctx.lineTo(x - t.w, t.yOffset);
      ctx.lineTo(x + t.w, t.yOffset);
      ctx.closePath();
      ctx.fill();

      // 소복이 쌓인 흰 눈
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(x - t.w, t.yOffset);
      ctx.quadraticCurveTo(x - t.w * 0.5, t.yOffset + 6, x, t.yOffset + 4);
      ctx.quadraticCurveTo(x + t.w * 0.5, t.yOffset + 6, x + t.w, t.yOffset);
      ctx.lineTo(x + t.w * 0.8, t.yOffset - 12);
      ctx.lineTo(x, t.yOffset - t.h + 8);
      ctx.lineTo(x - t.w * 0.8, t.yOffset - 12);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  static drawIgloo(ctx, x, y, size) {
    ctx.save();
    // 돔 몸체
    ctx.fillStyle = '#E3F2FD';
    ctx.beginPath();
    ctx.arc(x, y + size * 0.45, size * 0.45, Math.PI, 0);
    ctx.fill();

    // 얼음 블록 줄눈
    ctx.strokeStyle = '#BBDEFB';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y + size * 0.45, size * 0.45, Math.PI, 0);
    ctx.arc(x, y + size * 0.45, size * 0.30, Math.PI, 0);
    ctx.arc(x, y + size * 0.45, size * 0.16, Math.PI, 0);
    ctx.stroke();

    // 입구 터널
    ctx.fillStyle = '#CFD8DC';
    ctx.beginPath();
    ctx.arc(x - size * 0.35, y + size * 0.45, size * 0.22, Math.PI, 0);
    ctx.fill();

    // 입구 안쪽 따뜻한 등불
    ctx.fillStyle = '#FFE082';
    ctx.beginPath();
    ctx.arc(x - size * 0.35, y + size * 0.45, size * 0.16, Math.PI, 0);
    ctx.fill();
    ctx.restore();
  }

  static drawPlaygroundSlide(ctx, x, y, size) {
    ctx.save();
    // 사다리 기둥
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(x - size * 0.40, y - size * 0.40, 8, size * 0.90);
    ctx.fillRect(x - size * 0.30, y - size * 0.40, 8, size * 0.90);
    // 사다리 발판
    ctx.fillStyle = '#F1C40F';
    for (let r = 0; r < 5; r++) {
      ctx.fillRect(x - size * 0.40, y - size * 0.32 + r * (size * 0.14), size * 0.18, 5);
    }

    // 미끄럼틀 플랫폼
    ctx.fillStyle = '#3498DB';
    ctx.fillRect(x - size * 0.42, y - size * 0.42, size * 0.26, 8);

    // 노란색 곡선 슬라이드 판
    ctx.fillStyle = '#F39C12';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.18, y - size * 0.38);
    ctx.bezierCurveTo(x + size * 0.15, y - size * 0.20, x + size * 0.25, y + size * 0.25, x + size * 0.45, y + size * 0.48);
    ctx.lineTo(x + size * 0.38, y + size * 0.48);
    ctx.bezierCurveTo(x + size * 0.20, y + size * 0.25, x + size * 0.08, y - size * 0.15, x - size * 0.24, y - size * 0.34);
    ctx.closePath();
    ctx.fill();

    // 미끄럼틀 지지대
    ctx.strokeStyle = '#7F8C8D';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.15, y);
    ctx.lineTo(x + size * 0.15, y + size * 0.48);
    ctx.stroke();
    ctx.restore();
  }

  static drawSwingSet(ctx, x, y, size) {
    ctx.save();
    // A자 프레임 기둥
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.45, y + size * 0.50);
    ctx.lineTo(x - size * 0.35, y - size * 0.30);
    ctx.lineTo(x - size * 0.25, y + size * 0.50);

    ctx.moveTo(x + size * 0.25, y + size * 0.50);
    ctx.lineTo(x + size * 0.35, y - size * 0.30);
    ctx.lineTo(x + size * 0.45, y + size * 0.50);

    // 상단 빔
    ctx.moveTo(x - size * 0.40, y - size * 0.30);
    ctx.lineTo(x + size * 0.40, y - size * 0.30);
    ctx.stroke();

    // 그네 줄 & 안장 (2개)
    const swingXs = [x - size * 0.15, x + size * 0.15];
    for (const sx of swingXs) {
      ctx.strokeStyle = '#424242';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx - 10, y - size * 0.30);
      ctx.lineTo(sx - 10, y + size * 0.22);
      ctx.moveTo(sx + 10, y - size * 0.30);
      ctx.lineTo(sx + 10, y + size * 0.22);
      ctx.stroke();

      ctx.fillStyle = '#E74C3C';
      ctx.fillRect(sx - 16, y + size * 0.22, 32, 7);
    }
    ctx.restore();
  }

  static drawPicketFence(ctx, w, y) {
    ctx.save();
    // 가로 가이드 바
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, y + 15, w, 6);
    ctx.fillRect(0, y + 35, w, 6);

    // 세로 말뚝
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    for (let x = 10; x < w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, y + 50);
      ctx.lineTo(x, y + 10);
      ctx.lineTo(x + 7, y);
      ctx.lineTo(x + 14, y + 10);
      ctx.lineTo(x + 14, y + 50);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  static drawVegetableRows(ctx, w, h) {
    ctx.save();
    // 당근 머리와 새싹들
    for (let i = 0; i < 9; i++) {
      const vx = w * (0.08 + i * 0.10);
      const vy = h * (0.68 + (i % 3) * 0.08);

      // 흙에서 삐죽 솟은 당근 어깨
      ctx.fillStyle = '#FF7043';
      ctx.beginPath();
      ctx.ellipse(vx, vy, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // 파릇파릇 초록 깃털 잎사귀
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.moveTo(vx, vy - 4);
      ctx.lineTo(vx - 8, vy - 18);
      ctx.lineTo(vx - 2, vy - 12);
      ctx.lineTo(vx, vy - 24);
      ctx.lineTo(vx + 3, vy - 12);
      ctx.lineTo(vx + 9, vy - 17);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  static drawPumpkinAndTomato(ctx, w, h) {
    ctx.save();
    // 커다란 주황 호박
    const px = w * 0.80;
    const py = h * 0.70;
    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.ellipse(px - 14, py, 26, 32, -0.1, 0, Math.PI * 2);
    ctx.ellipse(px + 14, py, 26, 32, 0.1, 0, Math.PI * 2);
    ctx.ellipse(px, py, 28, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    // 호박 꼭지
    ctx.fillStyle = '#33691E';
    ctx.fillRect(px - 4, py - 42, 8, 14);

    // 토마토 지지대와 방울토마토들
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.65, h * 0.48);
    ctx.lineTo(w * 0.65, h * 0.74);
    ctx.stroke();

    const tomatoPos = [
      { x: w * 0.63, y: h * 0.54 },
      { x: w * 0.67, y: h * 0.60 },
      { x: w * 0.64, y: h * 0.66 }
    ];
    for (const t of tomatoPos) {
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(t.x - 3, t.y - 14, 6, 4);
    }
    ctx.restore();
  }

  static drawSunflower(ctx, x, y, r) {
    ctx.save();
    // 줄기
    ctx.strokeStyle = '#388E3C';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(x, y + r);
    ctx.quadraticCurveTo(x - 5, y + r + 80, x - 10, y + 160);
    ctx.stroke();

    // 꽃잎들
    ctx.fillStyle = '#FFC107';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 7) {
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * (r * 0.8), y + Math.sin(a) * (r * 0.8), r * 0.35, r * 0.18, a, 0, Math.PI * 2);
      ctx.fill();
    }

    // 가운데 씨앗 판
    ctx.fillStyle = '#4E342E';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  static drawPaperTexture(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 250, 240, 0.04)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
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
