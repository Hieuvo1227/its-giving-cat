/**
 * DETECTOR: SHH 🤫 (Mèo suỵt im lặng - đặt ngón tay lên môi)
 * Kích hoạt khi có ngón tay đặt thẳng trước môi và bàn tay đưa lên từ dưới cằm
 * Chống nhận diện nhầm khi người dùng chỉ ngồi bình thường
 */
(function() {
  'use strict';
  window.__CAT_DETECTORS__ = window.__CAT_DETECTORS__ || {};

  window.__CAT_DETECTORS__.shh = function(c) {
    const { W, H, isSkin, faceMinY, faceMaxY, faceH, faceCenterX, hasHandRaised } = c;
    if (hasHandRaised || faceH < 22) return false;

    // 1. Phải có bàn tay/cổ tay đưa lên ngay dưới cằm (khu vực trung tâm)
    let chinHandSkin = 0;
    const chinY1 = Math.floor(faceMaxY);
    const chinY2 = Math.min(H - 1, Math.floor(faceMaxY + 16));
    const midX = Math.floor(faceCenterX);

    for (let y = chinY1; y <= chinY2; y++) {
      for (let x = Math.max(0, midX - 8); x <= Math.min(W - 1, midX + 8); x++) {
        if (isSkin[y * W + x]) chinHandSkin++;
      }
    }
    // Không có bàn tay đưa lên dưới cằm -> không phải cử chỉ suỵt
    if (chinHandSkin < 25) return false;

    // 2. Ngón tay trỏ vươn dọc che qua vùng môi
    const mouthY1 = Math.floor(faceMinY + faceH * 0.60);
    const mouthY2 = Math.floor(faceMinY + faceH * 0.85);

    let fingerRows = 0;
    for (let y = mouthY1; y <= mouthY2; y++) {
      let centerSkin = 0;
      for (let x = Math.max(0, midX - 4); x <= Math.min(W - 1, midX + 4); x++) {
        if (isSkin[y * W + x]) centerSkin++;
      }
      if (centerSkin >= 3 && centerSkin <= 8) {
        fingerRows++;
      }
    }

    const totalRows = mouthY2 - mouthY1 + 1;
    return (fingerRows >= totalRows * 0.70);
  };
})();
