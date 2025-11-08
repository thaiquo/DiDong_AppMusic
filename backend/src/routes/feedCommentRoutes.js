import express from "express";
import {
  getCommentsByPost,
  createFeedComment,
  deleteFeedComment,
  getUserFeedComments,
} from "../controllers/feedCommentController.js";

const router = express.Router();

router.get("/user/:userId", getUserFeedComments);

router.get("/:postId", getCommentsByPost);
router.post("/", createFeedComment);
router.delete("/:id", deleteFeedComment);

export default router;
