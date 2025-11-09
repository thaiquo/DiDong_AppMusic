import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Role = "guest" | "customer" | "admin";
type UserLite = { _id?: string; username: string; email?: string; avatar?: string; role: Role };

type Ctx = {
  user: UserLite | null;
  setUser: (u: UserLite | null) => void;
  loginAsGuest: () => void;
  logout: () => void;
  /** Guard: trả về true nếu được phép tiếp tục (đã đăng nhập), false nếu chặn và mở prompt đăng nhập */
  requireAuth: (message?: string) => boolean;
};

const UserContext = createContext<Ctx | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserLite | null>(null);
  const navigation = useNavigation<any>(); // for prompts

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem("user");
        if (json) {
          const u = JSON.parse(json);
          setUser(u);
          console.log("✅ UserContext: Loaded user from AsyncStorage:", u);
        } else {
          console.log("⚠️ UserContext: Không tìm thấy user trong AsyncStorage");
        }
      } catch (err) {
        console.warn("❌ UserContext: Lỗi khi load user:", err);
      }
    })();
  }, []);

  const loginAsGuest = () => setUser({ username: "Guest", role: "guest" });
  const logout = () => setUser(null);

  const requireAuth = (message = "Bạn cần đăng nhập để dùng tính năng này.") => {
    if (!user || user.role === "guest") {
      Alert.alert("Yêu cầu đăng nhập", message, [
        { text: "Đăng nhập", onPress: () => navigation.navigate("LoginScreen") },
        { text: "Đăng ký", onPress: () => navigation.navigate("RegisterScreen") },
        { text: "Để sau" },
      ]);
      return false;
    }
    return true;
  };

  const value = useMemo(() => ({ user, setUser, loginAsGuest, logout, requireAuth }), [user]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
