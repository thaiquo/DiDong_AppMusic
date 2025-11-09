import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config/api";
import { useMusic } from "../context/MusicContext";
import { useUser } from "../context/UserContext";


const { width, height } = Dimensions.get("window");

export default function FullPlayer({ song, onMinimize }: any) {
  const insets = useSafeAreaInsets();
  const {
    isPlaying,
    playPause,
    position,
    duration,
    seekTo,
    nextSong,
    previousSong,
    isTimerActive,
    timerRemaining,
    toggleTimer,
  } = useMusic();

  const [seeking, setSeeking] = useState(false);
  const [seekPos, setSeekPos] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(song.likeCount || 0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);


  // ➕ Thêm state cho chia sẻ
  const [showShare, setShowShare] = useState(false);
  const [caption, setCaption] = useState("");

  // 📦 Lấy user và kiểm tra like
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem("user");
        if (!json) return;
        const u = JSON.parse(json);
        setUser(u);

        // Lấy thông tin mới nhất của bài hát
        const songRes = await axios.get(`${API_URL}/api/songs/${song._id}`);
        setLikes(songRes.data.likeCount || 0);

        // Kiểm tra user đã like chưa
        const userRes = await axios.get(`${API_URL}/api/users/${u._id}`);
        const favs = (userRes.data.favoriteSongs || []).map((s: any) =>
          typeof s === "string" ? s : s._id
        );
        setIsLiked(favs.includes(song._id));
      } catch (err: any) {
        console.warn("⚠️ Lỗi lấy dữ liệu like:", err.message);
      }
    })();
  }, [song._id]);

  // 💬 Lấy bình luận
  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/comments/${song._id}`);
      setComments(res.data || []);
    } catch (err: any) {
      console.warn("⚠️ Lỗi lấy bình luận:", err.message);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [song._id]);

  // ❤️ Toggle Like
  const toggleLike = async () => {
     if (!user || user.role === "guest") {
    Alert.alert("Thông báo", "Chỉ người dùng đã đăng nhập mới có thể thích bài hát!");
    return;
  }

    try {
      setIsLiked((prev) => !prev);
      setLikes((prev: number) => (isLiked ? Math.max(0, prev - 1) : prev + 1));

      const res = await axios.post(`${API_URL}/api/songs/like`, {
        songId: song._id,
        userId: user._id,
      });

      setIsLiked(res.data.liked);
      setLikes(res.data.likeCount);

      const userRes = await axios.get(`${API_URL}/api/users/${user._id}`);
      await AsyncStorage.setItem("user", JSON.stringify(userRes.data));
    } catch (err: any) {
      console.warn("⚠️ Lỗi toggleLike:", err.message);
    }
  };

  // 💬 Gửi bình luận
  const submitComment = async () => {
    if (!user || user.role === "guest") {
    Alert.alert("Thông báo", "Bạn cần đăng nhập để bình luận!");
    return;
  }
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/api/comments/add`, {
        song: song._id,
        user: user._id,
        content: newComment.trim(),
      });

      setNewComment("");
      setComments((prev) => [res.data.comment, ...prev]);
      song.commentCount = res.data.commentCount;
      fetchComments();
    } catch (err: any) {
      console.warn("⚠️ Lỗi gửi bình luận:", err.message);
    }
  };

  // 💬 Xóa bình luận
  const deleteComment = async (commentId: string) => {
    if (!user) return;

    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa bình luận này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/api/comments/${commentId}`, {
              data: { userId: user._id },
            });
            setComments((prev) => prev.filter((c) => c._id !== commentId));
          } catch (err: any) {
            console.warn("⚠️ Lỗi xóa bình luận:", err.message);
            Alert.alert("Lỗi", "Không thể xóa bình luận của người khác!");
          }
        },
      },
    ]);
  };

  // 📤 Chia sẻ bài hát lên Feed
  const shareToFeed = async () => {
     if (!user || user.role === "guest") {
    Alert.alert("Thông báo", "Chỉ người dùng đăng nhập mới có thể đăng bài lên bảng tin!");
    return;
  }

    try {
      await axios.post(`${API_URL}/api/posts`, {
        userId: user._id,
        songId: song._id,
        caption: caption.trim() || "🎧 Đang chill cùng nhạc!",
      });

      Alert.alert("✅ Thành công", "Bài hát đã được chia sẻ lên bảng tin!");
      setShowShare(false);
      setCaption("");
      // Không gọi navigation ở đây vì component nằm ngoài NavigationContainer
    } catch (err: any) {
      Alert.alert("Lỗi", "Không thể chia sẻ bài hát, thử lại sau.");
    }
  };

  // ⏱ Format thời gian
  const fmt = (ms?: number) => {
    const t = Math.floor((ms || 0) / 1000);
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const fmtTimer = (ms: number) => {
    const t = Math.floor(ms / 1000);
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}m ${s}s`;
  };

  return (
    <SafeAreaView style={styles.full} edges={["top", "bottom"]}>
      <Image
        source={{ uri: song.thumbnail }}
        style={styles.bg}
        blurRadius={40}
      />

      <View
        style={[
          styles.overlay,
          { paddingBottom: insets.bottom + 10, paddingTop: insets.top + 10 },
        ]}
      >
        {/* 🔙 Nút thu nhỏ */}
        <TouchableOpacity style={styles.back} onPress={onMinimize}>
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </TouchableOpacity>

        {/* ⏱ Hẹn giờ */}
        <TouchableOpacity style={styles.timer} onPress={toggleTimer}>
          <Ionicons
            name="timer-outline"
            size={28}
            color={isTimerActive ? "#ff4b4b" : "#fff"}
          />
          {isTimerActive && (
            <Text style={styles.timerText}>{fmtTimer(timerRemaining)}</Text>
          )}
        </TouchableOpacity>

        {/* ⋯ Chia sẻ */}
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={() => {
            if (!user || user.role === "guest") {
              Alert.alert(
                "Yêu cầu đăng nhập",
                "Bạn cần đăng nhập để chia sẻ bài hát lên bảng tin!",
                [
                  {
                    text: "Đăng nhập",
                    onPress: () =>
                      console.log("Chuyển sang login screen nếu cần"),
                  },
                  {
                    text: "Đăng ký",
                    onPress: () =>
                      console.log("Chuyển sang register screen nếu cần"),
                  },
                  { text: "Để sau", style: "cancel" },
                ]
              );
              return;
            }

            setShowShare(true); // ✅ Chỉ mở modal nếu user đã đăng nhập
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={28} color="#fff" />
        </TouchableOpacity>

        <Image source={{ uri: song.thumbnail }} style={styles.cover} />
        <Text style={styles.title}>{song.title}</Text>
        <Text style={styles.artist}>{song.artist}</Text>

        {/* ❤️ Like */}
        <TouchableOpacity
          style={[
            styles.likeBtn,
            { opacity: user?.role === "guest" ? 0.5 : 1 },
          ]}
          onPress={toggleLike}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={32}
            color={isLiked ? "#ff4b4b" : "#fff"}
          />
          <Text style={styles.likeText}>{likes}</Text>
        </TouchableOpacity>

        {/* 🎚 Thanh tiến độ */}
        <View style={{ width: "90%", marginTop: 10 }}>
          <Slider
            value={seeking ? seekPos : position}
            minimumValue={0}
            maximumValue={duration || 1}
            onValueChange={(v) => {
              setSeeking(true);
              setSeekPos(v);
            }}
            onSlidingComplete={async (v) => {
              setSeeking(false);
              await seekTo(v);
            }}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="rgba(255,255,255,0.4)"
            thumbTintColor="#fff"
          />
          <View style={styles.timeRow}>
            <Text style={styles.time}>{fmt(seeking ? seekPos : position)}</Text>
            <Text style={styles.time}>{fmt(duration)}</Text>
          </View>
        </View>

        {/* 🎵 Điều khiển */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={previousSong}>
            <Ionicons name="play-skip-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={playPause}>
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={80}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextSong}>
            <Ionicons name="play-skip-forward" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* 💬 Bình luận */}
        <View style={styles.commentBox}>
          <Text style={styles.commentTitle}>Bình luận</Text>
          <ScrollView
            style={styles.commentList}
            showsVerticalScrollIndicator={false}
          >
            {comments.length === 0 ? (
              <Text style={{ color: "#ccc" }}>Chưa có bình luận nào.</Text>
            ) : (
              comments.map((c, i) => (
                <View key={i} style={styles.commentItem}>
                  <Image
                    source={{
                      uri: c.user?.avatar || "https://i.pravatar.cc/50",
                    }}
                    style={styles.commentAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentUser}>{c.user?.username}</Text>
                    <Text style={styles.commentText}>{c.content}</Text>
                  </View>
                  {user && c.user?._id === user._id && (
                    <TouchableOpacity
                      style={{ marginLeft: 8, padding: 4 }}
                      onPress={() => deleteComment(c._id)}
                    >
                      <Ionicons name="trash" size={18} color="#ff4b4b" />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              placeholder={
                !user || user.role === "guest"
                  ? "Đăng nhập để bình luận..."
                  : "Nhập bình luận..."
              }
              placeholderTextColor="#aaa"
              style={[
                styles.input,
                { color: user?.role === "guest" ? "#999" : "#fff" },
              ]}
              value={newComment}
              onChangeText={setNewComment}
              editable={!!user && user.role !== "guest"} // ❌ không cho gõ nếu guest
            />
            <TouchableOpacity
              disabled={!user || user.role === "guest"} // ❌ không gửi nếu guest
              onPress={submitComment}
            >
              <Ionicons
                name="send"
                size={22}
                color={!user || user.role === "guest" ? "#666" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 📤 Modal chia sẻ */}
        <Modal visible={showShare} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chia sẻ bài hát</Text>

              <Image
                source={{ uri: song.thumbnail }}
                style={styles.modalThumbnail}
              />
              <Text style={styles.modalSongTitle}>{song.title}</Text>
              <Text style={styles.modalArtist}>{song.artist}</Text>

              <TextInput
                placeholder="Viết cảm nghĩ của bạn..."
                placeholderTextColor="#aaa"
                style={styles.modalInput}
                value={caption}
                onChangeText={setCaption}
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#888" }]}
                  onPress={() => setShowShare(false)}
                >
                  <Text style={styles.modalBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!user || user.role === "guest"}
                  style={[
                    styles.modalBtn,
                    {
                      backgroundColor:
                        !user || user.role === "guest" ? "#555" : "#1DB954",
                    },
                  ]}
                  onPress={() => {
                    if (!user || user.role === "guest") {
                      Alert.alert(
                        "Yêu cầu đăng nhập",
                        "Bạn cần đăng nhập để chia sẻ bài hát lên bảng tin!"
                      );
                      return;
                    }
                    shareToFeed();
                  }}
                >
                  <Text style={styles.modalBtnText}>
                    {!user || user.role === "guest" ? "Cần đăng nhập" : "Đăng"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  full: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000", zIndex: 10000 },
  bg: { position: "absolute", width, height, resizeMode: "cover" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  back: { position: "absolute", top: 10, left: 20 },
  timer: {
    position: "absolute",
    top: 10,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  moreBtn: { position: "absolute", top: 10, right: 70 },
  timerText: { color: "#fff", marginLeft: 8, fontSize: 12 },
  cover: { width: 300, height: 300, borderRadius: 16, marginBottom: 10 },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },
  artist: { color: "#ddd", marginTop: 4 },
  likeBtn: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  likeText: { color: "#fff", marginLeft: 6, fontSize: 14 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  time: { color: "#ccc", fontSize: 12 },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "80%",
    marginTop: 10,
  },
  commentBox: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
    height: 180,
  },
  commentTitle: { color: "#fff", fontWeight: "600", marginBottom: 6 },
  commentList: { maxHeight: 100 },
  commentItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  commentUser: { color: "#fff", fontWeight: "600" },
  commentText: { color: "#ddd" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 6,
  },
  input: {
    flex: 1,
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1c1c1c",
    width: "85%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginBottom: 10 },
  modalThumbnail: { width: 120, height: 120, borderRadius: 12, marginBottom: 10 },
  modalSongTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modalArtist: { color: "#bbb", marginBottom: 10 },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    width: "100%",
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    minHeight: 70,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalBtnText: { color: "#fff", fontWeight: "600" },
});
