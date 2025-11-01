import FollowPlaylist from "../models/FollowPlaylist.js";
import Playlist from "../models/Playlist.js";

/* ✅ FOLLOW playlist */
export const followPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id; // ✅ lấy từ middleware protect

    // Kiểm tra đã follow chưa
    const exists = await FollowPlaylist.findOne({ userId, playlistId });
    if (exists) {
      return res.status(400).json({ message: "Already followed" });
    }

    await FollowPlaylist.create({ userId, playlistId });
    await Playlist.findByIdAndUpdate(playlistId, { $inc: { followersCount: 1 } });

    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    console.error("❌ Error in followPlaylist:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

/* 🚫 UNFOLLOW playlist */
export const unfollowPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user._id;

    const result = await FollowPlaylist.findOneAndDelete({ userId, playlistId });
    if (!result) {
      return res.status(404).json({ message: "Not following this playlist" });
    }

    await Playlist.findByIdAndUpdate(playlistId, { $inc: { followersCount: -1 } });

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("❌ Error in unfollowPlaylist:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

/* 👤 Lấy playlist user đã follow */
export const getUserFollowedPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await FollowPlaylist.find({ userId }).populate("playlistId");
    res.json(follows);
  } catch (error) {
    console.error("❌ Error in getUserFollowedPlaylists:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

/* 👥 Lấy người theo dõi playlist */
export const getPlaylistFollowers = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const followers = await FollowPlaylist.find({ playlistId }).populate("userId");
    res.json(followers);
  } catch (error) {
    console.error("❌ Error in getPlaylistFollowers:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
