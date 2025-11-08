import Post from "../models/Post.js";
import FeedLike from "../models/FeedLike.js";
import FeedComment from "../models/FeedComment.js";


/* 📌 Lấy danh sách tất cả bài đăng (Feed) */
/* 📦 Lấy tất cả bài đăng */
export const getAllPosts = async (req, res) => {
  try {
    const { userId } = req.query;

    const posts = await Post.find()
      .populate("userId", "username avatar")
      .populate("songId", "title artist thumbnail")
      .sort({ createdAt: -1 });

    // Lấy toàn bộ lượt like
    const allLikes = await FeedLike.find();
    const userLikes = userId
      ? allLikes.filter((like) => like.userId.toString() === userId)
      : [];

    const formatted = posts.map((p) => {
      const likeCount = allLikes.filter(
        (like) => like.postId.toString() === p._id.toString()
      ).length;

      const userLiked = userLikes.some(
        (like) => like.postId.toString() === p._id.toString()
      );

      return {
        ...p.toObject(),
        likeCount,
        userLiked,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("⚠️ Error fetching posts:", error);
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

/* 📌 Tạo bài đăng chia sẻ bài hát */
export const createPost = async (req, res) => {
  try {
    const { userId, songId, caption } = req.body;
    if (!userId || !songId)
      return res.status(400).json({ message: "Missing userId or songId" });

    const post = await Post.create({ userId, songId, caption });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: "Error creating post", error });
  }
};

/* 📌 Xóa bài đăng (chỉ người tạo được xóa) */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.userId.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    await FeedLike.deleteMany({ postId: id });
    await FeedComment.deleteMany({ postId: id });
    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting post", error });
  }
};
