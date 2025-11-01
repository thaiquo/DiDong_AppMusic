import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FeedScreen from "../../screens/FeedScreen";

const Stack = createNativeStackNavigator();

export default function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedScreen" component={FeedScreen} />
    </Stack.Navigator>
  );
}
