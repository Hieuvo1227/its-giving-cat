"""
Dự án: CAT MEME TRACKER - Camera & Gesture Tracking
Sử dụng: OpenCV + MediaPipe (Hands & Face Mesh)
Hiển thị: 2 cửa sổ song song ("Camera" và "Meme Companion")
"""

import cv2
import mediapipe as mp
import numpy as np
import os
import math
import time
import json
import argparse

CALIB_FILE = os.path.join(os.path.dirname(__file__), "calibration.json")

# 1. CẤU HÌNH & KHỞI TẠO BỘ ẢNH MÈO MEME
# ==============================================================================
ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")

STATES = [
    "neutral",     # Nhìn thẳng tự nhiên (Webcam thật - Môi nằm thẳng)
    "huh",         # Mèo HUH?! (há to miệng ngơ ngác)
    "thumbs_up",   # Mèo khóc giơ tay LIKE kiên cường 👍
    "heart",       # Mèo má hồng yêu thương (Tay hình trái tim 🫶)
    "shh",         # Mèo suỵt im lặng 🤫
    "thinking",    # Mèo chống cằm suy ngẫm triết lý 🤔
    "fist",        # Mèo giơ nắm đấm khệnh khạng 😼
    "pointing",    # Mèo chỉ ngón tay ngại ngùng 👉👈
    "head_pat",    # Mèo hoảng hốt khi bị xoa đầu 😨
    "close_up",    # Mèo dí sát mặt cười trừng trừng 👁️
    "side_look"    # Mèo nhướn mày nghi ngờ kiểu The Rock 🤨
]

CAT_MEME_MAP = {
    "neutral": "cat_goblin.png",
    "huh": "cat_loading.png",
    "thumbs_up": "cat_thumbsup.png",
    "heart": "cat_heart.png",
    "shh": "cat_shh.png",
    "thinking": "cat_thinking_chin.png",
    "fist": "cat_smug_fist.png",
    "pointing": "cat_pointing.png",
    "head_pat": "cat_shocked.png",
    "close_up": "cat_cursed_stare.png",
    "side_look": "cat_eyebrow.png"
}

MEME_IMAGES = {}
TARGET_SIZE = (600, 600)

def load_or_create_fallback_image(state_name):
    cat_file = CAT_MEME_MAP.get(state_name)
    if cat_file:
        cat_path = os.path.join(ASSETS_DIR, cat_file)
        if os.path.exists(cat_path):
            img = cv2.imread(cat_path)
            if img is not None:
                return cv2.resize(img, TARGET_SIZE)

    for ext in [".png", ".jpg", ".jpeg"]:
        img_path = os.path.join(ASSETS_DIR, f"{state_name}{ext}")
        if os.path.exists(img_path):
            img = cv2.imread(img_path)
            if img is not None:
                return cv2.resize(img, TARGET_SIZE)

    blank = np.zeros((TARGET_SIZE[1], TARGET_SIZE[0], 3), dtype=np.uint8)
    blank[:] = (28, 25, 23)
    cv2.putText(blank, f"CAT MEME: {state_name.upper()}", (30, 280),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 242, 254), 2, cv2.LINE_AA)
    return blank

for state in STATES:
    MEME_IMAGES[state] = load_or_create_fallback_image(state)

# ==============================================================================
# 2. KHỞI TẠO CÁC MÔ HÌNH MEDIAPIPE
# ==============================================================================
mp_hands = mp.solutions.hands
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

hands_detector = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.65,
    min_tracking_confidence=0.65
)

face_detector = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

# ==============================================================================
# 3. HỆ THỐNG HIỆU CHUẨN CÁ NHÂN HÓA (BASELINE & Z-SCORE ENGINE)
# ==============================================================================
class Baseline:
    """Lưu trữ chỉ số khuôn mặt ở trạng thái nghỉ: Mean và Standard Deviation (Sigma)"""
    def __init__(self, mean=None, sigma=None, samples=0, made=None):
        self.mean = mean or {"mar": 0.05, "ear": 0.30, "turn": 0.0, "tilt": 0.0, "face_width": 0.28}
        self.sigma = sigma or {"mar": 0.02, "ear": 0.03, "turn": 0.02, "tilt": 3.0, "face_width": 0.03}
        self.samples = samples
        self.made = made
        self.generic = (mean is None)

    def z(self, key, val):
        floor = {"mar": 0.012, "ear": 0.015, "turn": 0.015, "tilt": 2.0}.get(key, 0.02)
        m = self.mean.get(key, 0.0)
        s = max(self.sigma.get(key, 0.03), floor)
        z_score = (val - m) / s
        return max(-8.0, min(8.0, z_score))

    def save(self, path):
        with open(path, "w", encoding="utf-8") as f:
            json.dump({
                "mean": self.mean,
                "sigma": self.sigma,
                "samples": self.samples,
                "made": self.made
            }, f, indent=2)

    @staticmethod
    def load(path):
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    d = json.load(f)
                    if d.get("mean") and d.get("sigma"):
                        return Baseline(d["mean"], d["sigma"], d.get("samples", 0), d.get("made"))
            except Exception as e:
                print(f"[CẢNH BÁO] Không thể nạp {path}: {e}")
        return Baseline()

# ==============================================================================
# 4. CÁC HÀM TOÁN HỌC & NHẬN DIỆN CỬ CHỈ PHI TỶ LỆ (SCALE-FREE)
# ==============================================================================
def distance_2d(p1, p2):
    return math.hypot(p1.x - p2.x, p1.y - p2.y)

def is_near(p1, p2, ratio, face_w):
    fw = face_w if (face_w and face_w > 0.05) else 0.28
    return distance_2d(p1, p2) < ratio * fw

def finger_extended(pts, tip_idx, pip_idx, mcp_idx):
    wrist = pts[0]
    d_tip = distance_2d(wrist, pts[tip_idx])
    d_pip = distance_2d(wrist, pts[pip_idx])
    d_mcp = distance_2d(wrist, pts[mcp_idx])
    return d_tip > d_pip and d_pip > d_mcp * 0.95

def finger_folded(pts, tip_idx, pip_idx, mcp_idx):
    wrist = pts[0]
    d_tip = distance_2d(wrist, pts[tip_idx])
    d_pip = distance_2d(wrist, pts[pip_idx])
    d_mcp = distance_2d(pts[tip_idx], pts[mcp_idx])
    d_pip_mcp = distance_2d(pts[pip_idx], pts[mcp_idx])
    return (d_tip < d_pip * 1.05) or (d_mcp < d_pip_mcp * 1.15)

def is_thumbs_up(pts):
    """Giơ ngón cái làm hình LIKE: 4 ngón gập, ngón cái duỗi vươn cao."""
    index_folded = finger_folded(pts, 8, 6, 5)
    middle_folded = finger_folded(pts, 12, 10, 9)
    ring_folded = finger_folded(pts, 16, 14, 13)
    pinky_folded = finger_folded(pts, 20, 18, 17)

    if not (index_folded and middle_folded and ring_folded and pinky_folded):
        return False

    thumb_up = pts[4].y < pts[3].y and pts[3].y < pts[2].y
    thumb_above_knuckle = pts[4].y < pts[5].y - 0.04
    thumb_above_wrist = pts[4].y < pts[0].y - 0.08
    thumb_extended = distance_2d(pts[4], pts[2]) > distance_2d(pts[3], pts[2]) * 1.18

    return thumb_up and thumb_above_knuckle and thumb_above_wrist and thumb_extended

def is_fist(pts):
    """Nắm đấm: Cả 4 ngón gập, ngón cái gập không nhô cao như LIKE."""
    index_folded = finger_folded(pts, 8, 6, 5)
    middle_folded = finger_folded(pts, 12, 10, 9)
    ring_folded = finger_folded(pts, 16, 14, 13)
    pinky_folded = finger_folded(pts, 20, 18, 17)

    if not (index_folded and middle_folded and ring_folded and pinky_folded):
        return False

    thumb_sticking_up = pts[4].y < pts[5].y - 0.025
    return not thumb_sticking_up

def is_shh(hand_pts, face_pts, face_w):
    """Suỵt 🤫: Chỉ ngón trỏ duỗi đặt sát môi hoặc chóp mũi (Scale-free theo Face Width)."""
    index_up = finger_extended(hand_pts, 8, 6, 5)
    middle_folded = not finger_extended(hand_pts, 12, 10, 9)
    ring_folded = not finger_extended(hand_pts, 16, 14, 13)
    pinky_folded = not finger_extended(hand_pts, 20, 18, 17)

    if not (index_up and middle_folded and ring_folded and pinky_folded):
        return False

    return is_near(hand_pts[8], face_pts[13], 0.28, face_w) or is_near(hand_pts[8], face_pts[1], 0.28, face_w)

def is_chin_rest(hand_pts, face_pts, face_w, face_h):
    """Chống cằm 🤔: Bàn tay chống dưới cằm (152)."""
    chin = face_pts[152]
    min_dist = min(
        distance_2d(hand_pts[0], chin),
        distance_2d(hand_pts[5], chin),
        distance_2d(hand_pts[8], chin),
        distance_2d(hand_pts[9], chin),
        distance_2d(hand_pts[4], chin)
    )
    hand_under_chin = hand_pts[0].y >= chin.y - 0.12 * face_h
    return min_dist < 0.32 * face_w and hand_under_chin

def is_head_pat(hand_pts, face_pts, face_w, face_h):
    """Xoa đầu 😨: Bàn tay đặt lên đỉnh trán/đầu."""
    forehead = face_pts[10]
    min_hand_y = min(p.y for p in hand_pts)
    near_top = (min_hand_y <= forehead.y + 0.15 * face_h) or distance_2d(hand_pts[0], forehead) < 0.42 * face_w
    horiz_aligned = abs(hand_pts[0].x - forehead.x) < 0.55 * face_w
    return near_top and horiz_aligned

def is_pointing(hand_pts, face_pts, face_w):
    """Chỉ ngón trỏ 👉👈: Ngón trỏ duỗi, cách xa vùng môi miệng."""
    index_up = finger_extended(hand_pts, 8, 6, 5)
    middle_folded = not finger_extended(hand_pts, 12, 10, 9)
    ring_folded = not finger_extended(hand_pts, 16, 14, 13)
    pinky_folded = not finger_extended(hand_pts, 20, 18, 17)

    if not (index_up and middle_folded and ring_folded and pinky_folded):
        return False

    if face_pts:
        if is_near(hand_pts[8], face_pts[13], 0.30, face_w):
            return False
    return True

def is_heart_shape(hand_pts, all_hands=None, face_w=0.28):
    """Tay làm thành hình trái tim 🫶."""
    fw = face_w if face_w else 0.28
    if all_hands is not None and len(all_hands) >= 2:
        h1 = all_hands[0].landmark
        h2 = all_hands[1].landmark
        dist_thumbs = distance_2d(h1[4], h2[4])
        dist_index = distance_2d(h1[8], h2[8])
        if dist_thumbs < 0.42 * fw and dist_index < 0.42 * fw:
            return True
    if hand_pts:
        dist_thumb_index = distance_2d(hand_pts[4], hand_pts[8])
        middle_folded = not finger_extended(hand_pts, 12, 10, 9)
        ring_folded = not finger_extended(hand_pts, 16, 14, 13)
        pinky_folded = not finger_extended(hand_pts, 20, 18, 17)
        if dist_thumb_index < 0.22 * fw and middle_folded and ring_folded and pinky_folded:
            return True
    return False

def compute_metrics(face_pts):
    """Tính các thông số hình học và độ lệch chuẩn của khuôn mặt."""
    if not face_pts:
        return 0.28, 0.35, 0.05, 0.30, 0.0, 0.0

    face_w = distance_2d(face_pts[234], face_pts[454])
    face_h = distance_2d(face_pts[10], face_pts[152])

    mouth_dist = distance_2d(face_pts[13], face_pts[14])
    mouth_width = distance_2d(face_pts[61], face_pts[291]) + 1e-6
    mar = mouth_dist / mouth_width

    left_v = distance_2d(face_pts[159], face_pts[145])
    left_h = distance_2d(face_pts[33], face_pts[133]) + 1e-6
    right_v = distance_2d(face_pts[386], face_pts[374])
    right_h = distance_2d(face_pts[263], face_pts[362]) + 1e-6
    ear = (left_v / left_h + right_v / right_h) / 2.0

    cl = face_pts[234]
    cr = face_pts[454]
    nose = face_pts[1]
    span = max(cr.x - cl.x, 0.001)
    turn_signed = (nose.x - cl.x) / span - 0.5

    dy = face_pts[263].y - face_pts[33].y
    dx = face_pts[263].x - face_pts[33].x
    tilt_deg = abs(math.atan2(dy, dx) * 180 / math.pi)

    return face_w, face_h, mar, ear, turn_signed, tilt_deg

def classify_state(hand_landmarks, face_landmarks, all_hands=None, base=None):
    """Phân loại cử chỉ và biểu cảm dựa trên Z-Score và khoảng cách phi tỷ lệ."""
    if base is None:
        base = Baseline()

    has_hand = hand_landmarks is not None
    has_face = face_landmarks is not None

    hand_pts = hand_landmarks.landmark if has_hand else None
    face_pts = face_landmarks.landmark if has_face else None

    face_w, face_h, mar, ear, turn_signed, tilt_deg = compute_metrics(face_pts)

    z_mar = base.z("mar", mar)
    z_turn = base.z("turn", turn_signed)
    z_tilt = base.z("tilt", tilt_deg)

    meta = {
        "face_w": face_w,
        "mar": mar,
        "z_mar": z_mar,
        "turn": turn_signed,
        "z_turn": z_turn,
        "tilt": tilt_deg
    }

    # 1. CỬ CHỈ TAY (ƯU TIÊN CAO NHẤT)
    if is_heart_shape(hand_pts, all_hands, face_w):
        return "heart", meta

    if has_hand:
        if has_face and is_head_pat(hand_pts, face_pts, face_w, face_h):
            return "head_pat", meta

        if has_face and is_shh(hand_pts, face_pts, face_w):
            return "shh", meta

        if has_face and is_chin_rest(hand_pts, face_pts, face_w, face_h):
            return "thinking", meta

        if is_pointing(hand_pts, face_pts, face_w):
            return "pointing", meta

        if is_thumbs_up(hand_pts):
            return "thumbs_up", meta

        if is_fist(hand_pts):
            return "fist", meta

    # 2. BIỂU CẢM KHUÔN MẶT (Z-SCORE CÁ NHÂN HÓA)
    if has_face:
        # Ghé sát mặt vào ống kính (so với kích thước mặt lúc hiệu chuẩn)
        base_w = base.mean.get("face_width", 0.28)
        if (not base.generic and face_w / base_w > 1.40) or (base.generic and face_w > 0.42):
            return "close_up", meta

        # Há miệng: Huh?! (Z-Score >= 3.8 sigma và độ mở tối thiểu 0.16)
        if (z_mar >= 3.8 and mar >= 0.16) or (mar > 0.22):
            return "huh", meta

        # Liếc nhìn / Nghiêng đầu The Rock
        if (abs(z_turn) >= 3.5 and abs(turn_signed) >= 0.08) or \
           (abs(z_tilt) >= 3.2 and tilt_deg >= 12.0) or \
           abs(turn_signed) > 0.16 or tilt_deg > 16.0:
            return "side_look", meta

    return "neutral", meta

# ==============================================================================
# 5. TIẾN TRÌNH HIỆU CHUẨN (CALIBRATION PROCEDURE)
# ==============================================================================
def run_calibration(cap, base_file=CALIB_FILE, duration_sec=4.0):
    """Ghi nhận khuôn mặt thư giãn trong 4s và tạo hồ sơ Z-Score cá nhân hóa."""
    print("\n" + "="*60)
    print(" BẮT ĐẦU HIỆU CHUẨN KHUÔN MẶT CÁ NHÂN (CALIBRATION)")
    print(" Hãy nhìn thẳng vào camera, giữ mặt thư giãn tự nhiên.")
    print(" Không nói chuyện, không cười, chớp mắt bình thường.")
    print("="*60 + "\n")

    start_time = time.time()
    sums = {"mar": 0.0, "ear": 0.0, "turn": 0.0, "tilt": 0.0, "face_width": 0.0}
    sq_sums = {"mar": 0.0, "ear": 0.0, "turn": 0.0, "tilt": 0.0, "face_width": 0.0}
    sample_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        face_res = face_detector.process(rgb)
        elapsed = time.time() - start_time
        remaining = max(0.0, duration_sec - elapsed)

        if face_res.multi_face_landmarks:
            pts = face_res.multi_face_landmarks[0].landmark
            if elapsed > 0.5:  # Bỏ qua 0.5s warmup đầu
                face_w, face_h, mar, ear, turn_s, tilt = compute_metrics(pts)
                sample_count += 1
                curr = {"mar": mar, "ear": ear, "turn": turn_s, "tilt": tilt, "face_width": face_w}
                for k in sums:
                    sums[k] += curr[k]
                    sq_sums[k] += curr[k] * curr[k]

            # Vẽ khung ngắm
            x0 = int(min(p.x for p in pts) * w) - 10
            x1 = int(max(p.x for p in pts) * w) + 10
            y0 = int(min(p.y for p in pts) * h) - 10
            y1 = int(max(p.y for p in pts) * h) + 10
            cv2.rectangle(frame, (x0, y0), (x1, y1), (0, 230, 118), 2)

        # Thanh tiến trình
        pct = min(1.0, elapsed / duration_sec)
        bar_w = int(w * pct)
        cv2.rectangle(frame, (0, 0), (w, 75), (15, 17, 21), -1)
        cv2.rectangle(frame, (0, 70), (bar_w, 75), (0, 242, 254), -1)
        cv2.putText(frame, f"CALIBRATING... {remaining:.1f}s | Samples: {sample_count}",
                    (20, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 242, 254), 2, cv2.LINE_AA)
        cv2.putText(frame, "Hold a relaxed natural face (Don't smile or talk)",
                    (20, 58), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (200, 200, 200), 1, cv2.LINE_AA)

        cv2.imshow("Camera", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27:
            print("Đã hủy hiệu chuẩn.")
            return None

        if elapsed >= duration_sec:
            break

    if sample_count < 25:
        print("[LỖI] Không đủ mẫu hiệu chuẩn. Vui lòng thử lại!")
        return None

    mean = {}
    sigma = {}
    floors = {"mar": 0.012, "ear": 0.015, "turn": 0.015, "tilt": 2.0, "face_width": 0.015}
    ceils = {"mar": 0.06, "ear": 0.08, "turn": 0.08, "tilt": 10.0, "face_width": 0.08}

    for k in sums:
        m = sums[k] / sample_count
        var = max(0.0, sq_sums[k] / sample_count - m * m)
        s = math.sqrt(var)
        mean[k] = round(m, 4)
        sigma[k] = round(min(max(s, floors.get(k, 0.02)), ceils.get(k, 0.1)), 4)

    base = Baseline(mean, sigma, sample_count, time.strftime("%Y-%m-%d %H:%M"))
    base.save(base_file)
    print(f"\n[THÀNH CÔNG] Đã lưu hiệu chuẩn vào {base_file}:")
    for k in mean:
        print(f"  - {k:12s}: {mean[k]:.3f} ± {sigma[k]:.3f}")
    return base

# ==============================================================================
# 6. VÒNG LẶP CHÍNH (MAIN LOOP & ANTI-JITTER HYSTERESIS)
# ==============================================================================
def main():
    parser = argparse.ArgumentParser(description="Cat Meme AI Tracker (OpenCV & MediaPipe)")
    parser.add_argument("--calibrate", action="store_true", help="Hiệu chuẩn khuôn mặt nghỉ và lưu lại")
    args = parser.parse_args()

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[LỖI] Không thể kết nối với webcam!")
        return

    cv2.namedWindow("Camera", cv2.WINDOW_NORMAL)
    cv2.namedWindow("Meme Companion", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Camera", 640, 480)
    cv2.resizeWindow("Meme Companion", 600, 600)

    base = Baseline.load(CALIB_FILE)

    if args.calibrate or base.generic:
        if base.generic and not args.calibrate:
            print("[INFO] Chưa có hồ sơ hiệu chuẩn cá nhân. Khởi chạy hiệu chuẩn 4s...")
        new_base = run_calibration(cap, CALIB_FILE)
        if new_base:
            base = new_base
        if args.calibrate:
            cap.release()
            cv2.destroyAllWindows()
            return

    current_state = "neutral"
    candidate_state = "neutral"
    candidate_streak = 0
    hold_frames = 0
    HOLD_DURATION = 8  # Giữ meme ~250ms trước khi về neutral
    ARM_THRESHOLDS = {
        "heart": 3, "head_pat": 3, "shh": 3, "thinking": 3,
        "pointing": 3, "thumbs_up": 3, "fist": 3, "close_up": 4,
        "huh": 3, "side_look": 4, "neutral": 2
    }

    print("\n=== CAT MEME TRACKER ĐANG CHẠY ===")
    print("Phím tắt:")
    print("  'q' hoặc ESC: Thoát chương trình")
    print("  'c'         : Hiệu chuẩn lại khuôn mặt (Recalibrate 4s)\n")

    prev_time = time.time()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb_frame.flags.writeable = False

        hand_results = hands_detector.process(rgb_frame)
        face_results = face_detector.process(rgb_frame)

        rgb_frame.flags.writeable = True

        active_hand = None
        if hand_results.multi_hand_landmarks:
            active_hand = hand_results.multi_hand_landmarks[0]
            mp_drawing.draw_landmarks(
                frame, active_hand, mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style()
            )

        active_face = None
        if face_results.multi_face_landmarks:
            active_face = face_results.multi_face_landmarks[0]
            for idx in [10, 13, 14, 152, 1, 234, 454]:
                pt = active_face.landmark[idx]
                cx, cy = int(pt.x * w), int(pt.y * h)
                cv2.circle(frame, (cx, cy), 3, (0, 242, 254), -1)

        raw_state, meta = classify_state(active_hand, active_face, hand_results.multi_hand_landmarks, base)

        # -------------------------------------------------------------
        # ANTI-JITTER SMOOTHING & HYSTERESIS HOLD
        # -------------------------------------------------------------
        if raw_state == candidate_state:
            candidate_streak += 1
        else:
            candidate_state = raw_state
            candidate_streak = 1

        arm_target = ARM_THRESHOLDS.get(candidate_state, 3)

        if candidate_streak >= arm_target:
            if candidate_state != "neutral":
                current_state = candidate_state
                hold_frames = HOLD_DURATION
            else:
                if hold_frames > 0:
                    hold_frames -= 1
                else:
                    current_state = "neutral"
        else:
            if current_state != "neutral" and raw_state == "neutral" and hold_frames > 0:
                hold_frames -= 1

        curr_time = time.time()
        fps = int(1.0 / (curr_time - prev_time + 1e-6))
        prev_time = curr_time

        # HUD hiển thị
        calib_str = "ACTIVE (Z-Score)" if not base.generic else "GENERIC (Press 'c')"
        cv2.putText(frame, f"STATE: {current_state.upper()}", (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.85, (0, 242, 254), 2, cv2.LINE_AA)
        cv2.putText(frame, f"FPS: {fps} | Calib: {calib_str}",
                    (20, 75), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 230, 118), 1, cv2.LINE_AA)
        cv2.putText(frame, f"MAR: {meta['mar']:.2f} (Z: {meta['z_mar']:+.1f}s) | Turn: {meta['turn']:+.2f} (Z: {meta['z_turn']:+.1f}s)",
                    (20, 105), cv2.FONT_HERSHEY_SIMPLEX, 0.50, (220, 220, 220), 1, cv2.LINE_AA)

        monke_frame = MEME_IMAGES.get(current_state, MEME_IMAGES["neutral"]).copy()

        cv2.imshow("Camera", frame)
        cv2.imshow("Meme Companion", monke_frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27:
            break
        elif key == ord('c'):
            new_base = run_calibration(cap, CALIB_FILE)
            if new_base:
                base = new_base

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()

