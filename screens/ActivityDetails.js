import React from "react";
import { SafeAreaView, View, Image, Text, TouchableOpacity, StatusBar, StyleSheet, Modal, FlatList, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { db, auth } from "../firebaseConfig";
import { doc, updateDoc, arrayUnion, onSnapshot, getDocs, collection, arrayRemove } from "firebase/firestore";
import { Entypo } from "@expo/vector-icons";
import { Ionicons } from '@expo/vector-icons';


export default function ActivityDetails({ route, navigation }) {

    const { activity } = route.params
    const [pendingUsersCount, setPendingUsersCount] = useState(activity.pendingUsers ? activity.pendingUsers.length : 0)
    const [joinedUsersCount, setJoinedUsersCount] = useState(activity.joinedUsers ? activity.joinedUsers.length : 0)
    const [joinedUsers, setJoinedUsers] = useState([])
    const [pendingUsers, setPendingUsers] = useState([])
    const [isPendingUsers, setIsPendingUsers] = useState(false)
    const [isJoinedUser, setIsJoinedUser] = useState(false)
    const [joinedUserProfiles, setJoinedUserProfiles] = useState([])
    const [pendingUserProfiles, setPendingUserProfiles] = useState([])
    const [isEditUI, setIsEditUI] = useState(false)
    const [userName, setUserName] = useState('')

    const [prModalVisible, setPrModalVisible] = useState(false);
    const [adModalVisible, setAdModalVisible] = useState(false);

    const updatePendingUsers = async () => {
        setIsPendingUsers(true)
        // update data in firestore
        try {
            const eventsRef = doc(db, "events", activity.eventCollectionId, "sports", activity.docId)
            //   await updateDoc(userRef, user);

            // Atomically add a new region to the "regions" array field.
            await updateDoc(eventsRef, {
                pendingUsers: arrayUnion(auth.currentUser.uid)
            });
            alert("Your request is pending. \nEvent Admin will update the status");
        } catch (err) {
            console.log(err)
        }
    }

    const updateDbJoinedUsers = async (userId) => {
        setPrModalVisible(false)
        removeDbJoinedOrPendingUsers(userId)
        // update data in firestore
        try {
            const eventsRef = doc(db, "events", activity.eventCollectionId, "sports", activity.docId)
            //   await updateDoc(userRef, user);

            await updateDoc(eventsRef, {
                joinedUsers: arrayUnion(userId)
            });
        } catch (err) {
            console.log(err)
        }
    }

    const removeDbJoinedOrPendingUsers = async (userIdToRemove) => {
        setPrModalVisible(false)
        // update data in firestore
        try {
            const eventsRef = doc(db, "events", activity.eventCollectionId, "sports", activity.docId)
            //   await updateDoc(userRef, user);
            // Update the document
            updateDoc(eventsRef, {
                joinedUsers: arrayRemove(userIdToRemove),
                pendingUsers: arrayRemove(userIdToRemove)
            }).then(() => {
                console.log("Value removed from array");
            }).catch((error) => {
                console.error("Error removing value from array", error);
            });
            alert("Activity Updated");
        } catch (err) {
            console.log(err)
        }
    }

    const retrieveAllUsersDataFromDb = async () => {
        const joinedUsersArr = [];
        const pendingUsersArr = [];
        const querySnapshot = await getDocs(collection(db, "userProfiles"));
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            if (activity.eventCollectionId == doc.id) {
                setUserName(`${doc.data().firstName} ${doc.data().lastName}`)
            }

            if (joinedUsers.includes(doc.id)) {
                const userObj = {
                    imageUrl: doc.data().imageUrl,
                    userId: doc.id,
                    firstName: doc.data().firstName,
                    lastName: doc.data().lastName
                }
                joinedUsersArr.push(userObj);
            }

            if (pendingUsers.includes(doc.id)) {
                const userObj = {
                    imageUrl: doc.data().imageUrl,
                    userId: doc.id,
                    firstName: doc.data().firstName,
                    lastName: doc.data().lastName
                }
                pendingUsersArr.push(userObj);
            }

            if (joinedUsers.includes(auth.currentUser.uid)) {
                setIsJoinedUser(true)
            }
        });

        setJoinedUserProfiles(joinedUsersArr)
        setPendingUserProfiles(pendingUsersArr)
    }

    const realtimeDbListener = async () => {
        const eventsRef = doc(db, "events", activity.eventCollectionId, "sports", activity.docId);

        // Setting up the real-time listener
        const unsubscribe = onSnapshot(eventsRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                docSnapshot.data().joinedUsers ? setJoinedUsersCount(docSnapshot.data().joinedUsers.length) : setJoinedUsersCount(0)
                docSnapshot.data().pendingUsers ? setPendingUsersCount(docSnapshot.data().pendingUsers.length) : setPendingUsersCount(0)
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
        const joinedUsersArr = [];
        const pendingUsersArr = [];
        const querySnapshot = await getDocs(collection(db, "events", activity.eventCollectionId, "sports"));
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            if (doc.id == activity.docId) {
                setJoinedUsers(doc.data().joinedUsers)
                joinedUsersArr.push(doc.data().joinedUsers)
                pendingUsersArr.push(doc.data().pendingUsers)

                setPendingUsers(doc.data().pendingUsers)
            }
        });
        // setJoinedUsers(joinedUsersArr)
        // setPendingUsers(pendingUsersArr)
    }

    const onItemClickedToNavigate = (userId) => {
        setPrModalVisible(false)
        if (userId == auth.currentUser.uid) {
            navigation.navigate("Profile", {
                userID: userId,
            })
        } else {
            navigation.navigate("FriendProfile", {
                userID: userId,
            })
        }
    }

    const onPendingButtonClicked = () => {
        setPrModalVisible(true)
    }

    const onActivityDescriptionClicked = () => {
        setAdModalVisible(true)
    }

    const onEditButtonClicked = () => {
        setIsEditUI(true)
    }

    useEffect(() => {
        realtimeDbListener();  // This sets up the realtime listener
        retrieveSingleEventData();  // This fetches joined users
    }, []);

    useEffect(() => {
        if (pendingUsers.includes(auth.currentUser.uid)) {
            setIsPendingUsers(true)
        }

        retrieveAllUsersDataFromDb();  // Fetch images for joined users

        // if (joinedUsers.length > 0 || pendingUsers.length > 0) {  // Ensure that we have some joined users
        //     retrieveAllUsersDataFromDb();  // Fetch images for joined users
        // }
    }, [joinedUsers, pendingUsers]);  // Called whenever joinedUsers or pendingUsers changes

    const PendingRequestsModal = () => {
        return (
            <Modal
                visible={prModalVisible}
                animationType="slide"
                // presentationStyle="pageSheet"
                transparent={true}
            >
                <View className="flex-1 justify-end">
                    <View className="w-full h-4/5 bg-primary rounded-lg">
                        <View className="flex-row justify-between mt-3 align-center px-3 pt-2">
                            <Text className="font-urbanistBold text-3xl text-start">
                                Pending Requests
                            </Text>
                            <Ionicons
                                name="close"
                                size={35}
                                color="black"
                                onPress={() => setPrModalVisible(false)}
                            />
                        </View>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "rgba(0,0,0,0.5)",
                            }}
                        >
                            <View style={{ backgroundColor: "white", height: "100%" }}>
                                <FlatList
                                    data={pendingUserProfiles}
                                    renderItem={
                                        (rowData) => {
                                            return (
                                                <TouchableOpacity onPress={() => onItemClickedToNavigate(rowData.item.userId)}>
                                                    <View className="flex-row items-center mt-5 pl-3">
                                                        <Image
                                                            source={rowData.item.imageUrl ? { uri: rowData.item.imageUrl } : require("../assets/profile-icon.png")}
                                                            className="w-12 h-12 rounded-full" />
                                                        <Text className="font-urbanist text-1xl mr-3">
                                                            {rowData.item.firstName} {rowData.item.lastName}
                                                        </Text>
                                                        <TouchableOpacity onPress={() => updateDbJoinedUsers(rowData.item.userId)} className="bg-secondary rounded-lg h-8 w-20 mr-2 items-center justify-center">
                                                            <Text style={styles.joinButtonText}>Accept</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => removeDbJoinedOrPendingUsers(rowData.item.userId)} className="bg-secondary rounded-lg h-8 w-20 items-center justify-center">
                                                            <Text style={styles.joinButtonText}>Decline</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        }
                                    }
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const ActivityDescriptionModal = () => {
        return (
            <Modal
                visible={adModalVisible}
                animationType="slide"
                // presentationStyle="pageSheet"
                transparent={true}
            >
                <View className="flex-1 justify-end">
                    <View className="w-full h-4/5 bg-primary rounded-lg">
                        <View className="flex-row justify-between mt-3 align-center px-3 pt-2">
                            <Text className="font-urbanistBold text-3xl text-start">
                                Activity Description
                            </Text>
                            <Ionicons
                                name="close"
                                size={35}
                                color="black"
                                onPress={() => setAdModalVisible(false)}
                            />
                        </View>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                margin: 20
                            }}
                        >
                            <View style={{ backgroundColor: "white", height: "100%" }}>
                                <Text style={styles.description}>{activity.description}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const attendeesTopMargin = activity.isUserActivity ? 365 : 340

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <View className="flex-row justify-between items-center px-6 pb-5">
                <Pressable onPress={() => navigation.goBack()}>
                    <Entypo name="chevron-left" size={35} color="black" />
                </Pressable>
                <Text className="font-urbanistBold text-2xl">Activity Details</Text>
                {activity.isUserActivity ? (
                    isEditUI ? (
                        <TouchableOpacity onPress={() => setIsEditUI(false)}>
                            <Text>Close</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={onEditButtonClicked}>
                            <Text>Edit</Text>
                        </TouchableOpacity>
                    )
                ) : (
                    <TouchableOpacity onPress={() => removeDbJoinedOrPendingUsers(auth.currentUser.uid)}>
                        <Text>Leave</Text>
                    </TouchableOpacity>
                )}
            </View>
            {/* <ScrollView style={styles.scrollView}> */}
            <View style={styles.container}>
                <Image source={{ uri: activity.activityDetailsImage }} style={{ width: '100%', height: 160 }} />
                <View style={styles.eventDetails}>
                    <Text style={styles.title}>{activity.title}</Text>
                    <TouchableOpacity onPress={() => onItemClickedToNavigate(activity.eventCollectionId)} >
                        <Text style={styles.createdByText}>Created By: <Text style={styles.boldText}>{userName}</Text></Text>
                    </TouchableOpacity>
                    <View style={styles.userCount}>
                        <Text style={styles.grayText}>{activity.date} {activity.time}</Text>
                        <Text style={styles.grayText}>CAD {activity.price}</Text>
                    </View>
                    <View style={styles.userCount}>
                        <Text style={styles.grayText}>{joinedUsersCount ? joinedUsersCount : 0}/{activity.players} joined</Text>
                        {activity.isUserActivity && (
                            <Text style={styles.grayText}>{pendingUsersCount ? pendingUsersCount : 0} pending</Text>
                        )}
                    </View>
                    <TouchableOpacity onPress={onActivityDescriptionClicked}
                        style={styles.descriptionButton}>
                        <Text style={styles.joinButtonText}>See Description</Text>
                    </TouchableOpacity>


                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Venue</Text>
                        {/* Add venue details here */}
                        <Text style={styles.venueTitle}>{activity.venue}</Text>
                        <Text style={styles.grayText}>{activity.venueAddress}</Text>
                    </View>

                    {
                        !activity.isUserActivity && !isPendingUsers && !isJoinedUser && (
                            <TouchableOpacity onPress={updatePendingUsers} className="bg-secondary rounded-lg h-10 items-center justify-center">
                                <Text style={styles.joinButtonText}>Join</Text>
                            </TouchableOpacity>
                        )
                    }

                    {activity.isUserActivity && !isEditUI && (
                        <TouchableOpacity onPress={onPendingButtonClicked} className="bg-secondary rounded-lg h-10 items-center justify-center">
                            <Text style={styles.joinButtonText}>View Pending Requests</Text>
                        </TouchableOpacity>
                    )}

                    {activity.isUserActivity && isEditUI && (
                        <TouchableOpacity onPress={() => {
                            navigation.navigate('CreateActivity', {
                                activity: "ActivityDetails",
                                title: activity.title,
                                description: activity.description,
                                players: activity.players,
                                price: activity.price,
                                date: activity.date,
                                venue: activity.venue,
                                venueAddress: activity.venueAddress,
                                sportType: activity.sportType,
                                joinedUsers: joinedUsers,
                                pendingUsers: pendingUsers,
                                activityImage: activity.activityImage,
                                activityDetailsImage: activity.activityDetailsImage,
                                eventCollectionId: activity.eventCollectionId,
                                docId: activity.docId
                            })
                        }}
                            className="bg-secondary rounded-lg h-10 items-center justify-center">
                            <Text style={styles.joinButtonText}>Update Activity</Text>
                        </TouchableOpacity>
                    )}

                    {isPendingUsers && (
                        <View className="bg-secondary rounded-lg h-10 items-center justify-center">
                            <Text style={styles.joinButtonText}>Pending</Text>
                        </View>
                    )}

                    {isJoinedUser && (
                        <View className="bg-secondary rounded-lg h-10 items-center justify-center">
                            <Text style={styles.joinButtonText}>Joined</Text>
                        </View>
                    )}
                </View>
                <View style={[styles.attendees, { top: attendeesTopMargin }]}>
                    <Text style={styles.sectionTitle}>Who's going?</Text>
                    {isEditUI ? (
                        <View style={styles.imagesContainer}>
                            {joinedUserProfiles.map((image, index) => (
                                <TouchableOpacity key={index} onPress={() => removeDbJoinedOrPendingUsers(image.userId)}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="remove-circle" size={24} color="black" />
                                    </View>
                                    <Image
                                        key={index}
                                        source={image.imageUrl ? { uri: image.imageUrl } : require("../assets/profile-icon.png")}
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 60 / 2,
                                            borderWidth: 2,
                                        }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.imagesContainer}>
                            {joinedUserProfiles.map((image, index) => (
                                <TouchableOpacity key={index} onPress={() => onItemClickedToNavigate(image.userId)}>
                                    <Image
                                        key={index}
                                        source={image.imageUrl ? { uri: image.imageUrl } : require("../assets/profile-icon.png")}
                                        style={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 60 / 2,
                                            borderWidth: 2,
                                        }} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
                <PendingRequestsModal />
                <ActivityDescriptionModal />
                <StatusBar barStyle="dark-content" />
            </View>
            {/* </ScrollView> */}
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
        top: 140,
        left: 16,
        right: 16,
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        padding: 16,
    },
    userCount: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // You can adjust these as needed
        // padding: 10,
        width: '100%',
    },
    boldText: {
        fontWeight: 'bold',
        color: "#000000",
        fontSize: 16
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        alignSelf: "center"
    },    
    venueTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: "center"
    },
    description: {
        fontSize: 20,
    },
    createdByText: {
        color: 'gray',
        marginTop: 12
    },
    grayText: {
        color: 'gray',
        marginTop: 8,
        fontSize: 14
    },
    descriptionButton: {
        width: "40%",
        height: 30,
        borderRadius: 10,
        borderWidth: 2,
        backgroundColor: "#000000",
        justifyContent: "center",
        marginTop: 10
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
        padding: 10
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        alignSelf: "center"
    },
    attendees: {
        left: 16,
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
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
        borderWidth: 2,
        overflow: 'hidden', // Ensure the borderWidth does not exceed the dimensions of the image wrapper
    },
    iconContainer: {
        position: 'absolute', // Position the icons absolutely
        right: -8, // Align to the right edge of the image, adjust as necessary
        top: -7, // Align to the top edge of the image, adjust as necessary
        zIndex: 1, // Make sure the icon is layered above the image
    },
});