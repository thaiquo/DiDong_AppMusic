import Song from "../models/Song.js";
import User from "../models/User.js";
import Artist from "../models/Artist.js";
import Playlist from "../models/Playlist.js";

// 🎧 Gợi ý bài hát
export const getSuggestions = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("history");

    let songs;
    if (user && user.history.length > 0) {
      const excludeIds = user.history.map((s) => s._id);
      songs = await Song.find({ _id: { $nin: excludeIds } }).limit(8);
    } else {
      songs = await Song.find().limit(8);
    }
    res.json(songs || []);
  } catch {
    res.status(500).json({ message: "Error fetching suggestions" });
  }
};

// 🔥 Lấy playlist công khai (thay cho albums)
export const getPublicPlaylists = async (_req, res) => {
  try {
    const lists = await Playlist.find({ isPublic: true })
      .populate("songs")
      .sort({ updatedAt: -1 });
    res.json(lists || []);
  } catch {
    res.status(500).json({ message: "Error fetching playlists" });
  }
};

// 🔥 Danh sách bài hát thịnh hành
export const getTrending = async (_req, res) => {
  try {
    const songs = await Song.find().sort({ playCount: -1 }).limit(10);
    res.json(songs || []);
  } catch {
    res.status(500).json({ message: "Error fetching trending" });
  }
};

// 👩‍🎤 Danh sách nghệ sĩ
export const getArtists = async (_req, res) => {
  try {
    const artists = await Artist.find().sort({ followers: -1 }).lean();
    res.json(artists || []);
  } catch {
    res.status(500).json({ message: "Error fetching artists" });
  }
};
