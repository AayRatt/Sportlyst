import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Pressable,
  StatusBar,
  TextInput,
} from "react-native";
import {
  useFonts,
  Urbanist_600SemiBold,
  Urbanist_500Medium,
} from "@expo-google-fonts/urbanist";
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

export default function Login({ navigation, route }) {
  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,

    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="bg-white pl-3 pr-3">
        <Pressable
          onPress={() => {
            navigation.goBack();
          }}
        >
          <View className="bg-white w-12 h-12 rounded-full items-center justify-center shadow-md">
            <Ionicons name="arrow-back-sharp" size={24} color="black" />
          </View>
        </Pressable>

        <Text className="font-urbanistBold text-2xl text-start pl-3">
          Login
        </Text>
        <View className="mt-8">
          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-5 font-urbanist"
            placeholder="Enter Email"
            placeholderTextColor={"#666"}
          ></TextInput>
          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 font-urbanist"
            placeholder="Enter Password"
            placeholderTextColor={"#666"}
            secureTextEntry
          ></TextInput>
          <Pressable className="bg-secondary rounded-lg h-14 mt-5 items-center justify-center">
            <Text className="text-lg font-urbanistBold text-primary">
              Continue
            </Text>
          </Pressable>
          <Pressable className="bg-gray rounded-lg h-14 mt-5 items-center justify-center">
            <View className="flex-row">
              <MaterialCommunityIcons name="apple" size={24} color="black" />
              <Text className="text-lg font-urbanistBold text-secondary">
                Continue with Apple
              </Text>
            </View>
          </Pressable>
          <Pressable className="bg-gray rounded-lg h-14 mt-5 items-center justify-center">
            <View className="flex-row justify-center items-center">
              <AntDesign name="google" size={20} color="black" />
              <Text className="text-lg font-urbanistBold text-secondary ml-0.5">
                Continue with Google
              </Text>
            </View>
          </Pressable>
        </View>
        <StatusBar barStyle="dark-content"></StatusBar>
      </View>
    </SafeAreaView>
  );
}
