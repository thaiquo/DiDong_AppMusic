import mongoose from "mongoose";

const followPlaylistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    playlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
      required: true,
    },
  },
  { timestamps: true }
);

// Một user chỉ được follow 1 playlist 1 lần
followPlaylistSchema.index({ userId: 1, playlistId: 1 }, { unique: true });

// ✅ Nếu bạn muốn chắc chắn trỏ đúng collection "followplaylists"
export default mongoose.model("FollowPlaylist", followPlaylistSchema, "followplaylists");
