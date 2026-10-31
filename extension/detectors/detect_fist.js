/**
 * DETECTOR: FIST 😼 (Mèo giơ nắm đấm uy lực)
 * Kích hoạt khi giơ nắm đấm đặc, vuông vắn ở bên sườn
 */
(function() {
  'use strict';
  window.__CAT_DETECTORS__ = window.__CAT_DETECTORS__ || {};

  window.__CAT_DETECTORS__.fist = function(c) {
    const { hasHandRaised, handCount, handH, handW } = c;
    if (!hasHandRaised) return false;
    // Nắm đấm đặc, tỷ lệ vuông vắn, không có ngón cái nhô cao
    return (handCount >= 42 && handW >= 12 && handH >= 12 && (handW / Math.max(1, handH) >= 0.68));
  };
})();
