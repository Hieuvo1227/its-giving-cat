/**
 * DETECTOR: CLOSE UP 👁️ (Mèo dí sát mặt trừng trừng)
 * Kích hoạt khi khuôn mặt thực sự dí cực sát và chiếm gần trọn khung hình webcam
 */
(function() {
  'use strict';
  window.__CAT_DETECTORS__ = window.__CAT_DETECTORS__ || {};

  window.__CAT_DETECTORS__.close_up = function(c) {
    // Chỉ kích hoạt khi mặt chiếm trên 85% chiều cao và 60% chiều rộng của camera
    return (c.faceH >= 80 && c.faceW >= 72 && c.totalSkin >= 5400);
  };
})();
