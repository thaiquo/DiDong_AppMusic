import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true }, // gắn theo tên
    duration: { type: String, default: "0:00" },
    genre: { type: String, default: "Pop" },
    audioUrl: { type: String, required: true },
    thumbnail: { type: String, required: true },
    playCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 }, 
    commentCount: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: [] }],
  },
  { timestamps: true }
);

export default mongoose.model("Song", songSchema);
