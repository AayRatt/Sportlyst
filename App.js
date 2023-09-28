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
          component={Activities}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
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
