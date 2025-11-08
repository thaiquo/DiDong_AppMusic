import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LaunchWelcomeScreen from "../screens/LaunchWelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import MainTabs from "./MainTabs";

// Các màn độc lập ngoài tab
import ProfileScreen from "../screens/ProfileScreen";
import ArtistScreen from "../screens/ArtistScreen";
import PlaylistScreen from "../screens/PlaylistScreen";
import FollowingScreen from "../screens/FollowingScreen";
import HistoryScreen from "../screens/HistoryScreen";
import FeedScreen from "../screens/FeedScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* ❌ KHÔNG CÓ TAB */}
      <Stack.Screen name="LaunchWelcomeScreen" component={LaunchWelcomeScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />

      {/* ✅ CHỈ CÓ TAB TRONG MAIN */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* ❌ KHÔNG CÓ TAB */}
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="ArtistScreen" component={ArtistScreen} />
      <Stack.Screen name="PlaylistScreen" component={PlaylistScreen} />
      <Stack.Screen name="FollowingScreen" component={FollowingScreen} />
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
      <Stack.Screen name="FeedScreen" component={FeedScreen} />
    </Stack.Navigator>
  );
}
