// 그림이 준비되지 않았을 때 즉시 체험할 수 있는 귀여운 크레파스풍 샘플 캐릭터들

function createCrayonRabbit() {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');

  // 아이가 크레파스로 꾹꾹 눌러 그린 듯한 몽실이 (분홍 토끼)
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. 귀 (왼쪽, 오른쪽)
  ctx.fillStyle = '#FFB6C1';
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 6;

  // 왼쪽 귀
  ctx.beginPath();
  ctx.ellipse(150, 110, 32, 85, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 왼쪽 귀 안쪽 분홍
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(150, 115, 18, 55, -0.25, 0, Math.PI * 2);
  ctx.fill();

  // 오른쪽 귀
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(250, 110, 32, 85, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 오른쪽 귀 안쪽 분홍
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(250, 115, 18, 55, 0.25, 0, Math.PI * 2);
  ctx.fill();

  // 2. 몸통
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(200, 320, 85, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 배 둥글게 흰색
  ctx.fillStyle = '#FFF0F5';
  ctx.beginPath();
  ctx.ellipse(200, 330, 50, 55, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. 얼굴
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(200, 210, 95, 85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 뺨 터치 (볼터치 분홍)
  ctx.fillStyle = '#FF8DA1';
  ctx.beginPath();
  ctx.arc(140, 230, 16, 0, Math.PI * 2);
  ctx.arc(260, 230, 16, 0, Math.PI * 2);
  ctx.fill();

  // 눈 (초롱초롱 손그림 눈)
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.arc(165, 200, 9, 0, Math.PI * 2);
  ctx.arc(235, 200, 9, 0, Math.PI * 2);
  ctx.fill();

  // 눈 하이라이트
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(163, 197, 3.5, 0, Math.PI * 2);
  ctx.arc(233, 197, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 코 (세모)
  ctx.fillStyle = '#FF1493';
  ctx.beginPath();
  ctx.moveTo(192, 215);
  ctx.lineTo(208, 215);
  ctx.lineTo(200, 225);
  ctx.closePath();
  ctx.fill();

  // 입 (웃는 모습)
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(190, 230, 10, 0.1 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(210, 230, 10, 0.2 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // 팔
  ctx.fillStyle = '#FFB6C1';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(115, 310, 22, 35, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(285, 310, 22, 35, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 발
  ctx.beginPath();
  ctx.ellipse(160, 395, 32, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(240, 395, 32, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
  return canvas.toDataURL('image/png');
}

function createCrayonDino() {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#2d472c';

  // 아기 공룡 몸통 & 꼬리
  ctx.fillStyle = '#78C850';
  ctx.beginPath();
  ctx.moveTo(150, 150);
  ctx.quadraticCurveTo(100, 160, 120, 240);
  ctx.quadraticCurveTo(120, 350, 190, 370);
  // 꼬리
  ctx.quadraticCurveTo(270, 380, 330, 340);
  ctx.quadraticCurveTo(280, 320, 250, 290);
  ctx.quadraticCurveTo(240, 200, 220, 150);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 등 뿔 (노란 삼각 뿔)
  ctx.fillStyle = '#FFD700';
  const spines = [
    { x: 145, y: 155, r: 18 },
    { x: 180, y: 140, r: 22 },
    { x: 220, y: 160, r: 20 },
    { x: 250, y: 210, r: 20 },
    { x: 275, y: 260, r: 18 },
    { x: 300, y: 310, r: 16 }
  ];
  for (const s of spines) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 머리
  ctx.fillStyle = '#8AE058';
  ctx.beginPath();
  ctx.ellipse(150, 170, 65, 55, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 볼터치
  ctx.fillStyle = '#FFA07A';
  ctx.beginPath();
  ctx.arc(125, 190, 12, 0, Math.PI * 2);
  ctx.fill();

  // 눈
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(135, 165, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(133, 163, 3, 0, Math.PI * 2);
  ctx.fill();

  // 콧구멍 & 웃음
  ctx.fillStyle = '#2d472c';
  ctx.beginPath();
  ctx.arc(105, 180, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2d472c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(115, 195, 12, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // 팔
  ctx.fillStyle = '#8AE058';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(140, 270, 20, 12, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 다리
  ctx.beginPath();
  ctx.ellipse(165, 375, 25, 35, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(220, 375, 25, 35, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
  return canvas.toDataURL('image/png');
}

function createCrayonStar() {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#e67e22';

  // 통통하고 둥글둥글한 꼬마별
  ctx.fillStyle = '#FFE066';

  const cx = 200, cy = 200, outerR = 150, innerR = 75;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const rot = (Math.PI / 2) * 3;
    const step = Math.PI / 5;
    let x = cx + Math.cos(rot + i * step * 2) * outerR;
    let y = cy + Math.sin(rot + i * step * 2) * outerR;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);

    x = cx + Math.cos(rot + (i * 2 + 1) * step) * innerR;
    y = cy + Math.sin(rot + (i * 2 + 1) * step) * innerR;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 귀여운 눈 & 볼터치
  ctx.fillStyle = '#FF7675';
  ctx.beginPath();
  ctx.arc(160, 210, 14, 0, Math.PI * 2);
  ctx.arc(240, 210, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2d3436';
  ctx.beginPath();
  ctx.arc(175, 190, 8, 0, Math.PI * 2);
  ctx.arc(225, 190, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(173, 188, 3, 0, Math.PI * 2);
  ctx.arc(223, 188, 3, 0, Math.PI * 2);
  ctx.fill();

  // 방긋 웃는 입
  ctx.strokeStyle = '#d35400';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(200, 205, 14, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  ctx.restore();
  return canvas.toDataURL('image/png');
}

// 4. 종이에 직접 그린 손그림 토끼 (실제 도화지 질감과 펜 스케치)
function createDrawnBunnySample() {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');

  // 실내 조명의 은은한 도화지 배경 (회색빛 도화지)
  ctx.fillStyle = '#E8E8E8';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 펜으로 그린 귀여운 토끼 선화
  ctx.save();
  ctx.strokeStyle = '#222222';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 왼쪽 귀
  ctx.beginPath();
  ctx.ellipse(150, 130, 26, 75, -0.15, 0, Math.PI * 2);
  ctx.stroke();

  // 오른쪽 귀
  ctx.beginPath();
  ctx.ellipse(250, 130, 26, 75, 0.15, 0, Math.PI * 2);
  ctx.stroke();

  // 얼굴
  ctx.beginPath();
  ctx.ellipse(200, 290, 85, 80, 0, 0, Math.PI * 2);
  ctx.stroke();

  // 눈
  ctx.fillStyle = '#222222';
  ctx.fillRect(170, 270, 6, 18);
  ctx.fillRect(224, 270, 6, 18);

  // 코
  ctx.beginPath();
  ctx.arc(200, 305, 5, 0, Math.PI * 2);
  ctx.fill();

  // 입
  ctx.beginPath();
  ctx.arc(192, 316, 9, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(208, 316, 9, 0, Math.PI);
  ctx.stroke();

  // 수염
  ctx.beginPath();
  ctx.moveTo(150, 305); ctx.lineTo(175, 305);
  ctx.moveTo(150, 320); ctx.lineTo(175, 315);
  ctx.moveTo(225, 305); ctx.lineTo(250, 305);
  ctx.moveTo(225, 315); ctx.lineTo(250, 320);
  ctx.stroke();

  ctx.restore();
  return canvas.toDataURL('image/png');
}

export const sampleCharacters = [
  {
    id: 'sample-sketch-rabbit',
    name: '토깽이 (손그림)',
    description: '스케치북에 직접 펜으로 그린 귀여운 토끼 손그림',
    image: createDrawnBunnySample(),
    tag: '#손그림 #도화지제거 #귀여운토끼',
    isDrawing: true
  },
  {
    id: 'sample-rabbit',
    name: '몽실이',
    description: '하늘을 날고 싶은 호기심 많은 분홍색 토끼',
    image: createCrayonRabbit(),
    tag: '#분홍토끼 #하늘날기 #호기심'
  },
  {
    id: 'sample-dino',
    name: '또또',
    description: '초록 풀잎을 좋아하는 다정한 꼬마 아기공룡',
    image: createCrayonDino(),
    tag: '#아기공룡 #풀잎좋아 #다정한친구'
  },
  {
    id: 'sample-star',
    name: '퐁이',
    description: '달님과 숨바꼭질하는 반짝반짝 노란 꼬마별',
    image: createCrayonStar(),
    tag: '#꼬마별 #반짝반짝 #숨바꼭질'
  }
];
