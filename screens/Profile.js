import React from "react";
import { View, Text, Button } from "react-native";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

export default function Profile({ navigation }) {
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

  return (
    <View className="flex-1 justify-center items-center">
      <Text>Profile</Text>
      <Button title="Log Out" onPress={logOutClick}></Button>
    </View>
  );
}
