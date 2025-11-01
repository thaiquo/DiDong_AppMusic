import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    songId: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

likeSchema.index({ songId: 1, userId: 1 }, { unique: true }); // ✅ mỗi user chỉ like 1 lần / bài

export default mongoose.model("Like", likeSchema);
