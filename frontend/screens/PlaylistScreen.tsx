import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { RootStackParamList } from "../types/navigation";
import { API_URL } from "../config/api";
import useFetch from "../hooks/useFetch";
import { useMusic } from "../context/MusicContext";

type PlaylistScreenRouteProp = RouteProp<RootStackParamList, "PlaylistScreen">;

export default function PlaylistScreen() {
  const route = useRoute<PlaylistScreenRouteProp>();
  const navigation = useNavigation();
  const { playlistId } = route.params;
  const { setSong } = useMusic();

  const [user, setUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // ✅ Lấy chi tiết playlist
  const { data: playlist } = useFetch<any>(`/api/playlists/${playlistId}`);

  // ✅ Lấy thông tin user từ AsyncStorage
  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem("user");
      if (json) setUser(JSON.parse(json));
    })();
  }, []);

  // ✅ Kiểm tra user đã follow playlist này chưa
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || !playlistId) return;
      try {
        const res = await axios.get(`${API_URL}/api/follow-playlist/user/${user._id}`);
        const hasFollowed = res.data.some((f: any) => f.playlistId._id === playlistId);
        setIsFollowing(hasFollowed);
      } catch (err) {
        console.log("❌ Lỗi kiểm tra follow:", err);
      }
    };
    checkFollowStatus();
  }, [user, playlistId]);

  // ✅ Đồng bộ số người theo dõi
  useEffect(() => {
    if (playlist?.followersCount) setFollowersCount(playlist.followersCount);
  }, [playlist]);

  // ✅ Khi bấm Follow/Unfollow
  const handleFollowToggle = async () => {
    if (!user) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để theo dõi playlist!");
      return;
    }

    setLoadingFollow(true);
    try {
      if (isFollowing) {
        // 🔹 Nếu đã follow -> gọi API hủy theo dõi
        await axios.delete(`${API_URL}/api/follow-playlist/${playlistId}/follow`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        // 🔹 Nếu chưa follow -> gọi API theo dõi
        await axios.post(
          `${API_URL}/api/follow-playlist/${playlistId}/follow`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch (err: unknown) {
      console.log("❌ Lỗi follow:", err);
      Alert.alert("Lỗi", "Không thể cập nhật theo dõi. Vui lòng thử lại!");
    } finally {
      setLoadingFollow(false);
    }
  };

  if (!playlist) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Nút quay lại */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <View style={styles.backIconBg}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </View>
        </TouchableOpacity>

        {/* Ảnh bìa */}
        <Image source={{ uri: playlist.coverImage }} style={styles.cover} />

        {/* Thông tin playlist */}
        <View style={styles.info}>
          <Text style={styles.title}>{playlist.title}</Text>
          <Text style={styles.desc}>{playlist.description}</Text>
          <Text style={styles.count}>
            {playlist.songs?.length || 0} bài hát – {followersCount} người theo dõi
          </Text>

          {/* ✅ Nút Follow / Unfollow */}
          <TouchableOpacity
            style={[
              styles.followBtn,
              { backgroundColor: isFollowing ? "#ccc" : "#1DB954" },
            ]}
            onPress={handleFollowToggle}
            disabled={loadingFollow}
          >
            <Ionicons
              name={isFollowing ? "checkmark" : "add"}
              size={20}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.followText}>
              {isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Danh sách bài hát */}
        {playlist.songs?.map((song: any) => (
          <TouchableOpacity
            key={song._id}
            style={styles.songRow}
            onPress={() => setSong(song, playlist.songs)}
          >
            <Image source={{ uri: song.thumbnail }} style={styles.songImg} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.songTitle}>{song.title}</Text>
              <Text style={styles.songArtist}>{song.artist}</Text>
            </View>
            <Text style={styles.songDuration}>{song.duration}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  backIconBg: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 30,
    padding: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
  },
  cover: { width: "100%", height: 250 },
  info: { padding: 20 },
  title: { fontSize: 26, fontWeight: "700" },
  desc: { color: "#555", marginVertical: 6 },
  count: { color: "#777", marginBottom: 16 },
  followBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followText: { color: "#fff", fontWeight: "600" },
  songRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 16 },
  songImg: { width: 60, height: 60, borderRadius: 8 },
  songTitle: { fontWeight: "600" },
  songArtist: { color: "#666" },
  songDuration: { color: "#999" },
});
