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

  const onButtonClicked = () => {
    //navigate to Bookings Details screen when a booking is clicked
    props.navigation.navigate("ActivityDetails", {
      activity: props,
    });
  };

  return (
    <Pressable onPress={onButtonClicked}>
      <View className="shadow-lg">
        <View className="bg-primary m-5 rounded-lg">
          <View className="flex-row">
            <Image
              className="w-full h-48 rounded-t-lg"
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
              <View className="flex-row">
                <Text className="text-lg font-semibold">$</Text>
                <Text className="text-lg font-semibold">{props.price}</Text>
              </View>

              <View className="flex-row items-center mb-3">
                <Ionicons name="time-outline" size={24} color="gray" />
                <Text className="font-urbanist text-[#777]">
                  {props.time} {props.date}
                </Text>
              </View>
            </View>
            <View className="w-full"></View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
