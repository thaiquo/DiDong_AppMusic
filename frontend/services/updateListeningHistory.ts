import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

export async function updateListeningHistory(songId: string) {
  try {
    const json = await AsyncStorage.getItem("user");
    if (!json) {
      console.warn("⚠️ No user found in AsyncStorage");
      return;
    }

    const user = JSON.parse(json);
    const res = await fetch(`${API_URL}/api/users/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, songId }),
    });

    // 👇 Kiểm tra phản hồi từ server
    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ updateListeningHistory: HTTP ${res.status} – ${errText}`);
      return;
    }

    const data = await res.json();
    console.log("✅ Lịch sử + playCount cập nhật thành công:", data);
  } catch (err) {
    console.error("❌ updateListeningHistory error:", err);
  }
}
