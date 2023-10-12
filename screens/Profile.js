import React from "react";
import { View, Text, Image, StyleSheet, Pressable, SafeAreaView, TextInput, StatusBar, TouchableOpacity } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { db, auth, firebaseStorage } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";
import profileIcon from '../assets/profile-icon.png';
import { AntDesign } from '@expo/vector-icons';

export default function Profile({ navigation }) {

  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const addImage = () => { }

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
    postalCode: "",
    imageUrl: "",
  })

  // Function to update form fields
  const updateUser = (key, updatedValue) => {
    const temp = { ...user };
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

  const updateDb = async () => {
    // update data in firestore
    try {
      const userRef = doc(db, "userProfiles", auth.currentUser.uid);

      await updateDoc(bookingRef, {
        bookingStatus: isEnabled ? 'Confirmed' : 'Declined',
        bookingCode: isEnabled ? bookingId : '',
      });
    } catch (err) {
      console.log(err)
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    });
    const source = { uri: result.assets[0].uri }
    console.log('source is: ${source}')
    setImage(source)
  };

  const uploadImage = async () => {
    setUploading(true);

    const response = await fetch(image.uri);
    const blob = await response.blob();

    const filename = auth.currentUser.uid;
    console.log(`filename is ${filename}`);
    const storageRef = ref(firebaseStorage, filename);

    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Progress function...
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        // Error function...
        console.log(error);
      },
      () => {
        // Complete function...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);

          // Store the downloadURL in Firestore under the user's profile
          const userDocRef = doc(db, "userProfiles", auth.currentUser.uid);
          updateDoc(userDocRef, {
            imageUrl: downloadURL
          });

        });
      }
    );
  };

  useEffect(() => {
    retrieveFromDb()
  }, [])

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="bg-white pl-3 pr-3">

        <Text className="mt-8 font-urbanistBold text-2xl text-start pl-3 text-center">
          User Profile
        </Text>
        <View className="mt-2">
          <View className="h-50 w-50 bg-gray-500 relative rounded-full">
            <Image
              source={image ? { uri: image.uri } : profileIcon}
              className="self-center w-40 h-40 rounded-full border-solid border-2"
            />
            <View className="opacity-80 absolute bottom-0 right-0 bg-light-gray w-full h-1/4">
              <TouchableOpacity onPress={pickImage} className="flex items-center justify-center" >
                <Text>{image ? 'Edit' : 'Upload'} Image</Text>
                <AntDesign name="camera" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-5 font-urbanist mt-5"
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
            className="bg-secondary rounded-lg h-14 mt-2 items-center justify-center"
            onPress={onLogoutClicked}
          >
            <Text className="text-lg font-urbanistBold text-primary">
              Update
            </Text>
          </Pressable>
          <Pressable
            className="bg-secondary rounded-lg h-14 mt-2 items-center justify-center"
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