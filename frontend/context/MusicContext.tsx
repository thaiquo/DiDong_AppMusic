import React, { createContext, useContext, useRef, useState, useEffect } from "react";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config/api";
import { Platform } from "react-native";

type Song = {
  _id: string;
  title: string;
  artist: string;
  audioUrl: string;
  thumbnail: string;
};

type MusicContextType = {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  playlist: Song[];
  currentSongIndex: number;
  isTimerActive: boolean;
  timerRemaining: number;
  setSong: (song: Song, playlist?: Song[]) => Promise<void>;
  playPause: () => Promise<void>;
  seekTo: (pos: number) => Promise<void>;
  reset: () => void;
  nextSong: () => Promise<void>;
  previousSong: () => Promise<void>;
  stopSong: () => Promise<void>;
  toggleTimer: () => void;
  extendTimer: () => void;
  isFullPlayer: boolean;
  setIsFullPlayer: (val: boolean) => void;
  playSongById: (id: string) => Promise<void>;
};

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(30 * 60 * 1000); // 30 phút
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [hasUpdated, setHasUpdated] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const hasReached80PercentRef = useRef(false);
  
  const [isFullPlayer, setIsFullPlayer] = useState(false);


  // 🔥 Giữ song hiện tại trong ref để tránh lỗi closure
  const currentSongRef = useRef<Song | null>(null);
  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  // Lấy user từ AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem("user");
        if (json) {
          const user = JSON.parse(json);
          if (user?._id) {
            setUserId(user._id);
            console.log("📍 MusicContext: User ID:", user._id);
          }
        } else {
          console.warn("⚠️ MusicContext: Không tìm thấy user trong AsyncStorage");
        }
      } catch (err) {
        console.error("❌ MusicContext: Lỗi lấy userId:", err);
      }
    })();
  }, []);

  // Cấu hình chế độ phát nhạc
  useEffect(() => {
    if (Platform.OS !== "web") {
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: 1,
        interruptionModeIOS: 1,
        shouldDuckAndroid: true,
      }).catch((err) => console.error("❌ MusicContext: Lỗi setAudioModeAsync:", err));
    }
    return () => reset();
  }, []);

  // Hẹn giờ tắt nhạc
  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1000) {
            stopSong();
            setIsTimerActive(false);
            return 30 * 60 * 1000;
          }
          return prev - 1000;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive]);

  // 🟢 Hàm gọi API cập nhật lịch sử
const updateHistory = async (songId: string) => {
  if (!userId || !songId) {
    console.warn("⚠️ Thiếu userId hoặc songId, bỏ qua updateHistory()");
    return;
  }

  const now = Date.now();
  if (now - lastUpdateRef.current < 5000) return; // tránh spam
  lastUpdateRef.current = now;

  try {
    console.log("📡 Gửi cập nhật lịch sử:", `${API_URL}/api/users/history`, { userId, songId });
    const res = await axios.post(`${API_URL}/api/users/history`, { userId, songId });

    // kiểm tra phản hồi
    if (res.status === 200) {
      console.log("✅ Lịch sử & playCount cập nhật thành công:", res.data);
      setHasUpdated(true);
    } else {
      console.warn(`⚠️ Server trả về ${res.status}:`, res.data);
    }
  } catch (err: any) {
    console.error("❌ Gọi API thất bại:", err.message);
  }
};



  // 🔁 Xử lý trạng thái phát nhạc
  const onStatus = async (status: any) => {
    const s = status as AVPlaybackStatusSuccess;
    if (!s.isLoaded) return;
    setPosition(s.positionMillis ?? 0);
    setDuration(s.durationMillis ?? 0);
    setIsPlaying(!!s.isPlaying);

    const song = currentSongRef.current;
    if (song && s.durationMillis && song._id) {
      const percent = (s.positionMillis ?? 0) / s.durationMillis;
      if (percent >= 0.8 && !hasUpdated && !hasReached80PercentRef.current) {
        console.log("📍 Đạt 80% bài:", song.title);
        hasReached80PercentRef.current = true;
        await updateHistory(song._id);
      }
      if (s.didJustFinish) {
        if (!hasUpdated) await updateHistory(song._id);
        hasReached80PercentRef.current = false;
        if (currentSongIndex < playlist.length - 1) await nextSong();
        else await stopSong();
      }
    }
  };

  const setSong = async (song: Song, newPlaylist?: Song[]) => {
    try {
      if (soundRef.current) {
        const st = await soundRef.current.getStatusAsync();
        if (st.isLoaded) await soundRef.current.unloadAsync();
      }
      if (newPlaylist) {
        setPlaylist(newPlaylist);
        setCurrentSongIndex(newPlaylist.findIndex((s) => s._id === song._id));
      } else if (!playlist.some((s) => s._id === song._id)) {
        setPlaylist([...playlist, song]);
        setCurrentSongIndex(playlist.length);
      }

      setHasUpdated(false);
      hasReached80PercentRef.current = false;

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(onStatus);

      setCurrentSong(song);
      currentSongRef.current = song; // 🔥 cập nhật ref ngay lập tức
      setIsPlaying(true);
    } catch (err) {
      console.error("❌ MusicContext: Lỗi setSong:", err);
    }
  };

  // 🟢 Phát nhạc bằng ID bài hát (dùng cho FeedScreen)
const playSongById = async (id: string) => {
  try {
    const res = await axios.get(`${API_URL}/api/songs/${id}`);
    if (res.data) {
      await setSong(res.data);
      setIsFullPlayer(true); // mở trình phát đầy đủ
    }
  } catch (err: any) {
    console.error("❌ MusicContext: Lỗi khi phát bài theo ID:", err.message);
  }
};


  const playPause = async () => {
    if (!soundRef.current) return;
    const st = await soundRef.current.getStatusAsync();
    if (!st.isLoaded) return;
    st.isPlaying ? await soundRef.current.pauseAsync() : await soundRef.current.playAsync();
  };

  const seekTo = async (pos: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(pos);
    setPosition(pos);
  };

  const nextSong = async () => {
    if (currentSongIndex < playlist.length - 1) {
      const nextIndex = currentSongIndex + 1;
      setCurrentSongIndex(nextIndex);
      await setSong(playlist[nextIndex], playlist);
    } else await stopSong();
  };

  const previousSong = async () => {
    if (currentSongIndex > 0) {
      const prevIndex = currentSongIndex - 1;
      setCurrentSongIndex(prevIndex);
      await setSong(playlist[prevIndex], playlist);
    }
  };

  const stopSong = async () => {
    if (soundRef.current) {
      const st = await soundRef.current.getStatusAsync();
      if (st.isLoaded) await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    }
    soundRef.current = null;
    setCurrentSong(null);
    currentSongRef.current = null;
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    setHasUpdated(false);
    hasReached80PercentRef.current = false;
  };

  const reset = () => {
    if (soundRef.current) soundRef.current.unloadAsync();
    setCurrentSong(null);
    currentSongRef.current = null;
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
    setPlaylist([]);
    setCurrentSongIndex(-1);
  };

  const toggleTimer = () => setIsTimerActive((prev) => !prev);
  const extendTimer = () => setTimerRemaining((prev) => prev + 30 * 60 * 1000);

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        position,
        duration,
        playlist,
        currentSongIndex,
        isTimerActive,
        timerRemaining,
        setSong,
        playPause,
        seekTo,
        reset,
        nextSong,
        previousSong,
        stopSong,
        toggleTimer,
        extendTimer,
        isFullPlayer,
       setIsFullPlayer,
       playSongById,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic phải được sử dụng trong MusicProvider");
  return ctx;
};
