import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config/api";
import { useMusic } from "../context/MusicContext";
import { useNavigation } from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";
import MyPlaylistScreen from "./MyPlaylistScreen";

const FILTERS = [
  { key: "favorites", label: "Your favorites" },
  { key: "yourplaylists", label: "Your playlists" },
  { key: "history", label: "History" },
  { key: "artists", label: "Following artists" },
  { key: "followPlaylists", label: "Followed playlists" },
  { key: "comments", label: "Your comments" },
  { key: "likefeed", label: "Liked feeds" },
  { key: "commentfeed", label: "Commented feeds" },
];

export default function LibraryScreen() {
  const { setSong } = useMusic();
  const navigation = useNavigation<any>();

  const [userId, setUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState("favorites");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Datasets
  const [favoriteSongs, setFavoriteSongs] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [followPlaylists, setFollowPlaylists] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [likeFeeds, setLikeFeeds] = useState<any[]>([]);
  const [commentFeeds, setCommentFeeds] = useState<any[]>([]);
  const [myPlaylists, setMyPlaylists] = useState<any[]>([]);
  const isFocused = useIsFocused();

  // get user info
  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem("user");
      if (json) {
        const user = JSON.parse(json);
        setUserId(user._id);
      }
    })();
  }, []);

  // fetch all library data
  useEffect(() => {
    if (!userId || !isFocused) return;
    (async () => {
      setLoading(true);
      try {
        const [userRes, hisRes, plRes, cmRes, likeRes, commentFeedRes,myPlaylists] =
          await Promise.all([
            axios.get(`${API_URL}/api/users/${userId}`),
            axios.get(`${API_URL}/api/users/${userId}/history`),
            axios.get(`${API_URL}/api/follow-playlist/user/${userId}`),
            axios.get(`${API_URL}/api/comments/user/${userId}`),
            axios.get(`${API_URL}/api/feed-likes/user/${userId}`),
            axios.get(`${API_URL}/api/feed-comments/user/${userId}`),
            axios.get(`${API_URL}/api/user-playlists/${userId}`),
          ]);

        setFavoriteSongs(userRes.data.favoriteSongs || []);
        setArtists(userRes.data.followingArtists || []);
        setHistory(hisRes.data || []);
        setFollowPlaylists(plRes.data || []);
        setComments(cmRes.data || []);
        setLikeFeeds(likeRes.data || []);
        setCommentFeeds(commentFeedRes.data || []);
        setMyPlaylists(myPlaylists.data || []);  
      } catch (err) {
        console.warn("❌ Error loading library:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, isFocused]);

  // search filter for favorites
  const filteredFavs = favoriteSongs.filter(
    (s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.artist?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7b2ff7" />
      </View>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Library</Text>

      {/* Filters */}
      <View style={styles.topRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterBtn,
                selected === f.key && styles.filterBtnActive,
              ]}
              onPress={() => setSelected(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  selected === f.key && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selected === "favorites" && (
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#888"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        )}
      </View>

      {/* FAVORITES */}
      {selected === "favorites" && (
        <ScrollView>
          {filteredFavs.length === 0 ? (
            <Text style={styles.noData}>No favorite songs found.</Text>
          ) : (
            filteredFavs.map((song) => (
              <TouchableOpacity
                key={song._id}
                style={styles.songRow}
                onPress={() => setSong(song, filteredFavs)}
              >
                <Image
                  source={{ uri: song.thumbnail }}
                  style={styles.songImg}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.songTitle}>{song.title}</Text>
                  <Text style={styles.songArtist}>{song.artist}</Text>
                </View>
                <Ionicons name="heart" size={22} color="#00B2FF" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* YOUR PLAYLISTS */}
      {selected === "yourplaylists" && (
        <ScrollView>
          {myPlaylists.length === 0 ? (
            <Text style={styles.noData}>Bạn chưa tạo playlist nào.</Text>
          ) : (
            myPlaylists.map((pl) => (
              <TouchableOpacity
                key={pl._id}
                style={styles.row}
                onPress={() => navigation.navigate("MyPlaylistScreen", { playlist: pl })}

              >
                <Image
                  source={{
                    uri:
                      pl.coverImage && pl.coverImage.trim() !== ""
                        ? pl.coverImage
                        : pl.songs[0]?.thumbnail || "https://picsum.photos/200",
                  }}
                  style={styles.playlistImg}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.playlistTitle}>{pl.title}</Text>
                  <Text style={{ color: "#666", fontSize: 13 }}>
                    {pl.songs?.length || 0} bài hát
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#999"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* LIKED FEEDS */}
      {selected === "likefeed" && (
        <ScrollView>
          {likeFeeds.length === 0 ? (
            <Text style={styles.noData}>Bạn chưa tim bài viết nào.</Text>
          ) : (
            likeFeeds.map((f) => (
              <TouchableOpacity
                key={f._id}
                style={styles.feedRow}
                onPress={() =>
                  navigation.navigate("FeedStack", {
                    screen: "FeedScreen",
                    params: { focusPostId: f.postId._id },
                  })
                }
              >
                <Image
                  source={{ uri: f.postId.songId?.thumbnail }}
                  style={styles.feedImg}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.feedTitle}>
                    {f.postId.songId?.title || "Bài nhạc"}
                  </Text>
                  <Text style={styles.feedUser}>
                    bởi {f.postId.userId?.username || "Người dùng"}
                  </Text>
                </View>
                <Ionicons name="heart" size={20} color="#ff4b4b" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* COMMENTED FEEDS */}
      {selected === "commentfeed" && (
        <ScrollView>
          {commentFeeds.length === 0 ? (
            <Text style={styles.noData}>Bạn chưa bình luận bài đăng nào.</Text>
          ) : (
            commentFeeds.map((c) => (
              <TouchableOpacity
                key={c._id}
                style={styles.feedRow}
                onPress={() =>
                  navigation.navigate("FeedStack", {
                    screen: "FeedScreen",
                    params: { focusPostId: c.postId._id },
                  })
                }
              >
                <Image
                  source={{ uri: c.postId.songId?.thumbnail }}
                  style={styles.feedImg}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.feedTitle}>
                    {c.postId.songId?.title || "Bài hát"}
                  </Text>
                  <Text style={styles.commentText}>
                    “{c.content.slice(0, 50)}...”
                  </Text>
                </View>
                <Ionicons name="chatbubble" size={18} color="#00B2FF" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* HISTORY */}
      {selected === "history" && (
        <ScrollView>
          {history.length === 0 ? (
            <Text style={styles.noData}>Bạn chưa nghe bài hát nào.</Text>
          ) : (
            history.map((song) => (
              <TouchableOpacity
                key={song._id}
                style={styles.songRow}
                onPress={() => setSong(song, history)}
              >
                <Image
                  source={{ uri: song.thumbnail }}
                  style={styles.songImg}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.songTitle}>{song.title}</Text>
                  <Text style={styles.songArtist}>{song.artist}</Text>
                </View>
                <Ionicons
                  name="play-circle-outline"
                  size={24}
                  color="#7b2ff7"
                />
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate("HistoryScreen", { userId })}
          >
            <Text style={styles.viewAllText}>Xem toàn bộ lịch sử nghe</Text>
            <Ionicons name="chevron-forward" size={18} color="#7b2ff7" />
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* FOLLOWING ARTISTS */}
      {selected === "artists" && (
        <ScrollView>
          {artists.length === 0 ? (
            <Text style={styles.noData}>Bạn chưa theo dõi nghệ sĩ nào.</Text>
          ) : (
            artists.map((a) => (
              <TouchableOpacity
                key={a._id}
                style={styles.row}
                onPress={() =>
                  navigation.navigate("ArtistScreen", { artistId: a._id })
                }
              >
                <Image
                  source={{ uri: a.avatar || "https://i.pravatar.cc/150" }}
                  style={styles.artistImg}
                />
                <Text style={styles.artistName}>{a.name}</Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#999"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* FOLLOWED PLAYLISTS */}
      {selected === "followPlaylists" && (
        <ScrollView>
          {followPlaylists.length === 0 ? (
            <Text style={styles.noData}>Bạn chưa theo dõi playlist nào.</Text>
          ) : (
            followPlaylists.map((f) => (
              <TouchableOpacity
                key={f._id}
                style={styles.row}
                onPress={() =>
                  navigation.navigate("PlaylistScreen", {
                    playlistId: f.playlistId._id,
                  })
                }
              >
                <Image
                  source={{ uri: f.playlistId.coverImage }}
                  style={styles.playlistImg}
                />
                <Text style={styles.playlistTitle}>{f.playlistId.title}</Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#999"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* COMMENTS */}
      {selected === "comments" && (
        <ScrollView>
          {comments.length === 0 ? (
            <Text style={styles.noData}>Bạn chưa bình luận bài hát nào.</Text>
          ) : (
            comments.map((c) => (
              <TouchableOpacity
                key={c._id}
                style={styles.commentRow}
                onPress={() => {
                  if (c.song?.audioUrl) {
                    setSong(c.song, [c.song]); // ✅ phát nhạc
                  } else {
                    console.warn("⚠️ Bài hát này chưa có audioUrl:", c.song);
                    alert("Bài hát này chưa có file âm thanh hoặc bị lỗi!");
                  }
                }}
              >
                <Image
                  source={{
                    uri: c.song?.thumbnail || "https://picsum.photos/100",
                  }}
                  style={styles.commentSongImg}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.commentSongTitle}>
                    {c.song?.title || "Bài hát"}
                  </Text>
                  <Text style={styles.commentText}>"{c.content}"</Text>
                </View>
                <Ionicons
                  name="play-circle-outline"
                  size={20}
                  color="#7b2ff7"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#f5f5f5",
    borderRadius: 18,
    marginRight: 8,
  },
  filterBtnActive: { backgroundColor: "#00B2FF" },
  filterText: { color: "#333", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    paddingHorizontal: 10,
    marginLeft: 8,
    flex: 1,
    height: 36,
  },
  searchInput: { flex: 1, marginLeft: 6, fontSize: 15 },
  noData: { color: "#888", textAlign: "center", marginTop: 24 },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingVertical: 4,
  },
  songImg: { width: 56, height: 56, borderRadius: 8 },
  songTitle: { fontSize: 16, fontWeight: "600" },
  songArtist: { color: "#666" },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  artistImg: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  artistName: { fontWeight: "600", fontSize: 16, color: "#000" },
  playlistImg: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  playlistTitle: { fontWeight: "600", fontSize: 16, color: "#000" },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  commentSongImg: { width: 50, height: 50, borderRadius: 6 },
  commentSongTitle: { fontWeight: "600", color: "#000" },
  commentText: { color: "#555", fontStyle: "italic" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 8,
  },
  viewAllText: { color: "#7b2ff7", fontWeight: "600", marginRight: 4 },
  feedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 6,
  },
  feedImg: { width: 60, height: 60, borderRadius: 10 },
  feedTitle: { fontWeight: "600", color: "#000", fontSize: 15 },
  feedUser: { color: "#666", fontSize: 13 },
});
