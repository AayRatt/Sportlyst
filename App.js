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
import Events from "./screens/Events";
import { MaterialIcons } from "@expo/vector-icons";
import ActivityDetails from "./screens/ActivityDetails";
import ActivityCard from "./components/ActivityCard";
import Chat from "./screens/Chat";
import FriendProfile from "./screens/FriendProfile";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import ChatFriends from "./screens/ChatFriends";

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
          component={ActivityDetailsStack}
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
          name="Search"
          component={SearchStack}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="search" size={24} color="black" />
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
          name="Events"
          component={Events}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="list" size={24} color="black" />
            ),
          }}
        />
        <Tab.Screen
          name="ChatFriends"
          component={ChatStack}
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
        initialRouteName="SearchHome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="SearchHome" component={Search} />
        <Stack.Screen
          name="SearchFriendProfile"
          component={FriendProfile}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    );
  }

  function FriendStack() {
    return (
      <Stack.Navigator
        initialRouteName="FriendsHome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="FriendsHome" component={Friends} />
        <Stack.Screen
          name="FriendProfile"
          component={FriendProfile}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    );
  }

  function ChatStack() {
    return (
      <Stack.Navigator
        initialRouteName="ChatFriendsHome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="ChatFriendsHome" component={ChatFriends} />
        <Stack.Screen
          name="Chat"
          component={Chat}
          options={{
            headerShown: true,
            title: null
          }}
        />
      </Stack.Navigator>
    );
  }

  function ActivityDetailsStack() {
    return (
      <Stack.Navigator initialRouteName="Activities">
        <Stack.Screen name="Activities" component={Activities}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ActivityDetails" component={ActivityDetails}
          options={{
            title: null
          }}

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
          {/* <Stack.Screen
            name="Activities"
            component={Activities}
            options={{ headerShown: false, headerLeft: false }}
          />                */}
          {/* <Stack.Screen
            name="ActivityCard"
            component={ActivityCard}
            options={{ headerShown: false, headerLeft: false }}
          />          
          <Stack.Screen
            name="ActivityDetails"
            component={ActivityDetails}
            options={{ headerShown: false, headerLeft: false }}
          /> */}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}