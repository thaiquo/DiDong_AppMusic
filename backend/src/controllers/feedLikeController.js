import FeedLike from "../models/FeedLike.js";
import Post from "../models/Post.js";

/* ❤️ Toggle like / unlike */
export const toggleFeedLike = async (req, res) => {
  try {
    const { userId, postId } = req.body;
    if (!userId || !postId)
      return res.status(400).json({ message: "Missing required fields" });

    const existing = await FeedLike.findOne({ userId, postId });
    let liked = false;

    if (existing) {
      await FeedLike.deleteOne({ _id: existing._id });
    } else {
      await FeedLike.create({ userId, postId });
      liked = true;
    }

    const likeCount = await FeedLike.countDocuments({ postId });
    return res.status(200).json({ liked, likeCount });
  } catch (error) {
    console.error("⚠️ Toggle like error:", error);
    res.status(500).json({ message: "Error toggling like", error });
  }
};

/* 🔢 Lấy số lượt like */
export const getFeedLikeCount = async (req, res) => {
  try {
    const { postId } = req.params;
    const likeCount = await FeedLike.countDocuments({ postId });
    res.json({ likeCount });
  } catch (error) {
    res.status(500).json({ message: "Error counting likes", error });
  }
};
//lấy lịch sử like của user
export const getUserLikedFeeds = async (req, res) => {
  try {
    const { userId } = req.params;
    const likes = await FeedLike.find({ userId })
      .populate({
        path: "postId",
        populate: [
          { path: "songId", select: "title thumbnail artist" },
          { path: "userId", select: "username avatar" },
        ],
      })
      .sort({ createdAt: -1 });
    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user liked feeds", error });
  }
};

