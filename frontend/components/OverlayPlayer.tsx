import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMusic } from "../context/MusicContext";
import MiniPlayer from "./MiniPlayer";
import FullPlayer from "./FullPlayer";
import { TAB_BAR_HEIGHT } from "../constants/ui";

export default function OverlayPlayer() {
  const insets = useSafeAreaInsets();
  const { currentSong, isFullPlayer, setIsFullPlayer } = useMusic();

  if (!currentSong) return null;

  // MiniPlayer nằm ngay trên tab bar: tab(60) + safe bottom (iPhone có notch)
  const miniBottom = TAB_BAR_HEIGHT + Math.max(insets.bottom, 0) + 8;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {!isFullPlayer ? (
        <View
          pointerEvents="box-none"
          style={[styles.miniWrap, { bottom: miniBottom }]}
        >
          <MiniPlayer song={currentSong} onExpand={() => setIsFullPlayer(true)} />
        </View>
      ) : (
        // Full phủ toàn màn nhưng tôn trọng safe area (nút back/controls không bị tràn)
        <View style={styles.fullWrap} pointerEvents="box-none">
          <FullPlayer song={currentSong} onMinimize={() => setIsFullPlayer(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  miniWrap: {
    position: "absolute",
    left: 12,
    right: 12,
    // bottom được set động ở trên
    zIndex: 9999,
  },
  fullWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10000,
  },
});
