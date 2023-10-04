import React from "react";
import { View, Text, Image, StyleSheet, Pressable, SafeAreaView, TextInput, StatusBar, FlatList } from "react-native";
import { useState, useEffect } from 'react';
import { db, auth } from "../firebaseConfig";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";


export default function Search({ navigation }) {

    const [searchName, setSearchName] = useState("")
    const [users, setUsers] = useState([])
    const [filterUser, setFilterUsers] = useState([])


    async function loadUsers() {

        try {

        const loggedUser = auth.currentUser.uid

        const friendsFromDB = await getDocs(collection(db, "userProfiles",loggedUser, "friends" ))
        const listOfFriends = friendsFromDB.docs.map(doc => doc.data().userID);


        
        const usersSnapshot = await getDocs(
            collection(db, "userProfiles")
        );

        const filterUsers = usersSnapshot.docs
        .filter(doc => doc.id !== loggedUser)
        .map(doc => {
            
            const friend = listOfFriends.includes(doc.id)

            return {id:doc.id, friend, ...doc.data()}
            
        })

        // setUsers(usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        setUsers(filterUsers)
        console.log(filterUsers)

        }catch(error){

        }

    }

    async function addFriend(fromUserID, toUserID) {

        try {
            const requestRef = collection(db, `userProfiles/${toUserID}/friendRequests`);
            await addDoc(requestRef, {

                fromUserID,
                status: 'Pending',
                timeStamp: new Date(),
            });
            alert('Friend Request sent!')
        } catch (error) {

            alert('ERROR SENDING REQUEST', error)

        }

    }

    useEffect(() => {

        loadUsers();

    }, [])

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
                        <Text>Friend</Text>:
                        <Pressable onPress={() => addFriend(auth.currentUser.uid, item.id.toString())}>
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