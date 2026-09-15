import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../firebase/context/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import ChatWindowScreen from '../screens/chat/ChatWindowScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import MainTabNavigator from './MainTabNavigator';

import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationsScreen from '../screens/notification/NotificationsScreen';
import BaseScreen from '../screens/settings/BaseScreen';
import NewChatScreen from '../screens/chat/NewChatScreen';
import NewGroupScreen from '../screens/chat/NewGroupScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import AccountScreen from '../screens/settings/AccountScreen';
import ThemeScreen from '../screens/settings/ThemeScreen';
import NotificationsSettingsScreen from '../screens/settings/NotificationsSettingsScreen';
import PrivacySecurityScreen from '../screens/settings/PrivacySecurityScreen';
import HelpFAQScreen from '../screens/settings/HelpFAQScreen';
import ChatSettingsScreen from '../screens/settings/ChatSettingsScreen';
import BackupStorageScreen from '../screens/settings/BackupStorageScreen';
import MessageSettingsScreen from '../screens/settings/MessageSettingsScreen';
import DevicesScreen from '../screens/settings/DevicesScreen';

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
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : !user.emailVerified ? (
          // Logged in but hasn't verified their email yet
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
        ) : (
          // Logged in and verified — main app.
          // MainTabNavigator holds the bottom tabs (Chats/Calls/Contacts/Settings);
          // everything below pushes on top of it, full-screen, outside the tab bar.
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="ChatWindow" component={ChatWindowScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="NewChat" component={NewChatScreen} />
            <Stack.Screen name="NewGroup" component={NewGroupScreen} />

            {/* ─── Settings Sub-screens ─────────────────────────── */}
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
            <Stack.Screen name="Devices" component={DevicesScreen} />
            <Stack.Screen name="Chats" component={ChatSettingsScreen} />
            <Stack.Screen name="MessageSettings" component={MessageSettingsScreen} />
            <Stack.Screen name="BackupStorage" component={BackupStorageScreen} />
            <Stack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} />
            <Stack.Screen
              name="NotificationSound"
              component={BaseScreen}
              initialParams={{ title: 'Notification Sound' }}
            />
            <Stack.Screen name="ThemePicker" component={ThemeScreen} />
            <Stack.Screen
              name="AccentColor"
              component={BaseScreen}
              initialParams={{ title: 'Accent Color' }}
            />
            <Stack.Screen name="HelpFAQ" component={HelpFAQScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
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