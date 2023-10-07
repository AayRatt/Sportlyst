import React from "react";
import { View, Text, Image, StyleSheet, Pressable, SafeAreaView, TextInput, StatusBar, FlatList,Alert } from "react-native";
import { useState, useEffect } from 'react';
import { db, auth } from "../firebaseConfig";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import profileIcon from '../assets/profile-icon.png';
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";


export default function FriendProfile({navigation}){

    return(
        <SafeAreaView className="bg-primary flex-1">
            <Text>User Profile View</Text>
        </SafeAreaView>
    )

}