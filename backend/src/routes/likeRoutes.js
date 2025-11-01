import express from "express";
import { toggleLike } from "../controllers/likeController.js";
const router = express.Router();

router.post("/", toggleLike); // POST /api/likes
export default router;
