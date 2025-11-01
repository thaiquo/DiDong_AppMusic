import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true }, // ✅ có trong Mongo
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },

    // ✅ Mongo đang dùng "songIds", backend vẫn hỗ trợ "songs" mới
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    songIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],

    followersCount: { type: Number, default: 0 }, // ✅ khớp với Mongo
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ Đảm bảo khi chỉ có songIds thì tự copy sang songs
playlistSchema.pre("save", function (next) {
  if ((!this.songs || this.songs.length === 0) && this.songIds?.length > 0) {
    this.songs = this.songIds;
  }
  next();
});

export default mongoose.model("Playlist", playlistSchema);
