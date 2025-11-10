import express from "express";
import {
  createUserPlaylist,
  getUserPlaylists,
  addSongToUserPlaylist,
  removeSongFromUserPlaylist,
  deleteUserPlaylist,
} from "../controllers/playlistUserController.js";

const router = express.Router();

router.post("/", createUserPlaylist);
router.get("/:userId", getUserPlaylists);
router.post("/add-song", addSongToUserPlaylist);
router.post("/remove-song", removeSongFromUserPlaylist);
router.delete("/:id", deleteUserPlaylist);

export default router;
