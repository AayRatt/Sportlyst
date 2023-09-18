import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";

export default function App() {
  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text
        style={{ fontFamily: "Urbanist_600SemiBold" }}
        className="text-6xl font-semibold text-gray-900 mt-56"
      >
        Sportlyst
      </Text>
      <TouchableOpacity className="bg-gray-300 rounded-lg w-11/12 h-14 mt-72 items-center justify-center">
        <Text
          style={{ fontFamily: "Urbanist_600SemiBold" }}
          className="text-lg font-semibold text-gray-900"
        >
          Register
        </Text>
      </TouchableOpacity>
      <TouchableOpacity className="bg-black rounded-lg w-11/12 h-14 mt-6 items-center justify-center">
        <Text
          style={{ fontFamily: "Urbanist_600SemiBold" }}
          className="text-lg font-semibold text-white"
        >
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
