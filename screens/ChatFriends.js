import { Text, View, FlatList, Image, TouchableOpacity } from "react-native";
import {
  useFonts,
  Urbanist_600SemiBold,
  Urbanist_500Medium,
} from "@expo-google-fonts/urbanist";
import {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import profileIcon from "../assets/profile-icon.png";
import groupIcon from "../assets/group-icon.png"

import { db, auth } from "../firebaseConfig";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";

export default function ChatFriends({ navigation }) {
  //State Variables
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);

  //Get Friends
  const getFriends = () => {
    try {
      const friendsDb = collection(
        db,
        "userProfiles",
        auth.currentUser.uid,
        "friends"
      )
      //Friends Listener 
      const unsubscribeFriends = onSnapshot(friendsDb, async snapshot => {
        const friendsArray = [];
        
        const friendsPromises = snapshot.docs.map(async friendDoc => {
          const friend = {
            id: friendDoc.id,
            ...friendDoc.data()
          }

          const friendProfile = await getFriendProfile(friend.userID)
          if (friendProfile) {
            friend.friendProfile = friendProfile
          }
          friendsArray.push(friend)
        })
        //Promises (get all the data correctly)
        await Promise.all(friendsPromises)
        setFriends(friendsArray)
        console.log("Friends Array:", friendsArray);
      })
      return () => {
        unsubscribeFriends()
      }

    } catch (error) {
      console.log(error);
    }
  };

  //Get Friends Data
  const getFriendProfile = async (friendID) => {
    const friendDoc = await getDoc(doc(db, "userProfiles", friendID));
    if (friendDoc.exists()) {
      return friendDoc.data();
    }
    return null;
  };


  //Get Group Friends
  const getGroups = () => {
    try {
      const chatGroupsDb = collection(db, "chatGroups")
  
      // ChatGroups Listener
      const unsubscribeChatGroups = onSnapshot(chatGroupsDb, async snapshot => {
        const groupsArray = []
        const groupPromises = snapshot.docs.map(async groupDoc => {
          const group = {
            id: groupDoc.id,
            ...groupDoc.data()
          }
          // Verify the user belongs to a group
          if (group.members && group.members.includes(auth.currentUser.uid)) {
            groupsArray.push(group)
          }
        })
  
        // Promise to get all the data completed
        await Promise.all(groupPromises);
        setGroups(groupsArray)
        console.log("Groups Array:", groupsArray)
      })
  
      return () => {
        unsubscribeChatGroups()
      }
    } catch (error) {
      console.log(error)
    }
  };
  

  //Use Effect State
  useEffect(() => {
    getFriends()
    getGroups()
  }, []);

  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,

    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  //Array Friends & Groups Data
  const arrayData = [...friends, ...groups.map(group => ({ isGroup: true, ...group }))]

  return (
    <SafeAreaView className="bg-primary flex-1">
      <Text className="mt-8 font-urbanistBold text-2xl text-start pl-3 text-center">
        Chat List
      </Text>
      <FlatList
        data={arrayData}
        renderItem={(rowData) => {
          if (rowData.item.isGroup) {
            return (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Chat", {
                    groupID: rowData.item.id,
                    groupName: rowData.item.groupName,
                    groupMembers: rowData.item.members
                  })
                }
              >
                <View className="flex-row items-center mt-5 pl-3">
                  <Image
                    source={groupIcon}
                    className="w-12 h-12 rounded-full"
                  />
                  <Text className="font-urbanist text-1xl mr-3">
                    {rowData.item.groupName}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }
  
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Chat", {
                  friendID: rowData.item.userID,
                  firstName: rowData.item.friendProfile.firstName,
                  lastName: rowData.item.friendProfile.lastName,
                })
              }
            >
              <View className="flex-row items-center mt-5 pl-3">
                <Image
                  source={
                    rowData.item.friendProfile?.image
                      ? { uri: rowData.item.friendProfile.image }
                      : profileIcon
                  }
                  className="w-12 h-12 rounded-full"
                />
                <Text className="font-urbanist text-1xl mr-3">
                  {`${rowData.item.friendProfile.firstName} ${rowData.item.friendProfile.lastName}`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
  
}


