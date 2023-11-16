import { Text, StyleSheet, View, Pressable, Alert } from 'react-native';
import { useFonts, Urbanist_600SemiBold, Urbanist_500Medium } from "@expo-google-fonts/urbanist";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback, useEffect, useLayoutEffect } from 'react';

import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

import { db, auth } from "../firebaseConfig";
import { setDoc, getDoc, doc, collection, onSnapshot, query, orderBy, deleteDoc, getDocs } from "firebase/firestore";

export default function Chat({ navigation, route }) {

  const { friendID, firstName, lastName, groupID, groupName, groupMembers, groupAdmiID } = route.params
  const [messages, setMessages] = useState([])

  const isGroupChat = groupID ? true : false

  const [membersProfile, setMembersProfile] = useState([])
  const [currentUserData, setCurrentUserData] = useState(null);

  //Order Alfabeticamente
  const generateChatID = (uidOne, uidTwo) => {
    return [uidOne, uidTwo].sort().join('_')
  }
  const chatID = isGroupChat ? groupID : generateChatID(auth.currentUser.uid, friendID)
  // console.log(chatID)

  useLayoutEffect(() => {
    const chatCollection = collection(db, isGroupChat ? 'chats' : 'chats', isGroupChat ? groupID : chatID, 'messages')
    const q = query(chatCollection, orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => ({
        _id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })));
    });

    return () => unsubscribe();
  }, []);


  //Get Actual user Data
  const getCurrentUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "userProfiles", auth.currentUser.uid))
      if (userDoc.exists()) {
        return userDoc.data()
      } else {
        console.error("No such document!")
        return null
      }
    } catch (error) {
      console.error("Error fetching user data: ", error)
      return null;
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCurrentUserData();
      setCurrentUserData(data);
    };

    fetchData()
  }, []);


  //Get Member Data
  const getMemberProfile = async () => {
    try {
      const arrayMember = [];
      for (const member of groupMembers) {
        const docSnapshot = await getDoc(doc(db, "userProfiles", member))
        if (docSnapshot.exists()) {
          arrayMember.push({ uid: member, ...docSnapshot.data() })
        }
      }
      setMembersProfile(arrayMember)
    } catch (error) {
      console.error(error)
    }
  }

  //Get the Name of the Member From FireStore
  const getNameForUser = (uid) => {
    if (isGroupChat) {
      const user = membersProfile.find((member) => member.uid === uid)
      return user ? `${user.firstName} ${user.lastName}` : "No data loaded"
    }
    if (currentUserData) {
      return `${currentUserData.firstName} ${currentUserData.lastName}`;
    } else {
      return "Loading...";
    }
  }

  useEffect(() => {
    if (isGroupChat) {
      getMemberProfile()
    }
  }, [groupMembers])

  //Create the Title with the groupName and all the members
  const GroupTitle = ({ groupName, memberNames }) => {
    return (
      <View style={{ alignItems: 'left' }}>
        <Text className="font-urbanistBold text-3xl text-start">{groupName}</Text>
        <Text numberOfLines={1} ellipsizeMode="tail">{memberNames.join(', ')}</Text>
      </View>
    )
  }

  //GiftedChat  Function to create the messages in the chat collection Firestore
  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    const { _id, createdAt, text, user } = messages[0]
    const chatDoc = doc(db, 'chats', chatID, 'messages', _id);
    setDoc(chatDoc, {
      _id,
      createdAt,
      text,
      user,
      isGroupChat,
      groupMembers: isGroupChat ? groupMembers : 'No hay miembros'
    });
  }, []);

  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,
    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }


  //Delete Confirmation
  const confirmAndDeleteGroup = () => {
    Alert.alert(
      "Delete Group",
      "Are you sure to eliminate this Group?",
      [
        //Cancel Button
        {
          text: "Cancel",
          style: "cancel"
        },
        //Confirmation
        { text: "Eliminate", onPress: () => deleteGroup() }
      ]
    )
  }

  //Delete Function
  const deleteGroup = async () => {
    try {
      //Delete document from Chat Group Colection
      const groupChatDelete = doc(db, "chatGroups", groupID)
      await deleteDoc(groupChatDelete)

      //Delete every messsage fron documentChats Collection
      const messages = collection(db, "chats", groupID, "messages")
      const messagesSnapshot = await getDocs(messages)

      messagesSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      })

      Alert.alert('Group Deleted')
      navigation.goBack()
    } catch (error) {
      console.log('Delete Firestore problem', error)
    }
  }

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="bg-white pl-3 pr-3 flex-row justify-between items-center mt-5 mb-2">
        <Pressable onPress={() => navigation.goBack()} className="flex-row items-center">
          <Entypo name="chevron-left" size={35} color="black" />
        </Pressable>
        <View className="flex-1 mr-10"> 
          {isGroupChat ? (
            <GroupTitle
              groupName={groupName}
              memberNames={groupMembers.map(memberID => getNameForUser(memberID)).filter(name => name !== "No data loaded")}
            />
          ) : (
            <Text className="font-urbanistBold text-3xl text-start ">
              {firstName ? `${firstName} ${lastName}` : 'Cannot load user data'}
            </Text>
          )}
        </View>
        {auth.currentUser.uid === groupAdmiID && (
          <Pressable onPress={confirmAndDeleteGroup}>
            <MaterialIcons name="delete" size={35} color="black" />
          </Pressable>
        )}
      </View>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={isGroupChat}
        renderUsernameOnMessage={isGroupChat}
        onSend={messages => onSend(messages)}
        user={{
          _id: auth?.currentUser?.email,
          name: getNameForUser(auth?.currentUser?.uid)
        }}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              wrapperStyle={{
                left: {
                  backgroundColor: 'rgba(229,232,233,255)'
                },
                right: {
                  backgroundColor: 'rgba(26,136,185,255)'
                },
              }}
            />
          );
        }}
      />
    </SafeAreaView>
  );

}

