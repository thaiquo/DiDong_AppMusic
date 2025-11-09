import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useMusic } from "../context/MusicContext";
import { API_URL } from "../config/api";
import { useNavigation } from "@react-navigation/native";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { setSong } = useMusic();
  const navigation = useNavigation<any>();

  // 🧠 Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) fetchResults(query);
      else setResults(null);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // 📡 Fetch search results
  const fetchResults = async (text: string) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/search?q=${encodeURIComponent(text)}`);
      setResults(res.data);
    } catch (err: any) {
      console.warn("❌ Search error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎧 Handle play song
  const handlePlaySong = async (song: any, playlist: any[]) => {
    if (!song?.audioUrl) {
      alert("Bài hát này hiện chưa có file audio để phát 🎧");
      return;
    }
    Keyboard.dismiss();
    await setSong(song, playlist);
  };

  return (
    <View style={styles.container}>
      {/* 🔍 Header */}
      <Text style={styles.header}>Tìm kiếm</Text>

      {/* Ô nhập tìm kiếm */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          placeholder="Nhập tên bài hát, nghệ sĩ hoặc playlist..."
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setQuery("");
              setResults(null);
              Keyboard.dismiss();
            }}
          >
            <Ionicons name="close-circle" size={20} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading spinner */}
      {loading && (
        <ActivityIndicator size="large" color="#1DB954" style={{ marginTop: 20 }} />
      )}

      {/* Kết quả tìm kiếm */}
      {!loading && results && (
        <ScrollView style={{ marginTop: 10 }} showsVerticalScrollIndicator={false}>
          {/* 🎵 Bài hát */}
          {results.songs?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🎵 Bài hát</Text>
              {results.songs.map((s: any, idx: number) => (
                <TouchableOpacity
                  key={s._id || idx}
                  style={styles.item}
                  onPress={() => handlePlaySong(s, results.songs)}
                >
                  <Image source={{ uri: s.thumbnail }} style={styles.thumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{s.title}</Text>
                    <Text style={styles.subtitle}>{s.artist}</Text>
                  </View>
                  <Ionicons name="play-circle" size={28} color="#1DB954" />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* 👨‍🎤 Nghệ sĩ */}
          {results.artists?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>👨‍🎤 Nghệ sĩ</Text>
              {results.artists.map((a: any, idx: number) => (
                <TouchableOpacity
                  key={a._id || idx}
                  style={styles.item}
                  onPress={() =>
                    navigation.navigate("ArtistScreen", { artistId: a._id })
                  }
                >
                  <Image source={{ uri: a.avatar }} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{a.name}</Text>
                    <Text style={styles.subtitle}>{a.country}</Text>
                  </View>
                  <Ionicons name="person-circle" size={26} color="#1DB954" />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* 🎧 Playlist */}
          {results.playlists?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🎧 Playlist</Text>
              {results.playlists.map((p: any, idx: number) => (
                <TouchableOpacity
                  key={p._id || idx}
                  style={styles.item}
                  onPress={() =>
                    navigation.navigate("PlaylistScreen", { playlistId: p._id })
                  }
                >
                  <Image source={{ uri: p.coverImage }} style={styles.thumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{p.title}</Text>
                    <Text numberOfLines={1} style={styles.subtitle}>
                      {p.description || "Playlist nổi bật"}
                    </Text>
                  </View>
                  <Ionicons name="albums-outline" size={26} color="#1DB954" />
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* ❌ Không có kết quả */}
          {results.songs?.length === 0 &&
            results.artists?.length === 0 &&
            results.playlists?.length === 0 && (
              <Text style={styles.noResult}>
                😕 Không tìm thấy kết quả phù hợp.
              </Text>
            )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 12, color: "#111" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 16, color: "#000" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 18, marginBottom: 6 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  thumb: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  title: { fontSize: 16, fontWeight: "600", color: "#111" },
  subtitle: { color: "#666", fontSize: 13 },
  noResult: { textAlign: "center", color: "#888", marginTop: 30, fontSize: 15 },
});
