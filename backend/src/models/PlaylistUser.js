// models/PlaylistUser.js
import mongoose from "mongoose";

const playlistUserSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    coverImage: { type: String, default: "" },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
    isPublic: { type: Boolean, default: false },
    titleLower: { type: String, index: true },
  },
  {
    timestamps: true,
    collection: "playlist_users", // 👈 đảm bảo trùng với Mongo Compass
  }
);

playlistUserSchema.index({ user: 1, titleLower: 1 }, { unique: true });

playlistUserSchema.pre("save", function (next) {
  if (this.title) {
    this.title = this.title.trim();
    this.titleLower = this.title.toLowerCase();
  }
  next();
});

export default mongoose.model("PlaylistUser", playlistUserSchema);
