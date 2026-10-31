# 🐱 Meme Tracker AI (Cat Edition v2.0)

<div align="center">

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10+-00C7B7?style=for-the-badge&logo=google&logoColor=white)
![OpenCV](https://img.shields.io/badge/OpenCV-Computer_Vision-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)

**Thể hiện cảm xúc qua meme mèo thời gian thực từ Webcam của bạn!**  
*Tích hợp chuẩn hóa hình học phi tỷ lệ (Scale-Free) và Hiệu chuẩn khuôn mặt nghỉ cá nhân hóa ($Z$-Score).*

[Tính Năng](#-tính-năng-nổi-bật-v20) • [Cơ Chế AI](#-cơ-chế-nhận-diện-toán-học-v20) • [Cách Sử Dụng](#-cách-sử-dụng) • [Bảng Cử Chỉ](#-danh-sách-11-cử-chỉ--meme) • [Chrome Extension](#-tích-hợp-google-meet-chrome-extension)

</div>

---

## 🌟 Tính Năng Nổi Bật (v2.0)

1. **Hiệu chuẩn Khuôn mặt Nghỉ Cá nhân hóa (Personalized $Z$-Score Baseline)**:
   - Mỗi người có hình dáng miệng, góc mắt và tư thế ngồi nghỉ hoàn toàn khác nhau.
   - Nút **"🎯 Hiệu chuẩn (3s)"** (hoặc phím `c` trên Python) thu thập 3 giây trạng thái thả lỏng tự nhiên để tính giá trị trung bình ($\mu$) và độ lệch chuẩn ($\sigma$).
   - Mọi biểu cảm được tính theo độ lệch chuẩn: $Z = \frac{\text{Giá trị} - \mu}{\sigma}$. Triệt tiêu hoàn toàn hiện tượng kích hoạt nhầm hoặc làm mãi không nhận.
   - Tự động lưu cấu hình hiệu chuẩn vào `localStorage` (trên Web) hoặc `calibration.json` (trên Desktop).

2. **Chuẩn hóa Hình học Phi Tỷ lệ (Scale-Free Normalization)**:
   - Tất cả khoảng cách cử chỉ (tay chạm môi, chống cằm, xoa đầu, chắp tay trái tim) đều được chia cho **bề rộng khuôn mặt (`face_width`)**.
   - Hoạt động ổn định và chính xác ở mọi cự ly: từ ngồi sát màn hình 30cm đến lùi xa 1.5m.

3. **Bộ đệm Chống Rung & Giữ Khung Hình (Hysteresis & Hold Duration)**:
   - Tích hợp bộ đếm `ARM` (3–4 khung hình kích hoạt) kết hợp `HOLD_DURATION` (giữ meme tối thiểu 8 khung hình).
   - Loại bỏ triệt để hiện tượng meme bị giật/nhấp nháy khi bạn chớp mắt hoặc nói chuyện bình thường.

4. **3 Chế Độ Triển Khai Linh Hoạt**:
   - 🌐 **Web App thuần**: Chạy ngay trên trình duyệt qua file `index.html`, không cần cài đặt môi trường.
   - 🖥️ **Python Native App**: Chạy trực tiếp qua OpenCV + MediaPipe trên máy tính.
   - 🧩 **Chrome Extension**: Chặn luồng camera và đưa ảnh meme vào góc màn hình khi họp Google Meet.

---

## 🔬 Cơ Chế Nhận Diện Toán Học (v2.0)

```
Webcam Frame
     │
 1. MediaPipe Tasks  ──>  Face Mesh (468 landmarks) + Hands (2 x 21 landmarks)
     │
 2. Scale-Free Unit  ──>  fw = dist(cheek_left, cheek_right)
                          fh = dist(forehead, chin)
                          near(ptA, ptB, k) <=> dist(ptA, ptB) < k * fw
     │
 3. Baseline Z-Score ──>  Z_mar  = (mar - μ_mar) / σ_mar
                          Z_turn = (turn - μ_turn) / σ_turn
                          Z_tilt = (tilt - μ_tilt) / σ_tilt
     │
 4. Priority Tree    ──>  1. Hand Gestures (Heart -> Head Pat -> Shh -> Chin -> Pointing -> Like -> Fist)
                          2. Facial Expressions (Close-up -> Huh?! [Z >= 3.8] -> The Rock [|Z| >= 3.5])
     │
 5. Hysteresis Hold  ──>  Arm candidate >= 3 frames -> Fire -> Hold 8 frames
```

---

## 🎭 Danh Sách 11 Cử Chỉ & Meme

| STT | Cử chỉ / Biểu cảm | Hành động thực hiện | Meme Mèo tương ứng |
| :---: | :--- | :--- | :--- |
| `01` | **Nhìn thẳng tự nhiên** | Nhìn vào camera, miệng khép thư giãn | 🌿 Camera thật (Không hiện meme) |
| `02` | **Há to miệng ngơ ngác** | Há miệng kiểu "HUH?!" não đang buffering | 🌀 Mèo load não ngơ ngác (`cat_loading.png`) |
| `03` | **Giơ tay Like 👍** | 4 ngón tay gập, ngón cái vươn cao | 👍 Mèo khóc like kiên cường (`cat_thumbsup.png`) |
| `04` | **Chắp tay hình trái tim 🫶** | 2 bàn tay chụm ngón trỏ và ngón cái | 💖 Mèo má hồng ngập tràn yêu thương (`cat_heart.png`) |
| `05` | **Suỵt im lặng 🤫** | 1 ngón trỏ đặt lên môi hoặc chóp mũi | 🤫 Mèo suỵt bí mật (`cat_shh.png`) |
| `06` | **Chống cằm suy ngẫm** | Bàn tay nâng dưới cằm triết lý | 🤔 Mèo suy tư về cuộc đời (`cat_thinking_chin.png`) |
| `07` | **Chỉ ngón trỏ ngại ngùng** | 1 ngón trỏ chỉ lên hoặc chỉ về trước 👉👈 | 🥺 Mèo "Dạ em..." (`cat_pointing.png`) |
| `08` | **Nắm đấm giơ lên 😼** | Cả bàn tay nắm chặt giơ trước mặt | 😼 Mèo thách thức khệnh khạng (`cat_smug_fist.png`) |
| `09` | **Xoa đầu / vò đầu 😨** | Đặt lòng bàn tay lên đỉnh trán/đầu | 😨 Mèo hoảng hốt cắn tay (`cat_shocked.png`) |
| `10` | **Ghé sát mặt camera 👁️** | Đưa mặt lại rất gần ống kính | 👁️ Mèo dí sát mặt cười trừng trừng (`cat_cursed_stare.png`) |
| `11` | **Liếc mắt / Nghiêng đầu** | Nghiêng đầu hoặc liếc mắt kiểu The Rock | 🤨 Mèo nhướn mày phán xét (`cat_eyebrow.png`) |

---

## 🚀 Cách Sử Dụng

### Cách 1: Web App Trực Tiếp (Khuyên dùng - Không cần cài đặt)
1. Mở file `index.html` bằng trình duyệt Chrome, Edge, Brave hoặc Firefox.
2. Bấm nút **"Bật Camera"** và cấp quyền webcam.
3. Bấm nút **"🎯 Hiệu chuẩn (3s)"** trên thanh Header, ngồi thẳng nhìn vào camera trong 3 giây để hệ thống học khuôn mặt bạn.
4. Thử các cử chỉ trước ống kính và xem meme xuất hiện tức thì!

### Cách 2: Chạy Python Desktop (OpenCV Native)
Yêu cầu Python 3.9+:
```bash
# 1. Cài đặt thư viện phụ thuộc
pip install -r requirements.txt

# 2. Khởi chạy ứng dụng
python main.py

# (Tùy chọn) Chạy riêng bước hiệu chuẩn:
python main.py --calibrate
```

**Phím tắt khi chạy Python:**
- `c`: Khởi động tiến trình hiệu chuẩn khuôn mặt (4 giây).
- `q` hoặc `ESC`: Thoát ứng dụng.

---

## 🧩 Tích Hợp Google Meet (Chrome Extension)

Thư mục `extension/` chứa tiện ích mở rộng chạy trực tiếp trên Google Meet:
1. Mở Chrome/Edge, vào `chrome://extensions/`.
2. Bật **"Chế độ dành cho nhà phát triển" (Developer mode)** ở góc trên bên phải.
3. Chọn **"Tải tiện ích đã giải nén" (Load unpacked)** $\to$ Chọn thư mục `d:\Page\extension`.
4. Tham gia cuộc họp Google Meet: Ảnh meme mèo sẽ tự động hiển thị gọn gàng ở góc dưới bên trái webcam của bạn khi bạn làm cử chỉ!

---

## 📁 Cấu Trúc Thư Mục

```
.
├── assets/                  # 12 file ảnh biểu cảm Mèo Meme chất lượng cao
├── extension/               # Chrome Extension tích hợp cho Google Meet
│   ├── detectors/           # Các module nhận diện cử chỉ riêng biệt
│   ├── inject.js            # Engine xử lý can thiệp getUserMedia trong Google Meet
│   └── manifest.json        # Manifest V3
├── index.html               # Giao diện Web App Dual-Window OpenCV Style
├── app.js                   # Engine nhận diện Web (MediaPipe + Calibration Z-Score)
├── style.css                # Giao diện Cyberpunk Glassmorphism hiện đại
├── main.py                  # Ứng dụng Python Desktop chạy bằng OpenCV
├── requirements.txt         # Thư viện phụ thuộc cho Python
└── .gitignore               # Cấu hình bỏ qua các file tạm và calibration.json
```

---

## 📄 License

Dự án phát hành dưới giấy phép [MIT License](LICENSE). Tự do sử dụng, chỉnh sửa và chia sẻ cho mục đích cá nhân hoặc cộng đồng!
