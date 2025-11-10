// controllers/playlistUserController.js
import PlaylistUser from "../models/PlaylistUser.js";

export const createUserPlaylist = async (req, res) => {
  try {
    const { userId, title, description } = req.body;
    if (!userId || !title) return res.status(400).json({ message: "Thiếu userId hoặc title" });

    const titleLower = title.trim().toLowerCase();

    const exists = await PlaylistUser.findOne({ user: userId, titleLower });
    if (exists) return res.status(400).json({ message: "Tên playlist đã tồn tại." });

    const playlist = await PlaylistUser.create({ user: userId, title, description });
    res.status(201).json(playlist);
  } catch (err) {
    // bắt lỗi E11000 nếu unique index đụng độ
    if (err.code === 11000) {
      return res.status(400).json({ message: "Tên playlist đã tồn tại." });
    }
    res.status(500).json({ message: "Lỗi tạo playlist", error: err.message });
  }
};

export const getUserPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;
    const lists = await PlaylistUser.find({ user: userId })
      .populate("songs", "title artist thumbnail audioUrl") // 👈 thêm audioUrl
      .sort({ updatedAt: -1 });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách playlist", error: err.message });
  }
};


export const addSongToUserPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;
    const pl = await PlaylistUser.findByIdAndUpdate(
      playlistId,
      { $addToSet: { songs: songId } },
      { new: true }
    ).populate("songs", "title artist thumbnail audioUrl");
    if (!pl) return res.status(404).json({ message: "Không tìm thấy playlist" });
    res.json({ message: "Đã thêm bài hát", playlist: pl });
  } catch (err) {
    res.status(500).json({ message: "Lỗi thêm bài hát", error: err.message });
  }
};

export const removeSongFromUserPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;
    const pl = await PlaylistUser.findByIdAndUpdate(
      playlistId,
      { $pull: { songs: songId } },
      { new: true }
    ).populate("songs", "title artist thumbnail audioUrl");
    if (!pl) return res.status(404).json({ message: "Không tìm thấy playlist" });
    res.json({ message: "Đã xóa bài hát", playlist: pl });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa bài hát", error: err.message });
  }
};

export const deleteUserPlaylist = async (req, res) => {
  try {
    await PlaylistUser.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa playlist" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa playlist", error: err.message });
  }
};
