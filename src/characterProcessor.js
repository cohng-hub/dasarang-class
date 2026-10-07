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
          return CharacterProcessor.autoCrop(canvas);
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

    // [핵심 1: 인물 사진 모드] 얼굴이나 옷이 파이지 않도록 안전 보존!
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

    // [핵심 2: 손그림 모드] 도화지/스케치북 배경 제거 (지능형 누끼 따기)
    ctx.drawImage(sourceImg, 0, 0, targetW, targetH);
    const imgData = ctx.getImageData(0, 0, targetW, targetH);
    const data = imgData.data;
    const totalPixels = targetW * targetH;

    // 1단계: 외곽 테두리 둘레에서 배경 도화지 색상과 밝기 샘플링 (실내 조명/그림자 적응)
    let borderCount = 0;
    let sumR = 0, sumG = 0, sumB = 0;
    const insetX = Math.max(1, Math.floor(targetW * 0.02));
    const insetY = Math.max(1, Math.floor(targetH * 0.02));

    const sampleBorderPixel = (x, y) => {
      const idx = (y * targetW + x) * 4;
      sumR += data[idx];
      sumG += data[idx + 1];
      sumB += data[idx + 2];
      borderCount++;
    };

    for (let x = insetX; x < targetW - insetX; x += 3) {
      sampleBorderPixel(x, insetY);
      sampleBorderPixel(x, targetH - 1 - insetY);
    }
    for (let y = insetY; y < targetH - insetY; y += 3) {
      sampleBorderPixel(insetX, y);
      sampleBorderPixel(targetW - 1 - insetX, y);
    }

    const bgR = borderCount > 0 ? sumR / borderCount : 200;
    const bgG = borderCount > 0 ? sumG / borderCount : 200;
    const bgB = borderCount > 0 ? sumB / borderCount : 200;
    const bgLum = bgR * 0.299 + bgG * 0.587 + bgB * 0.114;
    const bgSat = Math.max(Math.abs(bgR - bgG), Math.abs(bgG - bgB), Math.abs(bgB - bgR));

    // 감도(threshold: 5 ~ 95)에 따른 파라미터 계산
    const normThresh = Math.max(5, Math.min(95, threshold));
    // 선(획) 콘트라스트 기준값: 종이보다 이 이상 어두우면 선으로 판별하여 투명화 중단
    const strokeContrast = Math.max(8, 70 - (normThresh * 0.65));
    // 도화지 색상 허용 거리
    const colorDistLimit = 35 + (normThresh * 1.5);
    // 인접 픽셀간의 그라디언트 허용차 (조명 그림자를 부드럽게 추적)
    const stepDiffLimit = 35 + (normThresh * 0.4);

    // 픽셀이 도화지 배경인지 판별
    // true: 도화지 (지울 영역), false: 그림 선/채색 (보호할 영역)
    const isPaperPixel = (r, g, b) => {
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      const lumDiff = bgLum - lum; // 종이보다 얼마나 어두운가?
      const sat = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));

      // 1. 선화 판정: 종이보다 유의미하게 어두우면 펜/연필 선임 -> 보호!
      if (lumDiff > strokeContrast) {
        return false;
      }

      // 2. 채색 판정: 채도가 도화지보다 뚜렷하게 높은 유채색(크레파스/색연필) -> 보호!
      if (sat - bgSat > 20) {
        return false;
      }

      // 3. 도화지 평균 색상과의 거리
      const dR = r - bgR;
      const dG = g - bgG;
      const dB = b - bgB;
      const dist = Math.sqrt(dR * dR + dG * dG + dB * dB);

      return dist < colorDistLimit;
    };

    // 2단계: 외곽 테두리로부터 Flood-Fill (BFS) 시작
    // 외곽에 연결된 도화지만 지우므로, 캐릭터 내부는 보존됨!
    const visited = new Uint8Array(totalPixels);
    const queue = new Int32Array(totalPixels);
    let head = 0;
    let tail = 0;

    const trySeed = (x, y) => {
      const idx = y * targetW + x;
      if (visited[idx]) return;
      const p = idx * 4;
      if (isPaperPixel(data[p], data[p + 1], data[p + 2])) {
        visited[idx] = 1;
        queue[tail++] = idx;
      }
    };

    for (let x = 0; x < targetW; x++) {
      trySeed(x, 0);
      trySeed(x, targetH - 1);
    }
    for (let y = 0; y < targetH; y++) {
      trySeed(0, y);
      trySeed(targetW - 1, y);
    }

    while (head < tail) {
      const curr = queue[head++];
      const cx = curr % targetW;
      const cy = Math.floor(curr / targetW);
      const curP = curr * 4;
      const curR = data[curP];
      const curG = data[curP + 1];
      const curB = data[curP + 2];

      data[curP + 3] = 0; // 외곽 도화지 투명화!

      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < targetW - 1 ? curr + 1 : -1,
        cy > 0 ? curr - targetW : -1,
        cy < targetH - 1 ? curr + targetW : -1
      ];

      for (const n of neighbors) {
        if (n !== -1 && !visited[n]) {
          const np = n * 4;
          const nr = data[np];
          const ng = data[np + 1];
          const nb = data[np + 2];

          // 이웃 픽셀이 선/채색이 아니고 도화지 범위이며, 인접 픽셀과 색상 차이가 부드러운 경우 계속 전파
          if (isPaperPixel(nr, ng, nb)) {
            const stepDiff = Math.hypot(nr - curR, ng - curG, nb - curB);
            if (stepDiff < stepDiffLimit) {
              visited[n] = 1;
              queue[tail++] = n;
            }
          }
        }
      }
    }

    // 3단계: 캐릭터 내부 처리 (스티커 모드: 내부 도화지를 깨끗한 흰색으로 정돈)
    for (let i = 0; i < totalPixels; i++) {
      if (!visited[i]) {
        // 방문되지 않은 픽셀은 캐릭터 영역 (선 또는 캐릭터 몸통 내부)
        const p = i * 4;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        const lumDiff = bgLum - lum;
        const sat = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));

        const isStroke = (lumDiff > strokeContrast) || (sat - bgSat > 20);

        if (!isStroke) {
          // 캐릭터 내부의 도화지 영역
          if (fillBodyWhite) {
            // 스티커 모드: 캐릭터 내부를 뽀송뽀송하고 깨끗한 화이트로 채움
            data[p] = 255;
            data[p + 1] = 255;
            data[p + 2] = 255;
            data[p + 3] = 255;
          } else {
            // 투명 선화 모드: 내부도 투명하게 비우고 선만 남김
            data[p + 3] = 0;
          }
        } else if (smartEnhance && lumDiff > strokeContrast && sat < 30) {
          // 어두운 펜 선은 더 또렷하고 깊이감 있게 보정 (연필/볼펜/싸인펜 선명화)
          data[p] = Math.max(0, Math.floor(r * 0.5));
          data[p + 1] = Math.max(0, Math.floor(g * 0.5));
          data[p + 2] = Math.max(0, Math.floor(b * 0.5));
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // 4단계: 캐릭터 영역으로 자동 크롭
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
