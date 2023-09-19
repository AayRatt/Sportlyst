import React from "react";
import { Text, View, TouchableOpacity, Pressable } from "react-native";
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";
import Register from "./Register";

import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";


export default function Launch({ navigation }) {
  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-6xl font-urbanistBold text-gray-900 mt-56">
          Sportlyst
        </Text>
        <Pressable
          className="bg-gray rounded-lg w-11/12 h-14 mt-72 items-center justify-center"
          onPress={() => navigation.navigate("Register")}
        >
          <Text className="text-lg font-urbanistBold">Register</Text>
        </Pressable>
        <Pressable
          className="bg-secondary rounded-lg w-11/12 h-14 mt-6 items-center justify-center"
          onPress={() => navigation.navigate("Login")}
        >
          <Text className="text-lg font-urbanistBold text-primary">Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>

  );
}
