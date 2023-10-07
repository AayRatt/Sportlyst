import React from "react";
import { View, Text, Image, StyleSheet, Pressable, SafeAreaView, TextInput, StatusBar, FlatList,Alert } from "react-native";
import { useState, useEffect } from 'react';
import { db, auth } from "../firebaseConfig";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";
import profileIcon from '../assets/profile-icon.png';
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";

export default function Friends({ navigation }) {

    const [pendingRequests, setpendingRequests] = useState([])
    const [friends, setFriends] = useState([])
    const userID = auth.currentUser.uid;

    function loadFriendRequests() {
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
            const requestRef = doc(db, "userProfiles", userID, "friendRequests", requestID);
            const acceptRef = collection(db, "userProfiles", userID, "friends");
            const friendRequestUserRef = collection(db, "userProfiles", friendID, "friends");

            await updateDoc(requestRef, {
                status: "Accepted"
            })


            await addDoc(acceptRef, {

                userID: friendID,
                timeStamp: new Date()

            })

            await addDoc(friendRequestUserRef, {

                userID: userID,
                timeStamp: new Date()

            })

            console.log('User accepted')


            const requestRefofUser = collection(db, "userProfiles", friendID, "sentFriendRequests");
            const q = query(requestRefofUser, where("sentTo","==",userID))

            const snapShot = await getDocs(q)

            if(snapShot.empty){
                console.log("No user to be found")
                return
            }

            snapShot.forEach(async (document) => {
                const docRef = doc(db, "userProfiles", friendID, "sentFriendRequests", document.id);

                const status = {
                    status: "Accepted"
                }

                await updateDoc(docRef, status);
            });


            

        } catch (error) {

            console.log(error)
        }

    }

    async function decline(requestID, friendID) {
        try {
            const friendRequestRef = doc(db, "userProfiles", userID, "friendRequests", requestID);
            await updateDoc(friendRequestRef, {
                status: "Declined"
            });
            console.log('Friend request reference updated successfully.');

            const sentFriendRequestsCollection = collection(db, "userProfiles", friendID, "sentFriendRequests");
            const q = query(sentFriendRequestsCollection, where('sentTo', '==', userID));
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

    async function onDeleteFriendPress(friendID, friendName){

        Alert.alert('Delete Friend',`Are you sure you want to delete ${friendName}?`,[

            {
                text:'Cancel',
                onPress: () =>{
                    console.log('Delete Cancelled')
                },
                style:'cancel'
            },
            {
                text:'Delete',
                onPress: () => deleteFriend(friendID)
            }
        ],
        {cancelable: false}
        )
    }

    async function deleteFriend(friendID){ 

        const friendListRef = collection(db, "userProfiles", userID, "friends");
        const q = query(friendListRef, where("userID","==",friendID));
    
        const friendToDeleteRef = collection(db, "userProfiles", friendID, "friends");
        const q2 = query(friendToDeleteRef, where("userID","==",userID));
    
        try {
    
            const querySnap = await getDocs(q); 
            if(querySnap.empty){ 
                console.log("No friend found to delete");
                return;
            }
    
            querySnap.forEach(async (document) => {
                await deleteDoc(doc(db, "userProfiles", userID, "friends", document.id));
                console.log(`${friendID} deleted`);
            });
    
            const querySnap2 = await getDocs(q2); 
            if(querySnap2.empty){ 
                console.log("No friend found to delete");
                return;
            }
    
            querySnap2.forEach(async (document) => {
                await deleteDoc(doc(db, "userProfiles", friendID, "friends", document.id));
                console.log(`${userID} deleted from friend's list`);
            });
    
        } catch (error) {
            console.error(error); // Use console.error for errors
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

                            <Pressable
                                className="bg-secondary rounded-lg h-5 items-center justify-center w-1/4"
                                onPress={() => {
                                    // Handle the decline action
                                    onDeleteFriendPress(item.friendID, item.fullName);
                                }}
                            >
                                <Text style={{ color: 'white' }}>Delete</Text>
                            </Pressable>

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