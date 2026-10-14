// 동화 장면별 상호작용 액터, 친구 캐릭터(거북이, 다람쥐, 아기새 등), 사건 소품 렌더러

export class SceneActors {
  /**
   * 장면에 등장하는 친구 캐릭터 그리기
   * @param {CanvasRenderingContext2D} ctx
   * @param {string|Object} friendData - 친구 정보 ('거북이', 'turtle', 또는 { type, action })
   * @param {number} x
   * @param {number} y
   * @param {number} size
   * @param {string} action - 'ready' | 'walking' | 'steady_walk' | 'overtaking' | 'celebrating' | 'greeting'
   */
  static drawFriendCharacter(ctx, friendData = '', x, y, size = 240, action = 'greeting') {
    let type = '';
    let act = action;

    if (typeof friendData === 'object' && friendData !== null) {
      type = (friendData.type || friendData.name || '').toLowerCase();
      if (friendData.action) act = friendData.action;
    } else {
      type = String(friendData || '').toLowerCase();
    }

    if (!type) return;

    ctx.save();
    ctx.translate(x, y);

    if (type.includes('사슴벌레') || type.includes('사슴버레') || type.includes('stag')) {
      SceneActors.drawStagBeetle(ctx, size, act);
    } else if (type.includes('장수풍뎅이') || type.includes('풍뎅이') || type.includes('beetle')) {
      SceneActors.drawBeetle(ctx, size, act);
    } else if (type.includes('무당벌레') || type.includes('무당') || type.includes('ladybug')) {
      SceneActors.drawLadybug(ctx, size, act);
    } else if (type.includes('나비') || type.includes('butterfly')) {
      SceneActors.drawButterfly(ctx, size, act);
    } else if (type.includes('외계인') || type.includes('외계') || type.includes('alien') || type.includes('우주인') || type.includes('외계친구')) {
      SceneActors.drawCuteAlien(ctx, size, act);
    } else if (type.includes('거북') || type.includes('turtle')) {
      SceneActors.drawTurtle(ctx, size, act);
    } else if (type.includes('강아지') || type.includes('개') || type.includes('puppy') || type.includes('dog')) {
      SceneActors.drawPuppy(ctx, size, act);
    } else if (type.includes('고양이') || type.includes('냥이') || type.includes('cat')) {
      SceneActors.drawCat(ctx, size, act);
    } else if (type.includes('다람쥐') || type.includes('squirrel')) {
      SceneActors.drawSquirrel(ctx, size, act);
    } else if (type.includes('새') || type.includes('참새') || type.includes('bird')) {
      SceneActors.drawBabyBird(ctx, size, act);
    } else if (type.includes('곰') || type.includes('bear')) {
      SceneActors.drawBabyBear(ctx, size, act);
    } else if (type.includes('요정') || type.includes('fairy')) {
      SceneActors.drawCloudFairy(ctx, size, act);
    } else if (type.includes('토끼') || type.includes('rabbit')) {
      SceneActors.drawFriendRabbit(ctx, size, act);
    } else {
      // 그 외 곤충이나 동물 입력 시 귀여운 사슴벌레/숲속 친구 스타일로 안정적 렌더링
      if (type.includes('곤충') || type.includes('벌레')) {
        SceneActors.drawStagBeetle(ctx, size, act);
      } else {
        SceneActors.drawTurtle(ctx, size, act);
      }
    }

    ctx.restore();
  }

  // ==========================================
  // [1] 거북이 캐릭터 (토끼와 거북이 스토리 핵심 액터)
  // ==========================================
  static drawTurtle(ctx, size = 220, action = 'ready') {
    ctx.save();
    const scale = size / 220;
    ctx.scale(scale, scale);

    // 부드러운 잔디 그림자
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 52, 70, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 1. 네 다리
    ctx.save();
    ctx.fillStyle = '#48BB78';
    ctx.strokeStyle = '#22543D';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    if (action === 'celebrating') {
      // 만세 포즈 (앞다리 번쩍 들기)
      ctx.beginPath();
      ctx.ellipse(-52, -22, 17, 36, -0.4, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(52, -22, 17, 36, 0.4, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // 든든한 뒷다리
      ctx.beginPath();
      ctx.ellipse(-40, 44, 16, 24, 0.2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(40, 44, 16, 24, -0.2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else {
      // 걷기 및 달리기 대기 포즈
      const isWalk = action === 'walking' || action === 'slow_walk' || action === 'steady_walk' || action === 'overtaking';
      const offset = isWalk ? 7 : 0;

      // 뒷다리
      ctx.beginPath();
      ctx.ellipse(-50, 36 - offset, 17, 26, -0.2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(50, 36 + offset, 17, 26, 0.2, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // 앞다리
      ctx.beginPath();
      ctx.ellipse(-46, 14 + offset, 16, 30, -0.3, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(46, 14 - offset, 16, 30, 0.3, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    ctx.restore();

    // 2. 꼬꼬마 꼬리
    ctx.save();
    ctx.fillStyle = '#48BB78';
    ctx.strokeStyle = '#22543D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-58, 18);
    ctx.lineTo(-76, 20);
    ctx.lineTo(-60, 28);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // 3. 둥그런 올리브 등껍질 (Shell)
    ctx.save();
    ctx.fillStyle = '#2F855A';
    ctx.strokeStyle = '#1C4532';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 10, 66, 50, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 쉘 내부 육각 무늬 3개
    ctx.fillStyle = '#68D391';
    ctx.strokeStyle = '#276749';
    ctx.lineWidth = 3;
    [-24, 0, 24].forEach(ox => {
      ctx.beginPath();
      SceneActors.drawHexagon(ctx, ox, 10, 14);
      ctx.fill(); ctx.stroke();
    });

    // 쉘 하단 테두리 띠
    ctx.fillStyle = '#9AE6B4';
    ctx.strokeStyle = '#22543D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 36, 56, 13, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // 4. 귀여운 머리와 얼굴
    ctx.save();
    const headX = (action === 'celebrating') ? 0 : 42;
    const headY = (action === 'celebrating') ? -32 : -10;

    // 목
    ctx.fillStyle = '#48BB78';
    ctx.strokeStyle = '#22543D';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(headX - 10, headY + 16, 15, 18, 0.3, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 머리
    ctx.beginPath();
    ctx.ellipse(headX, headY, 25, 23, 0.1, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 볼터치
    ctx.fillStyle = '#FF8B94';
    ctx.beginPath();
    ctx.arc(headX - 6, headY + 7, 5, 0, Math.PI * 2);
    ctx.arc(headX + 15, headY + 7, 5, 0, Math.PI * 2);
    ctx.fill();

    // 반짝이는 눈망울
    ctx.fillStyle = '#1A202C';
    ctx.beginPath();
    ctx.arc(headX + 6, headY - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(headX + 8, headY - 6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 방긋 웃는 입
    ctx.strokeStyle = '#1C4532';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX + 9, headY + 5, 6, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // 시합 상황별 귀여운 소품/표정 연출
    if (action === 'ready') {
      // 1장: 출발 준비 빨간 러너 머리띠
      ctx.fillStyle = '#E53E3E';
      ctx.strokeStyle = '#9B2C2C';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(headX - 2, headY - 10, 23, 6, 0.1, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // 펄럭이는 머리띠 묶음
      ctx.beginPath();
      ctx.moveTo(headX - 20, headY - 10);
      ctx.lineTo(headX - 38, headY - 18);
      ctx.lineTo(headX - 34, headY - 6);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (action === 'walking' || action === 'slow_walk' || action === 'steady_walk' || action === 'overtaking') {
      // 2~4장: 끈기 있게 걷는 이마 땀방울
      ctx.fillStyle = '#63B3ED';
      ctx.strokeStyle = '#2B6CB0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX - 10, headY - 22);
      ctx.quadraticCurveTo(headX - 4, headY - 12, headX - 10, headY - 8);
      ctx.arc(headX - 10, headY - 8, 4.5, 0, Math.PI);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else if (action === 'celebrating') {
      // 5장: 승리의 금메달 목걸이
      ctx.strokeStyle = '#E53E3E';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 16, 24, 10, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ECC94B';
      ctx.strokeStyle = '#B7791F';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 26, 13, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#B7791F';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', 0, 27);
    }

    ctx.restore();
    ctx.restore();
  }

  // ==========================================
  // [2] 귀여운 아기 강아지
  // ==========================================
  static drawPuppy(ctx, size = 220, action = 'greeting') {
    ctx.save();
    const scale = size / 220;
    ctx.scale(scale, scale);

    // 몸통 (베이지)
    ctx.fillStyle = '#F6E05E';
    ctx.strokeStyle = '#B7791F';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 20, 48, 42, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 머리
    ctx.beginPath();
    ctx.ellipse(0, -25, 42, 38, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 축 처진 귀
    ctx.fillStyle = '#D69E2E';
    ctx.beginPath();
    ctx.ellipse(-38, -25, 14, 28, 0.3, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(38, -25, 14, 28, -0.3, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 눈, 코, 입
    ctx.fillStyle = '#1A202C';
    ctx.beginPath();
    ctx.arc(-14, -28, 5, 0, Math.PI * 2);
    ctx.arc(14, -28, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -18, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#744210';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -12, 7, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================
  // [3] 귀여운 아기 고양이
  // ==========================================
  static drawCat(ctx, size = 220, action = 'greeting') {
    ctx.save();
    const scale = size / 220;
    ctx.scale(scale, scale);

    // 몸통 (흰색 & 주황 줄무늬)
    ctx.fillStyle = '#FED7AA';
    ctx.strokeStyle = '#C2410C';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 20, 46, 40, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 머리
    ctx.beginPath();
    ctx.ellipse(0, -25, 40, 36, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 뾰족 귀
    ctx.beginPath();
    ctx.moveTo(-35, -45); ctx.lineTo(-15, -60); ctx.lineTo(-10, -40);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(35, -45); ctx.lineTo(15, -60); ctx.lineTo(10, -40);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // 눈
    ctx.fillStyle = '#065F46';
    ctx.beginPath();
    ctx.arc(-14, -26, 5, 0, Math.PI * 2);
    ctx.arc(14, -26, 5, 0, Math.PI * 2);
    ctx.fill();

    // 코 & 수염
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.arc(0, -18, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#9A3412';
    ctx.lineWidth = 2;
    [-8, 0, 8].forEach(dy => {
      ctx.beginPath();
      ctx.moveTo(-16, -18 + dy); ctx.lineTo(-32, -18 + dy * 1.5);
      ctx.moveTo(16, -18 + dy); ctx.lineTo(32, -18 + dy * 1.5);
      ctx.stroke();
    });

    ctx.restore();
  }

  // ==========================================
  // [4] 기타 동물 친구들 (다람쥐, 곰돌이, 아기새 등)
  // ==========================================
  static drawSquirrel(ctx, size = 260, action = 'greeting') {
    ctx.save();
    const scale = size / 260;
    ctx.scale(scale, scale);

    // 꼬리
    ctx.fillStyle = '#B45309';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(45, 0, 48, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 몸통
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.ellipse(0, 30, 44, 48, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 배
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath();
    ctx.ellipse(-4, 34, 26, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    // 머리
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.ellipse(-8, -25, 36, 34, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 귀
    ctx.beginPath();
    ctx.ellipse(-26, -55, 10, 16, -0.2, 0, Math.PI * 2);
    ctx.ellipse(12, -55, 10, 16, 0.2, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 눈, 코, 도토리
    ctx.fillStyle = '#1A202C';
    ctx.beginPath();
    ctx.arc(-18, -28, 5, 0, Math.PI * 2);
    ctx.arc(4, -28, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-7, -19, 4, 0, Math.PI * 2);
    ctx.fill();

    // 도토리 들고 있기
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(-5, 16, 12, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.restore();
  }

  static drawBabyBird(ctx, size = 180, action = 'greeting') {
    ctx.save();
    const scale = size / 180;
    ctx.scale(scale, scale);

    ctx.fillStyle = '#60A5FA';
    ctx.strokeStyle = '#1D4ED8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 32, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 부리
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(32, -4); ctx.lineTo(48, 2); ctx.lineTo(32, 8);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // 눈
    ctx.fillStyle = '#1A202C';
    ctx.beginPath();
    ctx.arc(18, -8, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  static drawBabyBear(ctx, size = 240, action = 'greeting') {
    ctx.save();
    const scale = size / 240;
    ctx.scale(scale, scale);

    ctx.fillStyle = '#92400E';
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 20, 52, 48, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, -30, 44, 40, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 귀
    ctx.beginPath();
    ctx.arc(-35, -60, 16, 0, Math.PI * 2);
    ctx.arc(35, -60, 16, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 코 주둥이
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.ellipse(0, -22, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1A202C';
    ctx.beginPath();
    ctx.arc(-16, -34, 4.5, 0, Math.PI * 2);
    ctx.arc(16, -34, 4.5, 0, Math.PI * 2);
    ctx.arc(0, -25, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  static drawCloudFairy(ctx, size = 200, action = 'greeting') {
    ctx.save();
    const scale = size / 200;
    ctx.scale(scale, scale);

    ctx.fillStyle = '#FDE047';
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧚', 0, 10);
    ctx.restore();
  }

  static drawFriendRabbit(ctx, size = 220, action = 'greeting') {
    ctx.save();
    const scale = size / 220;
    ctx.scale(scale, scale);

    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 38, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 귀
    ctx.beginPath();
    ctx.ellipse(-16, -55, 12, 36, -0.15, 0, Math.PI * 2);
    ctx.ellipse(16, -55, 12, 36, 0.15, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-12, -4, 4, 0, Math.PI * 2);
    ctx.arc(12, -4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // [5] 스토리 핵심 소품 (달리기 시작선, 결승선, 그늘나무 등)
  // ==========================================

  /**
   * 1장: 달리기 시작선 (START 배너 & 체크무늬 라인)
   */
  static drawStartBanner(ctx, x, y, width = 360) {
    ctx.save();
    ctx.translate(x, y);

    // 1. 좌우 원목 기둥 2개
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 3;
    const postH = 145;
    SceneActors.roundRect(ctx, -width / 2, -postH, 16, postH, 4);
    ctx.fill(); ctx.stroke();
    SceneActors.roundRect(ctx, width / 2 - 16, -postH, 16, postH, 4);
    ctx.fill(); ctx.stroke();

    // 2. 가로 현수막 (START)
    ctx.fillStyle = '#E53E3E';
    ctx.strokeStyle = '#9B2C2C';
    ctx.lineWidth = 4;
    SceneActors.roundRect(ctx, -width / 2 + 10, -postH + 15, width - 20, 52, 12);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Jua", "Gaegu", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ S T A R T ★  달리기 시작!', 0, -postH + 41);

    // 3. 지면 바닥의 체크무늬 시작선
    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.fillRect(-width / 2 - 20, 0, width + 40, 24);
    ctx.strokeRect(-width / 2 - 20, 0, width + 40, 24);

    ctx.fillStyle = '#1A202C';
    const checkW = 20;
    for (let cx = -width / 2 - 20; cx < width / 2 + 20; cx += checkW * 2) {
      ctx.fillRect(cx, 0, checkW, 12);
      ctx.fillRect(cx + checkW, 12, checkW, 12);
    }

    ctx.restore();
  }

  /**
   * 4장 & 5장: 결승선 테이프와 FINISH 아치
   */
  static drawFinishRibbon(ctx, x, y, width = 360) {
    ctx.save();
    ctx.translate(x, y);

    // 좌우 골 기둥
    ctx.fillStyle = '#8B4513';
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 3;
    const postH = 150;
    SceneActors.roundRect(ctx, -width / 2, -postH, 16, postH, 4);
    ctx.fill(); ctx.stroke();
    SceneActors.roundRect(ctx, width / 2 - 16, -postH, 16, postH, 4);
    ctx.fill(); ctx.stroke();

    // 펄럭이는 빨간 결승선 리본 테이프
    ctx.fillStyle = '#E53E3E';
    ctx.strokeStyle = '#C53030';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-width / 2 + 10, -postH * 0.45);
    ctx.quadraticCurveTo(0, -postH * 0.38, width / 2 - 10, -postH * 0.45);
    ctx.lineTo(width / 2 - 10, -postH * 0.32);
    ctx.quadraticCurveTo(0, -postH * 0.25, -width / 2 + 10, -postH * 0.32);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // 상단 FINISH 배너
    ctx.fillStyle = '#ECC94B';
    ctx.strokeStyle = '#B7791F';
    ctx.lineWidth = 4;
    SceneActors.roundRect(ctx, -width / 2 + 10, -postH + 15, width - 20, 50, 12);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#744210';
    ctx.font = 'bold 26px "Jua", "Gaegu", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏁 F I N I S H !  골인! 🏁', 0, -postH + 40);

    ctx.restore();
  }

  /**
   * 2장: 시원한 큰 쉼터 그늘나무
   */
  static drawRestingTree(ctx, x, y, size = 300) {
    ctx.save();
    ctx.translate(x, y);

    // 바닥 시원한 그늘 그림자
    ctx.fillStyle = 'rgba(28, 69, 50, 0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 105, 140, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    // 나무 줄기
    ctx.fillStyle = '#795548';
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-25, 100);
    ctx.quadraticCurveTo(-15, 0, -35, -80);
    ctx.lineTo(35, -80);
    ctx.quadraticCurveTo(15, 0, 25, 100);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // 풍성하고 싱그러운 초록 나뭇잎 덩어리
    ctx.fillStyle = '#48BB78';
    ctx.strokeStyle = '#22543D';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.arc(0, -110, 95, 0, Math.PI * 2);
    ctx.arc(-65, -90, 75, 0, Math.PI * 2);
    ctx.arc(65, -90, 75, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 연두빛 하이라이트
    ctx.fillStyle = '#9AE6B4';
    ctx.beginPath();
    ctx.arc(-20, -135, 45, 0, Math.PI * 2);
    ctx.arc(35, -120, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 5장: 승리의 축하 꽃가루 비
   */
  static drawCelebrationConfetti(ctx, w, h) {
    ctx.save();
    const colors = ['#FF6B81', '#3A86FF', '#FFB830', '#2ED573', '#FF4757', '#9B59B6'];
    const count = 45;

    for (let i = 0; i < count; i++) {
      const cx = (i * 97) % w;
      const cy = 40 + (i * 47) % (h * 0.7);
      const color = colors[i % colors.length];

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i * 35 * Math.PI) / 180);
      ctx.fillStyle = color;

      if (i % 3 === 0) {
        // 별
        ctx.font = '20px sans-serif';
        ctx.fillText('✨', 0, 0);
      } else if (i % 3 === 1) {
        // 리본 조각
        ctx.fillRect(-6, -3, 12, 6);
      } else {
        // 하트
        ctx.font = '18px sans-serif';
        ctx.fillText('💖', 0, 0);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  // ==========================================
  // [6] 주인공 액션 연출 (캐릭터를 가리지 않는 부드러운 효과)
  // ==========================================
  static drawCharacterActionAndCostume(ctx, pageNumber, charX, charY, charW, charH, storyInfo = {}) {
    const action = storyInfo.protagonistAction || storyInfo.actionPose || '';

    ctx.save();
    // 1. 달리기 시합 준비 (스피드 발밑 먼지 퐁퐁)
    if (action === 'ready_to_run' || action === 'walking') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.strokeStyle = '#F5CBA7';
      ctx.lineWidth = 2.5;
      const dustY = charY + charH - 6;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(charX + 15 - i * 16, dustY - i * 5, 7 + i * 3, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
    }

    // 2. 나무 그늘 낮잠 (z Z z 잠방울 효과 - 얼굴을 가리지 않고 우측 대각선 상단에 은은하게 띄움)
    if (action === 'sleeping_nap' || action === 'resting_under_tree') {
      ctx.fillStyle = '#4A90E2';
      ctx.font = 'bold 24px "Jua", sans-serif';
      ctx.fillText('z', charX + charW * 0.85, charY + 20);
      ctx.font = 'bold 32px "Jua", sans-serif';
      ctx.fillText('Z', charX + charW * 0.95, charY - 8);
      ctx.font = 'bold 40px "Jua", sans-serif';
      ctx.fillText('Z', charX + charW * 1.05, charY - 40);
    }

    // 3. 축하 및 박수 (반짝이 하트 & 별)
    if (action === 'clapping_happy' || action === 'celebrating') {
      const sparkles = ['✨', '💖', '⭐', '🎉'];
      ctx.font = '24px sans-serif';
      sparkles.forEach((s, idx) => {
        const sx = charX - 25 + idx * (charW * 0.45);
        const sy = charY - 20 + (idx % 2) * 28;
        ctx.fillText(s, sx, sy);
      });
    }

    ctx.restore();
  }

  /**
   * 사건 소품 그리기 (풍선, 보물 열쇠, 달콤한 딸기 비, 선물 상자 등)
   */
  static drawEventProp(ctx, propText = '', x, y, size = 180) {
    if (!propText) return;
    const text = String(propText).toLowerCase();
    ctx.save();
    ctx.translate(x, y);
    const s = size / 180;
    ctx.scale(s, s);

    if (text.includes('풍선') || text.includes('balloon')) {
      // 알록달록 무지개 풍선 3개
      const colors = ['#FF6B81', '#3A86FF', '#FFD166'];
      const offsets = [
        { ox: -30, oy: -20, r: 35, c: colors[0] },
        { ox: 25, oy: -35, r: 38, c: colors[1] },
        { ox: 0, oy: -60, r: 40, c: colors[2] }
      ];

      // 풍선 실
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      offsets.forEach(b => {
        ctx.beginPath();
        ctx.moveTo(b.ox, b.oy + b.r);
        ctx.quadraticCurveTo(b.ox + 10, b.oy + b.r + 40, 0, 70);
        ctx.stroke();
      });

      // 풍선 본체 및 하이라이트
      offsets.forEach(b => {
        ctx.fillStyle = b.c;
        ctx.beginPath();
        ctx.ellipse(b.ox, b.oy, b.r * 0.85, b.r, 0, 0, Math.PI * 2);
        ctx.fill();

        // 묶음 매듭
        ctx.beginPath();
        ctx.moveTo(b.ox - 5, b.oy + b.r);
        ctx.lineTo(b.ox + 5, b.oy + b.r);
        ctx.lineTo(b.ox, b.oy + b.r + 6);
        ctx.closePath();
        ctx.fill();

        // 반짝 하이라이트
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(b.ox - b.r * 0.35, b.oy - b.r * 0.35, b.r * 0.22, b.r * 0.35, -0.3, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (text.includes('열쇠') || text.includes('key')) {
      // 반짝이는 황금 마법 열쇠
      ctx.save();
      ctx.fillStyle = '#F1C40F';
      ctx.strokeStyle = '#D4AC0D';
      ctx.lineWidth = 4;

      // 손잡이 링
      ctx.beginPath();
      ctx.arc(0, -35, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(0, -35, 12, 0, Math.PI * 2);
      ctx.fill();

      // 열쇠 기둥
      ctx.fillStyle = '#F1C40F';
      ctx.fillRect(-6, -15, 12, 70);
      ctx.strokeRect(-6, -15, 12, 70);

      // 열쇠 날
      ctx.fillRect(6, 25, 16, 10);
      ctx.strokeRect(6, 25, 16, 10);
      ctx.fillRect(6, 42, 22, 10);
      ctx.strokeRect(6, 42, 22, 10);

      // 반짝이 별
      ctx.font = '28px sans-serif';
      ctx.fillText('✨', -35, -50);
      ctx.fillText('⭐', 25, 10);
      ctx.restore();
    } else if (text.includes('딸기') || text.includes('strawberry')) {
      // 달콤한 딸기
      ctx.fillStyle = '#FF4757';
      ctx.beginPath();
      ctx.moveTo(0, 45);
      ctx.quadraticCurveTo(-40, 20, -35, -20);
      ctx.quadraticCurveTo(-20, -45, 0, -40);
      ctx.quadraticCurveTo(20, -45, 35, -20);
      ctx.quadraticCurveTo(40, 20, 0, 45);
      ctx.closePath();
      ctx.fill();

      // 딸기 꼭지
      ctx.fillStyle = '#2ED573';
      [-16, 0, 16].forEach(px => {
        ctx.beginPath();
        ctx.ellipse(px, -42, 10, 6, px * 0.03, 0, Math.PI * 2);
        ctx.fill();
      });

      // 씨앗 점
      ctx.fillStyle = '#FFEAA7';
      [
        [-15, -15], [0, -20], [15, -15],
        [-10, 0], [10, 0],
        [0, 18]
      ].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // 기본 신기한 마법 선물 상자
      ctx.fillStyle = '#FF9F43';
      ctx.strokeStyle = '#EE5253';
      ctx.lineWidth = 3;
      SceneActors.roundRect(ctx, -35, -20, 70, 60, 10);
      ctx.fill();
      ctx.stroke();

      // 리본 띠
      ctx.fillStyle = '#FECA57';
      ctx.fillRect(-10, -20, 20, 60);

      // 리본 매듭
      ctx.beginPath();
      ctx.arc(-16, -30, 14, 0, Math.PI * 2);
      ctx.arc(16, -30, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '24px sans-serif';
      ctx.fillText('✨', -40, -40);
      ctx.fillText('💫', 30, -30);
    }

    ctx.restore();
  }

  // ==========================================
  // [8] 사슴벌레 캐릭터 (Stag Beetle)
  // ==========================================
  static drawStagBeetle(ctx, size = 220, action = 'greeting') {
    ctx.save();
    const scale = size / 220;
    ctx.scale(scale, scale);

    // 그림자
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.beginPath();
    ctx.ellipse(0, 70, 65, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 1. 다리 6개 (귀여운 관절 다리)
    ctx.save();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const isCelebrate = action === 'celebrating';
    const isGreeting = action === 'greeting';

    // 왼쪽 다리 3개
    ctx.beginPath();
    if (isGreeting) {
      ctx.moveTo(-25, -5);
      ctx.quadraticCurveTo(-55, -35, -50, -65); // 번쩍 들어 안녕 인사
    } else if (isCelebrate) {
      ctx.moveTo(-25, -5);
      ctx.quadraticCurveTo(-60, -40, -55, -70);
    } else {
      ctx.moveTo(-25, 0);
      ctx.quadraticCurveTo(-50, 10, -65, 30);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-28, 20);
    ctx.quadraticCurveTo(-60, 25, -70, 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-25, 45);
    ctx.quadraticCurveTo(-55, 60, -65, 80);
    ctx.stroke();

    // 오른쪽 다리 3개
    ctx.beginPath();
    if (isCelebrate) {
      ctx.moveTo(25, -5);
      ctx.quadraticCurveTo(60, -40, 55, -70);
    } else {
      ctx.moveTo(25, 0);
      ctx.quadraticCurveTo(50, 10, 65, 30);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(28, 20);
    ctx.quadraticCurveTo(60, 25, 70, 50);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(25, 45);
    ctx.quadraticCurveTo(55, 60, 65, 80);
    ctx.stroke();
    ctx.restore();

    // 2. 몸통 (배/등껍질 - 광택감 있는 밤색)
    ctx.save();
    const shellGrad = ctx.createLinearGradient(-40, 0, 40, 80);
    shellGrad.addColorStop(0, '#6D4C41');
    shellGrad.addColorStop(0.5, '#4E342E');
    shellGrad.addColorStop(1, '#2E1C14');
    ctx.fillStyle = shellGrad;
    ctx.strokeStyle = '#1D100B';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.ellipse(0, 38, 44, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 날개 분할선
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 82);
    ctx.strokeStyle = '#1D100B';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 등껍질 광택 하이라이트
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.beginPath();
    ctx.ellipse(-18, 28, 12, 28, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. 가슴마디
    ctx.save();
    ctx.fillStyle = '#3E2723';
    ctx.strokeStyle = '#1D100B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, -6, 36, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 4. 머리마디
    ctx.save();
    ctx.fillStyle = '#2E1C14';
    ctx.strokeStyle = '#1D100B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, -28, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 5. 사슴벌레 큰 턱 (사슴뿔 모양의 멋진 집게 턱!)
    ctx.save();
    ctx.fillStyle = '#1D100B';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    // 왼쪽 턱
    ctx.beginPath();
    ctx.moveTo(-16, -35);
    ctx.bezierCurveTo(-38, -60, -42, -90, -18, -108);
    ctx.bezierCurveTo(-14, -100, -22, -80, -16, -65);
    ctx.bezierCurveTo(-10, -60, -14, -50, -8, -40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-28, -78);
    ctx.lineTo(-14, -80);
    ctx.lineTo(-24, -70);
    ctx.closePath();
    ctx.fill();

    // 오른쪽 턱
    ctx.beginPath();
    ctx.moveTo(16, -35);
    ctx.bezierCurveTo(38, -60, 42, -90, 18, -108);
    ctx.bezierCurveTo(14, -100, 22, -80, 16, -65);
    ctx.bezierCurveTo(10, -60, 14, -50, 8, -40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(28, -78);
    ctx.lineTo(14, -80);
    ctx.lineTo(24, -70);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 6. 더듬이 2개
    ctx.save();
    ctx.strokeStyle = '#3E2723';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, -35);
    ctx.quadraticCurveTo(-35, -45, -30, -60);
    ctx.moveTo(12, -35);
    ctx.quadraticCurveTo(35, -45, 30, -60);
    ctx.stroke();
    ctx.restore();

    // 7. 귀여운 동화 스타일 커다란 반짝이 눈!
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-15, -26, 11, 0, Math.PI * 2);
    ctx.arc(15, -26, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1D100B';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#1D100B';
    ctx.beginPath();
    ctx.arc(-14, -26, 7, 0, Math.PI * 2);
    ctx.arc(14, -26, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-16, -29, 3.5, 0, Math.PI * 2);
    ctx.arc(12, -29, 3.5, 0, Math.PI * 2);
    ctx.arc(-12, -23, 1.8, 0, Math.PI * 2);
    ctx.arc(16, -23, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 분홍 볼터치
    ctx.fillStyle = '#FF8A80';
    ctx.beginPath();
    ctx.ellipse(-22, -18, 6, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(22, -18, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 방긋 웃는 귀여운 입
    ctx.strokeStyle = '#D84315';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -20, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();

    if (isGreeting || isCelebrate) {
      ctx.save();
      ctx.font = '22px sans-serif';
      ctx.fillText('✨', -70, -75);
      if (isCelebrate) ctx.fillText('🌟', 60, -75);
      ctx.restore();
    }

    ctx.restore();
  }

  // ==========================================
  // [9] 장수풍뎅이 (Rhinoceros Beetle)
  // ==========================================
  static drawBeetle(ctx, size = 220, action = 'greeting') {
    ctx.save();
    const scale = size / 220;
    ctx.scale(scale, scale);

    // 몸체 (사슴벌레와 비슷하되 이마에 늠름한 Y자 뿔)
    SceneActors.drawStagBeetle(ctx, 220, action);

    // 중앙 위쪽 장수풍뎅이 메인 뿔 추가
    ctx.save();
    ctx.fillStyle = '#1D100B';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -40);
    ctx.lineTo(-6, -95);
    ctx.lineTo(-20, -112); // 왼쪽 갈래
    ctx.lineTo(-12, -115);
    ctx.lineTo(0, -100);
    ctx.lineTo(12, -115);
    ctx.lineTo(20, -112); // 오른쪽 갈래
    ctx.lineTo(6, -95);
    ctx.lineTo(10, -40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // ==========================================
  // [10] 무당벌레 (Ladybug)
  // ==========================================
  static drawLadybug(ctx, size = 200, action = 'greeting') {
    ctx.save();
    const scale = size / 200;
    ctx.scale(scale, scale);

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 50, 55, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // 다리
    ctx.strokeStyle = '#2D3436';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    [-35, 0, 35].forEach(dy => {
      ctx.beginPath();
      ctx.moveTo(-30, dy); ctx.lineTo(-50, dy + 15);
      ctx.moveTo(30, dy); ctx.lineTo(50, dy + 15);
      ctx.stroke();
    });

    // 빨간 등껍질
    ctx.fillStyle = '#FF4757';
    ctx.strokeStyle = '#2F3542';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 15, 45, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 등껍질 점들
    ctx.fillStyle = '#2F3542';
    [[-20, 0], [20, 0], [-25, 25], [25, 25], [-12, 42], [12, 42], [0, -10]].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    // 머리
    ctx.fillStyle = '#2F3542';
    ctx.beginPath();
    ctx.arc(0, -32, 22, 0, Math.PI * 2);
    ctx.fill();

    // 눈
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-8, -32, 6, 0, Math.PI * 2);
    ctx.arc(8, -32, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-7, -32, 3.5, 0, Math.PI * 2);
    ctx.arc(7, -32, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 더듬이
    ctx.strokeStyle = '#2F3542';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, -48); ctx.lineTo(-18, -65);
    ctx.moveTo(8, -48); ctx.lineTo(18, -65);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-20, -66, 4, 0, Math.PI * 2);
    ctx.arc(20, -66, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // [11] 나비 (Butterfly)
  // ==========================================
  static drawButterfly(ctx, size = 200, action = 'greeting') {
    ctx.save();
    const scale = size / 200;
    ctx.scale(scale, scale);

    // 날개 4장 (알록달록 파스텔)
    const wingGrad = ctx.createLinearGradient(-60, -60, 60, 60);
    wingGrad.addColorStop(0, '#FF9FF3');
    wingGrad.addColorStop(0.5, '#FECA57');
    wingGrad.addColorStop(1, '#54A0FF');
    ctx.fillStyle = wingGrad;
    ctx.strokeStyle = '#5F27CD';
    ctx.lineWidth = 3;

    // 왼쪽 날개
    ctx.beginPath();
    ctx.ellipse(-38, -25, 34, 46, -0.4, 0, Math.PI * 2);
    ctx.ellipse(-32, 25, 26, 34, 0.4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 오른쪽 날개
    ctx.beginPath();
    ctx.ellipse(38, -25, 34, 46, 0.4, 0, Math.PI * 2);
    ctx.ellipse(32, 25, 26, 34, -0.4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 몸통
    ctx.fillStyle = '#341F97';
    ctx.beginPath();
    ctx.ellipse(0, 5, 9, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    // 머리와 눈
    ctx.beginPath();
    ctx.arc(0, -32, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-4, -33, 4, 0, Math.PI * 2);
    ctx.arc(4, -33, 4, 0, Math.PI * 2);
    ctx.fill();

    // 더듬이
    ctx.strokeStyle = '#341F97';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-4, -42); ctx.quadraticCurveTo(-18, -60, -14, -70);
    ctx.moveTo(4, -42); ctx.quadraticCurveTo(18, -60, 14, -70);
    ctx.stroke();

    ctx.restore();
  }

  // ==========================================
  // [12] 귀여운 외계인 친구 (Cute Alien)
  // ==========================================
  static drawCuteAlien(ctx, size = 220, action = 'greeting') {
    ctx.save();
    const scale = size / 220;
    ctx.scale(scale, scale);

    // 그림자
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 60, 55, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // 귀여운 민트색 몸체
    const alienGrad = ctx.createRadialGradient(-10, -10, 10, 0, 0, 60);
    alienGrad.addColorStop(0, '#55EFC4');
    alienGrad.addColorStop(1, '#00B894');
    ctx.fillStyle = alienGrad;
    ctx.strokeStyle = '#006266';
    ctx.lineWidth = 4;

    // 몸통
    ctx.beginPath();
    ctx.ellipse(0, 18, 38, 42, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 머리 (둥글고 귀여운 외계인)
    ctx.beginPath();
    ctx.ellipse(0, -28, 44, 38, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // 머리 위 별 안테나
    ctx.strokeStyle = '#006266';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -66); ctx.lineTo(0, -88);
    ctx.stroke();

    ctx.font = '24px sans-serif';
    ctx.fillText('⭐', -12, -92);

    // 커다란 초롱초롱한 눈
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-16, -26, 14, 0, Math.PI * 2);
    ctx.arc(16, -26, 14, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#2C3E50';
    ctx.beginPath();
    ctx.arc(-15, -26, 9, 0, Math.PI * 2);
    ctx.arc(15, -26, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-18, -30, 4, 0, Math.PI * 2);
    ctx.arc(13, -30, 4, 0, Math.PI * 2);
    ctx.fill();

    // 분홍 볼터치
    ctx.fillStyle = '#FF7675';
    ctx.beginPath();
    ctx.arc(-24, -15, 6, 0, Math.PI * 2);
    ctx.arc(24, -15, 6, 0, Math.PI * 2);
    ctx.fill();

    // 환하게 웃는 입
    ctx.strokeStyle = '#D63031';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -18, 9, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // 손인사
    ctx.strokeStyle = '#006266';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-32, 10); ctx.lineTo(-55, -25);
    ctx.moveTo(32, 10); ctx.lineTo(48, 25);
    ctx.stroke();

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

  static drawHexagon(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = x + Math.cos(angle) * r;
      const hy = y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
  }
}
