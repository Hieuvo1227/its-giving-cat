/**
 * CAT MEME CAM - INJECTED SCRIPT (Runs in Google Meet main world)
 * Intercepts getUserMedia to feed interactive Cat Meme Canvas into Google Meet
 *
 * Chế độ hiển thị:
 * - Ảnh mèo xuất hiện ở GÓC BÊN TRÁI PHÍA DƯỚI thay vì đè lên mặt người dùng!
 * - Nhìn thẳng tự nhiên (trạng thái nghỉ): KHÔNG hiện ảnh, webcam thật 100%.
 * - Khi có cử chỉ hoặc bấm nút: Ảnh mèo hiển thị gọn gàng, đẹp mắt ở góc dưới bên trái.
 */

(function() {
  'use strict';

  if (window.__CAT_MEME_CAM_INJECTED__) return;
  window.__CAT_MEME_CAM_INJECTED__ = true;

  console.log('[Cat Meme Cam] Engine injected into Google Meet');

  // ============================================================================
  // 1. STATE & CONFIGURATION
  // ============================================================================
  const config = {
    enabled: true,
    autoGesture: true, // Tự động nhận diện cử chỉ từ Webcam
    mode: 'corner', // 'corner' (Góc bên trái phía dưới - MẶC ĐỊNH), 'mask' (Đè mặt), 'avatar' (Toàn màn hình)
    activeMeme: 'neutral', // 'neutral' = Nhìn thẳng tự nhiên -> KHÔNG hiện ảnh
    cornerScale: 1.0, // Tỷ lệ kích thước ảnh mèo ở góc
    showBorder: true,
    extensionId: (document.currentScript && document.currentScript.dataset.extensionId) || ''
  };

  if (document.currentScript && document.currentScript.dataset.assetBase) {
    window.__CAT_MEME_ASSET_BASE__ = document.currentScript.dataset.assetBase;
  }

  const MEME_URLS = {
    neutral: 'assets/cat_goblin.png',
    huh: 'assets/cat_loading.png',
    thumbs_up: 'assets/cat_thumbsup.png',
    heart: 'assets/cat_heart.png',
    shh: 'assets/cat_shh.png',
    thinking: 'assets/cat_thinking_chin.png',
    fist: 'assets/cat_smug_fist.png',
    pointing: 'assets/cat_pointing.png',
    head_pat: 'assets/cat_shocked.png',
    close_up: 'assets/cat_cursed_stare.png',
    side_look: 'assets/cat_eyebrow.png'
  };

  const MEME_TITLES = {
    neutral: 'Nhìn thẳng tự nhiên (Webcam thật - Không hiện ảnh)',
    huh: 'Mèo HUH?! há miệng ngơ ngác',
    thumbs_up: 'Mèo khóc giơ LIKE kiên cường 👍',
    heart: 'Mèo má hồng yêu thương (Tay hình trái tim 🫶)',
    shh: 'Mèo suỵt im lặng 🤫',
    thinking: 'Mèo chống cằm suy ngẫm triết lý 🤔',
    fist: 'Mèo giơ nắm đấm uy lực 😼',
    pointing: 'Mèo chỉ ngón tay ngại ngùng 👉👈',
    head_pat: 'Mèo hoảng hốt cắn tay khi xoa đầu 😨',
    close_up: 'Mèo dí sát mặt trừng trừng 👁️',
    side_look: 'Mèo nhướn mày The Rock dò xét 🤨'
  };

  const loadedImages = {};

  function getMemeDataUrl(key) {
    if (window.__CAT_MEME_BASE64__ && window.__CAT_MEME_BASE64__[key]) {
      return window.__CAT_MEME_BASE64__[key];
    }
    const rel = MEME_URLS[key] || MEME_URLS['neutral'];
    return window.__CAT_MEME_ASSET_BASE__ ? window.__CAT_MEME_ASSET_BASE__ + rel : rel;
  }

  function getLoadedImage(key) {
    if (loadedImages[key] && loadedImages[key].complete && loadedImages[key].naturalWidth > 0) {
      return loadedImages[key];
    }
    const src = getMemeDataUrl(key);
    if (src) {
      const img = new Image();
      img.src = src;
      loadedImages[key] = img;
      return img;
    }
    return null;
  }

  function preloadImages() {
    Object.keys(MEME_URLS).forEach(key => {
      const src = getMemeDataUrl(key);
      if (src) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedImages[key] = img;
          console.log('[Cat Meme Cam] Sẵn sàng ảnh meme:', key);
        };
        loadedImages[key] = img;
      }
    });
  }
  preloadImages();
  setTimeout(preloadImages, 400);
  setTimeout(preloadImages, 1500);

  // ============================================================================
  // 2. CANVAS & VIDEO PIPELINE
  // ============================================================================
  let canvas = null;
  let ctx = null;
  let hiddenVideo = null;
  let virtualStream = null;
  let isLoopRunning = false;

  let trackCanvas = null;
  let trackCtx = null;
  function initTracker() {
    trackCanvas = document.createElement('canvas');
    trackCanvas.width = 120;
    trackCanvas.height = 90;
    trackCtx = trackCanvas.getContext('2d', { willReadFrequently: true });
  }

  // ============================================================================
  // 3. ROBUST COMPUTER VISION GESTURE DETECTOR
  // ============================================================================
  let gestureStreak = 0;
  let candidateGesture = 'neutral';
  let lastFaceBox = null;
  const GESTURE_LOCK_FRAMES = 3; // 3 frames (~225ms) phản hồi nhanh chóng, nhạy bén cho biểu cảm khuôn mặt
  const NEUTRAL_UNLOCK_FRAMES = 2; // 2 frames (~150ms) trở về camera thật mượt mà
  let lastGestureCheck = 0;

  function analyzeWebcamGestures() {
    const now = performance.now();
    if (now - lastGestureCheck < 75) return;
    lastGestureCheck = now;

    if (!hiddenVideo || hiddenVideo.readyState < 2) return;
    if (!trackCanvas) initTracker();
    if (!trackCtx) return;

    const W = trackCanvas.width;  // 120
    const H = trackCanvas.height; // 90
    trackCtx.drawImage(hiddenVideo, 0, 0, W, H);
    const imgData = trackCtx.getImageData(0, 0, W, H);
    const data = imgData.data;

    // 1. Phân đoạn pixel màu da chính xác theo chuẩn RGB & YCbCr
    const isSkin = new Uint8Array(W * H);
    let totalSkin = 0;
    const skinCols = new Int32Array(W);
    const skinRows = new Int32Array(H);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const isSkinPixel = (
          r > 70 && g > 40 && b > 20 &&
          r > g && r > b &&
          (r - g) >= 10 &&
          (Math.max(r, g, b) - Math.min(r, g, b) >= 14)
        );

        if (isSkinPixel) {
          isSkin[y * W + x] = 1;
          totalSkin++;
          skinCols[x]++;
          skinRows[y]++;
        }
      }
    }

    if (totalSkin < 80) {
      updateDetectedGesture('neutral');
      return;
    }

    // 2. Tìm phạm vi khuôn mặt chính (tìm theo đỉnh mật độ da trung tâm và thung lũng phân tách bàn tay)
    let faceMinY = H, faceMaxY = 0;
    for (let y = 4; y < Math.floor(H * 0.85); y++) {
      if (skinRows[y] >= 8) {
        if (y < faceMinY) faceMinY = y;
        if (y > faceMaxY) faceMaxY = y;
      }
    }

    // Tìm cột có mật độ da lớn nhất ở khu vực trung tâm (đỉnh khuôn mặt, tránh bàn tay giơ bên sườn)
    let peakX = Math.floor(W * 0.50);
    let maxColSkin = 0;
    for (let x = Math.floor(W * 0.25); x <= Math.floor(W * 0.75); x++) {
      if (skinCols[x] > maxColSkin) {
        maxColSkin = skinCols[x];
        peakX = x;
      }
    }

    // Mở rộng sang trái từ đỉnh khuôn mặt đến khi gặp khoảng trống hoặc thung lũng (phân tách với bàn tay giơ bên sườn)
    let faceMinX = peakX;
    while (faceMinX > Math.floor(W * 0.10)) {
      const nextVal = skinCols[faceMinX - 1];
      if (nextVal <= 4) break;
      if (faceMinX < peakX - 8 && nextVal > skinCols[faceMinX] + 3 && skinCols[faceMinX] < 14) break;
      faceMinX--;
    }

    // Mở rộng sang phải từ đỉnh khuôn mặt
    let faceMaxX = peakX;
    while (faceMaxX < Math.floor(W * 0.90)) {
      const nextVal = skinCols[faceMaxX + 1];
      if (nextVal <= 4) break;
      if (faceMaxX > peakX + 8 && nextVal > skinCols[faceMaxX] + 3 && skinCols[faceMaxX] < 14) break;
      faceMaxX++;
    }

    if (faceMaxY <= faceMinY || faceMaxX <= faceMinX) {
      updateDetectedGesture('neutral');
      return;
    }

    const faceW = faceMaxX - faceMinX;
    const faceH = faceMaxY - faceMinY;
    const faceCenterX = (faceMinX + faceMaxX) / 2;
    const faceCenterY = (faceMinY + faceMaxY) / 2;
    lastFaceBox = { centerX: faceCenterX, centerY: faceCenterY, w: faceW, h: faceH };

    // ------------------------------------------------------------------------
    // BƯỚC 1: TÍNH TOÁN CÁC ĐẶC TRƯNG TOÀN CỤC (GLOBAL METRICS)
    // ------------------------------------------------------------------------
    // Đếm số pixel da ở 2 bên sườn đầu (ngoài vùng khuôn mặt)
    let leftSideSkin = 0;
    let rightSideSkin = 0;
    let leftSideMinY = H;
    let rightSideMinY = H;

    for (let y = 0; y < Math.min(H, faceMaxY + 15); y++) {
      for (let x = 0; x < Math.max(0, faceMinX - 5); x++) {
        if (isSkin[y * W + x]) {
          leftSideSkin++;
          if (y < leftSideMinY) leftSideMinY = y;
        }
      }
      for (let x = Math.min(W - 1, faceMaxX + 5); x < W; x++) {
        if (isSkin[y * W + x]) {
          rightSideSkin++;
          if (y < rightSideMinY) rightSideMinY = y;
        }
      }
    }

    const hasHandRaised = (leftSideSkin >= 45 || rightSideSkin >= 45);

    // Tính toán vùng bàn tay nếu có tay giơ
    let handMinX = W, handMaxX = 0, handMinY = H, handMaxY = 0;
    let handCount = 0;
    const activeSide = leftSideSkin >= rightSideSkin ? 'left' : 'right';
    const xStart = activeSide === 'left' ? 0 : Math.min(W - 1, faceMaxX + 3);
    const xEnd = activeSide === 'left' ? Math.max(0, faceMinX - 3) : W - 1;

    for (let y = 3; y < H; y++) {
      for (let x = xStart; x <= xEnd; x++) {
        if (isSkin[y * W + x]) {
          handCount++;
          if (x < handMinX) handMinX = x;
          if (x > handMaxX) handMaxX = x;
          if (y < handMinY) handMinY = y;
          if (y > handMaxY) handMaxY = y;
        }
      }
    }
    const handH = handMaxY - handMinY;
    const handW = handMaxX - handMinX;

    // Tính toán độ sáng khuôn mặt thích ứng (Adaptive Face Luminance)
    let faceLumSum = 0;
    let faceLumCount = 0;
    for (let y = Math.floor(faceMinY + faceH * 0.20); y <= Math.floor(faceMinY + faceH * 0.70); y += 2) {
      for (let x = Math.floor(faceMinX + faceW * 0.20); x <= Math.floor(faceMaxX - faceW * 0.20); x += 2) {
        if (isSkin[y * W + x]) {
          const idx = (y * W + x) * 4;
          faceLumSum += (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
          faceLumCount++;
        }
      }
    }
    const avgFaceLum = faceLumCount > 0 ? (faceLumSum / faceLumCount) : 90;

    // Tính toán đối xứng khuôn mặt & 2 bên má (lấy mẫu 3x3 chống nhiễu hạt ánh sáng)
    const leftCol = Math.max(0, Math.floor(faceCenterX - faceW * 0.28));
    const rightCol = Math.min(W - 1, Math.floor(faceCenterX + faceW * 0.28));
    const midRow = Math.floor(faceCenterY);

    let leftCheekSkin = 0;
    let rightCheekSkin = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const py = Math.max(0, Math.min(H - 1, midRow + dy));
        const pxL = Math.max(0, Math.min(W - 1, leftCol + dx));
        const pxR = Math.max(0, Math.min(W - 1, rightCol + dx));
        if (isSkin[py * W + pxL]) leftCheekSkin++;
        if (isSkin[py * W + pxR]) rightCheekSkin++;
      }
    }
    const leftCheek = leftCheekSkin >= 4 ? 1 : 0;
    const rightCheek = rightCheekSkin >= 4 ? 1 : 0;
    const isFacingFront = (leftCheek === 1 && rightCheek === 1);
    const leftSkinProfile = skinCols[leftCol] || 0;
    const rightSkinProfile = skinCols[rightCol] || 0;
    const asymmetry = Math.abs(leftSkinProfile - rightSkinProfile);

    // Tính toán góc nghiêng đầu (Head Tilt: độ lệch giữa đỉnh trán và cằm)
    let topSkinX = 0, topSkinN = 0;
    let btmSkinX = 0, btmSkinN = 0;
    const yTopEnd = Math.floor(faceMinY + faceH * 0.30);
    const yBtmStart = Math.floor(faceMinY + faceH * 0.70);

    for (let y = faceMinY; y <= yTopEnd; y++) {
      for (let x = faceMinX; x <= faceMaxX; x++) {
        if (isSkin[y * W + x]) {
          topSkinX += x;
          topSkinN++;
        }
      }
    }
    for (let y = yBtmStart; y <= faceMaxY; y++) {
      for (let x = faceMinX; x <= faceMaxX; x++) {
        if (isSkin[y * W + x]) {
          btmSkinX += x;
          btmSkinN++;
        }
      }
    }
    const topCenter = topSkinN > 0 ? (topSkinX / topSkinN) : faceCenterX;
    const btmCenter = btmSkinN > 0 ? (btmSkinX / btmSkinN) : faceCenterX;
    const headTilt = Math.abs(topCenter - btmCenter);

    // Context truyền vào từng module detector độc lập
    const ctx = {
      W, H, data, isSkin, skinCols, skinRows, totalSkin,
      faceMinX, faceMaxX, faceMinY, faceMaxY, faceW, faceH,
      faceCenterX, faceCenterY, avgFaceLum, headTilt,
      leftSideSkin, rightSideSkin, leftSideMinY, rightSideMinY,
      hasHandRaised, activeSide,
      handMinX, handMaxX, handMinY, handMaxY, handCount, handW, handH,
      leftCol, rightCol, leftCheek, rightCheek, isFacingFront, asymmetry
    };

    // Helper an toàn gọi detector từ file riêng biệt
    function runDetector(name, fallbackFn) {
      if (window.__CAT_DETECTORS__ && typeof window.__CAT_DETECTORS__[name] === 'function') {
        try {
          return !!window.__CAT_DETECTORS__[name](ctx);
        } catch (err) {
          console.warn('[Cat Meme Cam] Lỗi trong detector ' + name + ':', err);
        }
      }
      return fallbackFn ? !!fallbackFn(ctx) : false;
    }

    // ------------------------------------------------------------------------
    // BƯỚC 2: CHẠY CÁC DETECTOR THEO THỨ TỰ ƯU TIÊN CHỐNG NHẬN NHẦM
    // ------------------------------------------------------------------------
    let detected = 'neutral';

    // 0. Dí sát mặt vào camera (Close Up 👁️)
    if (runDetector('close_up')) {
      detected = 'close_up';
    }
    // 1. Chụm 2 tay hình trái tim 🫶 (Heart 💖)
    else if (runDetector('heart')) {
      detected = 'heart';
    }
    // 2. Chạm 2 ngón tay ngại ngùng 👉👈 (Pointing)
    else if (runDetector('pointing')) {
      detected = 'pointing';
    }
    // 3. Ngón tay suỵt im lặng trước môi 🤫 (Shh)
    else if (runDetector('shh')) {
      detected = 'shh';
    }
    // 4. Bàn tay giơ bên sườn (Ưu tiên Thumbs Up 👍 / Fist 😼 trước xoa đầu)
    else if (hasHandRaised) {
      if (runDetector('thumbs_up')) {
        detected = 'thumbs_up';
      } else if (runDetector('fist')) {
        detected = 'fist';
      } else if (runDetector('head_pat')) {
        detected = 'head_pat';
      }
    }
    // 5. Bàn tay xoa đầu / vò đầu 😨 (Head Pat khi không có giơ like bên sườn)
    else if (runDetector('head_pat')) {
      detected = 'head_pat';
    }
    // 6. Biểu cảm khuôn mặt: Há to miệng HUH 🌀 / Nghiêng đầu The Rock 🤨
    else if (runDetector('huh')) {
      detected = 'huh';
    } else if (runDetector('side_look')) {
      detected = 'side_look';
    }
    // 7. Chống cằm suy nghĩ 🤔 (Thinking)
    else if (runDetector('thinking')) {
      detected = 'thinking';
    }

    if (config.autoGesture) {
      updateDetectedGesture(detected);
    }
  }

  let memeHoldFrames = 0;
  const MEME_HOLD_DURATION = 6; // Giữ meme thêm ~450ms trước khi tắt về camera thật

  function updateDetectedGesture(rawGesture) {
    if (rawGesture === candidateGesture) {
      gestureStreak++;
    } else {
      candidateGesture = rawGesture;
      gestureStreak = 1;
    }

    const requiredFrames = (candidateGesture === 'neutral') ? NEUTRAL_UNLOCK_FRAMES : GESTURE_LOCK_FRAMES;

    if (gestureStreak >= requiredFrames) {
      if (candidateGesture !== 'neutral') {
        memeHoldFrames = MEME_HOLD_DURATION;
        if (config.activeMeme !== candidateGesture) {
          setMemeState(candidateGesture);
        }
      } else {
        if (memeHoldFrames > 0) {
          memeHoldFrames--;
        } else {
          if (config.activeMeme !== 'neutral') {
            setMemeState('neutral');
          }
        }
      }
    } else {
      if (config.activeMeme !== 'neutral' && rawGesture === 'neutral' && memeHoldFrames > 0) {
        memeHoldFrames--;
      }
    }
  }

  function initVirtualPipeline() {
    if (canvas) return;

    canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    ctx = canvas.getContext('2d');

    hiddenVideo = document.createElement('video');
    hiddenVideo.playsInline = true;
    hiddenVideo.autoplay = true;
    hiddenVideo.muted = true;
    hiddenVideo.style.display = 'none';
    (document.body || document.documentElement).appendChild(hiddenVideo);
  }

  function renderFrame() {
    if (!ctx) return;

    analyzeWebcamGestures();

    const memeImg = getLoadedImage(config.activeMeme) || getLoadedImage('neutral');

    // 1. EXTENSION TẮT -> Webcam gốc
    if (!config.enabled) {
      if (hiddenVideo && hiddenVideo.readyState >= 2) {
        ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#0f1115';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(renderFrame);
      return;
    }

    // 2. CHẾ ĐỘ GÓC BÊN TRÁI PHÍA DƯỚI (MẶC ĐỊNH THEO YÊU CẦU CỦA USER)
    if (config.mode === 'corner') {
      // Vẽ camera thật của người dùng (Google Meet sẽ tự động scaleX(-1) khi hiển thị)
      if (hiddenVideo && hiddenVideo.readyState >= 2) {
        ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#0f1115';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Nhìn thẳng tự nhiên: KHÔNG HIỆN ẢNH, giữ camera thật 100%
      if (config.activeMeme === 'neutral') {
        requestAnimationFrame(renderFrame);
        return;
      }

      // Khi có cử chỉ hoặc kích hoạt meme: Hiện ảnh mèo ở GÓC BÊN TRÁI PHÍA DƯỚI trên màn hình Meet!
      // Do Google Meet lật gương video (scaleX(-1)), trên canvas ta vẽ ở canvasX = canvas.width - boxW - 35
      // Khi Meet lật gương lại, ảnh mèo sẽ xuất hiện chính xác ở GÓC TRÁI DƯỚI của người dùng!
      if (memeImg && memeImg.complete && memeImg.naturalWidth > 0) {
        const imgRatio = memeImg.naturalWidth / memeImg.naturalHeight;
        const boxH = Math.round(270 * config.cornerScale);
        const boxW = Math.round(boxH * imgRatio);

        // Tọa độ trên canvas để sau khi Meet scaleX(-1) sẽ hiện ở GÓC TRÁI DƯỚI (35px từ lề trái)
        const canvasX = canvas.width - boxW - 35;
        const canvasY = canvas.height - boxH - 45;

        ctx.save();
        // Đổ bóng nổi bật
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 8;

        // Lật ngang ảnh mèo để khi Meet lật gương, ảnh mèo hiển thị đúng chiều chuẩn (không bị ngược)
        ctx.translate(canvasX + boxW, canvasY);
        ctx.scale(-1, 1);

        // Bo góc mềm mại cho khung ảnh mèo
        ctx.beginPath();
        ctx.roundRect(0, 0, boxW, boxH, 18);
        ctx.closePath();
        ctx.clip();

        // Tắt shadow trước khi vẽ ảnh
        ctx.shadowColor = 'transparent';
        ctx.drawImage(memeImg, 0, 0, boxW, boxH);
        ctx.restore();

        // Viền neon cyberpunk tinh tế
        if (config.showBorder) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(canvasX, canvasY, boxW, boxH, 18);
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = 'rgba(0, 242, 254, 0.9)';
          ctx.shadowColor = 'rgba(0, 242, 254, 0.8)';
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 3. CHẾ ĐỘ ĐÈ MẶT (MASK - ĐÈ HÌNH LÊN KHUÔN MẶT)
    else if (config.mode === 'mask') {
      if (hiddenVideo && hiddenVideo.readyState >= 2) {
        ctx.drawImage(hiddenVideo, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#0f1115';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Nhìn thẳng tự nhiên: KHÔNG HIỆN ẢNH, giữ camera thật 100%
      if (config.activeMeme === 'neutral') {
        requestAnimationFrame(renderFrame);
        return;
      }

      // Khi có cử chỉ hoặc kích hoạt meme: Đè ảnh mèo trực tiếp lên khuôn mặt người dùng
      if (memeImg && memeImg.complete && memeImg.naturalWidth > 0) {
        const scaleX = canvas.width / 120;
        const scaleY = canvas.height / 90;
        const fx = lastFaceBox ? (lastFaceBox.centerX * scaleX) : (canvas.width / 2);
        const fy = lastFaceBox ? (lastFaceBox.centerY * scaleY) : (canvas.height / 2);
        const baseW = lastFaceBox ? (lastFaceBox.w * scaleX) : 340;
        const fw = Math.round(baseW * 1.35 * config.cornerScale);
        const fh = Math.round(fw * (memeImg.naturalHeight / memeImg.naturalWidth));

        ctx.save();
        // Căn đúng tâm mặt trên canvas
        ctx.translate(fx, fy - fh * 0.06);
        // Lật gương ngang để tương thích với hiệu ứng scaleX(-1) trong Google Meet
        ctx.scale(-1, 1);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 6;
        ctx.drawImage(memeImg, -fw / 2, -fh / 2, fw, fh);
        ctx.restore();
      }
    }

    // 4. CHẾ ĐỘ AVATAR TOÀN MÀN HÌNH
    else if (config.mode === 'avatar') {
      ctx.fillStyle = '#0f1115';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (memeImg && memeImg.complete && memeImg.naturalWidth > 0) {
        ctx.save();
        ctx.filter = 'blur(30px) brightness(0.4)';
        ctx.drawImage(memeImg, -50, -50, canvas.width + 100, canvas.height + 100);
        ctx.restore();

        const imgRatio = memeImg.naturalWidth / memeImg.naturalHeight;
        const maxH = canvas.height * 0.94;
        const maxW = canvas.width * 0.94;
        let w = maxH * imgRatio;
        let h = maxH;
        if (w > maxW) {
          w = maxW;
          h = w / imgRatio;
        }

        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 24;
        ctx.drawImage(memeImg, x, y, w, h);
        ctx.shadowBlur = 0;
      }
      drawWatermarkBadge('🐱 AVATAR: ' + config.activeMeme.toUpperCase());
    }

    requestAnimationFrame(renderFrame);
  }

  function drawWatermarkBadge(text) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
    ctx.beginPath();
    ctx.roundRect(canvas.width - 340, canvas.height - 48, 320, 32, 6);
    ctx.fill();
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#00f2fe';
    ctx.fillText(text, canvas.width - 325, canvas.height - 27);
    ctx.restore();
  }

  // ============================================================================
  // 4. OVERRIDE GETUSERMEDIA
  // ============================================================================
  const originalGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

  navigator.mediaDevices.getUserMedia = async function(constraints) {
    if (constraints && constraints.video) {
      console.log('[Cat Meme Cam] Intercepted getUserMedia constraints:', constraints);
      initVirtualPipeline();

      try {
        const realStream = await originalGUM(constraints);

        if (hiddenVideo) {
          hiddenVideo.srcObject = realStream;
          await hiddenVideo.play().catch(() => {});
        }

        if (!isLoopRunning) {
          isLoopRunning = true;
          renderFrame();
        }

        virtualStream = canvas.captureStream(30);
        const virtualVideoTrack = virtualStream.getVideoTracks()[0];

        const combinedTracks = [virtualVideoTrack, ...realStream.getAudioTracks()];
        const outputStream = new MediaStream(combinedTracks);

        console.log('[Cat Meme Cam] Virtual stream active with Corner Meme Mode!');
        return outputStream;
      } catch (err) {
        console.error('[Cat Meme Cam] Error capturing real camera:', err);
        return originalGUM(constraints);
      }
    }

    return originalGUM(constraints);
  };

  // ============================================================================
  // 5. FLOATING CONTROL BAR ON GOOGLE MEET
  // ============================================================================
  function injectFloatingWidget() {
    if (document.getElementById('catMemeWidget')) return;
    const parent = document.body || document.documentElement;
    if (!parent) return;

    // Inject CSS via style element with textContent (Trusted Types safe)
    if (!document.getElementById('catMemeStyles')) {
      const style = document.createElement('style');
      style.id = 'catMemeStyles';
      style.textContent = `
        #catMemeWidget {
          position: fixed !important;
          top: 75px !important;
          right: 20px !important;
          z-index: 2147483647 !important;
          background: rgba(14, 18, 28, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border: 1.5px solid rgba(0, 242, 254, 0.7) !important;
          border-radius: 14px !important;
          padding: 12px 14px !important;
          color: #fff !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          box-shadow: 0 14px 40px rgba(0,0,0,0.75), 0 0 16px rgba(0, 242, 254, 0.4) !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 9px !important;
          width: 325px !important;
          user-select: none !important;
          cursor: default !important;
        }
        .cmw-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          border-bottom: 1px solid rgba(255,255,255,0.12) !important;
          padding-bottom: 7px !important;
          cursor: move !important;
        }
        .cmw-title {
          font-size: 13px !important;
          font-weight: 800 !important;
          color: #00f2fe !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .cmw-header-actions {
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .cmw-btn-toggle {
          background: #00e676 !important;
          color: #0b1320 !important;
          border: none !important;
          padding: 4px 10px !important;
          border-radius: 6px !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        .cmw-btn-toggle.off {
          background: #ff3366 !important;
          color: #fff !important;
        }
        .cmw-mode-bar {
          display: flex !important;
          background: rgba(255, 255, 255, 0.08) !important;
          border-radius: 7px !important;
          padding: 2px !important;
          gap: 3px !important;
        }
        .cmw-mode-tab {
          flex: 1 !important;
          background: none !important;
          border: none !important;
          color: #8b95a5 !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 5px 2px !important;
          border-radius: 5px !important;
          cursor: pointer !important;
          transition: all 0.15s !important;
        }
        .cmw-mode-tab.active {
          background: #00f2fe !important;
          color: #0b1320 !important;
          font-weight: 800 !important;
        }
        .cmw-size-bar {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          font-size: 11px !important;
          color: #a0aec0 !important;
          padding: 0 4px !important;
        }
        .cmw-size-btn {
          background: rgba(255, 255, 255, 0.12) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          color: #fff !important;
          border-radius: 4px !important;
          width: 26px !important;
          height: 24px !important;
          cursor: pointer !important;
          font-weight: 700 !important;
        }
        .cmw-emotes {
          display: grid !important;
          grid-template-columns: repeat(6, 1fr) !important;
          gap: 5px !important;
        }
        .cmw-emote-btn {
          background: rgba(255,255,255,0.08) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 7px !important;
          padding: 6px 3px !important;
          font-size: 16px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.15s !important;
        }
        .cmw-emote-btn:hover {
          background: rgba(0,242,254,0.3) !important;
          border-color: #00f2fe !important;
          transform: translateY(-1px) !important;
        }
        .cmw-emote-btn.active {
          background: rgba(0,242,254,0.4) !important;
          border-color: #00f2fe !important;
          box-shadow: 0 0 12px rgba(0,242,254,0.7) !important;
        }
        .cmw-footer {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          font-size: 11px !important;
          color: #a0aec0 !important;
          border-top: 1px solid rgba(255,255,255,0.1) !important;
          padding-top: 6px !important;
        }
        #cmwStatus {
          color: #00f2fe !important;
          font-weight: 600 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 220px !important;
        }
        .cmw-auto-pill {
          background: rgba(0, 242, 254, 0.2);
          border: 1px solid #00f2fe;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 10px;
          color: #00f2fe;
          font-weight: 700;
          cursor: pointer;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    const widget = document.createElement('div');
    widget.id = 'catMemeWidget';

    // 1. Header
    const header = document.createElement('div');
    header.className = 'cmw-header';
    header.id = 'cmwDragHandle';

    const title = document.createElement('div');
    title.className = 'cmw-title';
    title.textContent = '🐱 Cat Meme Cam';

    const headerActions = document.createElement('div');
    headerActions.className = 'cmw-header-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'cmwToggle';
    toggleBtn.className = 'cmw-btn-toggle';
    toggleBtn.textContent = 'BẬT';
    toggleBtn.title = 'Bật/Tắt hiệu ứng';
    headerActions.appendChild(toggleBtn);

    header.appendChild(title);
    header.appendChild(headerActions);
    widget.appendChild(header);

    // 2. Mode bar
    const modeBar = document.createElement('div');
    modeBar.className = 'cmw-mode-bar';

    const tabCorner = document.createElement('button');
    tabCorner.className = 'cmw-mode-tab active';
    tabCorner.dataset.mode = 'corner';
    tabCorner.textContent = '📺 Góc Dưới';
    tabCorner.title = 'Hiện ảnh mèo ở góc bên trái phía dưới';

    const tabMask = document.createElement('button');
    tabMask.className = 'cmw-mode-tab';
    tabMask.dataset.mode = 'mask';
    tabMask.textContent = '🎭 Đè Mặt';
    tabMask.title = 'Đè ảnh mèo khớp trực tiếp lên khuôn mặt bạn';

    const tabAvatar = document.createElement('button');
    tabAvatar.className = 'cmw-mode-tab';
    tabAvatar.dataset.mode = 'avatar';
    tabAvatar.textContent = '🐱 Avatar';
    tabAvatar.title = 'Toàn màn hình ảnh mèo';

    modeBar.appendChild(tabCorner);
    modeBar.appendChild(tabMask);
    modeBar.appendChild(tabAvatar);
    widget.appendChild(modeBar);

    // 3. Size bar
    const sizeBar = document.createElement('div');
    sizeBar.className = 'cmw-size-bar';

    const sizeLabel = document.createElement('span');
    sizeLabel.textContent = 'Cỡ ảnh góc: ';
    const sizeVal = document.createElement('strong');
    sizeVal.id = 'cmwSizeVal';
    sizeVal.textContent = '100%';
    sizeLabel.appendChild(sizeVal);

    const sizeBtns = document.createElement('div');
    const btnMinus = document.createElement('button');
    btnMinus.id = 'cmwSizeMinus';
    btnMinus.className = 'cmw-size-btn';
    btnMinus.textContent = '-';
    btnMinus.title = 'Thu nhỏ cỡ ảnh';

    const btnPlus = document.createElement('button');
    btnPlus.id = 'cmwSizePlus';
    btnPlus.className = 'cmw-size-btn';
    btnPlus.textContent = '+';
    btnPlus.title = 'Phóng to cỡ ảnh';

    sizeBtns.appendChild(btnMinus);
    sizeBtns.appendChild(btnPlus);
    sizeBar.appendChild(sizeLabel);
    sizeBar.appendChild(sizeBtns);
    widget.appendChild(sizeBar);

    // 4. Emotes grid
    const emotesGrid = document.createElement('div');
    emotesGrid.className = 'cmw-emotes';

    const EMOTE_DEFS = [
      { key: 'neutral', icon: '🌿', title: 'Nhìn thẳng tự nhiên (Webcam thật - Không hiện ảnh)' },
      { key: 'huh', icon: '🌀', title: 'Mèo HUH?! há to miệng ngơ ngác' },
      { key: 'thumbs_up', icon: '👍', title: 'Mèo khóc giơ tay LIKE kiên cường 👍' },
      { key: 'heart', icon: '💖', title: 'Mèo má hồng yêu thương (Tay làm hình trái tim 🫶)' },
      { key: 'shh', icon: '🤫', title: 'Mèo suỵt im lặng 🤫' },
      { key: 'thinking', icon: '🤔', title: 'Mèo chống cằm suy ngẫm triết lý 🤔' },
      { key: 'fist', icon: '😼', title: 'Mèo giơ nắm đấm uy lực 😼' },
      { key: 'pointing', icon: '👉', title: 'Mèo chỉ ngón tay ngại ngùng 👉👈' },
      { key: 'head_pat', icon: '😨', title: 'Mèo hoảng hốt cắn tay khi xoa đầu 😨' },
      { key: 'close_up', icon: '👁️', title: 'Mèo dí sát mặt trừng trừng 👁️' },
      { key: 'side_look', icon: '🤨', title: 'Mèo nhướn mày The Rock 🤨' }
    ];

    EMOTE_DEFS.forEach(def => {
      const btn = document.createElement('button');
      btn.className = `cmw-emote-btn ${def.key === config.activeMeme ? 'active' : ''}`;
      btn.dataset.meme = def.key;
      btn.textContent = def.icon;
      btn.title = def.title;
      btn.addEventListener('click', () => {
        setMemeState(def.key);
      });
      emotesGrid.appendChild(btn);
    });
    widget.appendChild(emotesGrid);

    // 5. Footer
    const footer = document.createElement('div');
    footer.className = 'cmw-footer';

    const statusSpan = document.createElement('span');
    statusSpan.id = 'cmwStatus';
    statusSpan.textContent = '🌿 Webcam thật tự nhiên';

    const autoBtn = document.createElement('button');
    autoBtn.id = 'cmwAutoToggle';
    autoBtn.className = 'cmw-auto-pill';
    autoBtn.textContent = 'AI: BẬT';
    autoBtn.title = 'Bật/Tắt tự động nhận diện từ webcam';

    footer.appendChild(statusSpan);
    footer.appendChild(autoBtn);
    widget.appendChild(footer);

    parent.appendChild(widget);

    // Listeners
    toggleBtn.addEventListener('click', () => {
      config.enabled = !config.enabled;
      toggleBtn.textContent = config.enabled ? 'BẬT' : 'TẮT';
      toggleBtn.classList.toggle('off', !config.enabled);
    });

    autoBtn.addEventListener('click', () => {
      config.autoGesture = !config.autoGesture;
      autoBtn.textContent = config.autoGesture ? 'AI: BẬT' : 'AI: TẮT';
      autoBtn.style.color = config.autoGesture ? '#00f2fe' : '#ff3366';
      autoBtn.style.borderColor = config.autoGesture ? '#00f2fe' : '#ff3366';
      if (!config.autoGesture) {
        setMemeState('neutral');
      }
    });

    const modeTabs = [tabCorner, tabMask, tabAvatar];
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        config.mode = tab.dataset.mode;
        modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if (config.mode === 'corner') {
          sizeLabel.childNodes[0].textContent = 'Cỡ ảnh góc: ';
        } else if (config.mode === 'mask') {
          sizeLabel.childNodes[0].textContent = 'Cỡ đè mặt: ';
        } else {
          sizeLabel.childNodes[0].textContent = 'Cỡ ảnh: ';
        }
      });
    });

    btnMinus.addEventListener('click', () => {
      config.cornerScale = Math.max(0.6, config.cornerScale - 0.1);
      sizeVal.textContent = Math.round(config.cornerScale * 100) + '%';
    });
    btnPlus.addEventListener('click', () => {
      config.cornerScale = Math.min(1.8, config.cornerScale + 0.1);
      sizeVal.textContent = Math.round(config.cornerScale * 100) + '%';
    });

    // Drag-and-drop
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStartX = e.clientX - widget.offsetLeft;
      dragStartY = e.clientY - widget.offsetTop;
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      widget.style.left = Math.max(10, Math.min(window.innerWidth - widget.offsetWidth - 10, e.clientX - dragStartX)) + 'px';
      widget.style.top = Math.max(10, Math.min(window.innerHeight - widget.offsetHeight - 10, e.clientY - dragStartY)) + 'px';
      widget.style.right = 'auto';
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  function setMemeState(memeKey) {
    if (!MEME_URLS[memeKey]) return;
    config.activeMeme = memeKey;

    const btns = document.querySelectorAll('.cmw-emote-btn');
    btns.forEach(b => {
      b.classList.toggle('active', b.dataset.meme === memeKey);
    });

    const st = document.getElementById('cmwStatus');
    if (st) {
      if (memeKey === 'neutral') {
        st.innerText = '🌿 Webcam thật tự nhiên';
      } else {
        st.innerText = '🐱 ' + (MEME_TITLES[memeKey] || memeKey);
      }
    }
  }

  function ensureWidget() {
    if (!document.getElementById('catMemeWidget')) {
      injectFloatingWidget();
    }
  }
  setInterval(ensureWidget, 1200);
  ensureWidget();

  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CAT_MEME_SET_STATE') {
      const state = event.data.state;
      setMemeState(state);
    }
  });

})();
