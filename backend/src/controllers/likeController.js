import Like from "../models/Like.js";
import Song from "../models/Song.js";
import User from "../models/User.js";

export const toggleLike = async (req, res) => {
  try {
    const { userId, songId } = req.body;
    if (!userId || !songId) return res.status(400).json({ message: "Missing data" });

    const existing = await Like.findOne({ userId, songId });
    const song = await Song.findById(songId);
    const user = await User.findById(userId);

    if (!song || !user) return res.status(404).json({ message: "Not found" });

    if (existing) {
      // 🔹 UNLIKE
      await Like.deleteOne({ _id: existing._id });
      user.favoriteSongs.pull(songId);
      song.likeCount = Math.max(0, (song.likeCount || 0) - 1);
      await song.save();
      await user.save();
      return res.json({ liked: false, likeCount: song.likeCount });
    } else {
      // 🔹 LIKE
      await Like.create({ songId, userId });
      user.favoriteSongs.addToSet(songId);
      song.likeCount = (song.likeCount || 0) + 1;
      await song.save();
      await user.save();
      return res.json({ liked: true, likeCount: song.likeCount });
    }
  } catch (err) {
    console.error("❌ toggleLike error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
