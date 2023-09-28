import React from "react";
import { View, Text, Image, StyleSheet, Pressable, SafeAreaView, TextInput, StatusBar } from "react-native";
import { useState, useEffect } from 'react';

import { db, auth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

import profileIcon from '../assets/profile-icon.png';

export default function Profile({ navigation }) {
  const onLogoutClicked = async () => {
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

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    postalCode: ""
  })

  // Function to update form fields
  const updateUser = (key, updatedValue) => {
    const temp = { ...formField };
    temp[key] = updatedValue;
    setUser(temp);
  };

  const retrieveFromDb = async () => {
    const docRef = doc(db, "userProfiles", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    console.log(`docSnap ${JSON.stringify(docSnap)}`);


    if (docSnap.exists()) {
      setUser(docSnap.data())
    } else {
      console.log("No such document!");
    }
  }

  useEffect(() => {
    retrieveFromDb()
  }, [])


  return (
    // <View className="flex-1 justify-center items-center">
    //   <Text>Profile</Text>
    //   <Button title="Log Out" onPress={logOutClick}></Button>
    // </View>

    // <SafeAreaView style={styles.container}>

    //   <View style={styles.innerContainer}>
    //     {/* view 2 */}
    //     <View style={styles.view2}>
    //       {/* view 3 */}
    //       <View style={styles.view3}>
    //         <Image
    //           source={user.image ? { uri: user.image } : profileIcon} style={styles.image}
    //         />
    //         <Text style={{ fontSize: 22, alignContent: 'center' }}>{user.email}</Text>
    //         <Text style={{ fontSize: 28, fontWeight: "bold", alignContent: 'center', alignItems: 'center' }}>{user.firstName} {user.lastName}</Text>
    //       </View>
    //     </View>

    //     <View style={{
    //       alignItems: 'center'
    //     }}>
    // <Pressable style={styles.btn}>
    //   <Text style={styles.btnLabel} onPress={onLogoutClicked}>Logout</Text>
    // </Pressable>
    //     </View>
    //   </View>
    // </SafeAreaView>



    <SafeAreaView className="bg-primary flex-1">
      <View className="bg-white pl-3 pr-3">

      <Text className="mt-8 font-urbanistBold text-2xl text-start pl-3 text-center">
          User Profile
        </Text>
        <View className="mt-8">

        <View className="items-center">
        <Image
            source={user.image ? { uri: user.image } : profileIcon}
            className="self-center w-40 h-40 rounded-full"
          />
        </View>
          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-5 font-urbanist"
            placeholderTextColor={"#666"}
            value={user.email}
            editable={false}
          ></TextInput>
          
          <View className="flex-row gap-3">
            <TextInput
              className="bg-gray h-12 rounded-lg w-1/2 p-4 mb-5 flex-1 font-urbanist"
              placeholder="Enter First Name"
              placeholderTextColor={"#666"}
              autoCapitalize="none"
              value={user.firstName}
              onChangeText={(account) => {
                updateUser("firstName", account);
              }}
            ></TextInput>
            <TextInput
              className="bg-gray h-12 rounded-lg w-1/2 p-4 mb-5 flex-1 font-urbanist"
              placeholder="Enter Last Name"
              placeholderTextColor={"#666"}
              value={user.lastName}
              onChangeText={(account) => {
                updateUser("lastName", account);
              }}
            ></TextInput>
          </View>

          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-5 font-urbanist"
            placeholder="Phone number (optional)"
            placeholderTextColor={"#666"}
            value={user.phoneNumber}
            keyboardType="numeric"
            onChangeText={(account) => {
              updateUser("phoneNumber", account);
            }}
          ></TextInput>          
          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-5 font-urbanist"
            placeholder="Country"
            placeholderTextColor={"#666"}
            value={user.country}
            onChangeText={(account) => {
              updateUser("country", account);
            }}
          ></TextInput>          
          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-5 font-urbanist"
            placeholder="Postal code"
            placeholderTextColor={"#666"}
            value={user.phoneNumber}
            onChangeText={(account) => {
              updateUser("postalCode", account);
            }}
          ></TextInput>

          <Pressable
            className="bg-secondary rounded-lg h-14 mt-5 items-center justify-center"
            onPress={onLogoutClicked}
          >
            <Text className="text-lg font-urbanistBold text-primary">
              Logout
            </Text>
          </Pressable>
        </View>
        <StatusBar barStyle="dark-content"></StatusBar>
      </View>
    </SafeAreaView>



  );
}

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 150,
    marginTop: 5,
    borderRadius: 75,
    marginBottom: 10
  },
});