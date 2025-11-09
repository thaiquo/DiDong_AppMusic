import mongoose from "mongoose";
import User from "../models/User.js";
import Song from "../models/Song.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ✅ Đăng ký
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ username, email, password });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

// ✅ Đăng nhập
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

// ✅ Cập nhật lịch sử nghe nhạc + tăng playCount (chỉ khi nghe >80%)
export const updateListeningHistory = async (req, res) => {
  try {
    const { userId, songId } = req.body;
    if (!userId || !songId)
      return res.status(400).json({ message: "Missing userId or songId" });

    const user = await User.findById(userId);
    const song = await Song.findById(songId);

    if (!user || !song)
      return res.status(404).json({ message: "User or Song not found" });

    const songObjectId = new mongoose.Types.ObjectId(songId);

    // 🔹 Kiểm tra trùng lịch sử nghe
    const alreadyExists = user.history.some(
      (id) => id.toString() === songObjectId.toString()
    );

    // 🔹 Nếu bài hát chưa có trong lịch sử → thêm vào đầu danh sách
    if (!alreadyExists) {
      user.history.unshift(songObjectId);
      await user.save();
      console.log(`🎧 Thêm ${song.title} vào lịch sử của ${user.username}`);
    } else {
      console.log(`ℹ️ ${song.title} đã có trong lịch sử của ${user.username}`);
    }

    // 🔹 Cập nhật playCount (mỗi lần nghe đạt 80%)
    song.playCount = (song.playCount || 0) + 1;
    await song.save();

    console.log(`🔥 PlayCount +1 cho ${song.title} → ${song.playCount}`);

    res.json({
      message: "History & playCount updated",
      playCount: song.playCount,
      history: user.history,
    });
  } catch (error) {
    console.error("❌ updateListeningHistory error:", error);
    res.status(500).json({ message: "Error updating history", error });
  }
};

// ✅ Toggle Favorite (LIKE / UNLIKE)
export const toggleFavoriteSong = async (req, res) => {
  try {
    const { userId, songId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = user.favoriteSongs.some(
      (id) => id.toString() === songId.toString()
    );

    if (exists) {
      user.favoriteSongs.pull(songId);
      await user.save();
      return res.json({ favorite: false });
    } else {
      user.favoriteSongs.addToSet(songId);
      await user.save();
      return res.json({ favorite: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Error toggling favorite", error });
  }
};

// ✅ Lấy thông tin user (kèm history + favorite + following)
export const getUserData = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate("favoriteSongs")
      .populate("history")
      .populate("followingArtists");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data", error });
  }
};
// ✅ Cập nhật thông tin người dùng (hồ sơ cá nhân)
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, avatar } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      username: updated.username,
      email: updated.email,
      avatar: updated.avatar,
    });
  } catch (err) {
    console.error("❌ updateUserProfile error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};