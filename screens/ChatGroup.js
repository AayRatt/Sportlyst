import { Text, View, FlatList, Image, TouchableOpacity, Dimensions, StyleSheet, TextInput } from "react-native";
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
import { Ionicons } from "@expo/vector-icons";

import { db, auth } from "../firebaseConfig";
import { addDoc, collection, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

export default function ChatGroup({ navigation }) {

  //State Variables
  const [friendsGroup, setFriendsGroup] = useState([])
  const [selectedFriends, setSelectedFriends] = useState([])
  const [groupName, setGroupName] = useState('')

  //Dimensions Floating Button
  const { width, height } = Dimensions.get("window")

  //Get Friends ID from FireStore
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
        setFriendsGroup(friendsArray)
        console.log("Friends Array for Group Chat Creation:", friendsArray);
      })
      return () => {
        unsubscribeFriends()
      }

    } catch (error) {
      console.log(error);
    }
  };

  //Get Friends Data from FireStore
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
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: 'New Group'
    })
  }, []);

  //Selection's Friend 
  const handleSelectFriend = (id) => {
    if (selectedFriends.includes(id)) {
      const newSelectedFriends = selectedFriends.filter(friendId => friendId !== id)
      setSelectedFriends(newSelectedFriends)
      console.log("Friend Unselected", newSelectedFriends)
    } else {
      const newSelectedFriends = [...selectedFriends, id]
      setSelectedFriends(newSelectedFriends)
      console.log("Friend Selected", newSelectedFriends)
    }
  }

  //Add ChatGroup Data to FireStore
  const addChatGroup = async () => {
    //Requirements
    if (groupName === '') {
      alert("Please enter your group name")
      return
    }
    if (selectedFriends.length < 1) {
      alert("At least two members are neccesary to create the Group")
      return
    }

    try {
      const membersUserIDs = selectedFriends.map(friendId => {
        const friend = friendsGroup.find(f => f.id === friendId);
        return friend.userID;
      })

      //Adding the current userID to the group members
      membersUserIDs.push(auth.currentUser.uid);

      const createGroup = await addDoc(collection(db, "chatGroups"), {
        createdAt: new Date(),
        groupName: groupName,
        members: membersUserIDs
      })

      await updateDoc(doc(db, "chatGroups", createGroup.id), {
        groupID: createGroup.id
      })

    } catch (error) {
      console.log('Problem to create the group', error);
    }
  }

  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,

    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="bg-white pl-3 pr-3">
        {/* <Text className="font-urbanist text-2xl text-start pl-3 mb-3">
          GroupNew
        </Text> */}
        <TextInput
          className="bg-gray h-12 rounded-lg p-4 mb-4 font-urbanist"
          placeholder="Enter your Group's Name"
          placeholderTextColor={"#666"}
          autoCapitalize="none"
          value={groupName}
          onChangeText={setGroupName}
        ></TextInput>
        <Text className="font-urbanist text-2xl text-start pl-3"
        >Selected your members</Text>

        <FlatList
          data={friendsGroup}
          renderItem={(rowData) => {
            const isSelected = selectedFriends.includes(rowData.item.id)
            return (
              <TouchableOpacity
                onPress={() => handleSelectFriend(rowData.item.id)}>
                <View style={[
                  styles.friendItemContainer,
                  isSelected && { backgroundColor: '#D3D3D3' }
                ]}>
                  <Image
                    source={
                      rowData.item.friendProfile?.image
                        ? { uri: rowData.item.friendProfile.image }
                        : profileIcon
                    }
                    style={styles.profileImage}
                  />
                  <Text style={styles.friendName}>
                    {` ${rowData.item.friendProfile.firstName} ${rowData.item.friendProfile.lastName}`}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          }}
          keyExtractor={item => item.id}
        />
      </View>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: "black",
          alignItems: "center",
          justifyContent: "center",
          width: 65,
          position: "absolute",
          bottom: height * 0.03,
          right: width * 0.05,
          height: 65,
          backgroundColor: "black",
          borderRadius: 100,
        }}
        onPress={() => {
          addChatGroup()
          navigation.navigate("ChatFriendsHome")
        }}
      >
        <Ionicons name="arrow-forward" size={35} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

//FlatList Style
const styles = StyleSheet.create({
  newGroupText: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 24,
    textAlign: 'left',
    paddingLeft: 12,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'gray',
    height: 48,
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontFamily: 'Urbanist_500Medium',
  },
  memberSelectionText: {
    fontFamily: 'Urbanist_600SemiBold',
    fontSize: 20,
    textAlign: 'left',
    paddingLeft: 12,
  },
  friendItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingLeft: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 24,
  },
  friendName: {
    fontFamily: 'Urbanist_500Medium',
    fontSize: 15,
    marginRight: 12,
  },

});