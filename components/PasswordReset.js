import React from "react";
import {
    Text,
    View,
    Pressable,
    TextInput,
    Modal
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function PasswordReset ({ visible, onClose, onSend }) {
    const [email, setEmail] = useState('');
    // const [prModalVisible, setPrModalVisible] = useState(visible);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            // presentationStyle="pageSheet"
            transparent={true}
        >
            <View className="flex-1 justify-start mt-10">
                <View className="w-full h-4/5 bg-primary rounded-lg">
                    <View className="flex-row justify-between mt-3 align-center px-3 pt-2">
                        <Text className="font-urbanistBold text-3xl text-start mb-10">
                            Password Reset
                        </Text>
                        <Ionicons
                            name="close"
                            size={35}
                            color="black"
                            onPress={onClose}
                        />
                    </View>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: "rgba(0,0,0,0.5)",
                        }}
                    >
                        <View style={{ backgroundColor: "white", height: "100%" }}>
                            <TextInput
                                className="bg-gray h-12 rounded-lg w=11/12 p-4 ml-3 mr-3 font-urbanist"
                                placeholder="Enter Email"
                                placeholderTextColor={"#666"}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onChangeText={setEmail}
                                value={email}
                            ></TextInput>

                            <Pressable
                                className="bg-secondary rounded-lg h-14 mt-5 ml-3 mr-3 items-center justify-center"
                                onPress={() => onSend(email)}
                            >
                                <Text className="text-lg font-urbanistBold text-primary">
                                    Send Email
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}