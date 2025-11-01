import Playlist from "../models/Playlist.js";

/* 🧩 Tạo playlist mới */
export const createPlaylist = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Nếu có songIds mà chưa có songs → copy qua
    if ((!payload.songs || payload.songs.length === 0) && Array.isArray(payload.songIds) && payload.songIds.length > 0) {
      payload.songs = payload.songIds;
    }

    const playlist = await Playlist.create(payload);
    res.status(201).json(playlist);
  } catch (e) {
    res.status(400).json({ message: "Error creating playlist", error: e.message });
  }
};

/* 🧩 Lấy danh sách playlist public (cho HomeScreen) */
export const getPlaylists = async (_req, res) => {
  try {
    const lists = await Playlist.find({ isPublic: true })
      .populate("songs")
      .populate("songIds")
      .sort({ createdAt: -1 })
      .lean();

    // Normalize: luôn có field `songs` để frontend dùng
    const normalized = lists.map((pl) => ({
      ...pl,
      songs: pl.songs?.length > 0 ? pl.songs : pl.songIds || [],
      followersCount: pl.followersCount ?? 0,
    }));

    res.json(normalized);
  } catch (e) {
    res.status(500).json({ message: "Error fetching playlists", error: e.message });
  }
};

/* 🧩 Lấy chi tiết 1 playlist (cho PlaylistScreen) */
export const getPlaylistById = async (req, res) => {
  try {
    const pl = await Playlist.findById(req.params.id)
      .populate("songs")
      .populate("songIds")
      .lean();

    if (!pl) return res.status(404).json({ message: "Playlist not found" });

    const normalized = {
      ...pl,
      songs: pl.songs?.length > 0 ? pl.songs : pl.songIds || [],
      followersCount: pl.followersCount ?? 0,
    };

    res.json(normalized);
  } catch (e) {
    res.status(500).json({ message: "Error fetching playlist", error: e.message });
  }
};

/* 🧩 Cập nhật playlist */
export const updatePlaylist = async (req, res) => {
  try {
    const payload = { ...req.body };

    if ((!payload.songs || payload.songs.length === 0) && Array.isArray(payload.songIds) && payload.songIds.length > 0) {
      payload.songs = payload.songIds;
    }

    const pl = await Playlist.findByIdAndUpdate(req.params.id, payload, { new: true })
      .populate("songs")
      .populate("songIds")
      .lean();

    if (!pl) return res.status(404).json({ message: "Playlist not found" });

    const normalized = {
      ...pl,
      songs: pl.songs?.length > 0 ? pl.songs : pl.songIds || [],
      followersCount: pl.followersCount ?? 0,
    };

    res.json(normalized);
  } catch (e) {
    res.status(400).json({ message: "Error updating playlist", error: e.message });
  }
};

/* 🧩 Xóa playlist */
export const deletePlaylist = async (req, res) => {
  try {
    const pl = await Playlist.findByIdAndDelete(req.params.id);
    if (!pl) return res.status(404).json({ message: "Playlist not found" });
    res.json({ message: "Playlist deleted" });
  } catch (e) {
    res.status(500).json({ message: "Error deleting playlist", error: e.message });
  }
};

/* 🧩 Thêm bài hát vào playlist */
export const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;

    const pl = await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { songs: songId, songIds: songId } }, // Thêm vào cả hai để giữ tương thích
      { new: true }
    )
      .populate("songs")
      .populate("songIds")
      .lean();

    if (!pl) return res.status(404).json({ message: "Playlist not found" });

    const normalized = {
      ...pl,
      songs: pl.songs?.length > 0 ? pl.songs : pl.songIds || [],
      followersCount: pl.followersCount ?? 0,
    };

    res.json(normalized);
  } catch (e) {
    res.status(400).json({ message: "Error adding song to playlist", error: e.message });
  }
};

/* 🧩 Xóa bài hát khỏi playlist */
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;

    const pl = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { songs: songId, songIds: songId } },
      { new: true }
    )
      .populate("songs")
      .populate("songIds")
      .lean();

    if (!pl) return res.status(404).json({ message: "Playlist not found" });

    const normalized = {
      ...pl,
      songs: pl.songs?.length > 0 ? pl.songs : pl.songIds || [],
      followersCount: pl.followersCount ?? 0,
    };

    res.json(normalized);
  } catch (e) {
    res.status(400).json({ message: "Error removing song from playlist", error: e.message });
  }
};
