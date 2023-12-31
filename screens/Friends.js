import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  SafeAreaView,
  TextInput,
  StatusBar,
  FlatList,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import profileIcon from "../assets/profile-icon.png";
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";
import { FontAwesome } from "@expo/vector-icons";

export default function Friends({ navigation }) {
  const [pendingRequests, setpendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const userID = auth.currentUser.uid;

  function loadFriendRequests() {
    const friendRequestRef = collection(
      db,
      "userProfiles",
      userID,
      "friendRequests"
    );
    const q = query(friendRequestRef, where("status", "==", "Pending"));

    // This will be the unsubscribe function.
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const userData = [];

      for (const docSnapshot of snapshot.docs) {
        try {
          const docRef = doc(
            db,
            "userProfiles",
            docSnapshot.data().receivedFrom
          );
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
    console.log(requestID);
    console.log(friendID);
    console.log(auth.currentUser.uid);

    try {
      const requestRef = doc(
        db,
        "userProfiles",
        userID,
        "friendRequests",
        requestID
      );
      const acceptRef = collection(db, "userProfiles", userID, "friends");
      const friendRequestUserRef = collection(
        db,
        "userProfiles",
        friendID,
        "friends"
      );

      await updateDoc(requestRef, {
        status: "Accepted",
      });

      await addDoc(acceptRef, {
        userID: friendID,
        timeStamp: new Date(),
      });

      await addDoc(friendRequestUserRef, {
        userID: userID,
        timeStamp: new Date(),
      });

      console.log("User accepted");

      const requestRefofUser = collection(
        db,
        "userProfiles",
        friendID,
        "sentFriendRequests"
      );
      const q = query(requestRefofUser, where("sentTo", "==", userID));

      const snapShot = await getDocs(q);

      if (snapShot.empty) {
        console.log("No user to be found");
        return;
      }

      snapShot.forEach(async (document) => {
        const docRef = doc(
          db,
          "userProfiles",
          friendID,
          "sentFriendRequests",
          document.id
        );

        const status = {
          status: "Accepted",
        };

        await updateDoc(docRef, status);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function decline(requestID, friendID) {
    try {
      const friendRequestRef = doc(
        db,
        "userProfiles",
        userID,
        "friendRequests",
        requestID
      );
      await updateDoc(friendRequestRef, {
        status: "Declined",
      });
      console.log("Friend request reference updated successfully.");

      const sentFriendRequestsCollection = collection(
        db,
        "userProfiles",
        friendID,
        "sentFriendRequests"
      );
      const q = query(
        sentFriendRequestsCollection,
        where("sentTo", "==", userID)
      );
      const snapShot = await getDocs(q);

      console.log("Query executed successfully.");

      if (!snapShot.empty) {
        const requestDoc = snapShot.docs[0];
        await updateDoc(requestDoc.ref, {
          status: "Declined",
        });
        console.log(
          "Friend request in sender's collection updated successfully."
        );
      } else {
        console.log("No document found in sender's collection.");
      }
    } catch (error) {
      console.error("Error in decline function:", error);
    }
  }

  async function onDeleteFriendPress(friendID, friendName) {
    Alert.alert(
      "Delete Friend",
      `Are you sure you want to delete ${friendName}?`,
      [
        {
          text: "Cancel",
          onPress: () => {
            console.log("Delete Cancelled");
          },
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deleteFriend(friendID),
        },
      ],
      { cancelable: false }
    );
  }

  async function deleteFriend(friendID) {
    //Reference to logged user's friend list and query to get the single user to delete
    const friendListRef = collection(db, "userProfiles", userID, "friends");
    const q = query(friendListRef, where("userID", "==", friendID));

    //Reference to friend to delete's friendlist where ID is equal to the logged user
    const friendToDeleteRef = collection(
      db,
      "userProfiles",
      friendID,
      "friends"
    );
    const q2 = query(friendToDeleteRef, where("userID", "==", userID));

    //Reference to logged user's sentFriendRequests list and query to get doc
    const sentFriendRequestRef = collection(
      db,
      "userProfiles",
      userID,
      "sentFriendRequests"
    );
    const q3 = query(sentFriendRequestRef, where("sentTo", "==", friendID));

    //Reference to logged user's friendRequests list and query to get doc
    const friendRequests = collection(
      db,
      "userProfiles",
      userID,
      "friendRequests"
    );
    const q4 = query(friendRequests, where("receivedFrom", "==", friendID));

    //Reference to friend to delete's sentFriendRequest
    const sentFriendRequestFromFriend = collection(
      db,
      "userProfiles",
      friendID,
      "sentFriendRequests"
    );
    const q5 = query(
      sentFriendRequestFromFriend,
      where("sentTo", "==", userID)
    );

    //Reference to friend to delete's received friend Requests
    const friendRequestsFromFriend = collection(
      db,
      "userProfiles",
      friendID,
      "friendRequests"
    );
    const q6 = query(
      friendRequestsFromFriend,
      where("receivedFrom", "==", userID)
    );

    try {
      //Getting doc with q query
      const querySnap = await getDocs(q);
      if (querySnap.empty) {
        console.log("No friend found to delete");
        return;
      }
      //delete friend from current user's friendlist
      querySnap.forEach(async (document) => {
        await deleteDoc(
          doc(db, "userProfiles", userID, "friends", document.id)
        );
        console.log(`${friendID} deleted`);
      });
      //getting doc from query2
      const querySnap2 = await getDocs(q2);
      if (querySnap2.empty) {
        console.log("No friend found to delete");
        return;
      }
      //Deleting logged user from deleted user's friend list
      querySnap2.forEach(async (document) => {
        await deleteDoc(
          doc(db, "userProfiles", friendID, "friends", document.id)
        );
        console.log(`${userID} deleted from friend's list`);
      });

      //
      const querySnap3 = await getDocs(q3);
      const querySnap5 = await getDocs(q5);

      if (querySnap3.empty) {
        console.log(
          "Logged user sent friend's Requests does not contain user to delete"
        );

        querySnap5.forEach(async (document) => {
          if (document.data().status === "Accepted") {
            await updateDoc(
              doc(
                db,
                "userProfiles",
                friendID,
                "sentFriendRequests",
                document.id
              ),
              {
                status: "Deleted",
              }
            );

            console.log(
              `Logged User was deleted from delete user's sentRequest list`
            );
          }
        });

        const querySnap4 = await getDocs(q4);

        querySnap4.forEach(async (document) => {
          if (document.data().status === "Accepted") {
            await updateDoc(
              doc(db, "userProfiles", userID, "friendRequests", document.id),
              {
                status: "Deleted",
              }
            );

            console.log(
              `Deleted User's friend request updated in logged user's friendRequests`
            );
          }
        });
      } else {
        querySnap3.forEach(async (document) => {
          if (document.data().status === "Accepted") {
            // await deleteDoc(doc(db,"userProfiles",userID,"sentFriendRequests",document.id))

            await updateDoc(
              doc(
                db,
                "userProfiles",
                userID,
                "sentFriendRequests",
                document.id
              ),
              {
                status: "Deleted",
              }
            );
            console.log(
              `Updated user with id${friendID} from the logged user's sentFriend Requests set to Deleted`
            );
          }
        });

        const querySnap6 = await getDocs(q6);

        querySnap6.forEach(async (document) => {
          if (document.data().status === "Accepted") {
            //await deleteDoc(doc(db,"userProfiles",friendID,"friendRequests",document.id))
            await updateDoc(
              doc(db, "userProfiles", friendID, "friendRequests", document.id),
              {
                status: "Deleted",
              }
            );
            console.log(
              `Updated logged user FriendRequest from delete user's friendRequests`
            );
          }
        });
      }
    } catch (error) {
      console.error(error); // Use console.error for errors
    }
  }

  useEffect(() => {
    const unsubscribe = loadFriendRequests();
    console.log("unsubscribe:", unsubscribe, typeof unsubscribe);
    const unsubscribe2 = loadFriends();
    console.log("unsubscribe2:", unsubscribe2, typeof unsubscribe2);

    // Cleanup listener on component unmount
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
      if (typeof unsubscribe2 === "function") {
        unsubscribe2();
      }
    };
  }, []);

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="bg-white px-3">
        <View className="flex-row justify-between align-baseline mt-5">
          <Text className="font-urbanistBold text-3xl text-start pl-1">
            Friend Requests
          </Text>
          <Pressable
            className="pr-3"
            onPress={() => navigation.navigate("Search")}
          >
            <FontAwesome name="search" size={27} color="black" />
          </Pressable>
        </View>
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
                      <Text style={{ color: "white" }}>Accept</Text>
                    </Pressable>

                    <Pressable
                      className="bg-secondary rounded-lg h-5 items-center justify-center w-1/4"
                      onPress={() => {
                        // Handle the decline action
                        decline(item.requestID, item.friendID);
                      }}
                    >
                      <Text style={{ color: "white" }}>Decline</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          />
        ) : (
          <View className="flex-row items-center mt-5 pl-3 justify-center">
            <Text>No pending requests</Text>
          </View>
        )}
        <Text className="mt-8 font-urbanistBold text-2xl text-start pl-3 text-center">
          Friends List
        </Text>

        <FlatList
          data={friends}
          keyExtractor={(item) => item.friendID}
          renderItem={({ item }) => (
            <View className="flex-row items-center mt-4 bg-gray rounded-lg p-2 justify-between">
              {/* User profile picture */}
              <View className="flex-row items-center">
                <Pressable
                  onPress={
                    () =>
                      navigation.navigate("FriendProfile", {
                        userID: item.friendID,
                      })
                    //console.log(item.id)
                  }
                >
                  <Image
                    source={item.image ? { uri: item.image } : profileIcon}
                    className="w-12 h-12 rounded-full"
                  />
                </Pressable>

                <Text className="font-urbanist text-xl mr-3">{`${item.fullName}`}</Text>
              </View>

              <Pressable
                onPress={() => {
                  // Handle the decline action
                  onDeleteFriendPress(item.friendID, item.fullName);
                }}
                className="pr-3"
              >
                <FontAwesome name="trash-o" size={26} color="black" />
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
    marginBottom: 10,
  },
});
