import React from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MusicProvider } from "./context/MusicContext"; 
import AppNavigator from "./navigation/AppNavigator"; 
import OverlayPlayer from "./components/OverlayPlayer";  // ⬅️ mini + full “đè” lên trên

export default function App() {
  return (
    <SafeAreaProvider>
      <MusicProvider>
        <View style={styles.root}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>

          {/* Luôn render trên tất cả screen, không che tab */}
          <OverlayPlayer />
        </View>
      </MusicProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
