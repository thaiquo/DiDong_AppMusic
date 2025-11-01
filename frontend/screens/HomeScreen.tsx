import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useFetch from "../hooks/useFetch";
import { useMusic } from "../context/MusicContext";
// import MusicPlayer from "../components/MusicPlayer";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "MainTabs">;


export default function HomeScreen() {
  const { setSong } = useMusic();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const json = await AsyncStorage.getItem("user");
      console.log("📍 HomeScreen: User data from AsyncStorage:", json);
      if (json) {
        setUser(JSON.parse(json));
      } else {
        console.log("📍 HomeScreen: No user found, redirecting to LoginScreen");
        navigation.replace("LoginScreen");
      }
    })();
  }, [navigation]);


  const { data: suggestions } = useFetch<any[]>(user ? `/api/home/suggestions/${user._id}` : "");
  const { data: playlists } = useFetch<any[]>(`/api/home/playlists`);
  const { data: trending } = useFetch<any[]>(`/api/home/trending`);
  const { data: artists } = useFetch<any[]>(`/api/home/artists`);

  const handleSetSong = (song: any, playlist: any[]) => {
    setSong(song, playlist);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../assets/all_images/Launch Screen/Image 33.png")}
          style={styles.logo}
        />
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
            <Image
              source={{ uri: user?.avatar || "https://i.pravatar.cc/100" }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Xin chào, {user?.username || "Khách"} 👋</Text>

        {/* Ô tìm kiếm */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput placeholder="Bạn muốn nghe gì?" style={styles.searchInput} />
        </View>

        {/* Gợi ý cho bạn */}
        <Section title="Gợi ý cho bạn">
          <HorizontalList
            data={suggestions}
            onPressItem={(song: any) => handleSetSong(song, suggestions || [])}
          />
        </Section>

        {/* ✅ Playlist dòng nhạc */}
        <Section title="Playlist dòng nhạc">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
            {playlists?.map((pl: any) => (
              <TouchableOpacity
                key={pl._id}
                style={{ marginRight: 16 }}
                onPress={() => navigation.navigate("PlaylistScreen", { playlistId: pl._id })}
              >
                <Image source={{ uri: pl.coverImage }} style={styles.playlistImg} />
                <Text style={styles.playlistName}>{pl.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Section>

        {/* Đang thịnh hành */}
        <Section title="Đang thịnh hành">
          <HorizontalList
            data={trending}
            onPressItem={(song: any) => handleSetSong(song, trending || [])}
          />
        </Section>

        {/* Nghệ sĩ nổi bật */}
        <Section title="Nghệ sĩ nổi bật">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
            {artists?.map((a) => (
              <TouchableOpacity
                key={a._id}
                style={{ marginRight: 16, alignItems: "center" }}
                onPress={() => navigation.navigate("ArtistScreen", { artistId: a._id })}
              >
                <Image source={{ uri: a.avatar }} style={styles.artistImg} />
                <Text style={styles.artistName}>{a.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Section>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* MiniPlayer */}
      {/* <MusicPlayer /> */}
    </SafeAreaView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function HorizontalList({ data, onPressItem }: any) {
  if (!Array.isArray(data) || data.length === 0) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20 }}>
      {data.map((item: any, index: number) => (
        <TouchableOpacity key={item._id || index} style={styles.card} onPress={() => onPressItem(item)}>
          <Image source={{ uri: item.thumbnail }} style={styles.cardImg} />
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSub}>{item.artist}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20, alignItems: "center" },
  logo: { width: 40, height: 40 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  greeting: { fontSize: 24, fontWeight: "700", marginLeft: 20, marginBottom: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginLeft: 20, marginBottom: 12 },
  card: { width: 160, marginRight: 16 },
  cardImg: { width: 160, height: 160, borderRadius: 10 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginTop: 6 },
  cardSub: { color: "#666" },
  artistImg: { width: 80, height: 80, borderRadius: 40 },
  artistName: { marginTop: 6, color: "#333" },
  playlistImg: { width: 160, height: 160, borderRadius: 12 },
  playlistName: { marginTop: 6, fontWeight: "600", color: "#333" },
});
