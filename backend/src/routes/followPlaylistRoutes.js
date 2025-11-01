import express from "express";
import {
  followPlaylist,
  unfollowPlaylist,
  getUserFollowedPlaylists,
  getPlaylistFollowers,
} from "../controllers/followPlaylistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Follow / Unfollow (bắt buộc có token)
router.post("/:playlistId/follow", protect, followPlaylist);
router.delete("/:playlistId/follow", protect, unfollowPlaylist);

// ✅ Lấy danh sách (có thể public)
router.get("/user/:userId", getUserFollowedPlaylists);
router.get("/playlist/:playlistId", getPlaylistFollowers);

export default router;
