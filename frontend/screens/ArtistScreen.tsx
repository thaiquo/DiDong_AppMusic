import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import useFetch from "../hooks/useFetch";
import { useMusic } from "../context/MusicContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config/api";
// import MusicPlayer from "../components/MusicPlayer"; // ✅ quan trọng

type ArtistScreenRouteProp = RouteProp<RootStackParamList, "ArtistScreen">;
type ArtistScreenNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "ArtistScreen"
>;

export default function ArtistScreen() {
  const route = useRoute<ArtistScreenRouteProp>();
  const navigation = useNavigation<ArtistScreenNavProp>();
  const { artistId } = route.params;
  const { setSong } = useMusic();

  // ✅ Fetch artist info
  const { data: artist } = useFetch<any>(`/api/artists/${artistId}`);

  const [user, setUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ Lấy user hiện tại
  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem("user");
      if (json) {
        const parsed = JSON.parse(json);
        setUser(parsed);

        try {
          const res = await axios.get(`${API_URL}/api/users/${parsed._id}`);
          const found = res.data.followingArtists?.some(
            (a: any) => a._id === artistId
          );
          setIsFollowing(found);
        } catch (err) {
          console.log("Error fetching user:", err);
        }
      }
    })();
  }, [artistId]);

  // ✅ Đồng bộ followers count khi load artist
  useEffect(() => {
    if (artist) setFollowers(artist.followersCount ?? 0);
  }, [artist]);

  // ✅ Follow / Unfollow
  const handleFollow = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/artists/follow`, {
        userId: user._id,
        artistId,
      });
      setFollowers(res.data.followersCount);
      setIsFollowing(res.data.isFollowing);
    } catch (e) {
      console.log("Follow error:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading state
  if (!artist) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backIconBg}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </View>
        </TouchableOpacity>

        {/* Cover */}
        <Image source={{ uri: artist.coverImage }} style={styles.cover} />

        {/* Profile */}
        <View style={styles.profile}>
          <Image source={{ uri: artist.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{artist.name}</Text>
          <Text style={styles.followers}>
            {Number(followers || artist.followersCount || 0).toLocaleString()} Followers
          </Text>

          {/* Follow / Unfollow Button */}
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && { backgroundColor: "#ddd" }]}
            onPress={handleFollow}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text
                style={[styles.followText, isFollowing && { color: "#000" }]}
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Songs */}
        <Text style={styles.sectionTitle}>Popular</Text>
        {artist.songs?.map((s: any) => (
          <TouchableOpacity
            key={s._id}
            style={styles.songRow}
            onPress={() => setSong(s, artist.songs)} // ✅ bật nhạc trực tiếp
          >
            <Image source={{ uri: s.thumbnail }} style={styles.songImg} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.songTitle}>{s.title}</Text>
              <Text style={styles.songArtist}>{artist.name}</Text>
            </View>
            <Ionicons name="play-circle-outline" size={28} color="#7b2ff7" />
          </TouchableOpacity>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ✅ MiniPlayer / FullPlayer luôn hiển thị khi có bài hát */}
      {/* <MusicPlayer /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  backIconBg: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 30,
    padding: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cover: { width: "100%", height: 250 },
  profile: { alignItems: "center", marginTop: -60 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: { fontSize: 24, fontWeight: "700", marginTop: 10 },
  followers: { color: "#666" },
  followBtn: {
    marginTop: 12,
    backgroundColor: "#000",
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: 30,
  },
  followText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "700", margin: 20 },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 8,
  },
  songImg: { width: 60, height: 60, borderRadius: 8 },
  songTitle: { fontWeight: "600" },
  songArtist: { color: "#666" },
});
