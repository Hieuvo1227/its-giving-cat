/**
 * DETECTOR: THINKING 🤔 (Mèo chống cằm suy ngẫm triết lý)
 * Kích hoạt khi có nắm tay tì dưới cằm
 * Chống nhận diện nhầm khi người dùng giơ cả bàn tay xòe che trước mặt/mắt
 */
(function() {
  'use strict';
  window.__CAT_DETECTORS__ = window.__CAT_DETECTORS__ || {};

  window.__CAT_DETECTORS__.thinking = function(c) {
    const { W, H, isSkin, faceMinY, faceMaxY, faceCenterX, faceW, faceH, hasHandRaised } = c;
    if (hasHandRaised || faceH < 20) return false;

    // 1. Kiểm tra xem có bàn tay xòe che kín dọc từ cằm lên mắt/trán không
    // Khi chống cằm thực thụ, mắt và trán hoàn toàn thông thoáng
    const midX = Math.floor(faceCenterX);
    let midVerticalSkin = 0;
    const checkY1 = Math.floor(faceMinY + faceH * 0.25);
    const checkY2 = Math.floor(faceMaxY + 8);

    for (let y = checkY1; y <= checkY2; y++) {
      if (isSkin[y * W + midX] || isSkin[y * W + Math.max(0, midX - 1)] || isSkin[y * W + Math.min(W - 1, midX + 1)]) {
        midVerticalSkin++;
      }
    }

    // Nếu có bàn tay che kín liên tục từ cằm lên tận mắt -> đang che mặt, KHÔNG PHẢI chống cằm
    if (midVerticalSkin >= (checkY2 - checkY1) * 0.85) {
      return false;
    }

    // 2. Kiểm tra nắm tay chống cằm to bè phình ngang dưới cằm
    const chinY1 = Math.max(0, faceMaxY - 3);
    const chinY2 = Math.min(H - 1, faceMaxY + 12);
    let chinSkinCount = 0;
    let chinMaxWidth = 0;

    for (let y = chinY1; y <= chinY2; y++) {
      let rowSkin = 0;
      for (let x = Math.max(0, Math.floor(faceCenterX - faceW * 0.50)); x <= Math.min(W - 1, Math.floor(faceCenterX + faceW * 0.50)); x++) {
        if (isSkin[y * W + x]) {
          chinSkinCount++;
          rowSkin++;
        }
      }
      if (rowSkin > chinMaxWidth) chinMaxWidth = rowSkin;
    }

    // Nắm tay chống cằm phải phình to gần bằng cả bề ngang khuôn mặt (>= 76% bề ngang mặt)
    return (chinMaxWidth >= faceW * 0.76 && chinSkinCount >= 75);
  };
})();
