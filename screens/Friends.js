import React from "react";
import { View, Text, Image, StyleSheet, Pressable, SafeAreaView, TextInput, StatusBar, FlatList } from "react-native";
import { useState, useEffect } from 'react';
import { db, auth } from "../firebaseConfig";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from "firebase/firestore";


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
                    const docRef = doc(db, "userProfiles", docSnapshot.data().fromUserID);
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
                        friendData.push({friendID, fullName, email });
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


            await updateDoc(requestRef, {
                status: "Accepted"
            })

            await addDoc(acceptRef, {

                userID: friendID,
                timeStamp: new Date()

            })

            console.log('User accepted')

        } catch (error) {

            console.log(error)
        }

    }

    async function decline(requestID) {

        try {
            const docRef = doc(db, "userProfiles", auth.currentUser.uid, "friendRequests", requestID);

            await updateDoc(docRef, {
                status: "Declined"
            })

            console.log('User declined')

        } catch (error) {

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
            <Text className="mt-8 font-urbanistBold text-2xl text-start pl-3 text-center">
                Friend Requests
            </Text>
            <FlatList
                data={pendingRequests}
                keyExtractor={(item) => item.userID}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                        <Text>{`${item.fullName}`}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Pressable
                                style={{ padding: 10, backgroundColor: 'green', marginRight: 10 }}
                                onPress={() => {
                                    // Handle the accept action
                                    accept(item.requestID, item.friendID)
                                    //console.log(`Accepted request from ${item.fullName}`);
                                }}
                            >
                                <Text style={{ color: 'white' }}>Accept</Text>
                            </Pressable>
                            <Pressable
                                style={{ padding: 10, backgroundColor: 'red' }}
                                onPress={() => {

                                    // Handle the decline action
                                    decline(item.requestID)
                                    //console.log(`Declined request from ${item.fullName}`);
                                }}
                            >
                                <Text style={{ color: 'white' }}>Decline</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            />


            <Text className="mt-8 font-urbanistBold text-2xl text-start pl-3 text-center">
                Friends
            </Text>

            <FlatList
                data={friends}
                keyExtractor={(item) => item.userID}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
                        <Text>{`${item.fullName}`}</Text>
                    </View>
                )}
            />

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