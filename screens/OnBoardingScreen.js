import React from "react";
import { Text, View, TouchableOpacity, Pressable } from "react-native";
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";
import Onboarding from 'react-native-onboarding-swiper';
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db, auth } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function OnBoardingScreen({ navigation }) {
  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSkip = () => {

    // setData();
  
    navigation.replace('BottomTab');
  };

//   function setData(){

//     try {

//         AsyncStorage.setItem("launched","true")

//         //AsyncStorage.setItem("launched","true")
//         console.log("Async Storage added ")
        
//     } catch (error) {
        
//     }

    
//   }

const finishOnBoarding = async () =>{

  const loggedUser = auth.currentUser
  const userRef = doc(db, "userProfiles", loggedUser.uid);

  try {
    await updateDoc(userRef, {
      onBoardPending: false
    });
    console.log("User onBoardPending set to false");
    navigation.replace('BottomTab');
  } catch (error) {
    console.error("Error updating user onBoardPending: ", error);
  }

}
  return (
    <Onboarding
    onSkip={handleSkip}
    onDone={finishOnBoarding}
    pages={[
      {
        backgroundColor: '#fff',
        // image: <Image source={require('./images/circle.png')} />
        title: 'Onboarding',
        subtitle: 'Done with React Native Onboarding Swiper',
      },
      {
        backgroundColor: '#fff',
        // image: <Image source={require('./images/circle.png')} />
        title: 'Onboarding',
        subtitle: 'Done with React Native Onboarding Swiper',
      }
    ]}
    // SkipButtonComponent={skipButton}
  />
  );
}
