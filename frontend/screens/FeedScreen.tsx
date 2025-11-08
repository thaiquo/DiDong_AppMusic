import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import axios from "axios";
import { API_URL } from "../config/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useMusic } from "../context/MusicContext";

export default function FeedScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [showComments, setShowComments] = useState(false);
  const [activePost, setActivePost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const { setSong } = useMusic();
  const isFocused = useIsFocused();

  // 📦 Lấy user
  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem("user");
      if (json) setUser(JSON.parse(json));
    })();
  }, []);

  // 🔁 Load feed (với userId để xác định bài nào đã like)
  const fetchFeed = async () => {
    try {
      if (!user) return;
      const res = await axios.get(`${API_URL}/api/posts?userId=${user._id}`);
      setPosts(res.data);
    } catch (err: any) {
      console.warn("⚠️ Lỗi tải Feed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isFocused) fetchFeed();
  }, [user, isFocused]);

  // ❤️ Like / Unlike
  const toggleLike = async (postId: string) => {
    if (!user) return;
    try {
      const res = await axios.post(`${API_URL}/api/feed-likes`, {
        userId: user._id,
        postId,
      });

      // cập nhật UI
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                userLiked: res.data.liked, // ✅ gắn lại trạng thái like
                likeCount: res.data.likeCount,
              }
            : p
        )
      );
    } catch (err: any) {
      console.warn("⚠️ Lỗi like bài:", err.message);
    }
  };

  // 💬 Bình luận
  const fetchComments = async (postId: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/feed-comments/${postId}`);
      setComments(res.data);
    } catch (err: any) {
      console.warn("⚠️ Lỗi tải bình luận:", err.message);
    }
  };

  const openComments = async (post: any) => {
    setActivePost(post);
    setShowComments(true);
    await fetchComments(post._id);
  };

  const submitComment = async () => {
    if (!user || !newComment.trim()) return;
    try {
      await axios.post(`${API_URL}/api/feed-comments`, {
        postId: activePost._id,
        userId: user._id,
        content: newComment.trim(),
      });
      setNewComment("");
      await fetchComments(activePost._id);
    } catch (err: any) {
      console.warn("⚠️ Lỗi gửi bình luận:", err.message);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/feed-comments/${id}`, {
        data: { userId: user._id },
      });
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      console.warn("⚠️ Lỗi xoá bình luận:", err.message);
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Image
                source={{
                  uri: item.userId?.avatar || "https://i.pravatar.cc/100",
                }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.username}>{item.userId?.username}</Text>
                <Text style={styles.caption}>{item.caption}</Text>
              </View>
            </View>

            {/* Song Image */}
            <TouchableOpacity onPress={() => setSong(item.songId)}>
              <Image
                source={{ uri: item.songId?.thumbnail }}
                style={styles.songThumb}
              />
            </TouchableOpacity>
            <Text style={styles.songTitle}>{item.songId?.title}</Text>
            <Text style={styles.songArtist}>{item.songId?.artist}</Text>

            {/* Like & Comment */}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => toggleLike(item._id)}>
                <Ionicons
                  name={item.userLiked ? "heart" : "heart-outline"}
                  size={22}
                  color={item.userLiked ? "#E63946" : "#666"}
                />
              </TouchableOpacity>
              <Text style={styles.countText}>{item.likeCount ?? 0}</Text>

              <TouchableOpacity
                style={{ marginLeft: 16 }}
                onPress={() => openComments(item)}
              >
                <Ionicons name="chatbubble-outline" size={22} color="#666" />
              </TouchableOpacity>
              <Text style={styles.countText}>
                {item.commentCount ?? comments.length ?? 0}
              </Text>
            </View>
          </View>
        )}
      />

      {/* 💬 Modal */}
      <Modal visible={showComments} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {comments.length} bình luận
            </Text>

            <ScrollView style={{ flex: 1 }}>
              {comments.length === 0 ? (
                <Text style={styles.noComment}>Chưa có bình luận nào.</Text>
              ) : (
                comments.map((c) => (
                  <View key={c._id} style={styles.commentItem}>
                    <Image
                      source={{
                        uri: c.userId?.avatar || "https://i.pravatar.cc/50",
                      }}
                      style={styles.commentAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.commentUser}>{c.userId?.username}</Text>
                      <Text style={styles.commentText}>{c.content}</Text>
                    </View>
                    {user && c.userId?._id === user._id && (
                      <TouchableOpacity onPress={() => deleteComment(c._id)}>
                        <Ionicons name="trash-outline" size={18} color="#888" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                placeholder="Viết bình luận..."
                placeholderTextColor="#999"
                style={styles.input}
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity onPress={submitComment}>
                <Ionicons name="send" size={22} color="#1DB954" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
             onPress={() => {
                         setShowComments(false);
                        fetchFeed(); 
                        }}
            >
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🎨 Style sáng đẹp như ảnh bạn gửi
const styles = StyleSheet.create({
  container: { padding: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 10 },
  username: { color: "#111", fontWeight: "700", fontSize: 15 },
  caption: { color: "#555", fontSize: 13 },
  songThumb: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  songTitle: { color: "#111", fontSize: 17, fontWeight: "700" },
  songArtist: { color: "#666", marginBottom: 8 },
  actions: { flexDirection: "row", alignItems: "center" },
  countText: { color: "#444", marginLeft: 6, fontSize: 13 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "70%",
    padding: 16,
  },
  modalTitle: {
    color: "#111",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  noComment: { color: "#888", textAlign: "center", marginTop: 20 },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentUser: { color: "#111", fontWeight: "600", fontSize: 14 },
  commentText: { color: "#444", marginTop: 2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  input: {
    flex: 1,
    color: "#111",
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
    fontSize: 14,
    height: 36,
  },
  closeBtn: {
    backgroundColor: "#eaeaea",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  closeText: { color: "#333", fontWeight: "600" },
});
