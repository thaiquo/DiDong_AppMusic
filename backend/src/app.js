import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import followPlaylistRoutes from "./routes/followPlaylistRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import feedLikeRoutes from "./routes/feedLikeRoutes.js";
import feedCommentRoutes from "./routes/feedCommentRoutes.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => res.send("🎵 Music Stream API running successfully!"));

app.use("/api/users", userRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follow-playlist", followPlaylistRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/feed-likes", feedLikeRoutes);
app.use("/api/feed-comments", feedCommentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
