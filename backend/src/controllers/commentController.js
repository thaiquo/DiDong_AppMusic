import Comment from "../models/Comment.js";
import Song from "../models/Song.js";

/* 📥 Lấy bình luận của 1 bài hát */
export const getCommentsBySong = async (req, res) => {
  try {
    const { songId } = req.params;
    const comments = await Comment.find({ song: songId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    return res.json(comments);
  } catch (error) {
    console.error("❌ Error fetching comments:", error);
    res.status(500).json({ message: "Error fetching comments" });
  }
};

/* ➕ Thêm bình luận */
export const addComment = async (req, res) => {
  try {
    const { song, user, content } = req.body;
    if (!song || !user || !content?.trim()) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const comment = await Comment.create({
      song,
      user,
      content: content.trim(),
    });

    const songDoc = await Song.findById(song);
    if (songDoc) {
      songDoc.comments.push(comment._id);
      songDoc.commentCount = (songDoc.commentCount || 0) + 1;
      await songDoc.save();
    }

    const populated = await comment.populate("user", "username avatar");

    return res.status(201).json({
      message: "Comment added successfully",
      comment: populated,
      commentCount: songDoc?.commentCount || 0,
    });
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
};

/* ❌ Xóa bình luận (chỉ user tạo ra mới được xóa) */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // ⚠️ frontend phải gửi userId trong body

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // ✅ chỉ người đăng comment được xóa
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: "Not allowed to delete this comment" });
    }

    await Comment.findByIdAndDelete(id);

    // 🔹 Cập nhật lại bài hát
    const song = await Song.findById(comment.song);
    if (song) {
      song.comments = song.comments.filter(
        (cid) => cid.toString() !== id.toString()
      );
      song.commentCount = Math.max(0, (song.commentCount || 1) - 1);
      await song.save();
    }

    return res.json({
      message: "Comment deleted successfully",
      commentCount: song?.commentCount || 0,
    });
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    res.status(500).json({ message: "Error deleting comment" });
  }
};

/* 📤 Lấy tất cả bình luận của 1 user (cho LibraryScreen) */
/* 📤 Lấy tất cả bình luận của 1 user (cho LibraryScreen) */
export const getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const comments = await Comment.find({ user: userId })
      .populate("song", "title artist thumbnail audioUrl duration") // ✅ thêm audioUrl & duration
      .sort({ createdAt: -1 })
      .populate("user", "username avatar");

    return res.json(comments);
  } catch (error) {
    console.error("❌ Error fetching user comments:", error);
    res.status(500).json({ message: "Error fetching user comments" });
  }
};

