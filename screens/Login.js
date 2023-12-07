import React from "react";
import {
  Text,
  View,
  Pressable,
  StatusBar,
  TextInput,
  Alert
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

import { useState, useEffect } from "react";

// Import the auth variable
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";

import PasswordReset from "../components/PasswordReset"

export default function Login({ navigation, route }) {
  //Variables
  const [usernameFromUI, setUsernameFromUI] = useState("");
  const [passwordFromUI, setPasswordFromUI] = useState("");

  const [prModalVisible, setPrModalVisible] = useState(false);

  // Login
  const loginClick = async () => {
    try {
      if (usernameFromUI === "") {
        alert("Write your username");
      } else if (passwordFromUI === "") {
        alert("write your password");
      } else {
        //Verify Credential
        await signInWithEmailAndPassword(auth, usernameFromUI, passwordFromUI);
        //User Information
        console.log("Who is the currently logged in user");
        console.log(auth.currentUser);
        // alert(`Login success! ${auth.currentUser.uid}`);
        //Clean Inputs
        setUsernameFromUI("");
        setPasswordFromUI("");
      }
    } catch (error) {
      if (error.code === "auth/invalid-login-credentials") {
        alert("Invalid login credentials");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email");
      } else if (error.code === "auth/wrong-password") {
        alert("Wrong password");
      } else {
        alert("Check your credentials");
      }
    }
  };

  // LogOut
  const logOutClick = async () => {
    try {
      if (auth.currentUser === null) {
        alert("logoutPressed: There is no user to logout!");
      } else {
        await signOut(auth);
        alert("User LogOut");
      }
    } catch (error) {
      console.log(error);
    }
  };

  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,

    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  const passwordReset = async (email) => {
    try {
      // await auth().sendPasswordResetEmail(email);
      await sendPasswordResetEmail(auth, email)
      console.log("Who is the currently logged in user");
      Alert.alert("Check your email", "A link to reset your password has been sent to your email address.");
      setPrModalVisible(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const onResetPwdBtnClicked = () => {
    setPrModalVisible(true)
  }

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="bg-white pl-3 pr-3">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => {
              navigation.goBack();
            }}
          >
            <View className="bg-white w-12 h-12 rounded-full items-center justify-center shadow-md">
              <Ionicons name="arrow-back-sharp" size={24} color="black" />
            </View>
          </Pressable>
          <Text className="font-urbanistBold text-2xl">Login</Text>
        </View>

        {/* <Text className="font-urbanistBold text-3xl text-start pl-3">
          Login
        </Text> */}
        <View className="mt-8">
          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-5 font-urbanist"
            placeholder="Enter Email"
            placeholderTextColor={"#666"}
            autoCapitalize="none"
            value={usernameFromUI}
            onChangeText={setUsernameFromUI}
          ></TextInput>
          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 font-urbanist"
            placeholder="Enter Password"
            placeholderTextColor={"#666"}
            secureTextEntry
            autoCapitalize="none"
            value={passwordFromUI}
            onChangeText={setPasswordFromUI}
          ></TextInput>
          <Pressable
            className="bg-secondary rounded-lg h-14 mt-5 items-center justify-center"
            onPress={loginClick}
          >
            <Text className="text-lg font-urbanistBold text-primary">
              Login
            </Text>
          </Pressable>
          {/* <Pressable className="bg-gray rounded-lg h-14 mt-5 items-center justify-center">
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
          </Pressable> */}
          <Pressable
            onPress={onResetPwdBtnClicked}
          >
            <Text className="text-lg font-urbanistBold mt-2">
              Forgot Password?
            </Text>
          </Pressable>
        </View>
        <PasswordReset
          visible={prModalVisible}
          onClose={() => setPrModalVisible(false)}
          onSend={(email) => {
            passwordReset(email);
            setPrModalVisible(false);
          }}
        />
        <StatusBar barStyle="dark-content"></StatusBar>
      </View>
    </SafeAreaView>
  );
}
