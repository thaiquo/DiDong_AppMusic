import express from "express";
import {
  registerUser,
  loginUser,
  updateListeningHistory,
  toggleFavoriteSong,
  getUserData,
} from "../controllers/userController.js";
import User from "../models/User.js";

const router = express.Router();

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Lịch sử nghe nhạc + playCount
router.post("/history", updateListeningHistory);

// Toggle yêu thích
router.post("/favorite", toggleFavoriteSong);

// Lấy thông tin người dùng
router.get("/:id", getUserData);

// Lấy riêng lịch sử nghe
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

export default router;
