import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../firebase/context/ThemeContext';
import ChatsListScreen from '../screens/home/ChatListScreen';

const Tab = createBottomTabNavigator();

// Placeholder screens — swap these out as the real Calls/Contacts/Settings
// screens get built.
function CallsScreenPlaceholder() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <Text style={{ fontSize: 20, color: colors.text }}>📞 Calls</Text>
    </View>
  );
}

function ContactsScreenPlaceholder() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <Text style={{ fontSize: 20, color: colors.text }}>👥 Contacts</Text>
    </View>
  );
}

function SettingsScreenPlaceholder() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <Text style={{ fontSize: 20, color: colors.text }}>⚙️ Settings</Text>
    </View>
  );
}

export default function MainTabNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Chats"
        component={ChatsListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size/2 }} />
          ),
        }}
      />
      <Tab.Screen
        name="Calls"
        component={CallsScreenPlaceholder}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size/2 }} />
          ),
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreenPlaceholder}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size/2 }} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreenPlaceholder}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size/2 }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}