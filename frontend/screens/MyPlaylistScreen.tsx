import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMusic } from "../context/MusicContext";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function MyPlaylistScreen() {
  const { setSong } = useMusic();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { playlist } = route.params;

  return (
    <View style={styles.container}>
      {/* Ảnh cover + nút back */}
      <View>
        <Image
          source={{
            uri:
              playlist.coverImage ||
              playlist.songs[0]?.thumbnail ||
              "https://picsum.photos/400",
          }}
          style={styles.cover}
        />

        {/* Nút back góc trái */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{playlist.title}</Text>
      <Text style={styles.desc}>{playlist.description || "Không có mô tả"}</Text>

      <ScrollView>
        {playlist.songs?.length === 0 ? (
          <Text style={styles.noSong}>Playlist trống.</Text>
        ) : (
          playlist.songs.map((s: any) => (
            <TouchableOpacity
              key={s._id}
              style={styles.songRow}
              onPress={() => setSong(s, playlist.songs)}
            >
              <Image source={{ uri: s.thumbnail }} style={styles.thumb} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.songTitle}>{s.title}</Text>
                <Text style={styles.songArtist}>{s.artist}</Text>
              </View>
              <Ionicons name="play-circle-outline" size={24} color="#1DB954" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  cover: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginBottom: 10,
  },
  backBtn: {
    position: "absolute",
    top: 20,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 6,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#000" },
  desc: { color: "#666", marginBottom: 14 },
  noSong: { color: "#888", textAlign: "center", marginTop: 20 },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  thumb: { width: 60, height: 60, borderRadius: 8 },
  songTitle: { fontWeight: "600", color: "#000", fontSize: 15 },
  songArtist: { color: "#666", fontSize: 13 },
});
