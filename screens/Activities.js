import React from "react";
import { View, Text, Pressable, Button } from "react-native";
import { useState, useEffect } from 'react';


// Import Location's Library
import * as Location from 'expo-location'

export default function Activities({ navigation }) {
  ///Variables
  //Location State
  const [deviceLocation, setDeviceLocation] = useState(null);


  // Current Location 
  const getCurrentLocation = async () => {
    try {
      //1. Permissions
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        alert('Permission not granted')
        return
        }
        console.log('Permission granted');
      //2. Permission Accepted
      let location = await Location.getCurrentPositionAsync()
      console.log('Current location is:')
      console.log(location)
      // alert(JSON.stringify(location.coords.altitude, location.coords.longitude))
      setDeviceLocation({lat: location.coords.latitude, lng: location.coords.longitude})
      console.log('User location:', deviceLocation.lat, deviceLocation.lng);
    } catch (error) {
      console.log(error.message);
    }
  }

  //Use effect State
  useEffect ( () => {
    getCurrentLocation()
  },[])


  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Activities</Text>
    </View>

  );
}
