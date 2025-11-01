import express from "express";
import {
  getArtists,
  getArtistById,
  toggleFollowArtist, // ✅ thêm dòng này
} from "../controllers/artistController.js";

const router = express.Router();

// GET all artists
router.get("/", getArtists);

// GET one artist + songs
router.get("/:id", getArtistById);
//follow
router.post("/follow", toggleFollowArtist); 
export default router;
