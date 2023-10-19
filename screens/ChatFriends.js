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

import { db, auth } from "../firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export default function ChatFriends({ navigation }) {
  //State Variables
  const [friends, setFriends] = useState([]);

  //Get Friends
  const getFriends = async () => {
    try {
      const friendsDb = collection(
        db,
        "userProfiles",
        auth.currentUser.uid,
        "friends"
      );
      const friendsData = await getDocs(friendsDb);
      const friendsArray = [];

      for (const friendDoc of friendsData.docs) {
        const friend = {
          id: friendDoc.id,
          ...friendDoc.data(),
        };
        const friendProfile = await getFriendProfile(friend.userID);
        //Validation
        if (friendProfile) {
          friend.friendProfile = friendProfile;
        }
        friendsArray.push(friend);
      }

      setFriends(friendsArray);
      console.log("Friends Array:", friendsArray);
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

  //Use Effect State
  useEffect(() => {
    getFriends();
  });

  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,

    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="bg-primary flex-1">
      <Text className="mt-8 font-urbanistBold text-2xl text-start pl-3 text-center">
        Chat List
      </Text>
      <FlatList
        data={friends}
        renderItem={(rowData) => {
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
                <Text className="font-urbanist text-1xl mr-3">{` ${rowData.item.friendProfile.firstName} ${rowData.item.friendProfile.lastName}`}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
