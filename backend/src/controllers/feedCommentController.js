import FeedComment from "../models/FeedComment.js";

/* 📌 Lấy tất cả bình luận của bài đăng */
export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await FeedComment.find({ postId })
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error });
  }
};

/* 📌 Tạo bình luận */
export const createFeedComment = async (req, res) => {
  try {
    const { userId, postId, content } = req.body;
    if (!userId || !postId || !content)
      return res.status(400).json({ message: "Missing required fields" });

    const comment = await FeedComment.create({ userId, postId, content });
    const populated = await comment.populate("userId", "username avatar");
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: "Error creating comment", error });
  }
};

/* 📌 Xóa bình luận */
export const deleteFeedComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const comment = await FeedComment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.userId.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
};
//lấy lịch sử bình luận của user
export const getUserFeedComments = async (req, res) => {
  try {
    const { userId } = req.params;
    const comments = await FeedComment.find({ userId })
      .populate({
        path: "postId",
        populate: [
          { path: "songId", select: "title thumbnail artist" },
          { path: "userId", select: "username avatar" },
        ],
      })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user comments", error });
  }
};
