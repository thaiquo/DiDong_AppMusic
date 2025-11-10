// ✅ APP.JS
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// 🧩 ROUTES IMPORT
import userRoutes from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import followPlaylistRoutes from "./routes/followPlaylistRoutes.js";
import feedLikeRoutes from "./routes/feedLikeRoutes.js";
import feedCommentRoutes from "./routes/feedCommentRoutes.js";
import userPlaylistRoutes from "./routes/playlistUserRoutes.js";

// 🧩 MIDDLEWARE
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ✅ Kết nối MongoDB
connectDB();

// ✅ Middleware cơ bản
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Static upload file (ảnh avatar, playlist cover,...)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Route test root
app.get("/", (_req, res) => res.send("🎵 Music Stream API running successfully!"));

// ✅ API ROUTES
app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/follow-playlist", followPlaylistRoutes);
app.use("/api/feed-likes", feedLikeRoutes);
app.use("/api/feed-comments", feedCommentRoutes);
app.use("/api/user-playlists", userPlaylistRoutes);
// ✅ Error Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
