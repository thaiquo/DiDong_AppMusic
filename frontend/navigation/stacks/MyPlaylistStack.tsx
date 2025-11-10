import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MyPlaylistScreen from './../../screens/MyPlaylistScreen';

const Stack = createNativeStackNavigator();

export default function MyPlaylistStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyPlaylistScreen" component={MyPlaylistScreen} />
    </Stack.Navigator>
  );
}
