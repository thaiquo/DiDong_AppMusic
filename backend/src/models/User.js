import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      default: function () {
        const randomId = Math.floor(Math.random() * 70) + 1;
        return `https://i.pravatar.cc/150?img=${randomId}`;
      },
    },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },

    // 🔹 Nghệ sĩ mà user theo dõi
    followingArtists: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Artist", default: [] },
    ],

    // 🔹 Các bài hát yêu thích
    favoriteSongs: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Song", default: [] },
    ],

    // 🔹 Lịch sử nghe gần đây
    history: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Song", default: [] },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
