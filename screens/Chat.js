import { Text, StyleSheet, View } from 'react-native';
import { useFonts, Urbanist_600SemiBold, Urbanist_500Medium } from "@expo-google-fonts/urbanist";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback, useEffect, useLayoutEffect } from 'react';

import { GiftedChat, Bubble } from 'react-native-gifted-chat'


import { db, auth } from "../firebaseConfig";
import { setDoc, getDoc, doc, collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Chat({ navigation, route }) {

  const { friendID, firstName, lastName, groupID, groupName, groupMembers } = route.params
  const [messages, setMessages] = useState([])

  const isGroupChat = groupID ? true : false

  const [membersProfile, setMembersProfile] = useState([])
  const [currentUserData, setCurrentUserData] = useState(null);

  //Order Alfabeticamente
  const generateChatID = (uidOne, uidTwo) => {
    return [uidOne, uidTwo].sort().join('_')
  }
  const chatID = isGroupChat ? groupID : generateChatID(auth.currentUser.uid, friendID)
  console.log(chatID)

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

  useEffect(() => {
    navigation.setOptions({
      title: isGroupChat ? groupName : (firstName ? `${firstName} ${lastName}` : 'Cannot load user data')
    })
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
  };

  useEffect(() => {
    if (isGroupChat) {
      getMemberProfile()
    }
  }, [groupMembers])

  
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


  return (
    <SafeAreaView className="bg-primary flex-1">
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

