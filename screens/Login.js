import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";

export default function Login() {
  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text>Login Page</Text>
    </View>
  );
}
