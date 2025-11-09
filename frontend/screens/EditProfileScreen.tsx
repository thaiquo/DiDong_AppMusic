import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config/api";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function EditProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string>("");
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const nav = useNavigation<any>();

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem("user");
      if (json) {
        const u = JSON.parse(json);
        setUser(u);
        setUsername(u.username || "");
        setEmail(u.email || "");
        setAvatar(u.avatar || "");
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền bị từ chối", "Cần quyền truy cập thư viện ảnh.");
      return;
    }
   const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images, // vẫn OK
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});

    if (result.canceled) return;

    const file = result.assets[0];
    // Upload file lên backend
    try {
      setUploading(true);
      const form = new FormData();
      form.append("avatar", {
        uri: file.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);

      const resp = await fetch(`${API_URL}/api/users/upload`, {
        method: "POST",
        body: form,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || "Upload failed");
      setAvatar(data.url); // URL public từ backend
    } catch (e: any) {
      Alert.alert("Lỗi upload", e.message || "Không upload được ảnh");
    } finally {
      setUploading(false);
    }
  };

  const saveChanges = async () => {
    if (!user?._id) return;
    try {
      const res = await axios.put(`${API_URL}/api/users/${user._id}`, {
        username,
        email,
        password, // có thể để trống nếu không đổi
        avatar,
      });
      // Cập nhật lại AsyncStorage để UI đồng bộ
      const updated = { ...user, ...res.data };
      await AsyncStorage.setItem("user", JSON.stringify(updated));
      Alert.alert("Thành công", "Cập nhật hồ sơ thành công!");
      nav.goBack();
    } catch (err: any) {
      Alert.alert("Lỗi", err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 24 }} />
      </View>

      <TouchableOpacity style={styles.avatarWrap} onPress={pickImage}>
        <Image source={{ uri: avatar || "https://i.pravatar.cc/150" }} style={styles.avatar} />
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={16} color="#fff" />
        </View>
      </TouchableOpacity>
      {uploading && <ActivityIndicator style={{ marginTop: 6 }} />}

      <View style={styles.form}>
        <Text style={styles.label}>Tên hiển thị</Text>
        <TextInput value={username} onChangeText={setUsername} style={styles.input} />

        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />

        <Text style={styles.label}>Mật khẩu (để trống nếu không đổi)</Text>
        <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

        <TouchableOpacity style={styles.saveBtn} onPress={saveChanges} disabled={uploading}>
          <Text style={styles.saveText}>{uploading ? "Đang lưu..." : "Lưu thay đổi"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  headerTitle: { fontWeight: "700", fontSize: 18, color: "#111" },
  avatarWrap: { alignSelf: "center", marginTop: 8 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  cameraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#1DB954",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  form: { marginTop: 18 },
  label: { color: "#555", marginBottom: 6, fontSize: 13, fontWeight: "600" },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  saveBtn: {
    marginTop: 6,
    backgroundColor: "#1DB954",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
});
