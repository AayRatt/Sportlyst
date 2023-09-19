import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Launch from "./screens/Launch";
import React from "react";
import Login from "./screens/Login";
import Register from "./screens/Register";
import { NavigationContainer } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
