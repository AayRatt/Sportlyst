import {
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
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
import groupIcon from "../assets/group-icon.png";

import { db, auth } from "../firebaseConfig";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";

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
      );
      //Friends Listener
      const unsubscribeFriends = onSnapshot(friendsDb, async (snapshot) => {
        const friendsArray = [];

        const friendsPromises = snapshot.docs.map(async (friendDoc) => {
          const friend = {
            id: friendDoc.id,
            ...friendDoc.data(),
          };

          const friendProfile = await getFriendProfile(friend.userID);
          if (friendProfile) {
            friend.friendProfile = friendProfile;
          }
          friendsArray.push(friend);
        });
        //Promises (get all the data correctly)
        await Promise.all(friendsPromises);
        setFriends(friendsArray);
        console.log("Friends Array:", friendsArray);
      });
      return () => {
        unsubscribeFriends();
      };
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
      const chatGroupsDb = collection(db, "chatGroups");

      // ChatGroups Listener
      const unsubscribeChatGroups = onSnapshot(
        chatGroupsDb,
        async (snapshot) => {
          const groupPromises = snapshot.docs.map(async (groupDoc) => {
            const groupData = {
              id: groupDoc.id,
              ...groupDoc.data(),
            };
            // Returns either the group data or null if the user is not a member
            return groupData.members &&
              groupData.members.includes(auth.currentUser.uid)
              ? groupData
              : null;
          });

          // Resolve all promises and then filter out nulls
          const resolvedGroups = await Promise.all(groupPromises);
          const groupsArray = resolvedGroups.filter((group) => group !== null);

          setGroups(groupsArray);
          console.log("Groups Array:", groupsArray);
        }
      );

      return () => {
        unsubscribeChatGroups();
      };
    } catch (error) {
      console.log(error);
    }
  };

  //Use Effect State
  useEffect(() => {
    getFriends();
    getGroups();
  }, []);

  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,

    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  //Array Friends & Groups Data
  const arrayData = [
    ...friends,
    ...groups.map((group) => ({ isGroup: true, ...group })),
  ];
  console.log("arrayData aqui:", arrayData);
  return (
    <SafeAreaView className="bg-primary flex-1">
      {/* <View className="flex-row">
        <Text className="font-urbanistBold text-3xl text-start px-4 mt-5">
          Chats
        </Text>
      </View> */}
      <View className="flex-row justify-between align-baseline mt-5">
        <Text className="font-urbanistBold text-3xl text-start px-4">
          Chats
        </Text>
        <Pressable
          className="pr-5"
          onPress={() => {
            navigation.navigate("ChatGroup");
          }}
        >
          <MaterialIcons name="group-add" size={35} color="black" />
        </Pressable>
      </View>
      <FlatList
        data={arrayData}
        renderItem={(rowData) => {
          if (rowData.item.isGroup) {
            return (
              <View className="px-3">
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Chat", {
                      groupID: rowData.item.id,
                      groupName: rowData.item.groupName,
                      groupMembers: rowData.item.members,
                    })
                  }
                >
                  <View className="flex-row items-center mt-4 bg-gray rounded-lg p-2">
                    {/* <Image
                      source={groupIcon}
                      className="w-12 h-12 rounded-full"
                    /> */}
                    <View className="w-12 h-12 rounded-full pt-0.5 pl-0">
                      <MaterialIcons name="group" size={43} color="gray" />
                    </View>
                    <Text className="font-urbanist text-xl flex-1">
                      {rowData.item.groupName}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <View className="px-3">
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Chat", {
                    friendID: rowData.item.userID,
                    firstName: rowData.item.friendProfile.firstName,
                    lastName: rowData.item.friendProfile.lastName,
                  })
                }
              >
                <View className="flex-row items-center mt-4 bg-gray rounded-lg p-2">
                  <Image
                    source={
                      rowData.item.friendProfile?.image
                        ? { uri: rowData.item.friendProfile.image }
                        : profileIcon
                    }
                    className="w-12 h-12 rounded-full"
                  />
                  <Text className="font-urbanist text-xl flex-1">
                    {`${rowData.item.friendProfile.firstName} ${rowData.item.friendProfile.lastName}`}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
