import React from "react";
import { View, Text, Image, StyleSheet, Pressable, SafeAreaView, TextInput, StatusBar, FlatList, Alert } from "react-native";
import { useState, useEffect } from 'react';
import { db, auth } from "../firebaseConfig";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import profileIcon from '../assets/profile-icon.png';
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";


export default function FriendProfile({ navigation, route }) {

    //const { userID } = navigation.params 
    const loggedUser = auth.currentUser.uid

    const userID = route.params?.userID;
    // const friend = route.params?.friend;
    //const requestSent = route.params?.requestSent;

    const [friend, setFriend] = useState(false)
    const [requestSent, setRequestSent] = useState(false)
    const [userInfo, setUserInfo] = useState(null)

    const [requestStatus, setRequestStatus] = useState(null)

    async function loadUserInfo() {

        const docRef = doc(db, "userProfiles", userID);

        try {
            const docSnap = await getDoc(docRef);
            console.log(`docSnap ${JSON.stringify(docSnap)}`);

            if (docSnap.exists()) {
                setUserInfo(docSnap.data())
            } else {
                console.log("No such document!");
            }

        } catch (error) {
            console.log(error)
        }

    }

    async function addFriend(toUserID) {

        try {
            //Add friend request sent to logged user
            const requestSentRef = collection(db, `userProfiles/${loggedUser}/sentFriendRequests`);
            await addDoc(requestSentRef, {

                sentTo: toUserID,
                status: 'Pending',
                timeStamp: new Date(),
            });

            //Add friend request to target user 
            const friendRequestRef = collection(db, `userProfiles/${toUserID}/friendRequests`);
            await addDoc(friendRequestRef, {

                receivedFrom: loggedUser,
                status: 'Pending',
                timeStamp: new Date(),
            });
            alert('Friend Request sent!')
            //loadUsers()
        } catch (error) {

            alert('ERROR SENDING REQUEST', error)

        }

    }

    function setRequestListeners() {

        const sentRequestRef = collection(db, "userProfiles", loggedUser, "sentFriendRequests")
        const query1 = query(sentRequestRef, where("sentTo", "==", userID))

        const sentRequestsListener = onSnapshot(query1, snapshot => {

            const request = snapshot.docs.find(doc => doc.data().sentTo === userID)

            if (request) {
                setRequestStatus(request.data().status);
                setRequestSent(true);
                
            }

        })

        const friendRequestRef = collection(db, "userProfiles", loggedUser, "friendRequests")
        const query2 = query(friendRequestRef, where("receivedFrom", "==", userID))

        const friendRequestListener = onSnapshot(query2, snapshot => {

            const request = snapshot.docs.find(doc => doc.data().receivedFrom === userID)

            if (request) {
                setRequestStatus(request.data().status);
            }

        })

        return () => {
            sentRequestsListener();
            friendRequestListener();
        };

    }

    useEffect(() => {
        const unsubscribe = loadUserInfo();

        return () => {
            if (unsubscribe) {
                unsubscribe();  // Cleaning up the listener
            }
        };
    }, []);

    useEffect(() => {
        const unsubscribe = setRequestListeners();
    
        return () => {
            unsubscribe();
        };
    }, []);
    


    useEffect(() => {
        navigation.setOptions({
            title: userInfo ? `${userInfo.firstName}'s Profile` : 'Loading...',
        });
    }, [navigation, userInfo]);



    return ( 
        <SafeAreaView className="bg-primary flex-1">
            <View className="bg-white pl-3 pr-3 flex justify-center items-center">
                {userInfo && (
                    <>
                        <Text
                            className="mt-8 font-urbanistBold text-2xl text-start pl-3 text-center">
                            {`${userInfo.firstName} ${userInfo.lastName}`}
                        </Text>
    
                        <Image
                            source={userInfo.image ? { uri: userInfo.image } : profileIcon}
                            className="self-center w-40 h-40 rounded-full"
                        />
    
                        {requestStatus === 'Accepted' ? (    
                            <Text className="font-urbanistBold text-lg text-start pl-2 text-center">You are friends with {`${userInfo.firstName} `}</Text>
                        ) : requestStatus === 'Pending' ? (
                            <Text>Friend Request Sent</Text>
                        ) : (
                            <Pressable
                                className="bg-secondary rounded-lg h-8 items-center justify-center w-1/4"
                                onPress={() => addFriend(userID)}>
                                <Text className="text-sm font-urbanistBold text-primary">Add Friend</Text>
                            </Pressable>
                        )}
                    </>
                )}
            </View>
        </SafeAreaView>
    )
    


}