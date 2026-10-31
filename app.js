/**
 * CAT MEME AI - Real-time Hand & Face Landmarker Tracking
 * Dedicated Personalized Cat Meme Gestures & Expressions
 */

// ============================================================================
// 1. STATE DEFINITIONS & METADATA (PERSONALIZED CAT MEMES)
// ============================================================================
const MEME_STATES = {
  neutral: {
    code: 'NATURAL_IDLE',
    title: 'Nhìn thẳng tự nhiên (Webcam thật)',
    desc: 'Trạng thái bình thường: Nhìn thẳng, môi nằm thẳng, không kích hoạt meme.',
    src: 'assets/cat_goblin.png'
  },
  huh: {
    code: 'CAT_HUH',
    title: 'Mèo HUH?! (Há to miệng ngơ ngác)',
    desc: 'Hành động: Há to miệng biểu cảm ngơ ngác "Huh?! Não đang buffering..."',
    src: 'assets/cat_loading.png'
  },
  thumbs_up: {
    code: 'CAT_THUMBS_UP',
    title: 'Mèo khóc giơ tay LIKE kiên cường 👍',
    desc: 'Hành động: Nắm 4 ngón tay và giơ ngón cái lên làm hình LIKE 👍 "Em ổn!"',
    src: 'assets/cat_thumbsup.png'
  },
  shh: {
    code: 'CAT_SHH',
    title: 'Mèo suỵt im lặng 🤫',
    desc: 'Hành động: Giơ 1 ngón trỏ đặt lên môi hoặc chóp mũi "Suỵt! Im lặng."',
    src: 'assets/cat_shh.png'
  },
  thinking: {
    code: 'CAT_THINKING',
    title: 'Mèo chống cằm suy ngẫm triết lý 🤔',
    desc: 'Hành động: Đặt bàn tay chống dưới cằm suy tư về ý nghĩa cuộc đời.',
    src: 'assets/cat_thinking_chin.png'
  },
  fist: {
    code: 'CAT_SMUG_FIST',
    title: 'Mèo giơ nắm đấm khệnh khạng 😼',
    desc: 'Hành động: Nắm chặt toàn bộ bàn tay thành nắm đấm giơ lên trước mặt.',
    src: 'assets/cat_smug_fist.png'
  },
  pointing: {
    code: 'CAT_POINTING',
    title: 'Mèo chỉ ngón tay ngại ngùng 👉👈',
    desc: 'Hành động: Giơ 1 ngón trỏ chỉ lên trời hoặc chỉ về phía trước "Dạ em..."',
    src: 'assets/cat_pointing.png'
  },
  head_pat: {
    code: 'CAT_SHOCKED',
    title: 'Mèo hoảng hốt khi bị xoa đầu 😨',
    desc: 'Hành động: Đặt lòng bàn tay lên đỉnh trán/đầu vò đầu bối rối cắn tay.',
    src: 'assets/cat_shocked.png'
  },
  close_up: {
    code: 'CAT_CURSED_STARE',
    title: 'Mèo dí sát mặt cười trừng trừng 👁️',
    desc: 'Hành động: Ghé sát mặt vào ống kính camera với ánh mắt nhìn chằm chằm.',
    src: 'assets/cat_cursed_stare.png'
  },
  side_look: {
    code: 'CAT_EYEBROW',
    title: 'Mèo nhướn mày liếc nghi ngờ 🤨',
    desc: 'Hành động: Nghiêng đầu sang bên hoặc liếc mắt kiểu "The Rock" dò xét.',
    src: 'assets/cat_eyebrow.png'
  },
  heart: {
    code: 'CAT_HEART',
    title: 'Mèo má hồng yêu thương ❤️ (Tay làm hình trái tim 🫶)',
    desc: 'Hành động: Hai bàn tay (hoặc ngón tay) chắp lại tạo thành hình trái tim 🫶.',
    src: 'assets/cat_heart.png'
  }
};

// ============================================================================
// 2. DOM ELEMENTS & APPLICATION STATE
// ============================================================================
// 2. DOM ELEMENTS & APPLICATION STATE
// ============================================================================
const DOM = {
  webcam: document.getElementById('webcam'),
  overlayCanvas: document.getElementById('overlayCanvas'),
  cameraFallback: document.getElementById('cameraFallback'),
  cameraToggleBtn: document.getElementById('cameraToggleBtn'),
  startCamBtnFallback: document.getElementById('startCamBtnFallback'),
  showLandmarksToggle: document.getElementById('showLandmarksToggle'),
  mirrorToggle: document.getElementById('mirrorToggle'),
  toggleAudioBtn: document.getElementById('toggleAudioBtn'),
  audioIcon: document.getElementById('audioIcon'),

  // Calibration Controls
  calibPill: document.getElementById('calibPill'),
  calibDot: document.getElementById('calibDot'),
  calibText: document.getElementById('calibText'),
  calibrateBtn: document.getElementById('calibrateBtn'),
  calibOverlay: document.getElementById('calibOverlay'),
  calibCountdown: document.getElementById('calibCountdown'),
  calibRingBar: document.getElementById('calibRingBar'),
  calibSamples: document.getElementById('calibSamples'),
  cancelCalibBtn: document.getElementById('cancelCalibBtn'),

  // Meme stage
  memeStage: document.getElementById('memeStage'),
  monkeImg: document.getElementById('monkeImg'),
  monkeStateCode: document.getElementById('monkeStateCode'),
  bannerTitle: document.getElementById('bannerTitle'),
  bannerDesc: document.getElementById('bannerDesc'),
  memeStrip: document.getElementById('memeStrip'),

  // Anti-jitter / debouncer
  jitterFill: document.getElementById('jitterFill'),
  jitterText: document.getElementById('jitterText'),

  // Header stats
  fpsVal: document.getElementById('fpsVal'),
  statusText: document.getElementById('statusText'),

  // HUD Metrics
  hudStateTag: document.getElementById('hudStateTag'),
  hudStateLabel: document.getElementById('hudStateLabel'),
  metricEar: document.getElementById('metricEar'),
  metricMar: document.getElementById('metricMar'),
  metricMarZ: document.getElementById('metricMarZ'),
  metricTurn: document.getElementById('metricTurn'),
  metricTurnZ: document.getElementById('metricTurnZ'),
  metricFaceSize: document.getElementById('metricFaceSize'),
  metricFingers: document.getElementById('metricFingers'),

  // Telemetry dots
  indThumb: document.getElementById('indThumb'),
  indIndex: document.getElementById('indIndex'),
  indMiddle: document.getElementById('indMiddle'),
  indRing: document.getElementById('indRing'),
  indPinky: document.getElementById('indPinky')
};

const appState = {
  isCameraRunning: false,
  isAudioEnabled: true,
  showLandmarks: true,
  isMirrored: true,

  // Baseline Calibration (Personalized Resting Face via Z-score)
  baseline: {
    isCalibrated: false,
    samples: 0,
    made: null,
    mean: {
      mar: 0.05,
      ear: 0.30,
      turn: 0.0,
      tilt: 0.0,
      faceWidth: 0.28
    },
    sigma: {
      mar: 0.02,
      ear: 0.03,
      turn: 0.02,
      tilt: 3.0,
      faceWidth: 0.03
    }
  },
  isCalibrating: false,
  calibStartTime: 0,
  calibDurationMs: 3200,
  calibCollector: null,

  // Gesture debouncing & Hysteresis Hold
  currentState: 'neutral',
  candidateState: 'neutral',
  candidateStreak: 0,
  currentHoldFrames: 0,
  HOLD_DURATION: 8, // Giữ meme thêm ~250ms trước khi về neutral
  ARM_THRESHOLDS: {
    heart: 3,
    head_pat: 3,
    shh: 3,
    thinking: 3,
    pointing: 3,
    thumbs_up: 3,
    fist: 3,
    close_up: 4,
    huh: 3,
    side_look: 4,
    neutral: 2
  },

  // FPS calculation
  lastFrameTime: performance.now(),
  frameCount: 0,
  fps: 0,

  // MediaPipe instances
  hands: null,
  faceMesh: null,

  // Cache latest landmarks
  latestHandLandmarks: null,
  latestFaceLandmarks: null
};

// ============================================================================
// 3. SYNTHESIZED SOUND EFFECTS
// ============================================================================
let audioCtx = null;
function playStateChangeSound(stateKey) {
  if (!appState.isAudioEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const frequencies = {
      neutral: 440,
      huh: 330,
      thumbs_up: 523.25,
      shh: 659.25,
      thinking: 587.33,
      fist: 261.63,
      pointing: 783.99,
      head_pat: 493.88,
      close_up: 220,
      side_look: 698.46
    };

    const now = audioCtx.currentTime;
    const freq = frequencies[stateKey] || 440;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.1);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

// ============================================================================
// 4. MATHEMATICAL UTILITIES & SCALE-FREE RECOGNIZERS
// ============================================================================

function dist(p1, p2) {
  if (!p1 || !p2) return 999;
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// Kiểm tra 2 điểm nằm gần nhau dựa trên tỷ lệ bề rộng khuôn mặt (Scale-free: hoạt động chính xác ở mọi cự ly ngồi)
function isNear(p1, p2, ratio, faceWidth) {
  if (!p1 || !p2) return false;
  const fw = faceWidth || 0.28;
  return dist(p1, p2) < ratio * fw;
}

// Ngón tay duỗi thẳng: đầu ngón (tip) xa cổ tay (0) hơn khớp PIP (pip) và khớp PIP xa cổ tay hơn khớp MCP (mcp)
function isFingerExtended(pts, tipIdx, pipIdx, mcpIdx) {
  if (!pts || !pts[tipIdx] || !pts[pipIdx] || !pts[mcpIdx] || !pts[0]) return false;
  const dTip = dist(pts[0], pts[tipIdx]);
  const dPip = dist(pts[0], pts[pipIdx]);
  const dMcp = dist(pts[0], pts[mcpIdx]);
  return dTip > dPip && dPip > dMcp * 0.95;
}

// Ngón tay gập vào lòng bàn tay: đầu ngón (tip) gần cổ tay hơn hoặc gần khớp MCP
function isFingerFolded(pts, tipIdx, pipIdx, mcpIdx) {
  if (!pts || !pts[tipIdx] || !pts[pipIdx] || !pts[mcpIdx] || !pts[0]) return false;
  const dTipWrist = dist(pts[0], pts[tipIdx]);
  const dPipWrist = dist(pts[0], pts[pipIdx]);
  const dTipMcp = dist(pts[tipIdx], pts[mcpIdx]);
  const dPipMcp = dist(pts[pipIdx], pts[mcpIdx]);
  return (dTipWrist < dPipWrist * 1.05) || (dTipMcp < dPipMcp * 1.15);
}

function isThumbExtended(pts) {
  if (!pts || !pts[4] || !pts[2] || !pts[17]) return false;
  const dTipPinky = dist(pts[4], pts[17]);
  const dMcpPinky = dist(pts[2], pts[17]);
  return dTipPinky > dMcpPinky * 1.15;
}

// Cử chỉ Thumbs Up: 4 ngón gập gọn, ngón cái duỗi thẳng vươn cao
function isThumbsUp(pts) {
  if (!pts || pts.length < 21) return false;
  const indexFolded = isFingerFolded(pts, 8, 6, 5);
  const middleFolded = isFingerFolded(pts, 12, 10, 9);
  const ringFolded = isFingerFolded(pts, 16, 14, 13);
  const pinkyFolded = isFingerFolded(pts, 20, 18, 17);

  if (!(indexFolded && middleFolded && ringFolded && pinkyFolded)) return false;

  const thumbUpward = pts[4].y < pts[3].y && pts[3].y < pts[2].y;
  const thumbAboveKnuckles = pts[4].y < pts[5].y - 0.04;
  const thumbAboveWrist = pts[4].y < pts[0].y - 0.08;
  const thumbExtended = dist(pts[4], pts[2]) > dist(pts[3], pts[2]) * 1.18;

  return thumbUpward && thumbAboveKnuckles && thumbAboveWrist && thumbExtended;
}

// Cử chỉ Trái Tim 🫶 (Chuẩn hóa theo FaceWidth)
function isHeartShape(allHands, singleHandPts, faceWidth) {
  const fw = faceWidth || 0.28;

  // 1. Hai bàn tay ghép lại thành hình trái tim
  if (allHands && allHands.length >= 2) {
    const h1 = allHands[0];
    const h2 = allHands[1];

    const distThumbs = dist(h1[4], h2[4]);
    const distIndex = dist(h1[8], h2[8]);

    // Đầu ngón cái và ngón trỏ chụm gần nhau (dưới 42% bề rộng mặt)
    if (distThumbs < 0.42 * fw && distIndex < 0.42 * fw) {
      return true;
    }

    const distMiddle = dist(h1[12], h2[12]);
    if (distThumbs < 0.42 * fw && (distIndex < 0.46 * fw || distMiddle < 0.46 * fw)) {
      return true;
    }
  }

  // 2. Một bàn tay uốn cong ngón cái và ngón trỏ
  if (singleHandPts && singleHandPts.length >= 21) {
    const distThumbIndex = dist(singleHandPts[4], singleHandPts[8]);
    const middleFolded = isFingerFolded(singleHandPts, 12, 10, 9);
    const ringFolded = isFingerFolded(singleHandPts, 16, 14, 13);
    const pinkyFolded = isFingerFolded(singleHandPts, 20, 18, 17);

    if (distThumbIndex < 0.22 * fw && middleFolded && ringFolded && pinkyFolded) {
      return true;
    }
  }

  return false;
}

// Cử chỉ Nắm Đấm: Cả 4 ngón đều gập, ngón cái gập ôm sát (không nhô cao như LIKE)
function isFist(pts) {
  if (!pts || pts.length < 21) return false;
  const indexFolded = isFingerFolded(pts, 8, 6, 5);
  const middleFolded = isFingerFolded(pts, 12, 10, 9);
  const ringFolded = isFingerFolded(pts, 16, 14, 13);
  const pinkyFolded = isFingerFolded(pts, 20, 18, 17);

  if (!(indexFolded && middleFolded && ringFolded && pinkyFolded)) return false;

  const thumbNotStickingUp = pts[4].y >= pts[5].y - 0.025;
  return thumbNotStickingUp;
}

// Cử chỉ Suỵt 🤫: Ngón trỏ duỗi đặt sát bờ môi hoặc mũi (chuẩn hóa tỷ lệ theo FaceWidth)
function isShushing(handPts, facePts, faceWidth) {
  if (!handPts || !facePts || handPts.length < 21 || facePts.length < 468) return false;
  const indexUp = isFingerExtended(handPts, 8, 6, 5);
  const middleFolded = isFingerFolded(handPts, 12, 10, 9);
  const ringFolded = isFingerFolded(handPts, 16, 14, 13);
  const pinkyFolded = isFingerFolded(handPts, 20, 18, 17);

  if (!(indexUp && middleFolded && ringFolded && pinkyFolded)) return false;

  const indexTip = handPts[8];
  const lips = facePts[13];
  const nose = facePts[1];
  const fw = faceWidth || 0.28;

  return dist(indexTip, lips) < 0.28 * fw || dist(indexTip, nose) < 0.28 * fw;
}

// Cử chỉ Chống Cằm 🤔: Bàn tay nâng đỡ sát dưới cằm
function isChinRest(handPts, facePts, faceWidth, faceHeight) {
  if (!handPts || !facePts || handPts.length < 21 || facePts.length < 468) return false;
  const chin = facePts[152];
  const fw = faceWidth || 0.28;
  const fh = faceHeight || 0.35;

  const distToChin = Math.min(
    dist(handPts[0], chin),
    dist(handPts[5], chin),
    dist(handPts[8], chin),
    dist(handPts[9], chin),
    dist(handPts[4], chin)
  );

  const handUnderChin = handPts[0].y >= chin.y - 0.12 * fh;
  return distToChin < 0.32 * fw && handUnderChin;
}

// Cử chỉ Xoa Đầu 😨: Bàn tay đặt sát hoặc đè lên đỉnh trán/đầu
function isHeadPat(handPts, facePts, faceWidth, faceHeight) {
  if (!handPts || !facePts || handPts.length < 21 || facePts.length < 468) return false;
  const foreheadTop = facePts[10];
  const minHandY = Math.min(...handPts.map(p => p.y));
  const handWrist = handPts[0];
  const fw = faceWidth || 0.28;
  const fh = faceHeight || 0.35;

  const handNearTop = (minHandY <= foreheadTop.y + 0.15 * fh) || dist(handWrist, foreheadTop) < 0.42 * fw;
  const handOverHeadHorizontally = Math.abs(handWrist.x - foreheadTop.x) < 0.55 * fw;

  return handNearTop && handOverHeadHorizontally;
}

// Cử chỉ Chỉ Ngón Trỏ 👉👈: Ngón trỏ duỗi, các ngón khác gập, cách xa môi miệng
function isPointing(handPts, facePts, faceWidth) {
  if (!handPts || handPts.length < 21) return false;
  const indexUp = isFingerExtended(handPts, 8, 6, 5);
  const middleFolded = isFingerFolded(handPts, 12, 10, 9);
  const ringFolded = isFingerFolded(handPts, 16, 14, 13);
  const pinkyFolded = isFingerFolded(handPts, 20, 18, 17);

  if (!(indexUp && middleFolded && ringFolded && pinkyFolded)) return false;

  if (facePts && facePts.length >= 468) {
    const fw = faceWidth || 0.28;
    if (dist(handPts[8], facePts[13]) < 0.30 * fw) return false;
  }
  return true;
}

// Tính Eye Aspect Ratio (EAR)
function computeEAR(facePts) {
  if (!facePts || facePts.length < 468) return 0.3;

  const leftVertical = dist(facePts[159], facePts[145]);
  const leftHorizontal = dist(facePts[33], facePts[133]);
  const leftEAR = leftVertical / (leftHorizontal + 1e-6);

  const rightVertical = dist(facePts[386], facePts[374]);
  const rightHorizontal = dist(facePts[263], facePts[362]);
  const rightEAR = rightVertical / (rightHorizontal + 1e-6);

  return (leftEAR + rightEAR) / 2.0;
}

// Tính Mouth Aspect Ratio (MAR)
function computeMAR(facePts) {
  if (!facePts || facePts.length < 468) return 0.05;
  const mouthHeight = dist(facePts[13], facePts[14]);
  const mouthWidth = dist(facePts[61], facePts[291]) + 1e-6;
  return mouthHeight / mouthWidth;
}

function computeFaceWidth(facePts) {
  if (!facePts || facePts.length < 468) return 0.28;
  return dist(facePts[234], facePts[454]);
}

function computeFaceHeight(facePts) {
  if (!facePts || facePts.length < 468) return 0.35;
  return dist(facePts[10], facePts[152]);
}

// Tính góc quay đầu chuẩn hóa (Scale-free Head Turn & Tilt)
function computeHeadOrientation(facePts) {
  if (!facePts || facePts.length < 468) return { tiltAngle: 0, turnSigned: 0 };
  const leftEye = facePts[33];
  const rightEye = facePts[263];
  const nose = facePts[1];
  const cheekL = facePts[234];
  const cheekR = facePts[454];

  const dy = rightEye.y - leftEye.y;
  const dx = rightEye.x - leftEye.x;
  const tiltAngle = Math.abs((Math.atan2(dy, dx) * 180) / Math.PI);

  // Vị trí chóp mũi nằm giữa 2 mép gò má: 0 = nhìn thẳng, dương = quay phải, âm = quay trái
  const cheekSpan = Math.max(cheekR.x - cheekL.x, 0.001);
  const turnSigned = (nose.x - cheekL.x) / cheekSpan - 0.5;

  return { tiltAngle, turnSigned };
}

// ============================================================================
// 5. CALIBRATION & Z-SCORE ENGINE (INSPIRED BY ITSGIVING V2)
// ============================================================================
const SIGMA_FLOORS = { mar: 0.012, ear: 0.015, turn: 0.015, tilt: 2.0 };
const SIGMA_CEILS = { mar: 0.06, ear: 0.08, turn: 0.08, tilt: 10.0 };
const Z_THRESHOLDS = {
  mar: 3.8,      // Vượt 3.8 độ lệch chuẩn trên khuôn mặt nghỉ
  turn: 3.5,     // Quay mặt vượt 3.5 sigma
  tilt: 3.2      // Nghiêng đầu vượt 3.2 sigma
};
const ABS_FLOORS = {
  mar: 0.16,     // Đáy an toàn tránh hair-trigger
  turn: 0.08,
  tilt: 12.0
};

function getZScore(val, key) {
  const m = appState.baseline.mean[key] ?? 0;
  const s = Math.max(appState.baseline.sigma[key] ?? 0.02, SIGMA_FLOORS[key] ?? 0.012);
  const z = (val - m) / s;
  return Math.min(8.0, Math.max(-8.0, z)); // Chặn biên [-8s, +8s]
}

function loadSavedCalibration() {
  try {
    const raw = localStorage.getItem('CAT_MEME_CALIB_V1');
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.mean && data.sigma) {
        appState.baseline = data;
        appState.baseline.isCalibrated = true;
        updateCalibUI();
        console.log('[Calibration] Đã nạp cấu hình hiệu chuẩn từ LocalStorage:', data);
        return true;
      }
    }
  } catch (e) {
    console.warn('[Calibration] Lỗi đọc LocalStorage:', e);
  }
  updateCalibUI();
  return false;
}

function saveCalibration(baseData) {
  try {
    localStorage.setItem('CAT_MEME_CALIB_V1', JSON.stringify(baseData));
  } catch (e) {
    console.warn('[Calibration] Lỗi lưu LocalStorage:', e);
  }
}

function updateCalibUI() {
  if (appState.baseline.isCalibrated) {
    DOM.calibDot.classList.add('active');
    DOM.calibText.innerText = 'Active ⚡';
    DOM.calibText.className = 'stat-value text-accent';
    DOM.calibrateBtn.innerHTML = '<span class="icon">🎯</span> Hiệu chuẩn lại';
  } else {
    DOM.calibDot.classList.remove('active');
    DOM.calibText.innerText = 'Generic';
    DOM.calibText.className = 'stat-value text-muted';
    DOM.calibrateBtn.innerHTML = '<span class="icon">🎯</span> Hiệu chuẩn (3s)';
  }
}

function startCalibration() {
  if (!appState.isCameraRunning) {
    alert('Vui lòng bật Camera trước khi thực hiện hiệu chuẩn!');
    return;
  }

  appState.isCalibrating = true;
  appState.calibStartTime = performance.now();
  appState.calibCollector = {
    n: 0,
    sums: { mar: 0, ear: 0, turn: 0, tilt: 0, faceWidth: 0 },
    sqSums: { mar: 0, ear: 0, turn: 0, tilt: 0, faceWidth: 0 }
  };

  DOM.calibOverlay.classList.remove('hidden');
  DOM.calibCountdown.innerText = '3.0s';
  DOM.calibSamples.innerText = '0 frames';
  if (DOM.calibRingBar) {
    DOM.calibRingBar.style.strokeDashoffset = '264';
  }

  playTone(523.25, 0.15); // C5 chime
}

function cancelCalibration() {
  appState.isCalibrating = false;
  appState.calibCollector = null;
  DOM.calibOverlay.classList.add('hidden');
}

function finishCalibration() {
  appState.isCalibrating = false;
  DOM.calibOverlay.classList.add('hidden');

  const col = appState.calibCollector;
  if (!col || col.n < 20) {
    alert('Hiệu chuẩn chưa đủ mẫu (chưa bắt được khuôn mặt rõ ràng). Vui lòng ngồi trước camera và thử lại!');
    return;
  }

  const mean = {};
  const sigma = {};
  const keys = ['mar', 'ear', 'turn', 'tilt', 'faceWidth'];

  keys.forEach(k => {
    const m = col.sums[k] / col.n;
    const variance = Math.max(col.sqSums[k] / col.n - m * m, 0.0);
    const s = Math.sqrt(variance);
    mean[k] = Number(m.toFixed(4));
    sigma[k] = Number(Math.min(Math.max(s, SIGMA_FLOORS[k]), SIGMA_CEILS[k]).toFixed(4));
  });

  appState.baseline = {
    isCalibrated: true,
    samples: col.n,
    made: new Date().toLocaleTimeString(),
    mean,
    sigma
  };

  saveCalibration(appState.baseline);
  updateCalibUI();

  playTone(783.99, 0.25); // G5 success chime
  console.log('[Calibration] Hoàn tất hiệu chuẩn cá nhân:', appState.baseline);
}

function playTone(freq, dur) {
  if (!appState.isAudioEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}

// ============================================================================
// 6. CLASSIFICATION ENGINE (SCALE-FREE GEOMETRY & PERSONALIZED Z-SCORE)
// ============================================================================
function classifyGestures(handPts, facePts, allHands) {
  const hasHand = handPts && handPts.length >= 21;
  const hasFace = facePts && facePts.length >= 468;

  // Face Geometry Metrics
  let ear = 0.3;
  let mar = 0.05;
  let faceWidth = 0.28;
  let faceHeight = 0.35;
  let headTilt = 0;
  let turnSigned = 0;
  let zMar = 0;
  let zTurn = 0;
  let zTilt = 0;

  if (hasFace) {
    ear = computeEAR(facePts);
    mar = computeMAR(facePts);
    faceWidth = computeFaceWidth(facePts);
    faceHeight = computeFaceHeight(facePts);

    const orient = computeHeadOrientation(facePts);
    headTilt = orient.tiltAngle;
    turnSigned = orient.turnSigned;

    zMar = getZScore(mar, 'mar');
    zTurn = getZScore(turnSigned, 'turn');
    zTilt = getZScore(headTilt, 'tilt');

    // Telemetry display
    DOM.metricEar.innerText = ear.toFixed(3);
    DOM.metricMar.innerText = mar.toFixed(3);
    DOM.metricMarZ.innerText = `(Z: ${zMar >= 0 ? '+' : ''}${zMar.toFixed(1)}s)`;
    DOM.metricTurn.innerText = `${turnSigned >= 0 ? '+' : ''}${turnSigned.toFixed(2)}`;
    DOM.metricTurnZ.innerText = `(Z: ${zTurn >= 0 ? '+' : ''}${zTurn.toFixed(1)}s)`;
    DOM.metricFaceSize.innerText = faceWidth.toFixed(3);

    // Xử lý tiến trình hiệu chuẩn nếu đang chạy
    if (appState.isCalibrating && appState.calibCollector) {
      const elapsed = performance.now() - appState.calibStartTime;
      const col = appState.calibCollector;

      // Bỏ qua 400ms đầu (warmup)
      if (elapsed > 400) {
        col.n++;
        const metrics = { mar, ear, turn: turnSigned, tilt: headTilt, faceWidth };
        Object.keys(metrics).forEach(k => {
          col.sums[k] += metrics[k];
          col.sqSums[k] += metrics[k] * metrics[k];
        });
        DOM.calibSamples.innerText = `${col.n} frames`;
      }

      const remainSec = Math.max(0, (appState.calibDurationMs - elapsed) / 1000);
      DOM.calibCountdown.innerText = `${remainSec.toFixed(1)}s`;

      const progress = Math.min(1.0, elapsed / appState.calibDurationMs);
      if (DOM.calibRingBar) {
        DOM.calibRingBar.style.strokeDashoffset = (264 * (1 - progress)).toString();
      }

      if (elapsed >= appState.calibDurationMs) {
        finishCalibration();
      }

      return 'neutral';
    }
  }

  // Hand telemetry
  if (hasHand) {
    const thumbUp = isThumbExtended(handPts);
    const indexUp = isFingerExtended(handPts, 8, 6, 5);
    const middleUp = isFingerExtended(handPts, 12, 10, 9);
    const ringUp = isFingerExtended(handPts, 16, 14, 13);
    const pinkyUp = isFingerExtended(handPts, 20, 18, 17);

    const fingers = [indexUp, middleUp, ringUp, pinkyUp];
    const foldedCount = fingers.filter(x => !x).length;

    DOM.indThumb.classList.toggle('active', thumbUp);
    DOM.indIndex.classList.toggle('active', indexUp);
    DOM.indMiddle.classList.toggle('active', middleUp);
    DOM.indRing.classList.toggle('active', ringUp);
    DOM.indPinky.classList.toggle('active', pinkyUp);
    DOM.metricFingers.innerText = `${4 - foldedCount}/4 ngón`;
  } else {
    DOM.indThumb.classList.remove('active');
    DOM.indIndex.classList.remove('active');
    DOM.indMiddle.classList.remove('active');
    DOM.indRing.classList.remove('active');
    DOM.indPinky.classList.remove('active');
    DOM.metricFingers.innerText = 'Không có tay';
  }

  // -------------------------------------------------------------
  // ĐỘ ƯU TIÊN 1: CỬ CHỈ BÀN TAY (HAND GESTURES - SCALE-FREE)
  // -------------------------------------------------------------
  if (hasHand) {
    // 1. Trái Tim 🫶
    if (isHeartShape(allHands, handPts, faceWidth)) {
      return 'heart';
    }

    // 2. Xoa đầu 😨 (Mèo hoảng hốt)
    if (hasFace && isHeadPat(handPts, facePts, faceWidth, faceHeight)) {
      return 'head_pat';
    }

    // 3. Suỵt 🤫
    if (hasFace && isShushing(handPts, facePts, faceWidth)) {
      return 'shh';
    }

    // 4. Chống cằm 🤔 (Mèo suy ngẫm)
    if (hasFace && isChinRest(handPts, facePts, faceWidth, faceHeight)) {
      return 'thinking';
    }

    // 5. Chỉ 1 ngón trỏ 👉👈
    if (isPointing(handPts, facePts, faceWidth)) {
      return 'pointing';
    }

    // 6. Giơ tay Like 👍
    if (isThumbsUp(handPts)) {
      return 'thumbs_up';
    }

    // 7. Nắm đấm 😼
    if (isFist(handPts)) {
      return 'fist';
    }
  }

  // -------------------------------------------------------------
  // ĐỘ ƯU TIÊN 2: BIỂU CẢM KHUÔN MẶT (Z-SCORE CÁ NHÂN HÓA)
  // -------------------------------------------------------------
  if (hasFace) {
    // 8. Close Up: Ghé sát mặt vào camera
    const isCloseUp = appState.baseline.isCalibrated
      ? (faceWidth / appState.baseline.mean.faceWidth > 1.40)
      : (faceWidth > 0.42);

    if (isCloseUp) {
      return 'close_up';
    }

    // 9. Há to miệng ngơ ngác -> Mèo HUH?!
    // Kết hợp Z-Score vượt chuẩn VÀ giá trị Floor tối thiểu
    const isHuh = (zMar >= Z_THRESHOLDS.mar && mar >= ABS_FLOORS.mar) || (mar > 0.22);
    if (isHuh) {
      return 'huh';
    }

    // 10. Liếc mắt / Nghiêng đầu kiểu The Rock 🤨
    const isSideLook =
      (Math.abs(zTurn) >= Z_THRESHOLDS.turn && Math.abs(turnSigned) >= ABS_FLOORS.turn) ||
      (Math.abs(zTilt) >= Z_THRESHOLDS.tilt && headTilt >= ABS_FLOORS.tilt) ||
      (Math.abs(turnSigned) > 0.16) ||
      (headTilt > 16.0);

    if (isSideLook) {
      return 'side_look';
    }
  }

  // Mặc định: Trạng thái tự nhiên
  return 'neutral';
}

// ============================================================================
// 7. ANTI-JITTER SMOOTHING & HYSTERESIS HOLD DURATION
// ============================================================================
function updateClassification(rawState) {
  if (appState.isCalibrating) return;

  // 1. Tích lũy chuỗi khung hình ứng viên
  if (rawState === appState.candidateState) {
    appState.candidateStreak++;
  } else {
    appState.candidateState = rawState;
    appState.candidateStreak = 1;
  }

  const armTarget = appState.ARM_THRESHOLDS[appState.candidateState] || 3;
  const progressPct = Math.min(100, Math.round((appState.candidateStreak / armTarget) * 100));
  DOM.jitterFill.style.width = `${progressPct}%`;

  // 2. Ứng viên đạt ngưỡng ổn định ARM
  if (appState.candidateStreak >= armTarget) {
    DOM.jitterText.innerText = `Khóa: ${appState.candidateStreak}/${armTarget} (Locked)`;

    if (appState.candidateState !== 'neutral') {
      // Kích hoạt meme mới và nạp lại thời gian lưu giữ (Hold Duration)
      appState.currentHoldFrames = appState.HOLD_DURATION;
      if (appState.currentState !== appState.candidateState) {
        applyMemeState(appState.candidateState);
      }
    } else {
      // Ứng viên là neutral: Đếm lùi bộ đệm Hold Frames để tránh nhấp nháy
      if (appState.currentHoldFrames > 0) {
        appState.currentHoldFrames--;
        DOM.jitterText.innerText = `Giữ Meme: ${appState.currentHoldFrames}f (Hold)`;
      } else {
        if (appState.currentState !== 'neutral') {
          applyMemeState('neutral');
        }
      }
    }
  } else {
    // Chưa đủ streak mới: nếu đang hiển thị meme và ứng viên là neutral thì giữ meme
    if (appState.currentState !== 'neutral' && rawState === 'neutral' && appState.currentHoldFrames > 0) {
      appState.currentHoldFrames--;
      DOM.jitterText.innerText = `Giữ Meme: ${appState.currentHoldFrames}f (Hold)`;
    } else {
      DOM.jitterText.innerText = `Chờ ổn định: ${appState.candidateStreak}/${armTarget}`;
    }
  }
}

function applyMemeState(stateKey) {
  if (!MEME_STATES[stateKey]) return;
  appState.currentState = stateKey;

  const data = MEME_STATES[stateKey];

  DOM.monkeStateCode.innerText = `STATE: ${data.code}`;
  DOM.bannerTitle.innerText = data.title;
  DOM.bannerDesc.innerText = data.desc;

  DOM.monkeImg.src = data.src;
  DOM.memeStage.classList.remove('switching');
  void DOM.memeStage.offsetWidth;
  DOM.memeStage.classList.add('switching');

  if (stateKey !== 'neutral') {
    playStateChangeSound(stateKey);
  }

  DOM.hudStateLabel.innerText = data.title;

  document.querySelectorAll('.strip-item').forEach(el => {
    el.classList.toggle('active', el.dataset.state === stateKey);
  });

  document.querySelectorAll('.logic-table tbody tr').forEach(row => {
    row.classList.toggle('active-row', row.dataset.state === stateKey);
  });
}

// ============================================================================
// 7. OVERLAY CANVAS RENDERING
// ============================================================================
const cachedMemeImages = {};
function getMemeImage(stateKey) {
  if (!cachedMemeImages[stateKey] && MEME_STATES[stateKey]) {
    const img = new Image();
    img.src = MEME_STATES[stateKey].src;
    cachedMemeImages[stateKey] = img;
  }
  return cachedMemeImages[stateKey];
}

function drawOverlays() {
  const canvas = DOM.overlayCanvas;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Khung xương nhận diện khuôn mặt và bàn tay (nếu bật Landmarks)
  if (appState.showLandmarks) {
    if (appState.latestFaceLandmarks && window.drawConnectors) {
      const landmarks = appState.latestFaceLandmarks;

      if (window.FACEMESH_TESSELATION) {
        window.drawConnectors(ctx, landmarks, window.FACEMESH_TESSELATION, {
          color: 'rgba(0, 242, 254, 0.12)',
          lineWidth: 1
        });
      }

      if (window.FACEMESH_RIGHT_EYE && window.FACEMESH_LEFT_EYE) {
        window.drawConnectors(ctx, landmarks, window.FACEMESH_RIGHT_EYE, {
          color: '#00e676',
          lineWidth: 2
        });
        window.drawConnectors(ctx, landmarks, window.FACEMESH_LEFT_EYE, {
          color: '#00e676',
          lineWidth: 2
        });
      }

      if (window.FACEMESH_LIPS) {
        window.drawConnectors(ctx, landmarks, window.FACEMESH_LIPS, {
          color: '#ff3366',
          lineWidth: 2
        });
      }

      [10, 13, 14, 152, 1].forEach(idx => {
        const pt = landmarks[idx];
        if (pt) {
          ctx.beginPath();
          ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#ff007f';
          ctx.fill();
        }
      });

      // Hiển thị khung ngắm hiệu chuẩn nếu đang trong tiến trình
      if (appState.isCalibrating) {
        const ptsX = landmarks.map(p => p.x * canvas.width);
        const ptsY = landmarks.map(p => p.y * canvas.height);
        const minX = Math.min(...ptsX) - 10;
        const maxX = Math.max(...ptsX) + 10;
        const minY = Math.min(...ptsY) - 10;
        const maxY = Math.max(...ptsY) + 10;

        ctx.save();
        ctx.strokeStyle = '#00e676';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        ctx.restore();
      }
    }

    if (appState.latestHandLandmarks && window.drawConnectors && window.drawLandmarks) {
      for (const handPts of appState.latestHandLandmarks) {
        if (window.HAND_CONNECTIONS) {
          window.drawConnectors(ctx, handPts, window.HAND_CONNECTIONS, {
            color: '#00f2fe',
            lineWidth: 2.5
          });
        }
        window.drawLandmarks(ctx, handPts, {
          color: '#ffbd2e',
          lineWidth: 1.5,
          radius: 3.5
        });
      }
    }
  }

  // 2. HIỂN THỊ ẢNH MÈO Ở GÓC BÊN TRÁI PHÍA DƯỚI (Không đè lên mặt)
  if (appState.currentState && appState.currentState !== 'neutral') {
    const memeImg = getMemeImage(appState.currentState);
    if (memeImg && memeImg.complete && memeImg.naturalWidth > 0) {
      const boxH = Math.round(canvas.height * 0.32);
      const boxW = Math.round(boxH * (memeImg.naturalWidth / memeImg.naturalHeight));
      const posX = 16;
      const posY = canvas.height - boxH - 16;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 4;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(posX, posY, boxW, boxH, 12);
      } else {
        ctx.rect(posX, posY, boxW, boxH);
      }
      ctx.closePath();
      ctx.clip();

      ctx.shadowColor = 'transparent';
      ctx.drawImage(memeImg, posX, posY, boxW, boxH);
      ctx.restore();

      // Viền neon cyberpunk tinh tế
      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(posX, posY, boxW, boxH, 12);
      } else {
        ctx.rect(posX, posY, boxW, boxH);
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#00f2fe';
      ctx.shadowColor = 'rgba(0, 242, 254, 0.8)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ============================================================================
// 8. MEDIAPIPE INITIALIZATION
// ============================================================================
async function initMediaPipe() {
  DOM.statusText.innerText = 'Đang tải AI Model...';

  try {
    if (window.Hands) {
      appState.hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      appState.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65
      });
      appState.hands.onResults(onHandResults);
    }

    if (window.FaceMesh) {
      appState.faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
      appState.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });
      appState.faceMesh.onResults(onFaceResults);
    }

    DOM.statusText.innerText = 'AI sẵn sàng';
  } catch (err) {
    console.error('Lỗi nạp MediaPipe:', err);
    DOM.statusText.innerText = 'Lỗi nạp Model';
  }
}

function onHandResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    appState.latestHandLandmarks = results.multiHandLandmarks;
  } else {
    appState.latestHandLandmarks = null;
  }
}

function onFaceResults(results) {
  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    appState.latestFaceLandmarks = results.multiFaceLandmarks[0];
  } else {
    appState.latestFaceLandmarks = null;
  }
}

// ============================================================================
// 9. CAMERA STREAM & FRAME LOOP
// ============================================================================
async function startCamera() {
  if (appState.isCameraRunning) return;

  DOM.statusText.innerText = 'Đang mở Webcam...';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      },
      audio: false
    });

    DOM.webcam.srcObject = stream;
    await new Promise(resolve => {
      DOM.webcam.onloadedmetadata = () => {
        DOM.webcam.play();
        resolve();
      };
    });

    DOM.overlayCanvas.width = DOM.webcam.videoWidth || 640;
    DOM.overlayCanvas.height = DOM.webcam.videoHeight || 480;

    appState.isCameraRunning = true;
    DOM.cameraFallback.classList.add('hidden');
    DOM.cameraToggleBtn.innerHTML = '<span class="icon">⏹</span> Dừng Camera';
    DOM.statusText.innerText = 'Đang theo dõi trực tiếp';

    processLoop();
  } catch (err) {
    console.warn('Không thể truy cập Camera trực tiếp:', err);
    DOM.statusText.innerText = 'Chưa cấp quyền Camera';
    alert('Không thể mở webcam: Vui lòng cho phép quyền truy cập camera trên trình duyệt!');
  }
}

function stopCamera() {
  if (!appState.isCameraRunning) return;

  const stream = DOM.webcam.srcObject;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    DOM.webcam.srcObject = null;
  }

  appState.isCameraRunning = false;
  DOM.cameraFallback.classList.remove('hidden');
  DOM.cameraToggleBtn.innerHTML = '<span class="icon">📷</span> Bật Camera';
  DOM.statusText.innerText = 'Đã dừng Camera';
  DOM.fpsVal.innerText = '0';
}

async function processLoop() {
  if (!appState.isCameraRunning) return;

  const now = performance.now();
  appState.frameCount++;
  if (now - appState.lastFrameTime >= 1000) {
    appState.fps = Math.round((appState.frameCount * 1000) / (now - appState.lastFrameTime));
    DOM.fpsVal.innerText = appState.fps;
    appState.frameCount = 0;
    appState.lastFrameTime = now;
  }

  if (DOM.webcam.readyState >= 2) {
    if (appState.hands) {
      await appState.hands.send({ image: DOM.webcam });
    }
    if (appState.faceMesh) {
      await appState.faceMesh.send({ image: DOM.webcam });
    }

    const activeHand = appState.latestHandLandmarks ? appState.latestHandLandmarks[0] : null;
    const activeFace = appState.latestFaceLandmarks;
    const rawState = classifyGestures(activeHand, activeFace, appState.latestHandLandmarks);

    updateClassification(rawState);
    drawOverlays();
  }

  requestAnimationFrame(processLoop);
}

// ============================================================================
// 10. SETUP UI INTERACTIVITY
// ============================================================================
function renderMemeStrip() {
  DOM.memeStrip.innerHTML = '';
  Object.keys(MEME_STATES).forEach(key => {
    const item = MEME_STATES[key];
    const el = document.createElement('div');
    el.className = `strip-item ${key === appState.currentState ? 'active' : ''}`;
    el.dataset.state = key;
    el.title = item.title;
    el.innerHTML = `<img src="${item.src}" alt="${item.title}">`;
    el.addEventListener('click', () => {
      applyMemeState(key);
    });
    DOM.memeStrip.appendChild(el);
  });
}

function setupUI() {
  renderMemeStrip();

  DOM.cameraToggleBtn.addEventListener('click', () => {
    if (appState.isCameraRunning) {
      stopCamera();
    } else {
      startCamera();
    }
  });

  DOM.startCamBtnFallback.addEventListener('click', () => {
    startCamera();
  });

  DOM.mirrorToggle.addEventListener('change', e => {
    appState.isMirrored = e.target.checked;
    DOM.webcam.classList.toggle('mirrored', appState.isMirrored);
    DOM.overlayCanvas.classList.toggle('mirrored', appState.isMirrored);
  });

  DOM.showLandmarksToggle.addEventListener('change', e => {
    appState.showLandmarks = e.target.checked;
    if (!appState.showLandmarks) {
      const ctx = DOM.overlayCanvas.getContext('2d');
      ctx.clearRect(0, 0, DOM.overlayCanvas.width, DOM.overlayCanvas.height);
    }
  });

  DOM.toggleAudioBtn.addEventListener('click', () => {
    appState.isAudioEnabled = !appState.isAudioEnabled;
    DOM.audioIcon.innerText = appState.isAudioEnabled ? '🔊' : '🔇';
    DOM.toggleAudioBtn.title = appState.isAudioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh';
  });

  // Cheatsheet accordion & row click
  const toggleBtn = document.getElementById('toggleLogicBtn');
  const tableContainer = document.getElementById('logicTableContainer');
  if (toggleBtn && tableContainer) {
    toggleBtn.addEventListener('click', () => {
      tableContainer.classList.toggle('collapsed');
    });
  }

  document.querySelectorAll('.logic-table tbody tr').forEach(row => {
    row.addEventListener('click', () => {
      const state = row.dataset.state;
      if (state) applyMemeState(state);
    });
  });

  // Calibration button handlers
  if (DOM.calibrateBtn) {
    DOM.calibrateBtn.addEventListener('click', () => {
      startCalibration();
    });
  }

  if (DOM.cancelCalibBtn) {
    DOM.cancelCalibBtn.addEventListener('click', () => {
      cancelCalibration();
    });
  }

  // Load saved calibration profile
  loadSavedCalibration();

  applyMemeState('neutral');
}

// ============================================================================
// 11. BOOTSTRAP
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  setupUI();
  initMediaPipe();
});
