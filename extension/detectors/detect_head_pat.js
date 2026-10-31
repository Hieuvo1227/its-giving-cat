/**
 * DETECTOR: HEAD PAT 😨 (Mèo hoảng hốt cắn tay khi xoa đầu)
 * Kích hoạt khi có bàn tay đặt ngay trên đỉnh đầu (vương miện trung tâm)
 * Chống nhận diện nhầm khi giơ ngón tay LIKE ở bên sườn
 */
(function() {
  'use strict';
  window.__CAT_DETECTORS__ = window.__CAT_DETECTORS__ || {};

  window.__CAT_DETECTORS__.head_pat = function(c) {
    const { W, isSkin, faceMinY, faceCenterX, faceW, handMinY } = c;

    // Bàn tay xoa đầu phải đặt ngay trên đỉnh đầu (khu vực vương miện trung tâm)
    const crownX1 = Math.max(0, Math.floor(faceCenterX - faceW * 0.25));
    const crownX2 = Math.min(W - 1, Math.floor(faceCenterX + faceW * 0.25));
    const topCutY = Math.max(0, faceMinY - 1);

    if (topCutY < 2) return false;

    let crownSkin = 0;
    for (let y = 0; y <= topCutY; y++) {
      for (let x = crownX1; x <= crownX2; x++) {
        if (isSkin[y * W + x]) crownSkin++;
      }
    }

    // Bàn tay vò đầu: có da tập trung ngay trên đỉnh đầu trung tâm
    return (crownSkin >= 22 && (handMinY === undefined || handMinY <= 12));
  };
})();
