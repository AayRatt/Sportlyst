import React from "react";
import { SafeAreaView, ScrollView, View, Image, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { db, auth } from "../firebaseConfig";
import { doc, updateDoc, arrayUnion, onSnapshot, getDocs, collection } from "firebase/firestore";
// import profileIcon from '../assets/profile-icon.png';

export default function ActivityDetails({ route }) {

    const { activity } = route.params
    const [joinedUsersCount, setJoinedUsersCount] = useState(activity.joinedUsers ? activity.joinedUsers.length : 0)
    const [joinedUsers, setJoinedUsers] = useState([])
    const [userImages, setUserImages] = useState([])

    const updateDb = async () => {
        // update data in firestore
        try {
            const eventsRef = doc(db, "events", activity.eventCollectionId, "sports", activity.docId)
            //   await updateDoc(userRef, user);

            // Atomically add a new region to the "regions" array field.
            await updateDoc(eventsRef, {
                joinedUsers: arrayUnion(auth.currentUser.uid)
            });
            alert("Profile Updated");
        } catch (err) {
            console.log(err)
        }
    }

    const retrieveAllUsersDataFromDb = async () => {
        console.log("retrieveAllUsersDataFromDb!!!!");
        const imagesArr = [];
        const querySnapshot = await getDocs(collection(db, "userProfiles"));
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            if (joinedUsers.includes(doc.id)) {
                console.log(doc.id, " => ");
                imagesArr.push(doc.data().imageUrl);
            }
        });
        imagesArr.map(
            (currCountry) => {
                console.log(`imagesArr => ${currCountry}`)
            }
        )
        setUserImages(imagesArr)
    }

    const realtimeDbListener = async () => {
        const eventsRef = doc(db, "events", activity.eventCollectionId, "sports", activity.docId);

        // Setting up the real-time listener
        const unsubscribe = onSnapshot(eventsRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                docSnapshot.data().joinedUsers ? setJoinedUsersCount(docSnapshot.data().joinedUsers.length) : setJoinedUsersCount(0)
            } else {
                console.log("No such document!");
            }
        });

        // Cleanup listener on component unmount
        return () => {
            unsubscribe()
        };
    }

    const retrieveSingleEventData = async () => {
        console.log("test!!!!");
        const querySnapshot = await getDocs(collection(db, "events", activity.eventCollectionId, "sports"));
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            if (doc.id == activity.docId) {
                console.log(doc.data().joinedUsers, " => ");
                setJoinedUsers(doc.data().joinedUsers)
            }
        });
    }

    useEffect(() => {
        realtimeDbListener();  // This sets up the realtime listener
        retrieveSingleEventData();  // This fetches joined users
    }, []);  // Called only once when component is mounted

    useEffect(() => {
        if (joinedUsers.length > 0) {  // Ensure that we have some joined users
            retrieveAllUsersDataFromDb();  // Fetch images for joined users
        }
    }, [joinedUsers]);  // Called whenever joinedUsers changes


    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.container}>
                    <Image source={require('../assets/football.jpg')} style={{ width: '100%', height: 160 }} />
                    <View style={styles.eventDetails}>
                        <Text style={styles.title}>{activity.title}</Text>
                        <Text style={styles.grayText}>{activity.date} {activity.time}</Text>
                        <Text style={styles.grayText}>CAD {activity.price}</Text>
                        <Text style={styles.grayText}>{joinedUsersCount ? joinedUsersCount : 0}/{activity.players} joined</Text>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Venue</Text>
                            {/* Add venue details here */}
                            <Text style={styles.title}>{activity.venue}</Text>
                            <Text style={styles.grayText}>{activity.venueAddress}</Text>
                        </View>

                        <TouchableOpacity onPress={updateDb} className="bg-secondary rounded-lg h-10 mt-2 items-center justify-center">
                            <Text style={styles.joinButtonText}>Join</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.attendees}>
                        <Text style={styles.sectionTitle}>Who's going?</Text>
                        <View style={styles.imagesContainer}>
                            {userImages.map((image, index) => (
                                <Image
                                    key={index}
                                    source={image ? { uri: image } : require("../assets/profile-icon.png")}
                                    style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 60 / 2,
                                        borderWidth: 2,
                                    }} />
                            ))}
                        </View>
                    </View>
                    <StatusBar barStyle="dark-content" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaView: {
        backgroundColor: 'yourPrimaryColor',  // Replace 'yourPrimaryColor' with the color corresponding to "bg-primary"
        flex: 1
    },
    scrollView: {
        backgroundColor: '#ffffff'
    },
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    eventDetails: {
        flex: 1,
        backgroundColor: '#ffffff',
        position: 'absolute',
        top: 128,
        left: 16,
        right: 16,
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    grayText: {
        color: 'gray',
        marginTop: 8
    },
    joinButton: {
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: 'red',
        padding: 8,
        borderRadius: 8
    },
    joinButtonText: {
        textAlign: 'center',
        color: '#ffffff',
        fontWeight: 'bold'
    },
    section: {
        padding: 16
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8
    },
    attendees: {
        top: 290,
        left: 16,
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        // flexDirection: "row"
    },
    imagesContainer: {
        flex: 1,
        gap: 5,
        flexDirection: "row"
    },
    circle: {
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        borderWidth: 3,
    }
});