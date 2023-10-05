import React from "react";
import { View, Text, Image, StyleSheet, Pressable, SafeAreaView, TextInput, StatusBar, FlatList } from "react-native";
import { useState, useEffect } from 'react';
import { db, auth } from "../firebaseConfig";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import profileIcon from '../assets/profile-icon.png';
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";

export default function Friends({ navigation }) {

    const [pendingRequests, setpendingRequests] = useState([])
    const [friends, setFriends] = useState([])


    // async function loadFriendRequests() {
    //     try {
    //         const q = await getDocs(collection(db, "userProfiles", auth.currentUser.uid, "friendRequests"));
    //         const userData = [];

    //         q.forEach(async (docSnapshot) => {
    //             try {
    //                 const docRef = doc(db, "userProfiles", docSnapshot.data().fromUserID);

    //                 console.log(docSnapshot.data().status)
    //                 if(docSnapshot.data().status === 'Pending'){

    //                     const docSnap = await getDoc(docRef);
    //                     if (docSnap.exists()) {

    //                             const userDocData = docSnap.data();
    //                             const fullName = `${userDocData.firstName} ${userDocData.lastName}`;
    //                             const email = userDocData.email;
    //                             const requestID = docSnapshot.id
    //                             const friendID = userDocData.userID
    //                             userData.push({ requestID, friendID, fullName, email });
    //                             console.log(fullName)
    //                             setpendingRequests(userData)
    //                     }
    //                 }


    //             } catch (error) {
    //                 console.error("Error getting document:", error);
    //             }
    //         });




    //     } catch (error) {
    //         console.error("Error loading friend requests: ", error);
    //     }
    // }

    function loadFriendRequests() {
        const userID = auth.currentUser.uid;
        const friendRequestRef = collection(db, "userProfiles", userID, "friendRequests");
        const q = query(friendRequestRef, where('status', '==', 'Pending'));

        // This will be the unsubscribe function.
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const userData = [];

            for (const docSnapshot of snapshot.docs) {
                try {
                    const docRef = doc(db, "userProfiles", docSnapshot.data().receivedFrom);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const userDocData = docSnap.data();
                        const fullName = `${userDocData.firstName} ${userDocData.lastName}`;
                        const email = userDocData.email;
                        const requestID = docSnapshot.id;
                        const friendID = userDocData.userID;
                        userData.push({ requestID, friendID, fullName, email });
                    }
                } catch (error) {
                    console.error("Error processing request:", error);
                }
            }

            setpendingRequests(userData);
        });

        // Return the unsubscribe function for cleanup
        return unsubscribe;
    }

    function loadFriends() {
        const userID = auth.currentUser.uid;
        const friendRef = collection(db, "userProfiles", userID, "friends");
        //const q = query(friendRequestRef, where('status', '==', 'Pending'));

        // This will be the unsubscribe function.
        const unsubscribe2 = onSnapshot(friendRef, async (snapshot) => {
            const friendData = [];

            for (const docSnapshot of snapshot.docs) {
                try {
                    const docRef = doc(db, "userProfiles", docSnapshot.data().userID);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const userDocData = docSnap.data();
                        const fullName = `${userDocData.firstName} ${userDocData.lastName}`;
                        const email = userDocData.email;
                        const friendID = userDocData.userID;
                        friendData.push({ friendID, fullName, email });
                    }
                } catch (error) {
                    console.error("Error processing request:", error);
                }
            }

            setFriends(friendData);
        });

        // Return the unsubscribe function for cleanup
        return unsubscribe2;
    }



    async function accept(requestID, friendID) {

        console.log(requestID)
        console.log(friendID)
        console.log(auth.currentUser.uid)

        try {
            const requestRef = doc(db, "userProfiles", auth.currentUser.uid, "friendRequests", requestID);
            const acceptRef = collection(db, "userProfiles", auth.currentUser.uid, "friends");
            const friendRequestUserRef = collection(db, "userProfiles", friendID, "friends");
            const loggedUserID = auth.currentUser.uid

            await updateDoc(requestRef, {
                status: "Accepted"
            })

            await addDoc(acceptRef, {

                userID: friendID,
                timeStamp: new Date()

            })

            await addDoc(friendRequestUserRef, {

                userID: loggedUserID,
                timeStamp: new Date()

            })

            console.log('User accepted')

        } catch (error) {

            console.log(error)
        }

    }

    // async function decline(requestID, friendID) {

    //     const friendRequestRef = doc(db, "userProfiles", auth.currentUser.uid, "friendRequests", requestID);
    //     const friendRequestFromRef = collection(db, "userProfiles", friendID, "sentFriendRequests");
    //     const q = query(friendRequestRef, where('sentTo', '==', auth.currentUser.uid));


    //     try {



    //         await updateDoc(friendRequestRef, {
    //             status: "Declined"
    //         })

    //         const snapShot = await getDocs(q)

    //         if(!snapShot.empty){
    //             const requestDoc = snapShot.docs[0]

    //             await updateDoc(requestDoc.ref,{
    //                 status: "Declined"
    //             })
    //         }

    //         console.log('User declined')

    //     } catch (error) {

    //     }

    // }
    async function decline(requestID, friendID) {
        try {
            const friendRequestRef = doc(db, "userProfiles", auth.currentUser.uid, "friendRequests", requestID);
            await updateDoc(friendRequestRef, {
                status: "Declined"
            });
            console.log('Friend request reference updated successfully.');

            const sentFriendRequestsCollection = collection(db, "userProfiles", friendID, "sentFriendRequests");
            const q = query(sentFriendRequestsCollection, where('sentTo', '==', auth.currentUser.uid));
            const snapShot = await getDocs(q);

            console.log('Query executed successfully.');

            if (!snapShot.empty) {
                const requestDoc = snapShot.docs[0];
                await updateDoc(requestDoc.ref, {
                    status: "Declined"
                });
                console.log('Friend request in sender\'s collection updated successfully.');
            } else {
                console.log('No document found in sender\'s collection.');
            }

        } catch (error) {
            console.error("Error in decline function:", error);
        }
    }


    useEffect(() => {
        const unsubscribe = loadFriendRequests();
        const unsubscribe2 = loadFriends();

        // Cleanup listener on component unmount
        return () => {
            if (unsubscribe) unsubscribe();
            if (unsubscribe2) unsubscribe2();
        };
    }, []);


    return (
        <SafeAreaView className="bg-primary flex-1">
            <View className="bg-white pl-3 pr-3">
                <Text className="mt-8 font-urbanistBold text-2xl text-start pl-3 text-center">
                    Friend Requests
                </Text>
                {pendingRequests && pendingRequests.length > 0 ? (
                    <FlatList
                        data={pendingRequests}
                        keyExtractor={(item) => item.userID}
                        renderItem={({ item }) => (
                            <View className="flex-row mt-5 pl-3 items-center">
                                {/* User profile picture */}
                                <Image
                                    source={item.image ? { uri: item.image } : profileIcon}
                                    className="w-12 h-12 rounded-full"
                                />

                                {/* Name and buttons container */}
                                <View className="flex-1 ml-3">
                                    {/* User name */}
                                    <Text className="font-urbanist text-xl mb-2 flex-1">{`${item.fullName}`}</Text>

                                    {/* Accept and Decline Buttons */}
                                    <View className="flex-row">
                                        <Pressable
                                            className="bg-secondary rounded-lg h-5 items-center justify-center w-1/4 mr-1"
                                            onPress={() => {
                                                // Handle the accept action
                                                accept(item.requestID, item.friendID);
                                            }}
                                        >
                                            <Text style={{ color: 'white' }}>Accept</Text>
                                        </Pressable>

                                        <Pressable
                                            className="bg-secondary rounded-lg h-5 items-center justify-center w-1/4"
                                            onPress={() => {
                                                // Handle the decline action
                                                decline(item.requestID, item.friendID);
                                            }}
                                        >
                                            <Text style={{ color: 'white' }}>Decline</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>

                        )}
                    />
                ) : (
                    <View className="flex-row items-center mt-5 pl-3">
                        <Text>No pending requests</Text>
                    </View>
                )}
                <Text className="mt-8 font-urbanistBold text-2xl text-start pl-3 text-center">
                    Friends
                </Text>

                <FlatList
                    data={friends}
                    keyExtractor={(item) => item.userID}
                    renderItem={({ item }) => (

                        <View className="flex-row items-center mt-5 pl-3">
                            {/* User profile picture */}
                            <Image
                                source={item.image ? { uri: item.image } : profileIcon}
                                className="w-12 h-12 rounded-full"
                            />

                            <Text
                                className="font-urbanist text-2xl mr-3"
                            >{`${item.fullName}`}</Text>

                        </View>
                    )}
                />

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