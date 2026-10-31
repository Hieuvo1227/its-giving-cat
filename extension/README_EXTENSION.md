# 🐱 Hướng Dẫn Cài Đặt Cat Meme Cam Cho Google Meet

Tiện ích mở rộng (Chrome Extension) giúp biến webcam của bạn trên Google Meet thành bộ lọc AR Cat Meme thông minh theo thời gian thực!

---

## 🌟 Bảng Phân Tách Cử Chỉ & Biểu Cảm (Độc Lập 100% - Không Bao Giờ Trùng)

Mỗi biểu cảm meme mèo tương ứng với một vùng hành động cơ thể hoàn toàn khác nhau, đảm bảo **không bao giờ bị nhận nhầm hay chồng chéo lên nhau**:

| Nhóm | Biểu cảm Meme | File Detector | Cử chỉ kích hoạt chuẩn | Cơ chế chống nhầm lẫn |
|---|---|---|---|---|
| **Khuôn mặt** | 🌀 **Mèo HUH?!** | [`detect_huh.js`](file:///d:/Page/extension/detectors/detect_huh.js) | **Há to miệng ngơ ngác** | Nhận diện khoang miệng đa thành phần (răng, lưỡi hồng, họng tối) với khoảng hở dọc $\ge 5\text{px}$. Ngậm miệng (dù có bóng môi) chỉ đạt $1-2\text{px}$. |
| **Khuôn mặt** | 🤨 **The Rock** | [`detect_side_look.js`](file:///d:/Page/extension/detectors/detect_side_look.js) | **Nghiêng hẳn đầu sang bên** | Đo góc nghiêng trục trán-cằm (`headTilt >= 6.5`). Nhìn thẳng mở to mắt có `headTilt <= 2`, tuyệt đối không bao giờ bị kích hoạt nhầm. |
| **Khuôn mặt** | 👁️ **Dí sát mặt** | [`detect_close_up.js`](file:///d:/Page/extension/detectors/detect_close_up.js) | **Mặt dí cực sát camera** | Chỉ kích hoạt khi khuôn mặt chiếm $> 85\%$ chiều cao camera và $> 72\%$ chiều ngang. |
| **1 tay bên sườn** | 👍 **Giơ LIKE** | [`detect_thumbs_up.js`](file:///d:/Page/extension/detectors/detect_thumbs_up.js) | **Giơ ngón cái LIKE bên sườn** | Bàn tay bên sườn có ngón cái chĩa lên thon dài. Được ưu tiên kiểm tra trước xoa đầu. |
| **1 tay bên sườn** | 😼 **Nắm đấm** | [`detect_fist.js`](file:///d:/Page/extension/detectors/detect_fist.js) | **Nắm chặt bàn tay bên sườn** | Bàn tay bên sườn đặc, tỷ lệ vuông vắn, không có ngón cái nhô lên. |
| **1 tay trên đầu** | 😨 **Xoa đầu** | [`detect_head_pat.js`](file:///d:/Page/extension/detectors/detect_head_pat.js) | **Bàn tay đặt lên đỉnh đầu** | Bàn tay đặt ngay trên đỉnh đầu trung tâm (vương miện tóc). Giơ ngón cái bên sườn không bao giờ bị tính vào đây. |
| **1 tay trước mặt** | 🤫 **Suỵt im lặng** | [`detect_shh.js`](file:///d:/Page/extension/detectors/detect_shh.js) | **1 ngón tay dọc che môi** | Ngón tay đơn đặt dọc trước môi, mắt và trán hoàn toàn thông thoáng. |
| **1 tay dưới hàm** | 🤔 **Chống cằm** | [`detect_thinking.js`](file:///d:/Page/extension/detectors/detect_thinking.js) | **Nắm tay tì dưới cằm** | Nắm tay to phình ngang dưới cằm. Nếu xòe bàn tay che kín mắt/mặt sẽ bị loại bỏ ngay. |
| **2 bàn tay** | 🫶 **Trái tim** | [`detect_heart.js`](file:///d:/Page/extension/detectors/detect_heart.js) | **2 tay chụm trái tim trước ngực** | Cả 2 tay giơ lên và tạo thành một cụm da to ở giữa ngực. |
| **2 bàn tay** | 👉👈 **Chỉ tay** | [`detect_pointing.js`](file:///d:/Page/extension/detectors/detect_pointing.js) | **2 ngón trỏ chạm nhau** | 2 tay giơ lên và chỉ chạm 2 đầu ngón tay ở giữa (mảnh, không dính cụm to như trái tim). |
| **Trạng thái nghỉ**| 🌿 **Tự nhiên** | Mặc định | **Nhìn thẳng bình thường** | Hiển thị webcam thật 100%, không hiện ảnh mèo. |

---

## 🚀 Cách Cập Nhật Trình Duyệt Ngay Lập Tức
1. Mở trang quản lý tiện ích: `chrome://extensions/`
2. Bấm nút **Reload (biểu tượng xoay tròn 🔄)** tại tiện ích **Cat Meme Cam for Google Meet**.
3. Quay lại Google Meet ([https://meet.google.com/qjf-scxg-pbw](https://meet.google.com/qjf-scxg-pbw)) và nhấn **F5**!
