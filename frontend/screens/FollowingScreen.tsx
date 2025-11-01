import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { API_URL } from "../config/api";

// ✅ Kiểu dữ liệu điều hướng
type FollowingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "FollowingScreen"
>;
type FollowingScreenRouteProp = RouteProp<
  RootStackParamList,
  "FollowingScreen"
>;

export default function FollowingScreen() {
  const route = useRoute<FollowingScreenRouteProp>();
  const navigation = useNavigation<FollowingScreenNavigationProp>();
  const { userId } = route.params;

  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/${userId}`);
        const userData = await res.json();
        setArtists(userData.followingArtists || []);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách theo dõi:", err);
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nghệ sĩ bạn theo dõi</Text>
        <View style={{ width: 26 }} />
      </View>

      {artists.length === 0 ? (
        <Text style={styles.noData}>Bạn chưa theo dõi nghệ sĩ nào.</Text>
      ) : (
        artists.map((a: any) => (
          <TouchableOpacity
            key={String(a._id)}
            style={styles.artistItem}
            onPress={() =>
              navigation.navigate("ArtistScreen", { artistId: String(a._id) })
            }
          >
            <Image
              source={{ uri: a.avatar || "https://i.pravatar.cc/150" }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.artistName}>{a.name}</Text>
              <Text style={styles.artistBio} numberOfLines={1}>
                {a.bio || "Nghệ sĩ"}
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#999" />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#000" },
  noData: { textAlign: "center", marginTop: 40, color: "#666" },
  artistItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  artistName: { fontSize: 16, fontWeight: "700", color: "#000" },
  artistBio: { color: "#666", fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
