import React from "react";
import { Text, View, TouchableOpacity, Image, Pressable } from "react-native";
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";
import { StatusBar } from "expo-status-bar";

export default function Register({ route, navigation }) {
  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Pressable
        onPress={() => {
          navigation.goBack();
        }}
        style={{ paddingHorizontal: 15 }}
      >
        <Image source={require("../assets/Icons/Back.png")} />
      </Pressable>
      <Text>Register Page</Text>
      <StatusBar barStyle="light-content"></StatusBar>
    </View>
  );
}
