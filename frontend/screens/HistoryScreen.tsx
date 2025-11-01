import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useRoute,
  useNavigation,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { API_URL } from "../config/api";
import { useMusic } from "../context/MusicContext";
// import MusicPlayer from "../components/MusicPlayer";

type HistoryScreenRouteProp = RouteProp<RootStackParamList, "HistoryScreen">;
type HistoryScreenNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "HistoryScreen"
>;

export default function HistoryScreen() {
  const route = useRoute<HistoryScreenRouteProp>();
  const navigation = useNavigation<HistoryScreenNavProp>();
  const { userId } = route.params;

  const { setSong } = useMusic();

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/${userId}/history`);
        const data = await res.json();
        setHistory(data || []);
      } catch (err) {
        console.error("❌ Lỗi tải lịch sử:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7b2ff7" />
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử nghe</Text>
          <View style={{ width: 26 }} />
        </View>

        {history.length === 0 ? (
          <Text style={styles.noData}>Bạn chưa nghe bài hát nào.</Text>
        ) : (
          history.map((song: any) => (
            <TouchableOpacity
              key={song._id}
              style={styles.songItem}
              onPress={() => setSong(song, history)}
            >
              <Image
                source={{ uri: song.thumbnail || "https://picsum.photos/100" }}
                style={styles.songThumb}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.songTitle}>{song.title}</Text>
                <Text style={styles.songArtist}>{song.artist}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={28} color="#7b2ff7" />
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ✅ Giữ mini/full player hiển thị ở mọi màn */}
      {/* <MusicPlayer /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#000" },
  noData: { textAlign: "center", color: "#666", marginTop: 40 },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  songThumb: { width: 60, height: 60, borderRadius: 8 },
  songTitle: { fontWeight: "700", color: "#000" },
  songArtist: { color: "#666", fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
