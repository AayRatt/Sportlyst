import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Pressable,
  Button,
  TextInput,
  Modal
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
// import { Picker } from 'react-native-wheel-pick';
import { Picker } from '@react-native-picker/picker'

import DateTimePickerModal from "react-native-modal-datetime-picker"

// Import firebase auth/db
import { db, auth } from "../firebaseConfig";
import { setDoc, doc, collection } from "firebase/firestore";


export default function Events({ navigation }) {

  //Sport Picker State
  const [pickerVisible, setPickerVisible] = useState(false)

  //Date States
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false)
  const showDatePicker = () => {
    setDatePickerVisibility(true)
  }
  const hideDatePicker = () => {
    setDatePickerVisibility(false)
  }
  const handleConfirm = (date) => {
    const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    formChanged('date', formattedDate)
    hideDatePicker()
  }

  //Time States
  const [isTimePickerVisible, setTimePickerVisivility] = useState(false)
  const showTimePicker = () => {
    setTimePickerVisivility(true)
  }
  const hideTimePicker = () => {
    setTimePickerVisivility(false)
  }
  const handleTimeConfirm = (time) => {
    const hours = `${time.getHours()}`
    const minutes = `${time.getMinutes()}`
    const period = hours >= 12 ? "PM" : "AM"
    const formattedHours = hours % 12 || 12
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`
    formChanged('time', formattedTime)
    hideTimePicker()
  }


  const [userEventField, setUserEventField] = useState({
    eventName: "",
    description: "",
    sportType: "",
    players: "",
    payment: "",
    date: "",
    time: ""
  })


  const onCreateEvent = async () => {
    //Read Data
    const outData = `
EventName: ${userEventField.eventName},
Description: ${userEventField.description},
SportType: ${userEventField.sportType},
players: ${userEventField.players},
Payment: ${userEventField.payment},
Date: ${userEventField.date},
Time: ${userEventField.time}
`;
    console.log(outData);

    try {
      if (!userEventField.eventName) {
        alert("Please Type your Event Name");
      } else {
        //Create a Firestore Collection
        //1. Add data Object
        const eventData = {
          eventName: userEventField.eventName,
          description: userEventField.description,
          sportType: userEventField.sportType,
          players: userEventField.players,
          payment: userEventField.payment,
          date: userEventField.date,
          time: userEventField.time
        }


        //2. Add data to firestore
        const randomId = doc(collection(db, 'events', auth.currentUser.uid, 'sports')).id
        await setDoc(
          doc(db, 'events', auth.currentUser.uid, 'sports', randomId),
          eventData
        )


        console.log("Event created");
        alert("Event created")
        //Clean Field
        setUserEventField({
          eventName: "",
          description: "",
          sportType: "",
          players: "",
          payment: "",
          date: "",
          time: ""
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

          <Modal
            animationType="slide"
            transparent={true}
            visible={pickerVisible}
            onRequestClose={() => {
              setPickerVisible(false)
            }}
          >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View style={{ backgroundColor: 'white', height: 350 }}>
                <Picker
                  selectedValue={userEventField.sportType}
                  onValueChange={(value) => {
                    formChanged("sportType", value);
                    setPickerVisible(false);
                  }}
                >
                  <Picker.Item label="Soccer" value="Soccer" />
                  <Picker.Item label="Basket" value="Basket" />
                  <Picker.Item label="Baseball" value="Baseball" />
                  <Picker.Item label="Tennis" value="Tennis" />
                  <Picker.Item label="Ping Pong" value="Ping Pong" />
                </Picker>
                <Button title="Close Picker" onPress={() => setPickerVisible(false)} />
              </View>
            </View>
          </Modal>



          <Pressable
            className="bg-secondary rounded-lg h-10 mt-1 items-center justify-center"
            onPress={() => setPickerVisible(true)}
          >
            <Text className="text-lg font-urbanistBold text-primary">
              {userEventField.sportType ? `Selected Sport: ${userEventField.sportType}` : "Choose your Sport"}
            </Text>
          </Pressable>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            minimumDate={new Date()}
          />
          <Pressable
            className="bg-secondary rounded-lg h-10 mt-1 items-center justify-center"
            onPress={showDatePicker}
          >
            <Text className="text-lg font-urbanistBold text-primary">
              {userEventField.date ? `Selected Date: ${userEventField.date}` : "Choose your Date"}
            </Text>
          </Pressable>

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={handleTimeConfirm}
            onCancel={hideTimePicker}
          />
          <Pressable
            className="bg-secondary rounded-lg h-10 mt-1 items-center justify-center"
            onPress={showTimePicker}
          >
            <Text className="text-lg font-urbanistBold text-primary">
              {userEventField.time ? `Selected Time: ${userEventField.time}` : "Choose your Time"}
            </Text>
          </Pressable>


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

