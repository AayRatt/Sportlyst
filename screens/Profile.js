import React from "react";
import { View, Text, Button, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { useState, useEffect } from 'react';

import { db, auth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function Profile({ navigation }) {
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
    email: ""
  })

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

  useEffect(() => {
    retrieveFromDb()
  }, [])


  return (
    // <View className="flex-1 justify-center items-center">
    //   <Text>Profile</Text>
    //   <Button title="Log Out" onPress={logOutClick}></Button>
    // </View>

    <SafeAreaView style={styles.container}>

    <View style={styles.innerContainer}>
      {/* view 2 */}
      <View style={styles.view2}>
        {/* view 3 */}
        <View style={styles.view3}>
          {/* <Image
            source={user.image ? { uri: user.image } : defaultPerson} style={styles.image}
          /> */}
          <Text style={{ fontSize: 36, fontWeight: "bold", alignContent: 'center', alignItems: 'center' }}>{user.firstName}</Text>
          <Text style={{ fontSize: 22, alignContent: 'center' }}>{user.email}</Text>
        </View>
      </View>

      <View style={{
        alignItems: 'center'
      }}>
        <Pressable style={styles.btn}>
          <Text style={styles.btnLabel} onPress={onLogoutClicked}>Logout</Text>
        </Pressable>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  innerContainer: {
    padding: 5,
    flex: 1,
  },
  view2: {
    height: "50%",
    marginBottom: -35
  },
  view3: {
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    marginTop: 5,
    borderRadius: 75,
    marginBottom: 10
  },
  btn: {
    borderWidth: 1,
    borderColor: "#141D21",
    backgroundColor: "#333434",
    borderRadius: 8,
    paddingVertical: 16,
    marginVertical: 10,
    width: "60%"
  },
  btnLabel: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center"
  },
});