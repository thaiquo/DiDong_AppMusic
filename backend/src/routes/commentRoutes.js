import express from "express";
import {
  getCommentsBySong,
  addComment,
  deleteComment,
   getCommentsByUser, 
} from "../controllers/commentController.js";

const router = express.Router();

//get comments by user
router.get("/user/:userId", getCommentsByUser);
// GET: /api/comments/:songId
router.get("/:songId", getCommentsBySong);

// POST: /api/comments/add
router.post("/add", addComment);

// DELETE: /api/comments/:id
router.delete("/:id", deleteComment);



export default router;
