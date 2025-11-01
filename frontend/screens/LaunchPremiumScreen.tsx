import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LaunchPremiumScreen() {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require("../assets/all_images/Launch Screen - Premium/Image 112.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image
          source={require("../assets/all_images/Launch Screen - Premium/Image 113.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Welcome to</Text>
        <Text style={[styles.title, styles.bold]}>Premium</Text>
        <Text style={styles.dot}>...</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("LaunchWelcome" as never)}
        >
          <Text style={styles.buttonText}>Start listening</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center" },
  overlay: { alignItems: "center" },
  logo: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    marginBottom: 60,
  },
  title: { color: "#fff", fontSize: 30, textAlign: "center" },
  bold: { fontWeight: "700" },
  dot: { color: "#fff", fontSize: 36, marginVertical: 10 },
  button: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 40,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});
