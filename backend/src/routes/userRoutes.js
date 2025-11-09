import express from "express";
import multer from "multer";
import path from "path";

import {
  registerUser,
  loginUser,
  updateListeningHistory,
  toggleFavoriteSong,
  getUserData,
  updateUserProfile,
} from "../controllers/userController.js";
import User from "../models/User.js";

const router = express.Router();

// ====================== MULTER CONFIG ======================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // thư mục lưu ảnh
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("❌ Chỉ được upload file ảnh (.jpg, .jpeg, .png)"));
  },
});

// ====================== ROUTES ======================

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Lịch sử nghe nhạc + playCount
router.post("/history", updateListeningHistory);

// ✅ Toggle yêu thích (like/unlike)
router.post("/favorite", toggleFavoriteSong);

// ✅ Lấy thông tin người dùng (kèm history, favorite,...)
router.get("/:id", getUserData);

// ✅ Cập nhật hồ sơ cá nhân
router.put("/:id", updateUserProfile);

// ✅ Lấy riêng lịch sử nghe
router.get("/:id/history", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("history");
    if (!user) return res.status(404).json([]);
    res.json(user.history || []);
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json([]);
  }
});

// ✅ Upload avatar (trả về URL public)
router.post("/upload", upload.single("avatar"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Không có file nào được tải lên" });

  const host = `${req.protocol}://${req.get("host")}`;
  const fileUrl = `${host}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

export default router;
