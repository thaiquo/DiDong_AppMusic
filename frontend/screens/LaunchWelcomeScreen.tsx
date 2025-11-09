import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RootStackParamList = {
  LaunchWelcomeScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  MainTabs: undefined;
};

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  "LaunchWelcomeScreen"
>;

export default function LaunchWelcomeScreen() {
  const navigation = useNavigation<NavProp>();

  const handleGuestStart = async () => {
    try {
      const guest = { username: "Guest", role: "guest" };
      await AsyncStorage.setItem("user", JSON.stringify(guest));
      navigation.navigate("MainTabs");
    } catch (err) {
      console.warn("⚠️ Lỗi khi vào chế độ khách:", err);
      Alert.alert("Lỗi", "Không thể vào chế độ khách, thử lại sau.");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/all_images/Launch Screen/Image 30.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* lớp phủ giúp text rõ hơn */}
      <View style={styles.darkOverlay} />

      <View style={styles.overlay}>
        <Image
          source={require("../assets/all_images/Launch Screen/Image 33.png")}
          style={styles.logo}
        />

        <Text style={styles.title}>Your music</Text>
        <Text style={styles.title}>Your artists</Text>

        {/* Đăng nhập ưu tiên hơn */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>

        {/* Đăng ký */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("RegisterScreen")}
        >
          <Text style={styles.registerText}>Create an account</Text>
        </TouchableOpacity>

        {/* Chế độ khách */}
        <TouchableOpacity style={styles.guestButton} onPress={handleGuestStart}>
          <Text style={styles.guestText}>Continue as guest</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center", alignItems: "center" },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)", // overlay tối làm nổi chữ
  },
  overlay: { alignItems: "center", justifyContent: "center" },
  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginBottom: 35,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginVertical: 3,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  loginButton: {
    backgroundColor: "#1DB954",
    paddingVertical: 14,
    paddingHorizontal: 70,
    borderRadius: 30,
    marginTop: 50,
    elevation: 3,
  },
  loginText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  registerButton: {
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: "#fff",
    borderRadius: 30,
    paddingVertical: 13,
    paddingHorizontal: 60,
  },
  registerText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 4,
  },
  guestButton: { marginTop: 20, paddingVertical: 8 },
  guestText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontStyle: "italic",
  },
});
