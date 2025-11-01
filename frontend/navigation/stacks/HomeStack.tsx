import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../screens/HomeScreen";
import ProfileScreen from "../../screens/ProfileScreen";
import ArtistScreen from "../../screens/ArtistScreen";
import PlaylistScreen from "../../screens/PlaylistScreen";
import FollowingScreen from "../../screens/FollowingScreen";
import HistoryScreen from "../../screens/HistoryScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="ArtistScreen" component={ArtistScreen} />
      <Stack.Screen name="PlaylistScreen" component={PlaylistScreen} />
      <Stack.Screen name="FollowingScreen" component={FollowingScreen} />
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
    </Stack.Navigator>
  );
}
