import express from "express";
import {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist
} from "../controllers/playlistController.js";

const router = express.Router();

router.post("/", createPlaylist);
router.get("/", getPlaylists);
router.get("/:id", getPlaylistById);
router.put("/:id", updatePlaylist);
router.delete("/:id", deletePlaylist);
router.post("/add-song", addSongToPlaylist);
router.post("/remove-song", removeSongFromPlaylist);

export default router;
