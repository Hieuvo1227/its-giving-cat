/**
 * DETECTOR: SIDE LOOK 🤨 (Mèo nhướn mày The Rock dò xét)
 * Kích hoạt khi nghiêng đầu rõ rệt (Head Tilt) hoặc quay mặt sang bên
 * Tuyệt đối không nhận nhầm khi nhìn thẳng (dù tóc rẽ ngôi hay phòng có đèn chiếu lệch một bên)
 */
(function() {
  'use strict';
  window.__CAT_DETECTORS__ = window.__CAT_DETECTORS__ || {};

  window.__CAT_DETECTORS__.side_look = function(c) {
    const { hasHandRaised, faceH, faceW, headTilt, asymmetry, leftCheek, rightCheek } = c;
    if (hasHandRaised || faceH < 20 || faceW < 16) return false;

    // 1. Nghiêng đầu The Rock rõ rệt: đỉnh trán và cằm lệch góc nhau ít nhất 6.5 pixel
    if (headTilt !== undefined && headTilt >= 6.5) {
      return true;
    }

    // 2. Quay hẳn mặt sang bên: mất hoàn toàn một bên má và lệch khung da lớn
    if (leftCheek !== rightCheek && asymmetry >= 24) {
      return true;
    }

    return false;
  };
})();
