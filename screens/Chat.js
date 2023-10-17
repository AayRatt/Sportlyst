import { Text, StyleSheet, View } from 'react-native';
import { useFonts, Urbanist_600SemiBold, Urbanist_500Medium } from "@expo-google-fonts/urbanist";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback, useEffect, useLayoutEffect } from 'react';

import { GiftedChat } from 'react-native-gifted-chat'
import { Bubble } from 'react-native-gifted-chat'


import { db, auth } from "../firebaseConfig";
import { setDoc, doc, collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Chat({ navigation, route }) {

  const { friendID, firstName, lastName } = route.params;
  const [messages, setMessages] = useState([]);

  //Order Alfabeticamente
  const generateChatID = (uidOne, uidTwo) => {
    return [uidOne, uidTwo].sort().join('_')
  }
  const chatID = generateChatID(auth.currentUser.uid, friendID)
  console.log(chatID)

  useLayoutEffect(() => {
    const chatCollection = collection(db, 'chats', chatID, 'messages');
    const q = query(chatCollection, orderBy('createdAt', 'desc'));
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
        title: firstName ?  `${firstName} ${lastName}`: 'Cannot load user data'
    });
}, []);

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
    const { _id, createdAt, text, user } = messages[0];
    const chatDoc = doc(db, 'chats', chatID, 'messages', _id);
    setDoc(chatDoc, {
      _id,
      createdAt,
      text,
      user
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
        showAvatarForEveryMessage={true}
        onSend={messages => onSend(messages)}
        user={{
          _id: auth?.currentUser?.email,
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

