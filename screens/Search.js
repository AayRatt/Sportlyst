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
} from "react-native";
import { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { Entypo } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import profileIcon from "../assets/profile-icon.png";
import { useFonts, Urbanist_600SemiBold } from "@expo-google-fonts/urbanist";

export default function Search({ navigation }) {
  const [searchName, setSearchName] = useState("");
  const [users, setUsers] = useState([]);
  const [filterUser, setFilterUsers] = useState([]);
  const [friendReqSent, setfriendReqSent] = useState([]);
  const loggedUser = auth.currentUser.uid;

  // async function loadUsers() {

  //     //Listener for any changes in the friend's subcollection
  //     const friendsListener = onSnapshot(collection(db, "userProfiles", loggedUser, "friends"), snapshot => {

  //         const listOfFriends = snapshot.docs.map(doc => doc.data().userID)

  //         //Listener for any changes in the friends request subcollection
  //         const friendRequestListener = onSnapshot(collection(db, "userProfiles", loggedUser, "sentFriendRequests"), async sentSnapshot => {

  //             try {
  //                 // const sentFriendRequests = sentSnapshot.docs.map(doc => doc.data().sentTo);

  //                 const sentFriendRequests = sentSnapshot.docs
  //                     .filter(doc => doc.data().status !== "Declined" && doc.data().status !== "Accepted" && doc.data().status !== "Deleted") // Filter out declined requests
  //                     .map(doc => doc.data().sentTo);

  //                 //Load all users in DB
  //                 const usersSnapshot = await getDocs(
  //                     collection(db, "userProfiles")
  //                 );

  //                 //Filtering users in DB
  //                 const filterUsers = usersSnapshot.docs
  //                     .filter(doc => doc.id !== loggedUser) //Excluding Current User from list
  //                     .map(doc => {

  //                         const friend = listOfFriends.includes(doc.id)
  //                         const requestSent = sentFriendRequests.includes(doc.id)

  //                         return {
  //                             id: doc.id,
  //                             friend,
  //                             requestSent,
  //                             ...doc.data()
  //                         }

  //                     })

  //                 setUsers(filterUsers)
  //             } catch (error) {
  //                 console.error("Error in loadUsers function:", error);
  //             }
  //         })

  //         return friendRequestListener

  //     })

  //     return friendsListener

  // }

  async function loadUsers() {
    //Listener for any changes in the friend's subcollection
    const friendsListener = onSnapshot(
      collection(db, "userProfiles", loggedUser, "friends"),
      (snapshot) => {
        const listOfFriends = snapshot.docs.map((doc) => doc.data().userID);

        const receivedFriendRequestsListener = onSnapshot(
          collection(db, "userProfiles", loggedUser, "friendRequests"),
          async (receivedSnapshot) => {
            const receivedFriendRequests = receivedSnapshot.docs
              .filter((doc) => doc.data().status === "Pending")
              .map((doc) => doc.data().receivedFrom);

            // Listener for any changes in the sent friend requests sub-collection
            const sentFriendRequestsListener = onSnapshot(
              collection(db, "userProfiles", loggedUser, "sentFriendRequests"),
              async (sentSnapshot) => {
                const sentFriendRequests = sentSnapshot.docs
                  .filter(
                    (doc) =>
                      doc.data().status !== "Declined" &&
                      doc.data().status !== "Accepted" &&
                      doc.data().status !== "Deleted"
                  )
                  .map((doc) => doc.data().sentTo);

                // Load all users in DB
                const usersSnapshot = await getDocs(
                  collection(db, "userProfiles")
                );

                const filterUsers = usersSnapshot.docs
                  .filter((doc) => doc.id !== loggedUser)
                  .map((doc) => {
                    const friend = listOfFriends.includes(doc.id);
                    const requestSent = sentFriendRequests.includes(doc.id);
                    const requestReceived = receivedFriendRequests.includes(
                      doc.id
                    );

                    return {
                      id: doc.id,
                      friend,
                      requestSent,
                      requestReceived,
                      ...doc.data(),
                    };
                  });

                setUsers(filterUsers);
              }
            );
            return sentFriendRequestsListener;
          }
        );
        return receivedFriendRequestsListener;
      }
    );

    return friendsListener;
  }

  async function addFriend(toUserID) {
    try {
      //Add friend request sent to logged user
      const requestSentRef = collection(
        db,
        `userProfiles/${loggedUser}/sentFriendRequests`
      );
      await addDoc(requestSentRef, {
        sentTo: toUserID,
        status: "Pending",
        timeStamp: new Date(),
      });

      //Add friend request to target user
      const friendRequestRef = collection(
        db,
        `userProfiles/${toUserID}/friendRequests`
      );
      await addDoc(friendRequestRef, {
        receivedFrom: loggedUser,
        status: "Pending",
        timeStamp: new Date(),
      });
      alert("Friend Request sent!");
      //loadUsers()
    } catch (error) {
      alert("ERROR SENDING REQUEST", error);
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
    const searchResults = users.filter((user) => {
      const fullName = `${user.firstName || ""} ${
        user.lastName || ""
      }`.toLowerCase();
      return fullName.includes(searchName.toLowerCase().trim());
    });
    setFilterUsers(searchResults);
  }, [searchName, users]);

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="bg-white pl-3 pr-3">
        <Pressable
          className="flex-row mt-5 align-baseline"
          onPress={() => navigation.goBack()}
        >
          <Entypo name="chevron-left" size={35} color="black" />
          <Text className="font-urbanistBold text-3xl text-start">Search</Text>
        </Pressable>
        <TextInput
          className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-5 font-urbanist mt-5"
          placeholder="Search Friends"
          value={searchName}
          onChangeText={setSearchName}
          style={styles.textInput}
        />
        <FlatList
          data={filterUser}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="flex-row items-center mt-5 pl-3">
              {/* User profile picture */}
              <Pressable
                onPress={
                  () =>
                    navigation.navigate("SearchFriendProfile", {
                      userID: item.id,
                      friend: item.friend,
                      requestSent: item.requestSent,
                    })
                  //console.log(item.id)
                }
              >
                <Image
                  source={item.image ? { uri: item.image } : profileIcon}
                  className="w-12 h-12 rounded-full mr-3"
                />
              </Pressable>

              <Pressable>
                <Text className="font-urbanist text-lg mr-3">{`${item.firstName} ${item.lastName}`}</Text>
              </Pressable>

              {item.friend ? (
                <Text className="font-urbanist text-lg bg-gray-500 text-white">
                  Friend
                </Text>
              ) : item.requestSent ? (
                <Text className="font-urbanist text-lg bg-gray-500 text-white">
                  Request Sent
                </Text>
              ) : item.requestReceived ? (
                <Pressable onPress={() => navigation.navigate("Friends")}>
                  <Text className="font-urbanist text-base bg-gray-500 text-white">
                    Pending Approval
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  className="bg-secondary rounded-lg h-8 items-center justify-center w-1/4"
                  onPress={() => addFriend(item.id.toString())}
                >
                  <Text className="text-sm font-urbanistBold text-primary">
                    Add Friend
                  </Text>
                </Pressable>
              )}
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
