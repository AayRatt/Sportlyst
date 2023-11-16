import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Launch from "./screens/Launch";
import React from "react";
import Login from "./screens/Login";
import Register from "./screens/Register";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Alert, Text } from "react-native";
import { useState, useEffect } from "react";
import Activities from "./screens/Activities";
import Profile from "./screens/Profile"; 
import Search from "./screens/Search";
import Friends from "./screens/Friends";
import CreateActivity from "./screens/CreateActivity";
import { MaterialIcons } from "@expo/vector-icons";
import ActivityDetails from "./screens/ActivityDetails";
import ActivityCard from "./components/ActivityCard";
import Chat from "./screens/Chat";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import ChatFriends from "./screens/ChatFriends";
import FriendProfile from "./screens/FriendProfile";
import Onboarding from "react-native-onboarding-swiper";
import { Pressable } from "react-native"; //NEW
import OnBoardingScreen from "./screens/OnBoardingScreen";
import AsyncStorage, {
  useAsyncStorage,
} from "@react-native-async-storage/async-storage";
import ChatGroup from "./screens/ChatGroup";

const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [onBoarding, setOnBoarding] = useState(false);
  const [launch, setLaunch] = useState(false);

  console.log(onBoarding);

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const getOnBoardingStatus = async () => {
      const loggedUser = auth.currentUser;
      if (loggedUser) {
        const userRef = doc(db, "userProfiles", loggedUser.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            print(`STATUS${docSnap.data().onBoardPending}`);
            if (docSnap.data().onBoardPending) {
              setOnBoarding(true);

              // try {

              //   AsyncStorage.getItem("launched").then(value => {

              //     if (value !== null) {
              //       setLaunch(true)
              //       setOnBoarding(true)
              //     } else {
              //       setOnBoarding(true)
              //     }

              //   }
              //   )

              // } catch (error) {

              //   console.log(error)

              // }
            } else {
              setOnBoarding(false);
            }
          } else {
            // Consider how to handle the case where user data doesn't exist
          }

          console.log(
            `LAUNCH:${launch}, ONBOARDING:${onBoarding} USER:${user}`
          );
        } catch (error) {
          // Handle any errors
        }
      }
      console.log(`LAUNCH:${launch}, ONBOARDING:${onBoarding} USER:${user}`);
    };

    if (user) {
      getOnBoardingStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (initializing) return null;

  function Onboarding() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name="OnBoardingScreen"
          component={OnBoardingScreen}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="BottomTab"
          component={BottomTabNavigator}
        />
      </Stack.Navigator>
    );
  }

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
        <Stack.Screen
          name="ActivityDetails"
          component={ActivityDetails}
          options={{
            title: null,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="FriendProfile"
          component={FriendProfile}
          options={{ headerShown: true }}
        />
        <Stack.Screen name="Search" component={SearchStack} />
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
            headerShown: false,
            title: null,
          }}
        />
        <Stack.Screen
          name="ChatGroup"
          component={ChatGroup}
          options={{
            headerShown: false,
            title: null,
          }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <NavigationContainer>
      {/* Assuming OnBoardingModal is correctly imported and used */}
      {user && onBoarding && launch ? (
        // If there is a user and onboarding is true, show the onboarding screen
        <BottomTabNavigator />
      ) : user && onBoarding ? (
        // If there is a user and onboarding is true, show the onboarding screen
        <Onboarding />
      ) : user ? (
        // If there is a user but onboarding is not true, show the bottom tab navigator
        <BottomTabNavigator />
      ) : (
        // If there is no user, show the authentication flow
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
