import { Text, StyleSheet, View } from 'react-native'
import { useFonts, Urbanist_600SemiBold, Urbanist_500Medium, } from "@expo-google-fonts/urbanist";

import { useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'

import { db, auth } from "../firebaseConfig";
import { setDoc, doc, collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Chat() {

    const [messages, setMessages] = useState([])

    useLayoutEffect(() => {

        const q = query(collection(db, 'chats'), orderBy('createdAt', 'desc'))
        const unsubscribe = onSnapshot(q, snapshot => {
            setMessages(snapshot.docs.map(doc => ({
                _id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
            })));
        });

        return () => unsubscribe();
    }, []);

    const onSend = useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
        const { _id, createdAt, text, user } = messages[0];

        setDoc(doc(db, 'chats', _id), {
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

        <GiftedChat
            messages={messages}
            showAvatarForEveryMessage={true}
            onSend={messages => onSend(messages)}
            user={{
                _id: auth?.currentUser?.email,
                // name: auth?.currentUser?.displayName
            }}
        />

    );
}

