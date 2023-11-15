import React from "react";
import { Text, View, TouchableOpacity, Pressable, Image, StyleSheet } from "react-native";
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const OnboardingPageTemplate = ({ title, subtitle, description, children, imageSource }) => {

  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.container]}>
      <View style={styles.backTop}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {imageSource && <Image source={imageSource} style={styles.image} />}
      <Text style={styles.description}>{description}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 40
  },
  backTop:{
    //flex: 1, 
    // backgroundColor: "black",
    // width: '100%', 
    // alignSelf: 'stretch', 
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 

  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1a202c',
    margin: 30,
    marginBottom: 10,

  },
  subtitle: {
    fontSize: 18,
    color: '#4a5568',
    textAlign: 'center',
    justifyContent: 'center'
  },

  description: {
    fontSize: 16,
    color: '#4a5568',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    // marginTop:10,
    marginHorizontal: 25
  },

  image: {
    width: '50%',  // or a fixed width
    height: '50%',
    aspectRatio: 1, // The aspect ratio (width/height) of the image
    resizeMode: 'contain', // or 'cover'
  }
});

export default OnboardingPageTemplate;

