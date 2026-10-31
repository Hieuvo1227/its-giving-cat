/**
 * DETECTOR: HEART 🫶 (Mèo má hồng yêu thương - 2 tay chụm trái tim trước ngực)
 * Kích hoạt khi 2 tay giơ lên và chụm lại ở giữa ngực/dưới cằm tạo thành hình trái tim
 */
(function() {
  'use strict';
  window.__CAT_DETECTORS__ = window.__CAT_DETECTORS__ || {};

  window.__CAT_DETECTORS__.heart = function(c) {
    const { W, H, isSkin, faceMaxY, faceCenterX, faceW, leftSideSkin, rightSideSkin } = c;
    if (leftSideSkin < 32 || rightSideSkin < 32) return false;

    let centerSkin = 0;
    const centerY1 = Math.max(0, Math.floor(faceMaxY - 4));
    const centerY2 = Math.min(H - 1, Math.floor(faceMaxY + 22));
    const centerX1 = Math.max(0, Math.floor(faceCenterX - faceW * 0.35));
    const centerX2 = Math.min(W - 1, Math.floor(faceCenterX + faceW * 0.35));

    for (let y = centerY1; y <= centerY2; y++) {
      for (let x = centerX1; x <= centerX2; x++) {
        if (isSkin[y * W + x]) centerSkin++;
      }
    }

    return centerSkin >= 32;
  };
})();
