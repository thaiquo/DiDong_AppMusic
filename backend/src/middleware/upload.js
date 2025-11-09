import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = "src/uploads"; // hoặc "uploads" nếu file server.js ở root

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!ok.includes(file.mimetype)) return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});
