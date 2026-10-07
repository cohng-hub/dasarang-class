// 어린이 그림 및 인물 사진 처리기 (얼굴·옷 100% 보호, 손그림 도화지 지능형 누끼 제거, 다이컷 스티커 및 마술봉/지우개 지원)

export class CharacterProcessor {
  /**
   * 이미지 파일 또는 데이터 URL을 받아 HTMLImageElement로 로드
   */
  static loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
      img.src = src;
    });
  }

  /**
   * 로컬 AI 서버(rembg)를 통한 완벽한 인물/캐릭터 배경 제거 (자동 누끼)
   * 복잡한 교실/방 배경도 깨끗하게 지우고 오직 아이 인물만 선명하게 추출합니다.
   * 서버 오프라인 시 클라이언트 측 지능형 필터로 자동 폴백
   */
  static async removeBackgroundWithAI(sourceImgOrBlob, serverUrl = 'http://127.0.0.1:8000') {
    try {
      let blob;
      let img = null;
      if (sourceImgOrBlob instanceof HTMLImageElement) {
        img = sourceImgOrBlob;
      } else if (sourceImgOrBlob instanceof HTMLCanvasElement) {
        img = sourceImgOrBlob;
      } else if (sourceImgOrBlob instanceof Blob) {
        const u = URL.createObjectURL(sourceImgOrBlob);
        img = await CharacterProcessor.loadImage(u);
        URL.revokeObjectURL(u);
      } else if (typeof sourceImgOrBlob === 'string') {
        img = await CharacterProcessor.loadImage(sourceImgOrBlob);
      }

      if (img) {
        const maxDim = 512;
        let w = img.naturalWidth || img.width || 512;
        let h = img.naturalHeight || img.height || 512;
        if (Math.max(w, h) > maxDim) {
          if (w > h) {
            h = Math.round(h * (maxDim / w));
            w = maxDim;
          } else {
            w = Math.round(w * (maxDim / h));
            h = maxDim;
          }
        }
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        blob = await new Promise(r => c.toBlob(r, 'image/png'));
      }

      if (blob) {
        const formData = new FormData();
        formData.append('image_file', blob, 'photo.png');

        const cleanUrl = (serverUrl || 'http://127.0.0.1:8000').replace(/\/+$/, '');
        const res = await fetch(`${cleanUrl}/api/remove-bg`, {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const resBlob = await res.blob();
          const imgUrl = URL.createObjectURL(resBlob);
          const cutoutImg = await CharacterProcessor.loadImage(imgUrl);
          URL.revokeObjectURL(imgUrl);

          const canvas = document.createElement('canvas');
          canvas.width = cutoutImg.naturalWidth;
          canvas.height = cutoutImg.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(cutoutImg, 0, 0);
          // AI 서버가 책상을 분리한 뒤에도 남아있는 흰 도화지 배경을 확실하게 2차 투명화!
          return CharacterProcessor.removePaperBackground(canvas, 45, false, 'rounded');
        }
      }
    } catch (e) {
      console.warn('AI 배경 제거 실패 -> 로컬 알고리즘 폴백:', e);
    }

    if (sourceImgOrBlob instanceof HTMLImageElement || sourceImgOrBlob instanceof HTMLCanvasElement) {
      return CharacterProcessor.removePaperBackground(sourceImgOrBlob, 45, false, 'rounded');
    }
    return null;
  }

  /**
   * 사진 및 손그림 스마트 처리 (도화지 배경 제거 & 인물 보호)
   * @param {HTMLImageElement|HTMLCanvasElement} sourceImg
   * @param {number} threshold - 배경 제거 감도 (5~95)
   * @param {boolean} isPhoto - 인물 사진 모드 여부 (true면 얼굴/옷 100% 안전 보존)
   * @param {string} shapeMode - 'rounded' (둥근 액자) | 'oval' (인물 중심 타원 배지)
   * @param {Object} options - { fillBodyWhite: boolean, smartEnhance: boolean }
   */
  static removePaperBackground(sourceImg, threshold = 45, isPhoto = false, shapeMode = 'rounded', options = {}) {
    const { fillBodyWhite = true, smartEnhance = true } = options;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const origW = sourceImg.naturalWidth || sourceImg.width;
    const origH = sourceImg.naturalHeight || sourceImg.height;

    // 최대 1200px 리사이즈 (메모리 및 성능 최적화)
    const maxDim = 1200;
    let targetW = origW;
    let targetH = origH;
    if (origW > maxDim || origH > maxDim) {
      const scale = Math.min(maxDim / origW, maxDim / origH);
      targetW = Math.round(origW * scale);
      targetH = Math.round(origH * scale);
    }

    canvas.width = targetW;
    canvas.height = targetH;

    // [인물 사진 모드] 얼굴이나 옷이 파이지 않도록 안전 보존
    if (isPhoto || threshold <= 0) {
      if (shapeMode === 'oval') {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(targetW / 2, targetH / 2, targetW * 0.46, targetH * 0.48, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(sourceImg, 0, 0, targetW, targetH);
        ctx.restore();
      } else {
        ctx.drawImage(sourceImg, 0, 0, targetW, targetH);
      }
      return canvas;
    }

    // [손그림 모드] 스마트 도화지 & 책상 배경 완벽 누끼 제거
    ctx.drawImage(sourceImg, 0, 0, targetW, targetH);
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const data = imgData.data;
    const totalPixels = targetW * targetH;

    // 1단계: 전체 이미지에서 지능형 도화지(Paper) 색상 및 조명 밝기 통계 추출
    // - 사진 프레임 모서리에 책상/바닥/그림자가 찍혀도 영향받지 않도록 화면 전체 격자 샘플링
    const sampleStep = Math.max(2, Math.floor(Math.min(targetW, targetH) / 120));
    const paperLumSamples = [];

    for (let y = sampleStep; y < targetH - sampleStep; y += sampleStep) {
      const rowOffset = y * targetW;
      for (let x = sampleStep; x < targetW - sampleStep; x += sampleStep) {
        const idx = (rowOffset + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        const sat = Math.max(r, g, b) - Math.min(r, g, b);

        // 도화지 후보: 무채색에 가깝고(sat < 28), 최소한의 밝기(lum > 130)를 가진 영역
        if (sat < 28 && lum > 130) {
          paperLumSamples.push(lum);
        }
      }
    }

    // 도화지 밝기 결정 (상위 80 백분위수 활용: 어두운 그림자/책상 배제, 순수 도화지 기준)
    let paperLum = 238;
    if (paperLumSamples.length > 30) {
      paperLumSamples.sort((a, b) => a - b);
      const pIdx = Math.floor(paperLumSamples.length * 0.80);
      paperLum = paperLumSamples[pIdx];
    }

    // 2단계: 감도(threshold: 5 ~ 95, 기본 약 45~50)에 따른 선화 및 채색 판정 기준
    const normThresh = Math.max(5, Math.min(95, threshold));
    // 선 콘트라스트: 도화지보다 이만큼 어두우면 연필/펜/외곽선으로 판별
    const strokeContrast = Math.max(12, 60 - (normThresh * 0.65));
    // 유채색 채도 기준: 크레파스/색연필/사인펜
    const satLimit = Math.max(14, 30 - (normThresh * 0.18));

    // 마스크 배열 (1: 그림/선/채색, 0: 도화지 또는 책상 배경)
    const isStroke = new Uint8Array(totalPixels);

    // 3단계: 픽셀별 선화 및 채색 감지
    // 외곽 테두리 3% 여백 (책상 자투리, 스케치북 스프링 구멍 등 노이즈 제거 마진)
    const marginX = Math.max(4, Math.floor(targetW * 0.03));
    const marginY = Math.max(4, Math.floor(targetH * 0.03));

    for (let y = marginY; y < targetH - marginY; y++) {
      const rowOffset = y * targetW;
      for (let x = marginX; x < targetW - marginX; x++) {
        const p = (rowOffset + x) * 4;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        const sat = Math.max(r, g, b) - Math.min(r, g, b);

        // A. 어두운 선화 (연필, 볼펜, 사인펜, 크레파스 외곽선)
        const isDark = (paperLum - lum) > strokeContrast;
        // B. 유채색 채색 (크레파스, 색연필, 형광펜, 사인펜 채색)
        const isColor = sat > satLimit;
        // C. 초록/파랑/살구색 등 특정 유채색 색조 보호 (채도가 낮아도 색조가 뚜렷한 경우)
        const isGreenCrayon = (g > r + 8 && g > b + 8);
        const isBlueCrayon = (b > r + 12);
        const isSkin = (r > b + 16 && r > 130 && sat > 10);

        if (isDark || isColor || isGreenCrayon || isBlueCrayon || isSkin) {
          isStroke[rowOffset + x] = 1;
        }
      }
    }

    // 4단계: 외곽 테두리에 걸친 책상선(바닥 테이블 라인) 및 상단 스프링선 제거
    const visitedDesk = new Uint8Array(totalPixels);
    const deskQueue = new Int32Array(totalPixels);
    for (let y = 0; y < targetH; y++) {
      for (const x of [marginX, targetW - 1 - marginX]) {
        const idx = y * targetW + x;
        if (isStroke[idx] && !visitedDesk[idx]) {
          let dHead = 0, dTail = 0;
          visitedDesk[idx] = 1;
          deskQueue[dTail++] = idx;
          let minX = x, maxX = x, minY = y, maxY = y;
          const compIndices = [];

          while (dHead < dTail) {
            const cur = deskQueue[dHead++];
            compIndices.push(cur);
            const cx = cur % targetW;
            const cy = Math.floor(cur / targetW);
            if (cx < minX) minX = cx;
            if (cx > maxX) maxX = cx;
            if (cy < minY) minY = cy;
            if (cy > maxY) maxY = cy;

            const nbs = [
              cx > marginX ? cur - 1 : -1,
              cx < targetW - 1 - marginX ? cur + 1 : -1,
              cy > marginY ? cur - targetW : -1,
              cy < targetH - 1 - marginY ? cur + targetW : -1
            ];
            for (const n of nbs) {
              if (n !== -1 && isStroke[n] && !visitedDesk[n]) {
                visitedDesk[n] = 1;
                deskQueue[dTail++] = n;
              }
            }
          }

          const compW = maxX - minX + 1;
          const compH = maxY - minY + 1;
          // 상단/하단 경계에 닿아있으면서 가로로 길게 뻗은 테이블/스프링 선이면 제거
          if (compW > targetW * 0.40 && compH < 35) {
            for (const cIdx of compIndices) {
              isStroke[cIdx] = 0;
            }
          }
        }
      }
    }

    // 5단계: 크레파스 질감 틈새 메우기 (Morphological Closing)
    // 5x5 모폴로지 닫기(팽창 후 침식)로 크레파스 틈을 촘촘히 메워 단단한 캐릭터 덩어리로 만듭니다.
    const closed = new Uint8Array(totalPixels);
    const tempDilate = new Uint8Array(totalPixels);
    const radius = 2; // 5x5 반경

    // 팽창(Dilation)
    for (let y = radius; y < targetH - radius; y++) {
      const row = y * targetW;
      for (let x = radius; x < targetW - radius; x++) {
        if (isStroke[row + x]) {
          for (let dy = -radius; dy <= radius; dy++) {
            const nyRow = (y + dy) * targetW;
            for (let dx = -radius; dx <= radius; dx++) {
              tempDilate[nyRow + (x + dx)] = 1;
            }
          }
        }
      }
    }

    // 침식(Erosion)
    for (let y = radius; y < targetH - radius; y++) {
      const row = y * targetW;
      for (let x = radius; x < targetW - radius; x++) {
        let allOn = true;
        for (let dy = -radius; dy <= radius; dy++) {
          const nyRow = (y + dy) * targetW;
          for (let dx = -radius; dx <= radius; dx++) {
            if (!tempDilate[nyRow + (x + dx)]) {
              allOn = false;
              break;
            }
          }
          if (!allOn) break;
        }
        if (allOn) {
          closed[row + x] = 1;
        }
      }
    }

    // 6단계: 외부 도화지 배경과 캐릭터 내부(얼굴, 몸통, 옷) 분리 (외부 Flood-Fill)
    const extBg = new Uint8Array(totalPixels);
    const queue = new Int32Array(totalPixels);
    let head = 0, tail = 0;

    const seedExt = (x, y) => {
      const idx = y * targetW + x;
      if (!extBg[idx] && !closed[idx]) {
        extBg[idx] = 1;
        queue[tail++] = idx;
      }
    };

    for (let x = 0; x < targetW; x++) {
      seedExt(x, 0);
      seedExt(x, targetH - 1);
    }
    for (let y = 0; y < targetH; y++) {
      seedExt(0, y);
      seedExt(targetW - 1, y);
    }

    while (head < tail) {
      const curr = queue[head++];
      const cx = curr % targetW;
      const cy = Math.floor(curr / targetW);

      const nbs = [
        cx > 0 ? curr - 1 : -1,
        cx < targetW - 1 ? curr + 1 : -1,
        cy > 0 ? curr - targetW : -1,
        cy < targetH - 1 ? curr + targetW : -1
      ];

      for (const n of nbs) {
        if (n !== -1 && !extBg[n] && !closed[n]) {
          extBg[n] = 1;
          queue[tail++] = n;
        }
      }
    }

    // 7단계: 픽셀 합성 및 스티커 내부 정돈
    // extBg === 1: 외부 도화지/책상 -> alpha = 0 (투명)
    // extBg === 0: 캐릭터 내부 (선화, 크레파스 채색, 얼굴/몸통) -> alpha = 255 (보존)
    for (let i = 0; i < totalPixels; i++) {
      const p = i * 4;
      if (extBg[i] === 1) {
        data[p + 3] = 0; // 바깥 도화지는 깨끗하게 100% 투명화!
      } else {
        data[p + 3] = 255;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        const sat = Math.max(r, g, b) - Math.min(r, g, b);

        const isDrawingPixel = isStroke[i] === 1;

        if (!isDrawingPixel) {
          // 캐릭터 내부지만 색칠하지 않은 빈 도화지(예: 칠하지 않은 얼굴, 흰 옷, 눈동자 흰자위)
          if (fillBodyWhite) {
            data[p] = 255;
            data[p + 1] = 255;
            data[p + 2] = 255;
          }
        } else if (smartEnhance && sat < 25 && lum < 120) {
          // 검정/어두운 펜 외곽선은 더욱 또렷하고 선명하게 보정
          data[p] = Math.max(0, Math.floor(r * 0.6));
          data[p + 1] = Math.max(0, Math.floor(g * 0.6));
          data[p + 2] = Math.max(0, Math.floor(b * 0.6));
        }
      }
    }

    // 8단계: 외곽선 안티앨리어싱 (경계면 부드럽게 스무딩)
    for (let y = 1; y < targetH - 1; y++) {
      const row = y * targetW;
      for (let x = 1; x < targetW - 1; x++) {
        const i = row + x;
        const p = i * 4;
        if (data[p + 3] > 0) {
          const tNeighbors = (
            (data[((y - 1) * targetW + x) * 4 + 3] === 0 ? 1 : 0) +
            (data[((y + 1) * targetW + x) * 4 + 3] === 0 ? 1 : 0) +
            (data[(row + x - 1) * 4 + 3] === 0 ? 1 : 0) +
            (data[(row + x + 1) * 4 + 3] === 0 ? 1 : 0)
          );
          if (tNeighbors >= 2) {
            data[p + 3] = 160;
          } else if (tNeighbors === 1) {
            data[p + 3] = 210;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // 9단계: 캐릭터 영역으로 자동 크롭
    return CharacterProcessor.autoCrop(canvas);
  }

  /**
   * 마술봉 도구: 클릭한 지점과 연결된 유사 색상 영역 지우기
   */
  static magicWandErase(canvas, startX, startY, tolerance = 35) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { width, height } = canvas;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const sx = Math.floor(Math.max(0, Math.min(width - 1, startX)));
    const sy = Math.floor(Math.max(0, Math.min(height - 1, startY)));
    const startIdx = (sy * width + sx) * 4;

    if (data[startIdx + 3] === 0) return canvas; // 이미 투명하면 스킵

    const targetR = data[startIdx];
    const targetG = data[startIdx + 1];
    const targetB = data[startIdx + 2];

    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let head = 0;
    let tail = 0;

    const startIndex = sy * width + sx;
    visited[startIndex] = 1;
    queue[tail++] = startIndex;

    while (head < tail) {
      const curr = queue[head++];
      const cx = curr % width;
      const cy = Math.floor(curr / width);
      const cp = curr * 4;

      data[cp + 3] = 0; // 투명화!

      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < width - 1 ? curr + 1 : -1,
        cy > 0 ? curr - width : -1,
        cy < height - 1 ? curr + width : -1
      ];

      for (const n of neighbors) {
        if (n !== -1 && !visited[n]) {
          const np = n * 4;
          if (data[np + 3] > 0) {
            const dR = data[np] - targetR;
            const dG = data[np + 1] - targetG;
            const dB = data[np + 2] - targetB;
            const dist = Math.sqrt(dR * dR + dG * dG + dB * dB);

            if (dist < tolerance) {
              visited[n] = 1;
              queue[tail++] = n;
            }
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return CharacterProcessor.autoCrop(canvas);
  }

  /**
   * 브러시 지우개 도구: 특정 반경 내 픽셀 지우기
   */
  static brushErase(canvas, x, y, radius = 18) {
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return canvas;
  }

  /**
   * 투명 여백 자동 크롭
   */
  static autoCrop(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { width, height } = canvas;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width, minY = height, maxX = 0, maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 15) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          found = true;
        }
      }
    }

    if (!found) return canvas;

    const pad = 12;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(width - 1, maxX + pad);
    maxY = Math.min(height - 1, maxY + pad);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d');

    cropCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return cropCanvas;
  }

  /**
   * 캐릭터 스티커 렌더링
   * - 인물 사진: 둥근 액자 또는 타원 배지
   * - 손그림: 캐릭터 실루엣을 부드럽게 감싸는 다이컷(Die-cut) 스티커 테두리
   */
  static renderCharacterWithStickerEffect(ctx, charCanvas, x, y, width, height, options = {}) {
    const {
      withSticker = true,
      stickerColor = '#FFFFFF',
      stickerWidth = 7,
      shadowBlur = 14,
      shadowColor = 'rgba(0,0,0,0.18)',
      rotation = 0,
      flipH = false
    } = options;

    if (!charCanvas) return;

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
    if (flipH) ctx.scale(-1, 1);

    const drawX = -width / 2;
    const drawY = -height / 2;

    // 실제 캐릭터 실루엣 외곽선을 따라 흐르는 다이컷 스티커 테두리 (배경 투명화 100% 보존)
    if (withSticker) {
      // 임시 캔버스에 캐릭터의 화이트 실루엣 생성
      const silCanvas = document.createElement('canvas');
      silCanvas.width = charCanvas.width;
      silCanvas.height = charCanvas.height;
      const sCtx = silCanvas.getContext('2d');
      sCtx.drawImage(charCanvas, 0, 0);
      sCtx.globalCompositeOperation = 'source-in';
      sCtx.fillStyle = stickerColor;
      sCtx.fillRect(0, 0, silCanvas.width, silCanvas.height);

      // 화이트 실루엣을 사방으로 약간 오프셋하여 부드러운 스티커 테두리 형성
      ctx.save();
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 5;

      const d = Math.max(3, stickerWidth);
      const steps = 12;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const ox = Math.cos(angle) * d;
        const oy = Math.sin(angle) * d;
        ctx.drawImage(silCanvas, drawX + ox, drawY + oy, width, height);
      }
      ctx.restore();
    }

    // 본 캐릭터 그리기 (배경 없이 캐릭터만 선명하게 표시)
    ctx.drawImage(charCanvas, drawX, drawY, width, height);
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
