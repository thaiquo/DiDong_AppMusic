import express from "express";
import { toggleFeedLike, getFeedLikeCount,getUserLikedFeeds, } from "../controllers/feedLikeController.js";

const router = express.Router();

router.get("/user/:userId", getUserLikedFeeds);

router.post("/", toggleFeedLike);
router.get("/:postId/count", getFeedLikeCount);


export default router;
