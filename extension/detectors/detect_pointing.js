/**
 * DETECTOR: POINTING 👉👈 (Mèo chỉ 2 ngón tay chạm nhau ngại ngùng)
 * Kích hoạt khi 2 bàn tay giơ lên và 2 ngón trỏ chạm vào nhau ở giữa ngực
 */
(function() {
  'use strict';
  window.__CAT_DETECTORS__ = window.__CAT_DETECTORS__ || {};

  window.__CAT_DETECTORS__.pointing = function(c) {
    const { W, H, isSkin, faceMaxY, faceCenterX, faceW, leftSideSkin, rightSideSkin } = c;
    // Cả 2 tay cùng đưa lên ở 2 bên nhưng không to bè như chụm tim
    if (leftSideSkin < 20 || rightSideSkin < 20) return false;

    let centerSkin = 0;
    const centerY1 = Math.max(0, Math.floor(faceMaxY));
    const centerY2 = Math.min(H - 1, Math.floor(faceMaxY + 20));
    const centerX1 = Math.max(0, Math.floor(faceCenterX - faceW * 0.25));
    const centerX2 = Math.min(W - 1, Math.floor(faceCenterX + faceW * 0.25));

    for (let y = centerY1; y <= centerY2; y++) {
      for (let x = centerX1; x <= centerX2; x++) {
        if (isSkin[y * W + x]) centerSkin++;
      }
    }

    // 2 đầu ngón tay chạm nhau ở giữa: có vùng da vừa phải (10 đến 30 pixel), không quá đặc như chụm tim
    return (centerSkin >= 10 && centerSkin < 32);
  };
})();
