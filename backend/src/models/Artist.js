import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    avatar: { type: String, required: true },
    followersCount: { type: Number, default: 0 },
    bio: { type: String, default: "" },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }], // liên kết mềm
  },
  { timestamps: true }
);

export default mongoose.model("Artist", artistSchema);
