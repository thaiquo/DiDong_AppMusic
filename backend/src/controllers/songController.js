import Song from "../models/Song.js";
import User from "../models/User.js";
import Artist from "../models/Artist.js";
import Like from "../models/Like.js";
/* Get all songs */
export const getSongs = async (_req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching songs" });
  }
};

/* Create song + gắn vào artist.songs nếu tìm thấy artist theo tên */
export const createSong = async (req, res) => {
  try {
    const song = await Song.create(req.body);

    // đồng bộ với Artist.songs (nếu có artist trùng tên)
    const artistDoc = await Artist.findOne({ name: song.artist });
    if (artistDoc) {
      artistDoc.songs = artistDoc.songs || [];
      artistDoc.songs.push(song._id);
      await artistDoc.save();
    }

    res.status(201).json(song);
  } catch (error) {
    res.status(400).json({ message: "Error creating song", error });
  }
};

/* Get song by id */
export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate({ path: "comments", populate: { path: "user", select: "username avatar" } });
    if (!song) return res.status(404).json({ message: "Song not found" });
    res.json(song);
  } catch (error) {
    res.status(500).json({ message: "Error fetching song" });
  }
};

/* Update song */
export const updateSong = async (req, res) => {
  try {
    const prev = await Song.findById(req.params.id);
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!song) return res.status(404).json({ message: "Song not found" });

    // nếu đổi tên artist, đồng bộ lại artist.songs
    if (prev && req.body.artist && req.body.artist !== prev.artist) {
      const oldArtist = await Artist.findOne({ name: prev.artist });
      if (oldArtist) {
        oldArtist.songs = (oldArtist.songs || []).filter(id => id.toString() !== song._id.toString());
        await oldArtist.save();
      }
      const newArtist = await Artist.findOne({ name: song.artist });
      if (newArtist) {
        newArtist.songs = newArtist.songs || [];
        if (!newArtist.songs.some(id => id.toString() === song._id.toString())) {
          newArtist.songs.push(song._id);
          await newArtist.save();
        }
      }
    }

    res.json(song);
  } catch (error) {
    res.status(400).json({ message: "Error updating song" });
  }
};

/* Delete song */
export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ message: "Song not found" });

    // gỡ khỏi artist.songs
    await Artist.updateMany({}, { $pull: { songs: song._id } });

    res.json({ message: "Song deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting song" });
  }
};

/* Increment playcount */
export const incrementPlayCount = async (req, res) => {
  try {
    const { songId } = req.body;
    const song = await Song.findById(songId);
    if (!song) return res.status(404).json({ message: "Song not found" });

    song.playCount += 1;
    await song.save();
    res.json({ message: "Play count updated", playCount: song.playCount });
  } catch (error) {
    res.status(500).json({ message: "Error updating play count", error });
  }
};




/* Like / Unlike */
export const toggleLikeSong = async (req, res) => {
  try {
    const { userId, songId } = req.body;
    if (!userId || !songId)
      return res.status(400).json({ message: "Missing userId or songId" });

    const user = await User.findById(userId);
    const song = await Song.findById(songId);
    if (!user || !song)
      return res.status(404).json({ message: "User or song not found" });

    // ✅ kiểm tra Like record
    const existingLike = await Like.findOne({ userId, songId });

    if (existingLike) {
      // 🔹 UNLIKE
      await Like.deleteOne({ _id: existingLike._id });

      user.favoriteSongs = (user.favoriteSongs || []).filter(
        (id) => id.toString() !== songId.toString()
      );
      song.likeCount = Math.max(0, (song.likeCount || 0) - 1);

      await song.save();
      await user.save();

      return res.json({
        message: "Unliked song",
        liked: false,
        likeCount: song.likeCount,
      });
    } else {
      // 🔹 LIKE
      await Like.create({ userId, songId });

      user.favoriteSongs = user.favoriteSongs || [];
      if (!user.favoriteSongs.some((id) => id.toString() === songId.toString())) {
        user.favoriteSongs.push(songId);
      }

      song.likeCount = (song.likeCount || 0) + 1;

      await song.save();
      await user.save();

      return res.json({
        message: "Liked song",
        liked: true,
        likeCount: song.likeCount,
      });
    }
  } catch (error) {
    console.error("❌ Error toggling like:", error);
    res.status(500).json({ message: "Error toggling like", error });
  }
};
