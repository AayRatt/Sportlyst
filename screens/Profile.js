import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  SafeAreaView,
  TextInput,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { db, auth, firebaseStorage } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import profileIcon from "../assets/profile-icon.png";
import countries from "../data/countries.json";

import {
  useFonts,
  Urbanist_600SemiBold,
  Urbanist_500Medium,
} from "@expo-google-fonts/urbanist";

export default function Profile({}) {
  const [uploading, setUploading] = useState(false);
  //Countries Picker Visibiilty
  const [pickerVisible, setPickerVisible] = useState(false);

  const [countriesDataList, setCountriesDataList] = useState([]);

  const retrieveCountryNames = () => {
    console.log(`Countries data ${JSON.stringify(countries)}`);

    const countryNames = Object.values(countries).map(
      (country) => country.name.common
    );
    setCountriesDataList(countryNames);
    console.log(`Countries ${JSON.stringify(countryNames)}`);
  };

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
  });

  const [tmpUser, setTmpUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    postalCode: "",
    imageUrl: "",
  });

  // Function to update form fields
  const updateUser = (key, updatedValue) => {
    const temp = { ...user };
    temp[key] = updatedValue;
    setUser(temp);
  };

  const retrieveFromDb = async () => {
    const docRef = doc(db, "userProfiles", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`docSnap ${JSON.stringify(docSnap.data().imageUrl)}`);
      setUser(docSnap.data());
      setTmpUser(docSnap.data());
    } else {
      console.log("No such document!");
    }
  };

  const updateDb = async () => {
    // update data in firestore
    try {
      const userRef = doc(db, "userProfiles", auth.currentUser.uid);
      alert("Profile Updated");

      await updateDoc(userRef, user);
    } catch (err) {
      console.log(err);
    }
  };

  const resetForm = () => {
    const userReset = {
      firstName: tmpUser.firstName,
      lastName: tmpUser.lastName,
      email: tmpUser.email,
      phoneNumber: tmpUser.phoneNumber,
      country: tmpUser.country,
      postalCode: tmpUser.postalCode,
      imageUrl: tmpUser.imageUrl,
    };
    setUser(userReset);
  };

  const saveUserProfile = () => {
    updateDb();
    uploadImage();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    const source = { uri: result.assets[0].uri };
    console.log(`source is: ${JSON.stringify(source)}`);
    updateUser("imageUrl", source.uri);
  };

  const uploadImage = async () => {
    setUploading(true);

    const response = await fetch(user.imageUrl);
    const blob = await response.blob();

    const filename = auth.currentUser.uid;
    console.log(`filename is ${filename}`);
    const storageRef = ref(firebaseStorage, filename);

    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Progress function...
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        // Error function...
        console.log(error);
      },
      () => {
        // Complete function...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("File available at", downloadURL);

          // Store the downloadURL in Firestore under the user's profile
          const userDocRef = doc(db, "userProfiles", auth.currentUser.uid);
          updateDoc(userDocRef, {
            imageUrl: downloadURL,
          });
        });
      }
    );
  };

  // //fucntion to retrieve data from the API
  // const getDataFromAPI = async () => {
  //   const apiURL = `https://sportlystapi.onrender.com/sportlyst/getVenues`
  //   const apiURL2 = `https://sportlystapi.onrender.com/sportlyst/getSports`

  //   const response = await fetch(apiURL2)

  //   try {
  //     const json = await response.json()
  //     console.log(`json is: ${JSON.stringify(json)}`)
  //     setApiDataList(json)
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  // const test = () => {
  //   // console.log(`json2 is: ${JSON.stringify(json)}`)
  //   apiDataList.sports.map(
  //     (currVehicle) => {
  //       // console.log(`Venue : ${currVehicle.venue}`)
  //       console.log(`Venue : ${currVehicle.sportsType}`)
  //     }
  //   )
  // }

  useEffect(() => {
    retrieveFromDb();
    retrieveCountryNames();
  }, []);

  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,

    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  const countriesListItem = ({ item }) =>
    countriesDataList.map((currCountry) => {
      <Picker.Item label={currCountry} value={currCountry} />;
    });

  return (
    <SafeAreaView className="bg-primary flex-1 h-full">
      <View className="flex-row justify-between items-center px-6 pb-5">
        <TouchableOpacity onPress={resetForm}>
          <Text>Reset</Text>
        </TouchableOpacity>
        <Text className="font-urbanistBold text-2xl">User Profile</Text>
        <TouchableOpacity onPress={saveUserProfile}>
          <Text>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="h-fit">
        <View className="bg-white pl-3 pr-3">
          <View className="mt-2">
            <View className="h-50 w-50 bg-gray-500 relative rounded-full">
              <Image
                source={user.imageUrl ? { uri: user.imageUrl } : profileIcon}
                className="self-center w-40 h-40 rounded-full border-solid border-2"
              />
              <TouchableOpacity
                onPress={pickImage}
                className="flex items-center justify-center mt-2"
              >
                <Text>Change Image</Text>
              </TouchableOpacity>
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
              className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-3 font-urbanist"
              placeholder="Phone number (optional)"
              placeholderTextColor={"#666"}
              value={user.phoneNumber}
              keyboardType="numeric"
              onChangeText={(account) => {
                updateUser("phoneNumber", account);
              }}
            ></TextInput>

            <Modal
              animationType="slide"
              transparent={true}
              visible={pickerVisible}
              onRequestClose={() => {
                setPickerVisible(false);
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  backgroundColor: "rgba(0,0,0,0.5)",
                }}
              >
                <View style={{ backgroundColor: "white", height: 350 }}>
                  <Picker
                    selectedValue={user.country}
                    onValueChange={(account) => {
                      updateUser("country", account);
                      setPickerVisible(false);
                    }}
                  >
                    {countriesDataList.map((country) => (
                      <Picker.Item
                        key={country}
                        label={country}
                        value={country}
                      />
                    ))}
                  </Picker>
                  <Button
                    title="Close Picker"
                    onPress={() => setPickerVisible(false)}
                  />
                </View>
              </View>
            </Modal>
            <Pressable
              className="bg-secondary rounded-lg h-10 mt-1 items-center justify-center"
              onPress={() => setPickerVisible(true)}
            >
              <Text className="text-lg font-urbanistBold text-primary">
                {user.country ? user.country : "Country"}
              </Text>
            </Pressable>

            <TextInput
              className="bg-gray h-12 rounded-lg w=11/12 p-4 mt-3 mb-5 font-urbanist"
              placeholder="Postal code"
              placeholderTextColor={"#666"}
              value={user.postalCode}
              onChangeText={(account) => {
                updateUser("postalCode", account);
              }}
            ></TextInput>

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
      </ScrollView>
    </SafeAreaView>
  );
}
