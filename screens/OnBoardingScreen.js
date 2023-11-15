import React from "react";
import { Text, View, TouchableOpacity, Pressable, Image } from "react-native";
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
import OnboardingPageTemplate from "../components/OnBoardingPageTemplate";

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

  const finishOnBoarding = async () => {

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
      backgroundColor = {"#fefefe"}

      pages={[
        {
          backgroundColor:'#fff',
          title: (<OnboardingPageTemplate
          title='Welcome to Sportlyst'
          subtitle='Discover sports, meet peers, and stay active!'
          description = 'Join a community where fitness and fun meet. Whether you are a beginner or a pro, find the perfect sporty crew with Sportlyst'
          imageSource={require('../assets/OB1.png')}
          >
          </OnboardingPageTemplate>)
        },
        {
          backgroundColor: '#fff',
          title: (<OnboardingPageTemplate
            title='Find Your Sport'
            subtitle='Explore a wide range of activities'
            description = 'From team sports to solo adventures, discover activities that match your interests and skill level.'
            imageSource={require('../assets/OB2.png')}
            >
            </OnboardingPageTemplate>)
          
        },
        {
          backgroundColor: '#fff',
          title: ((<OnboardingPageTemplate
            title='Connect with Peers'
            subtitle='Meet people who share your passion'
            description = 'Create or join groups, plan events, and make new friends. It’s all about connecting with people who love the sport as much as you do.'
            imageSource={require('../assets/OB3.png')}
            >
            </OnboardingPageTemplate>))
        },
        {
          backgroundColor: '#fff',
          title: ((<OnboardingPageTemplate
            title='Stay Active'
            subtitle='Keep up with your fitness goals'
            description = 'Set personal goals, track your progress, and stay motivated. Sportlyst is your partner in maintaining an active and healthy lifestyle.'
            imageSource={require('../assets/OB4.png')}
            >
            </OnboardingPageTemplate>))
        },
        {
          backgroundColor: '#fff',
          title: ((<OnboardingPageTemplate
            title='Ready to Jump In?'
            subtitle='Lets get you set up!'
            description = 'Create your profile, tell us your favorite sports, and find your first activity today'
            imageSource={require('../assets/OB5.png')}
            >
            </OnboardingPageTemplate>))
        }
      ]}
    // SkipButtonComponent={skipButton}
    />
  );
}
