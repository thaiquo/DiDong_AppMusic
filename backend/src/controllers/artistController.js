import User from "../models/User.js";
import Artist from "../models/Artist.js";
import Song from "../models/Song.js";
// Create
export const createArtist = async (req, res) => {
  try {
    const artist = await Artist.create(req.body);
    res.status(201).json(artist);
  } catch (e) {
    res.status(400).json({ message: "Error creating artist", error: e });
  }
};

// List
export const getArtists = async (_req, res) => {
  try {
    const artists = await Artist.find().sort({ name: 1 }).lean();
    res.json(artists);
  } catch (e) {
    res.status(500).json({ message: "Error fetching artists" });
  }
};

// Detail + songs
export const getArtistById = async (req, res) => {
  try {
    const { id } = req.params;
    const artist = await Artist.findById(id).lean();
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    // Lấy bài hát theo 2 cách: theo mảng artist.songs hoặc tên trùng
    const songs = await Song.find({
      $or: [
        { _id: { $in: artist.songs || [] } },
        { artist: artist.name }
      ]
    }).sort({ createdAt: -1 });

    res.json({ ...artist, songs });
  } catch (e) {
    res.status(500).json({ message: "Error fetching artist" });
  }
};

// Update
export const updateArtist = async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    res.json(artist);
  } catch (e) {
    res.status(400).json({ message: "Error updating artist" });
  }
};

// Delete
export const deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    res.json({ message: "Artist deleted" });
  } catch (e) {
    res.status(500).json({ message: "Error deleting artist" });
  }
};
// 🎧 Toggle Follow Artist (cập nhật song song User và Artist)
export const toggleFollowArtist = async (req, res) => {
  try {
    const { userId, artistId } = req.body;

    const user = await User.findById(userId);
    const artist = await Artist.findById(artistId);
    if (!user || !artist) {
      return res.status(404).json({ message: "User or Artist not found" });
    }

    const isFollowing = user.followingArtists.some(
      (id) => id.toString() === artistId.toString()
    );

    if (isFollowing) {
      // ❌ Bỏ theo dõi
      user.followingArtists = user.followingArtists.filter(
        (id) => id.toString() !== artistId.toString()
      );
      artist.followersCount = Math.max(0, artist.followersCount - 1);
    } else {
      // ✅ Theo dõi mới
      user.followingArtists.push(artistId);
      artist.followersCount += 1;
    }

    await user.save();
    await artist.save();

    res.json({
      message: isFollowing ? "Unfollowed artist" : "Followed artist",
      followersCount: artist.followersCount, // ✅ thống nhất với DB
      isFollowing: !isFollowing,
    });
  } catch (error) {
    console.error("Follow toggle error:", error);
    res.status(500).json({ message: "Error toggling follow", error });
  }
};
