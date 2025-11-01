import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { API_URL } from "../config/api";
import { useMusic } from "../context/MusicContext";

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "ProfileScreen">;

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [followingArtists, setFollowingArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { reset } = useMusic();

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem("user");
        if (!json) {
          navigation.replace("LoginScreen");
          return;
        }

        const u = JSON.parse(json);
        setUser(u);

        // ✅ Lấy danh sách nghệ sĩ đang theo dõi
        const followRes = await fetch(`${API_URL}/api/users/${u._id}`);
        const userData = await followRes.json();
        setFollowingArtists(userData.followingArtists || []);

        // ✅ Lấy lịch sử nghe (limit 2 bài)
        const historyRes = await fetch(`${API_URL}/api/users/${u._id}/history`);
        const historyData = await historyRes.json();
        setRecentSongs((historyData || []).slice(0, 2));
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu hồ sơ:", err);
      }
    })();
  }, [navigation]);

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await AsyncStorage.removeItem("user");
            reset();
            setLoading(false);
            Alert.alert("Thành công", "Đăng xuất thành công!");
            navigation.replace("LoginScreen");
          } catch (err: any) {
            setLoading(false);
            Alert.alert("Lỗi", "Đăng xuất thất bại, vui lòng thử lại.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#7b2ff7", "#f107a3"]} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{ uri: user?.avatar || "https://i.pravatar.cc/150?img=10" }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{user?.username || "Người dùng"}</Text>
          <Text style={styles.email}>{user?.email || "user@email.com"}</Text>
        </View>
      </LinearGradient>

      {/* Hàng thống kê */}
      <View style={styles.statsRow}>
        {/* Theo dõi */}
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => navigation.navigate("FollowingScreen", { userId: user?._id })}
        >
          <Ionicons name="person-add-outline" size={22} color="#7b2ff7" />
          <Text style={styles.statValue}>{followingArtists.length}</Text>
          <Text style={styles.statLabel}>Đang theo dõi</Text>
        </TouchableOpacity>

        {/* Lịch sử nghe */}
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => navigation.navigate("HistoryScreen", { userId: user?._id })}
        >
          <Ionicons name="musical-notes-outline" size={22} color="#7b2ff7" />
          <Text style={styles.statValue}>{recentSongs.length}</Text>
          <Text style={styles.statLabel}>Lịch sử nghe</Text>
        </TouchableOpacity>
      </View>

      {/* Lịch sử nghe gần đây */}
      <View style={styles.recentContainer}>
        <Text style={styles.recentTitle}>Đã nghe gần đây</Text>
        {recentSongs.length === 0 ? (
          <Text style={styles.noData}>Bạn chưa nghe bài hát nào.</Text>
        ) : (
          recentSongs.map((song, idx) => (
            <View key={idx} style={styles.songItem}>
              <Image
                source={{ uri: song.thumbnail || "https://picsum.photos/100" }}
                style={styles.songThumb}
              />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{song.title}</Text>
                <Text style={styles.songArtist}>{song.artist}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#aaa" />
            </View>
          ))
        )}

        {/* Nút xem tất cả */}
        {recentSongs.length > 0 && (
          <TouchableOpacity
            onPress={() => navigation.navigate("HistoryScreen", { userId: user?._id })}
          >
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nút đăng xuất */}
      <TouchableOpacity
        style={[styles.logoutButton, loading && { opacity: 0.7 }]}
        onPress={handleLogout}
        disabled={loading}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>{loading ? "Đang đăng xuất..." : "Đăng xuất"}</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>Bạn sẽ được đăng xuất khỏi tất cả thiết bị.</Text>
      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  profileSection: { alignItems: "center", marginTop: 20 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  username: { color: "#fff", fontSize: 24, fontWeight: "700", marginTop: 12 },
  email: { color: "#f5f5f5", fontSize: 14, marginBottom: 10 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#000", marginTop: 6 },
  statLabel: { color: "#666", fontSize: 12 },
  recentContainer: { marginTop: 30, paddingHorizontal: 20 },
  recentTitle: { fontSize: 18, fontWeight: "700", color: "#000" },
  noData: { color: "#666", marginTop: 10, fontStyle: "italic" },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  songThumb: { width: 60, height: 60, borderRadius: 10 },
  songInfo: { flex: 1, marginLeft: 10 },
  songTitle: { fontWeight: "700", color: "#000" },
  songArtist: { color: "#666", fontSize: 13 },
  seeAll: {
    textAlign: "right",
    color: "#7b2ff7",
    marginTop: 10,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff4b4b",
    marginHorizontal: 40,
    marginTop: 40,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  footerNote: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 12,
    marginTop: 6,
  },
});
