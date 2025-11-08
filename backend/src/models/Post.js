import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    songId: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
    caption: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
