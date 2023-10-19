import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  Pressable,
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

// Import firebase auth/db
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

export default function Register({ route, navigation }) {
  //Variables
  const [formField, setFormField] = useState({
    email: "",
    password: "",
    confPassword: "",
    firstName: "",
    lastName: "",
  });

  //Sign Up
  const signUpClick = async () => {
    //Read Data
    const outData = `
    Email: ${formField.email},
    Password: ${formField.password},
    ConfPassword: ${formField.confPassword},
    FirstName: ${formField.firstName},
    LasName: ${formField.lastName}
    `;
    console.log(outData);

    try {
      // Field Conditions
      if (!formField.email) {
        alert("Please enter your email");
      } else if (!formField.password || formField.password.length < 6) {
        alert("Password should be at least 6 characters");
      } else if (formField.password !== formField.confPassword) {
        alert("Passwords do not match");
      } else if (!formField.firstName) {
        alert("Please enter your first name");
      } else if (!formField.lastName) {
        alert("Please enter your last name");
      } else {
        //Create User
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formField.email,
          formField.password
        );
        console.log(`Id of created user is: ${userCredential.user.uid}`);
        alert(userCredential.user.uid);

        //Create a Firestore Collection
        //1. Add data Object
        const profileData = {
          firstName: formField.firstName,
          lastName: formField.lastName,
          email: formField.email,
          userID: auth.currentUser.uid,
        };
        //2. Add data to firestore
        await setDoc(
          doc(db, "userProfiles", userCredential.user.uid),
          profileData
        );
        console.log("Profile created");
        //Clean Field
        setFormField({
          email: "",
          password: "",
          confPassword: "",
          firstName: "",
          lastName: "",
        });
      }
    } catch (error) {
      console.log(error);
      if (error.code === "auth/email-already-in-use") {
        alert("That email address is already in use!");
      }
      if (error.code === "auth/invalid-email") {
        alert("That email address is invalid!");
      }
    }
  };

  // Function for Updating form fields
  const formChanged = (key, updatedValue) => {
    const temp = { ...formField };
    temp[key] = updatedValue;
    setFormField(temp);
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
        <Pressable
          onPress={() => {
            navigation.goBack();
          }}
        >
          <View className="bg-white w-12 h-12 rounded-full items-center justify-center shadow-md">
            <Ionicons name="arrow-back-sharp" size={24} color="black" />
          </View>
        </Pressable>

        <Text className="font-urbanistBold text-3xl text-start pl-3">
          Register
        </Text>
        <View className="mt-8">
          <View className="flex-row gap-3">
            <TextInput
              className="bg-gray h-12 rounded-lg w-1/2 p-4 mb-5 flex-1 font-urbanist"
              placeholder="Enter First Name"
              placeholderTextColor={"#666"}
              autoCapitalize="none"
              value={formField.firstName}
              onChangeText={(account) => {
                formChanged("firstName", account);
              }}
            ></TextInput>
            <TextInput
              className="bg-gray h-12 rounded-lg w-1/2 p-4 mb-5 flex-1 font-urbanist"
              placeholder="Enter Last Name"
              placeholderTextColor={"#666"}
              value={formField.lastName}
              onChangeText={(account) => {
                formChanged("lastName", account);
              }}
            ></TextInput>
          </View>
          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-5 font-urbanist"
            placeholder="Enter Email"
            placeholderTextColor={"#666"}
            autoCapitalize="none"
            value={formField.email}
            onChangeText={(account) => {
              formChanged("email", account);
            }}
          ></TextInput>
          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 font-urbanist mb-5"
            placeholder="Enter Password"
            placeholderTextColor={"#666"}
            secureTextEntry
            autoCapitalize="none"
            value={formField.password}
            onChangeText={(account) => {
              formChanged("password", account);
            }}
          ></TextInput>
          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 font-urbanist"
            placeholder="Confirm Password"
            placeholderTextColor={"#666"}
            secureTextEntry
            autoCapitalize="none"
            value={formField.confPassword}
            onChangeText={(account) => {
              formChanged("confPassword", account);
            }}
          ></TextInput>
          <Pressable
            className="bg-secondary rounded-lg h-14 mt-5 items-center justify-center"
            onPress={signUpClick}
          >
            <Text className="text-lg font-urbanistBold text-primary">
              Continue
            </Text>
          </Pressable>
          <Pressable className="bg-gray rounded-lg h-14 mt-5 items-center justify-center">
            <View className="flex-row">
              <MaterialCommunityIcons name="apple" size={24} color="black" />
              <Text className="text-lg font-urbanistBold text-secondary">
                Sign Up with Apple
              </Text>
            </View>
          </Pressable>
          <Pressable className="bg-gray rounded-lg h-14 mt-5 items-center justify-center">
            <View className="flex-row justify-center items-center">
              <AntDesign name="google" size={20} color="black" />
              <Text className="text-lg font-urbanistBold text-secondary ml-0.5">
                Sign Up with Google
              </Text>
            </View>
          </Pressable>
        </View>
        <Text className="text-2sm, font-urbanist text-[#999] mt-3">
          By proceeding, you consent to get email messages, including by
          automated means, from Sportlyst and its affiliates to the email
          provided.
        </Text>
        <StatusBar barStyle="dark-content"></StatusBar>
      </View>
    </SafeAreaView>
  );
}
