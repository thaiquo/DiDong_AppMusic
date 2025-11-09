import React from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MusicProvider } from "./context/MusicContext";
import { UserProvider } from "./context/UserContext";
import AppNavigator from "./navigation/AppNavigator";
import OverlayPlayer from "./components/OverlayPlayer";

export default function App() {
  return (
    <SafeAreaProvider>
      <MusicProvider>
        <View style={styles.root}>
          <NavigationContainer>
            {/* ✅ Bọc UserProvider Ở TRONG NavigationContainer */}
            <UserProvider>
              <AppNavigator />
            </UserProvider>
          </NavigationContainer>

          {/* Luôn đè trên mọi màn hình */}
          <OverlayPlayer />
        </View>
      </MusicProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
