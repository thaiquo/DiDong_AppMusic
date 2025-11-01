import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeStack from "./stacks/HomeStack";
import SearchStack from "./stacks/SearchStack";
import FeedStack from "./stacks/FeedStack";
import LibraryStack from "./stacks/LibraryStack";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#1DB954",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#eee",
          height: 60,
          paddingBottom: 6,
          paddingTop: 4,
        },
        tabBarIcon: ({ color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";
          if (route.name === "HomeStack") iconName = "home-outline";
          else if (route.name === "SearchStack") iconName = "search-outline";
          else if (route.name === "FeedStack") iconName = "newspaper-outline";
          else if (route.name === "LibraryStack") iconName = "library-outline";
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeStack} options={{ title: "Home" }} />
      <Tab.Screen name="SearchStack" component={SearchStack} options={{ title: "Search" }} />
      <Tab.Screen name="FeedStack" component={FeedStack} options={{ title: "Feed" }} />
      <Tab.Screen name="LibraryStack" component={LibraryStack} options={{ title: "Library" }} />
    </Tab.Navigator>
  );
}
