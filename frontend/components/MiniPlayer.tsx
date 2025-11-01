import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMusic } from "../context/MusicContext";

export default function MiniPlayer({ song, onExpand }: any) {
  const { isPlaying, playPause, stopSong } = useMusic();
  if (!song) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={onExpand} activeOpacity={0.95}>
      <View style={styles.left}>
        <Image source={{ uri: song.thumbnail }} style={styles.thumb} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
        </View>
      </View>

      <View style={styles.rightControls}>
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); stopSong(); }}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="stop" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); playPause(); }}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={26} color="#000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1 },
  thumb: { width: 48, height: 48, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: "600", color: "#000" },
  artist: { fontSize: 13, color: "#666" },
  rightControls: { flexDirection: "row", alignItems: "center" },
});
