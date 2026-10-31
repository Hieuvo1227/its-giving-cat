/**
 * DETECTOR: HUH 🌀 (Mèo HUH?! há miệng ngơ ngác)
 * Kích hoạt nhạy bén khi người dùng há miệng ngơ ngác (dù há vừa hay há to)
 * Tuyệt đối không kích hoạt khi ngậm miệng (bờ môi sáng màu luôn ngắt quãng chuỗi liên tục)
 */
(function() {
  'use strict';
  window.__CAT_DETECTORS__ = window.__CAT_DETECTORS__ || {};

  window.__CAT_DETECTORS__.huh = function(c) {
    const { W, data, faceMinY, faceH, faceW, faceCenterX, hasHandRaised, avgFaceLum } = c;
    if (hasHandRaised || faceH < 18 || faceW < 16) return false;

    // 1. Vùng giải phẫu khuôn miệng: từ dưới nhân trung (0.60) đến trên cằm (0.88)
    const mouthY1 = Math.floor(faceMinY + faceH * 0.60);
    const mouthY2 = Math.floor(faceMinY + faceH * 0.88);
    const midX = Math.floor(faceCenterX);

    // 2. Ngưỡng tối thích ứng chuẩn cho khoang miệng (tương quan với độ sáng da mặt)
    const baseLum = avgFaceLum || 85;
    const darkThresh = Math.max(34, Math.min(60, baseLum * 0.60));

    let maxVerticalGap = 0;
    let maxStreakPixels = 0;
    let currentStreak = 0;
    let currentStreakPixels = 0;

    for (let y = mouthY1; y <= mouthY2; y++) {
      let openCols = 0;
      // Quét 5 cột trung tâm của khuôn miệng để nhận diện ổn định ngay cả khi đầu hơi nghiêng
      for (let dx = -2; dx <= 2; dx++) {
        const col = Math.max(0, Math.min(W - 1, midX + dx));
        const idx = (y * W + col) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // Điểm mở miệng: khoang họng tối hoặc răng trắng lộ rõ trong miệng mở
        const isDarkCavity = (lum < darkThresh);
        const isTeeth = (Math.abs(r - g) <= 9 && Math.abs(g - b) <= 9 && lum >= darkThresh && lum < 185);

        if (isDarkCavity || isTeeth) {
          openCols++;
        }
      }

      // Hàng có ít nhất 2 cột thuộc khoang miệng mở
      if (openCols >= 2) {
        currentStreak++;
        currentStreakPixels += openCols;
        if (currentStreak > maxVerticalGap) {
          maxVerticalGap = currentStreak;
          maxStreakPixels = currentStreakPixels;
        }
      } else {
        currentStreak = 0;
        currentStreakPixels = 0;
      }
    }

    // Khi ngậm miệng: vệt kẽ môi chỉ cao tối đa 1 pixel (bờ môi dưới sáng màu sẽ lập tức ngắt streak)
    // Khi há miệng (HUH?!): khoang miệng mở liên tục từ 2 pixel trở lên và tổng số điểm mở trong chuỗi >= 5
    return (maxVerticalGap >= 2 && maxStreakPixels >= 5);
  };
})();
