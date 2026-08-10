import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../firebase/context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import ChatWindowScreen from '../screens/chat/ChatWindowScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  // user/loading come from AuthContext, which already listens to
  // auth().onAuthStateChanged() and the live Firestore profile —
  // no separate listener needed here.
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#DD984B" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Not logged in
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={SignUpScreen} />
          </>
        ) : !user.emailVerified ? (
          // Logged in but hasn't verified their email yet
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        ) : (
          // Logged in and verified — main app.
          // MainTabNavigator holds the bottom tabs (Chats/Calls/Contacts/Settings);
          // ChatWindow and Profile push on top of it, full-screen, outside the tab bar.
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="ChatWindow" component={ChatWindowScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});