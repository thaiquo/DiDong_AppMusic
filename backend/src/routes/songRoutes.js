import express from "express";
import {
  getSongs,
  createSong,
  getSongById,
  updateSong,
  deleteSong,
  incrementPlayCount,
  toggleLikeSong
} from "../controllers/songController.js";

const router = express.Router();

router.get("/", getSongs);
router.get("/:id", getSongById);
router.post("/", createSong);
router.put("/:id", updateSong);
router.delete("/:id", deleteSong);
router.post("/playcount", incrementPlayCount);
router.post("/like", toggleLikeSong); // ✅ dùng Like model mới

export default router;
