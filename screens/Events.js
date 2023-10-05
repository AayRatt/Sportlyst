import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Pressable,
  Button,
  TextInput,
} from "react-native";
import {
  useFonts,
  Urbanist_600SemiBold,
  Urbanist_500Medium,
} from "@expo-google-fonts/urbanist";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";


import { useState, useEffect } from "react";
import { Picker, DatePicker } from 'react-native-wheel-pick';



// Import firebase auth/db
import { db, auth } from "../firebaseConfig";
import { setDoc, doc, collection } from "firebase/firestore";

export default function Events({ navigation }) {



  const [userEventField, setUserEventField] = useState({
    eventName: "",
    description: "",
    sportType: "Baseball",
    players:"",
    payment:"",
    date:""
  })

  const onCreateEvent = async () => {
      //Read Data
      const outData = `
      EventName: ${userEventField.eventName},
      Description: ${userEventField.description},
      SportType: ${userEventField.sportType},
      players:  ${userEventField.players},
      Payment: ${userEventField.payment},
      Date: ${userEventField.date}
      `;
      console.log(outData);

      try {
        if (!userEventField.eventName){
          alert("Please Type your Event Name");
        }else{
        //Create a Firestore Collection
        //1. Add data Object
        const eventData = {
          eventName: userEventField.eventName,
          description: userEventField.description,
          sportType: userEventField.sportType,
          players: userEventField.players,
          payment: userEventField.payment,
          date: userEventField.date
        }

        //2. Add data to firestore
        const randomId = doc (collection(db, 'events', auth.currentUser.uid, 'sports')).id
        await setDoc(
          doc(db, 'events', auth.currentUser.uid, 'sports', randomId),
          eventData
        )

        console.log("Event created");
        alert("Event created")
        //Clean Field
        setUserEventField({
          eventName: "",
          description:"",
          sportType: "",
          players: "",
          payment:"",
          date:""
        })
        }
      } catch (error) {
          console.log(error);
      }
  }

  // Function for Updating form fields
  const formChanged = (key, updatedValue) => {
    const temp = { ...userEventField };
    temp[key] = updatedValue;
    setUserEventField(temp);
  };

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

        <Text className="font-urbanistBold text-2xl text-start pl-3">
          User Event
        </Text>
        <View className="mt-8">

          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-5 font-urbanist"
            placeholder="Event Name"
            placeholderTextColor={"#666"}
            autoCapitalize="none"
            value={userEventField.eventName}
            onChangeText={(account) => {
              formChanged("eventName", account);
            }}
          ></TextInput>
          
          <TextInput
            className="bg-gray h-20 rounded-lg w=11/12 p-4 mb-5 font-urbanist"
            placeholder="Event Description"
            placeholderTextColor={"#666"}
            autoCapitalize="none"
            value={userEventField.description}
            onChangeText={(account) => {
              formChanged("description", account);
            }}
          ></TextInput>

    <View className="flex-row gap-3">
      <TextInput
            className="bg-gray h-12 rounded-lg w-1/2 p-4 mb-5 flex-1 font-urbanist"
            placeholder="Quantity of Players"
            placeholderTextColor={"#666"}
            autoCapitalize="none"
            keyboardType='numeric'
            value={userEventField.players}
            onChangeText={(account) => {
              formChanged("players", account);
            }}
          ></TextInput>
      <TextInput
            className="bg-gray h-12 rounded-lg w-1/2 p-4 mb-5 flex-1 font-urbanist"
            placeholder="Price per person"
            placeholderTextColor={"#666"}
            autoCapitalize="none"
            keyboardType='numeric'
            value={userEventField.payment}
            onChangeText={(account) => {
              formChanged("payment", account);
            }}
          ></TextInput>
    </View>

          <Picker
          style={{ backgroundColor: 'white', height: 215 }}
          selectedValue='Baseball'
          pickerData={['Soccer', 'Basket', 'Baseball', 'Tennis','Ping Pong']}
          onValueChange={value => { 
              formChanged("sportType", value)
          }}
          />

          {/* <DatePicker
          style={{ backgroundColor: 'white', width: 370, height: 240 }}
          dateFormat = "MM-DD"
          minDate={new Date()} 
          onDateChange={ date=> { 
              formChanged("date", date)
           }}
          /> */}

          
          <Pressable
            className="bg-secondary rounded-lg h-14 mt-5 items-center justify-center"
            onPress={onCreateEvent}
          >
            <Text className="text-lg font-urbanistBold text-primary">
              Create Event
            </Text>
          </Pressable>

        </View>
        <StatusBar barStyle="dark-content"></StatusBar>
      </View>
    </SafeAreaView>
      );
}