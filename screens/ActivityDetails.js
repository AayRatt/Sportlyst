import React from "react";
import { SafeAreaView, ScrollView, View, Image, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { db, auth, firebaseStorage } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";
import profileIcon from '../assets/profile-icon.png';
import { AntDesign } from '@expo/vector-icons';

export default function Profile({ navigation }) {

    const [image, setImage] = useState(null)
    const [uploading, setUploading] = useState(false)
    const addImage = () => { }

    const onLogoutClicked = async () => {
        try {
            if (auth.currentUser === null) {
                alert("logoutPressed: There is no user to logout!");
            } else {
                await signOut(auth);
                alert("User LogOut");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        country: "",
        postalCode: "",
        imageUrl: "",
    })

    // Function to update form fields
    const updateUser = (key, updatedValue) => {
        const temp = { ...user };
        temp[key] = updatedValue;
        setUser(temp);
    };

    const retrieveFromDb = async () => {
        const docRef = doc(db, "userProfiles", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        console.log(`docSnap ${JSON.stringify(docSnap)}`);


        if (docSnap.exists()) {
            setUser(docSnap.data())
        } else {
            console.log("No such document!");
        }
    }

    const updateDb = async () => {
        // update data in firestore
        try {
            const userRef = doc(db, "userProfiles", auth.currentUser.uid);

            await updateDoc(bookingRef, {
                bookingStatus: isEnabled ? 'Confirmed' : 'Declined',
                bookingCode: isEnabled ? bookingId : '',
            });
        } catch (err) {
            console.log(err)
        }
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });
        const source = { uri: result.assets[0].uri }
        console.log('source is: ${source}')
        setImage(source)
    };

    const uploadImage = async () => {
        setUploading(true);

        const response = await fetch(image.uri);
        const blob = await response.blob();

        const filename = auth.currentUser.uid;
        console.log(`filename is ${filename}`);
        const storageRef = ref(firebaseStorage, filename);

        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on('state_changed',
            (snapshot) => {
                // Progress function...
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                // Error function...
                console.log(error);
            },
            () => {
                // Complete function...
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);

                    // Store the downloadURL in Firestore under the user's profile
                    const userDocRef = doc(db, "userProfiles", auth.currentUser.uid);
                    updateDoc(userDocRef, {
                        imageUrl: downloadURL
                    });

                });
            }
        );
    };

    useEffect(() => {
        retrieveFromDb()
    }, [])

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.container}>
                    <Image source={require('../assets/football.jpg')} style={{ width: '100%', height: 160 }} />

                    <View style={styles.eventDetails}>
                        <Text style={styles.title}>5v5 Indoor Football</Text>
                        <Text style={styles.grayText}>Event Location</Text>
                        <Text style={styles.grayText}>27 October, 6:00 PM</Text>
                        <Text style={styles.grayText}>INR 400</Text>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Venue</Text>
                            {/* Add venue details here */}
                            <Text style={styles.title}>Toronto Soccerplex</Text>
                            <Text style={styles.grayText}>101 Railside Rd, North York, ON M3A 1B2</Text>
                        </View>

                        <TouchableOpacity style={styles.joinButton}>
                            <Text style={styles.joinButtonText}>Join</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.attendees}>
                        <Text style={styles.sectionTitle}>Who's going?</Text>
                        {/* Add attendees icons and names here */}
                        <View style={styles.circle}>
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
    circle: {
        width: 60,
        height: 60,
        borderRadius: 60/2,
        borderWidth: 3,
     }
});