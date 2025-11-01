import express from "express";
import {
  getSuggestions,
  getTrending,
  getArtists,
  getPublicPlaylists,
} from "../controllers/homeController.js";

const router = express.Router();

router.get("/suggestions/:userId", getSuggestions);
router.get("/trending", getTrending);
router.get("/artists", getArtists);
router.get("/playlists", getPublicPlaylists); // ✅ show public playlists trên Home

export default router;
