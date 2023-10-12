import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import {
  useFonts,
  Urbanist_600SemiBold,
  Urbanist_500Medium,
} from "@expo-google-fonts/urbanist";
import { Ionicons } from "@expo/vector-icons";

export default function ActivityCard(props) {
  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,

    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="shadow-lg">
      <View className="bg-primary m-5 rounded-lg">
        <View className="flex-row">
          <Image
            className="w-full h-52 rounded-t-lg"
            source={props.img}
          ></Image>
        </View>
        <View className="px-3 py-3">
          <View className="flex-row justify-between items-center">
            <Text className="font-urbanist text-3xl">{props.title}</Text>
            <View className="flex-row items-center">
              <Ionicons name="location-sharp" size={24} color="gray" />
              <Text className="font-urbanist text-[#777]">
                {props.location}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Details</Text>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={24} color="gray" />
              <Text className="font-urbanist text-[#777]">
                {props.datetime}
              </Text>
            </View>
          </View>
          <View className="w-full">
            <Pressable className="bg-gray rounded-lg w-1/5 h-10 mt-5 items-center justify-center">
              <Text className="text-lg font-urbanistBold">View</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}