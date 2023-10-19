import React from "react";
import {
  View,
  Text,
  Pressable,
  Button,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import ActivityCard from "../components/ActivityCard";
import CreateActivity from "./CreateActivity";
import {
  useFonts,
  Urbanist_600SemiBold,
  Urbanist_500Medium,
} from "@expo-google-fonts/urbanist";

export default function Activities({ navigation }) {
  ///Variables
  //Location State
  const [deviceLocation, setDeviceLocation] = useState(null);

  // Current Location
  // const getCurrentLocation = async () => {
  //   try {
  //     //1. Permissions
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       alert("Permission not granted");
  //       return;
  //     }
  //     console.log("Permission granted");
  //     //2. Permission Accepted
  //     let location = await Location.getCurrentPositionAsync();
  //     console.log("Current location is:");
  //     console.log(location);
  //     // alert(JSON.stringify(location.coords.altitude, location.coords.longitude))
  //     setDeviceLocation({
  //       lat: location.coords.latitude,
  //       lng: location.coords.longitude,
  //     });
  //     console.log("User location:", deviceLocation.lat, deviceLocation.lng);
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // };

  //Use effect State
  // useEffect(() => {
  //   getCurrentLocation();
  // }, []);

  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,

    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="bg-primary flex-1 h-full">
      <View className="flex-row justify-between items-center px-6 pb-5">
        <Ionicons name="filter" size={24} color="black" />
        <Text className="font-urbanistBold text-2xl">Sportlyst</Text>
        <Ionicons name="notifications" size={24} color="black" />
      </View>
      <ScrollView className="h-fit">
        <View className="px-3">
          <Text className="font-urbanist text-xl text-start pl-3">
            Hey, John
          </Text>
          <Text className="font-urbanistBold text-2xl text-start pl-3">
            Discover Activities
          </Text>
        </View>
        <ActivityCard
          title="Soccer"
          img={require("../assets/cherry.jpg")}
          location="Cherry Sports Field"
          datetime="9:30PM 04/11/2023"
        />
        <ActivityCard
          title="Tennis"
          img={require("../assets/trinity.jpeg")}
          location="Trinity Bellwoods Park"
          datetime="9:30PM 19/12/2023"
        />
      </ScrollView>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: "black",
          alignItems: "center",
          justifyContent: "center",
          width: 65,
          position: "absolute",
          top: 750,
          right: 15,
          height: 65,
          backgroundColor: "black",
          borderRadius: 100,
        }}
        onPress={() => {
          //NAVIGATE HERE
          navigation.navigate("CreateActivity");
        }}
      >
        <Ionicons name="add" size={35} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
