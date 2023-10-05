import React from "react";
import { View, Text, Image, StyleSheet, Pressable, SafeAreaView, TextInput, StatusBar, FlatList } from "react-native";
import { useState, useEffect } from 'react';
import { db, auth } from "../firebaseConfig";
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot } from "firebase/firestore";


export default function Search({ navigation }) {

    const [searchName, setSearchName] = useState("")
    const [users, setUsers] = useState([])
    const [filterUser, setFilterUsers] = useState([])
    const [friendReqSent, setfriendReqSent] = useState([])
    const loggedUser = auth.currentUser.uid

    // async function loadUsers() {

    //     try {

    //         //Loading logged user's friend requests sent    
    //         const sentFriendRequestSnapshot = await getDocs(collection(db, "userProfiles", loggedUser, "sentFriendRequests"))

    //         const sentFriendRequests = sentFriendRequestSnapshot.docs.map(doc => doc.data().sentTo);

    //         //Load logged user's friends list 
    //         const friendsFromDB = await getDocs(collection(db, "userProfiles", loggedUser, "friends"))
    //         const listOfFriends = friendsFromDB.docs.map(doc => doc.data().userID);

    //         //Load all users in DB
    //         const usersSnapshot = await getDocs(
    //             collection(db, "userProfiles")
    //         );

    //         //Filtering users in DB 
    //         const filterUsers = usersSnapshot.docs
    //             .filter(doc => doc.id !== loggedUser) //Excluding Current User from list
    //             .map(doc => {

    //                 const friend = listOfFriends.includes(doc.id)
    //                 const requestSent = sentFriendRequests.includes(doc.id)

    //                 return {
    //                     id: doc.id,
    //                     friend,
    //                     requestSent,
    //                     ...doc.data()
    //                 }

    //             })

    //         setUsers(filterUsers)
    //         // console.log(filterUsers)

    //     } catch (error) {

    //     }

    // }

    async function loadUsers() {

        //Listener for any changes in the friend's subcollection
        const friendsListener = onSnapshot(collection(db, "userProfiles", loggedUser, "friends"), snapshot => {

            const listOfFriends = snapshot.docs.map(doc => doc.data().userID)

            //Listener for any changes in the friends request subcollection
            const friendRequestListener = onSnapshot(collection(db, "userProfiles", loggedUser, "sentFriendRequests"), async sentSnapshot => {

                try {
                    // const sentFriendRequests = sentSnapshot.docs.map(doc => doc.data().sentTo);

                    const sentFriendRequests = sentSnapshot.docs
                        .filter(doc => doc.data().status !== "Declined") // Filter out declined requests
                        .map(doc => doc.data().sentTo);


                    //Load all users in DB
                    const usersSnapshot = await getDocs(
                        collection(db, "userProfiles")
                    );

                    //Filtering users in DB 
                    const filterUsers = usersSnapshot.docs
                        .filter(doc => doc.id !== loggedUser) //Excluding Current User from list
                        .map(doc => {

                            const friend = listOfFriends.includes(doc.id)
                            const requestSent = sentFriendRequests.includes(doc.id)

                            return {
                                id: doc.id,
                                friend,
                                requestSent,
                                ...doc.data()
                            }

                        })

                    setUsers(filterUsers)
                } catch (error) {
                    console.error("Error in loadUsers function:", error);
                }
            })

            return friendRequestListener

        })

        return friendsListener


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

    useEffect(() => {
        const unsubscribe = loadUsers();

        // Cleanup listener on component unmount
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    useEffect(() => {
        const searchResults = users.filter(user => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
            return fullName.includes(searchName.toLowerCase().trim());
        });
        setFilterUsers(searchResults);
    }, [searchName, users]);




    return (
        <SafeAreaView className="bg-primary flex-1">
            <Text className="mt-8 font-urbanistBold text-2xl text-start pl-3 text-center">
                Search View
            </Text>

            <TextInput
                placeholder="Search Friends"
                value={searchName}
                onChangeText={setSearchName}
                style={styles.textInput}
            />
            <FlatList
                data={filterUser}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Text>{`${item.firstName} ${item.lastName}  `}</Text>
                        {item.friend ?
                            <Text>Friend</Text>
                            :
                            item.requestSent ?
                                <Text>Friend Request Sent</Text>
                                :
                                <Pressable onPress={() => addFriend(item.id.toString())}>
                                    <Text style={{ color: 'blue' }}>Add Friend</Text>
                                </Pressable>
                        }
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