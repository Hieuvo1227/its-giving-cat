/**
 * DETECTOR: THUMBS UP 👍 (Mèo khóc giơ like kiên cường)
 * Kích hoạt khi giơ ngón tay cái lên ở bên sườn
 */
(function() {
  'use strict';
  window.__CAT_DETECTORS__ = window.__CAT_DETECTORS__ || {};

  window.__CAT_DETECTORS__.thumbs_up = function(c) {
    const { hasHandRaised, handCount, handH, handMinY, handMaxY, handMinX, handMaxX, faceMaxY, isSkin, W } = c;
    if (!hasHandRaised || handCount < 25) return false;
    if (handH < 14 || handMinY > faceMaxY + 16) return false;

    const thumbYCut = handMinY + Math.max(3, Math.floor(handH * 0.38));
    const palmYCut = handMinY + Math.floor(handH * 0.44);

    let thumbSkin = 0;
    let palmSkin = 0;
    for (let y = handMinY; y <= thumbYCut; y++) {
      for (let x = handMinX; x <= handMaxX; x++) {
        if (isSkin[y * W + x]) thumbSkin++;
      }
    }
    for (let y = palmYCut; y <= handMaxY; y++) {
      for (let x = handMinX; x <= handMaxX; x++) {
        if (isSkin[y * W + x]) palmSkin++;
      }
    }

    const thumbWidth = thumbSkin / Math.max(1, thumbYCut - handMinY + 1);
    const palmWidth = palmSkin / Math.max(1, handMaxY - palmYCut + 1);

    // Ngón cái chĩa lên thon gọn hơn lòng bàn tay
    return (thumbSkin >= 4 && palmSkin >= 14 && thumbWidth <= palmWidth * 0.95);
  };
})();
