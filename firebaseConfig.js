// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

//Persistance and Auth
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVP8qb23ZRWT9Og_AuPTVjhQgRw3EqR4k",
  authDomain: "sportlyst-f84a1.firebaseapp.com",
  projectId: "sportlyst-f84a1",
  storageBucket: "sportlyst-f84a1.appspot.com",
  messagingSenderId: "671352737622",
  appId: "1:671352737622:web:e47d80c7ba6b02a75150f7",
  measurementId: "G-TXLT08HG9J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Services (database, auth, etc)
const db = getFirestore(app);
//auth configuration
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
//Initialise Firebase Storage
const firebaseStorage = getStorage(app);

// TODO: Initialize Firebase Analytics
// const analytics = getAnalytics(app);

export { db, auth, firebaseStorage };
