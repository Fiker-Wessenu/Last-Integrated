import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../firebase/context/AuthContext';
import { useTheme } from '../../firebase/context/ThemeContext';

const LOGO_IMAGE = require('../../../assets/icon.png');

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'person-outline') path = 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2';
  if (name === 'chevron-forward-outline') path = 'M9 5l7 7-7 7';
  if (name === 'pencil-outline') path = 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z';
  if (name === 'lock-closed-outline') path = 'M7 11V7a5 5 0 0 1 10 0v4 M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z';
  if (name === 'phone-portrait-outline') path = 'M5 4h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M12 18h.01';
  if (name === 'chatbubbles-outline') path = 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z';
  if (name === 'settings-outline') path = 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z';
  if (name === 'cloud-outline') path = 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z';
  if (name === 'notifications-outline') path = 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z M13.73 21a2 2 0 0 1-3.46 0';
  if (name === 'musical-notes-outline') path = 'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
  if (name === 'color-palette-outline') path = 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z M7 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M10 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M14 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M17 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z';
  if (name === 'moon-outline') path = 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z';
  if (name === 'color-filter-outline') path = 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z M12 6v12 M6 12h12';
  if (name === 'help-circle-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01';
  if (name === 'information-circle-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01';
  if (name === 'log-out-outline') path = 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

export default function SettingsScreen({ navigation }) {
  const { logout, user } = useAuth();
  const { colors, theme, isDark, toggleTheme } = useTheme();

  const bgColor = colors.background;
  const textColor = colors.text;
  const secondaryText = colors.rowTime;
  const borderColor = colors.border;
  const brandColor = colors.primary;
  const cardColor = colors.rowBg;
  const accentColor = colors.tabActiveBg;

  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleToggleDarkMode = () => {
    toggleTheme();
  };

  const renderSectionHeader = (title) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={[styles.sectionHeader, { color: secondaryText }]}>{title}</Text>
    </View>
  );

  const renderNavItem = (label, screenName, iconName) => (
    <TouchableOpacity
      style={[styles.option, { backgroundColor: cardColor }]}
      onPress={() => navigateTo(screenName)}
      activeOpacity={0.6}
    >
      <View style={styles.optionLeft}>
        <Icon name={iconName} size={20} color={accentColor} />
        <Text style={[styles.optionText, { color: textColor, marginLeft: 14 }]}>{label}</Text>
      </View>
      <Icon name="chevron-forward-outline" size={18} color={secondaryText} />
    </TouchableOpacity>
  );

  const renderToggleItem = (label, value, onToggle, iconName) => (
    <View style={[styles.option, { backgroundColor: cardColor }]}>
      <View style={styles.optionLeft}>
        <Icon name={iconName} size={20} color={accentColor} />
        <Text style={[styles.optionText, { color: textColor, marginLeft: 14 }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#3a3a5a', true: brandColor }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
        ios_backgroundColor="#3a3a5a"
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.profileCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
        <View style={styles.avatarContainer}>
          <Image source={LOGO_IMAGE} style={styles.avatarLogo} resizeMode="contain" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: textColor }]}>
            {user?.fullName || user?.name || 'Orbit User'}
          </Text>
          <Text style={[styles.profileEmail, { color: secondaryText }]}>
            {user?.email || 'orbiting@chat.com'}
          </Text>
        </View>
        <TouchableOpacity style={styles.editIcon}>
          <Icon name="pencil-outline" size={20} color={secondaryText} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderSectionHeader('PROFILE & ACCOUNT')}
        {renderNavItem('Account', 'Account', 'person-outline')}
        {renderNavItem('Privacy & Security', 'PrivacySecurity', 'lock-closed-outline')}
        {renderNavItem('Devices', 'Devices', 'phone-portrait-outline')}

        {renderSectionHeader('CHATS & MESSAGES')}
        {renderNavItem('Chats', 'Chats', 'chatbubbles-outline')}
        {renderNavItem('Message Settings', 'MessageSettings', 'settings-outline')}
        {renderNavItem('Backup & Storage', 'BackupStorage', 'cloud-outline')}

        {renderSectionHeader('NOTIFICATIONS & SOUNDS')}
        {renderNavItem('Notifications', 'NotificationsSettings', 'notifications-outline')}
        {renderNavItem('Notification Sound', 'NotificationSound', 'musical-notes-outline')}

        {renderSectionHeader('APPEARANCE')}
        {renderNavItem('Theme', 'ThemePicker', 'color-palette-outline')}
        {renderToggleItem('Dark Mode', isDark, handleToggleDarkMode, 'moon-outline')}
        {renderNavItem('Accent Color', 'AccentColor', 'color-filter-outline')}

        {renderSectionHeader('SUPPORT & ABOUT')}
        {renderNavItem('Help & FAQ', 'HelpFAQ', 'help-circle-outline')}
        {renderNavItem('About Orbit Chat', 'About', 'information-circle-outline')}

        <View style={{ height: 20 }} />
      </ScrollView>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Icon name="log-out-outline" size={20} color="#ffffff" />
        <Text style={[styles.logoutText, {marginLeft: 8}]}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: secondaryText }]}>
          Orbit Chat v1.0.0
        </Text>
        <Text style={[styles.footerSubtext, { color: secondaryText }]}>
          Secure Communication for Space & Geospatial Teams
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: { padding: 4, width: 40 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileInfo: { flex: 1, marginLeft: 14 },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  editIcon: { padding: 8 },
  scrollContent: { paddingBottom: 10 },
  sectionHeaderContainer: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#c0392b',
    borderRadius: 14,
    marginTop: 0,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.6,
  },
  footerSubtext: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.4,
  },
});
