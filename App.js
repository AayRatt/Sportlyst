import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Launch from "./screens/Launch";
import React from "react";
import Login from "./screens/Login";
import Register from "./screens/Register";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { auth } from "./firebaseConfig";
import { useState, useEffect } from "react";
import Activities from "./screens/Activities";
import Profile from "./screens/Profile";
import Search from "./screens/Search";
import Friends from "./screens/Friends";
import CreateActivity from "./screens/CreateActivity";
import { MaterialIcons } from "@expo/vector-icons";
import ActivityDetails from "./screens/ActivityDetails";
import Chat from "./screens/Chat";
import FriendProfile from "./screens/FriendProfile";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) return null;

  function BottomTabNavigator() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Activities"
          component={CreateActivityStack}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="local-activity" size={24} color="black" />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="user" size={24} color="black" />
            ),
          }}
        />
        <Tab.Screen
          name="Friends"
          component={FriendStack}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="user-friends" size={24} color="black" />
            ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={Chat}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={24} color="black" />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  function SearchStack() {
    return (
      <Stack.Navigator
        initialRouteName="Search"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen
          name="FriendProfile"
          component={FriendProfile}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    );
  }

  function FriendStack() {
    return (
      <Stack.Navigator
        initialRouteName="Friends"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Friends" component={Friends} />
        <Stack.Screen
          name="FriendProfile"
          component={FriendProfile}
          options={{ headerShown: true }}
        />
        <Stack.Screen name="Search" component={SearchStack} />
      </Stack.Navigator>
    );
  }

  function CreateActivityStack() {
    return (
      <Stack.Navigator
        initialRouteName="Activities"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Activities" component={Activities} />
        <Stack.Screen
          name="CreateActivity"
          component={CreateActivity}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <BottomTabNavigator />
      ) : (
        <Stack.Navigator initialRouteName="Launch">
          <Stack.Screen
            name="Launch"
            component={Launch}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
