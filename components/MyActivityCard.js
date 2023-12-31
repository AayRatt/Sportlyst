import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import {
  useFonts,
  Urbanist_600SemiBold,
  Urbanist_500Medium,
} from "@expo-google-fonts/urbanist";
import { Ionicons } from "@expo/vector-icons";
import CachedImage from 'react-native-expo-cached-image';

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
            <CachedImage
              className="w-full h-52 rounded-t-lg"
              isBackground
              source={{ uri: props.activityImage }}
            />
            {/* <Image
              className="w-full h-52 rounded-t-lg"
              // source={props.img}
              source={{ uri: props.activityImage }}
            ></Image> */}
          </View>
          <View className="px-3 py-3">
            <View className="flex-row justify-between items-center">
              <Text className="font-urbanist text-3xl">{props.title}</Text>
              <View className="flex-row items-center">
                <Ionicons name="location-sharp" size={24} color="gray" />
                <View className="w-28">
                  <Text numberOfLines={1} className="font-urbanist text-[#777]">
                    {props.location}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-row">
                <Text className="text-lg font-semibold">$</Text>
                <Text className="text-lg font-semibold">{props.price}</Text>
              </View>
              <View className="flex-row items-center">
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