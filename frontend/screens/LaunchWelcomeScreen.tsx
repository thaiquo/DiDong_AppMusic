import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  LaunchWelcomeScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
};

type NavProp = NativeStackNavigationProp<RootStackParamList, "LaunchWelcomeScreen">;

export default function LaunchWelcomeScreen() {
  const navigation = useNavigation<NavProp>();

  return (
    <ImageBackground
      source={require("../assets/all_images/Launch Screen/Image 30.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image
          source={require("../assets/all_images/Launch Screen/Image 33.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Your music</Text>
        <Text style={styles.title}>Your artists</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("RegisterScreen")} // ✅ Chuyển sang trang đăng ký
        >
          <Text style={styles.primaryText}>Create an account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("LoginScreen")} // ✅ Chuyển sang trang đăng nhập
        >
          <Text style={styles.secondaryText}>I already have an account</Text>
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
    marginBottom: 40,
  },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", marginVertical: 5 },
  primaryButton: {
    backgroundColor: "#000",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginTop: 50,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "500" },
  secondaryButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  secondaryText: { color: "#00CFFF", fontSize: 15, fontWeight: "500" },
});
