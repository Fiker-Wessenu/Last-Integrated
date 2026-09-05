import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Alert,
  Linking,
  Switch,
  Text,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../firebase/context/AuthContext';
import { useTheme } from '../../firebase/context/ThemeContext';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Simple constants since the original files are missing
const SPACING = { xs: 4, sm: 8, base: 16, md: 20, lg: 24, xl: 32, '2xl': 40 };
const RADIUS = { sm: 4, md: 8, lg: 16, xl: 24 };

const PROFILE_IMAGE = require('../../../assets/icon.png');

// Simple Icon component using SVG paths for common icons
const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'camera-outline') path = 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z';
  if (name === 'flask-outline') path = 'M9 3v12a3 3 0 0 0 6 0V3 M8 3h8 M12 15h.01';
  if (name === 'calendar-outline') path = 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18';
  if (name === 'business-outline') path = 'M3 21h18 M3 7v14 M21 7v14 M9 21V11h6v10 M7 7h10 M7 3h10';
  if (name === 'globe-outline') path = 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z M12 2v20 M2 12h20';
  if (name === 'person-outline') path = 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2';
  if (name === 'key-outline') path = 'M21 2l-2 2 M7 10a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M11 14l9-9 2 2-9 9';
  if (name === 'document-text-outline') path = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8';
  if (name === 'people-outline') path = 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0-4-4 4 4 0 0 0 4 4z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75';
  if (name === 'chevron-forward-outline') path = 'M9 5l7 7-7 7';
  if (name === 'log-out-outline') path = 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateProfilePicture } = useAuth();
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  const [imageUri, setImageUri] = useState(user?.profilePicture || null);
  const [uploading, setUploading] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.fullName || '');
  const [updating, setUpdating] = useState(false);

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    announcements: true,
    training: true,
    research: false,
    events: true,
  });

  const textColor = colors.text;
  const secondaryText = colors.rowTime;
  const borderColor = colors.border;
  const cardColor = colors.rowBg;
  const brandColor = colors.primary;
  const accentColor = colors.tabActiveBg;
  const goldAccent = '#de994a';

  const showImagePickerOptions = () => {
    Alert.alert('Profile Picture', 'Image selection feature coming soon!');
  };

  const handleUpdateProfile = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a name.');
      return;
    }
    setUpdating(true);
    try {
      await firestore().collection('users').doc(user.uid).update({
        fullName: newName.trim(),
      });
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 12) {
      Alert.alert('Error', 'Password must be at least 12 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      await auth().currentUser.updatePassword(newPassword);
      setPasswordModalVisible(false);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully.');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert('Action Required', 'This action requires a recent login. Please log out and log back in to change your password.');
      } else {
        Alert.alert('Error', error.message || 'Failed to change password.');
      }
    } finally {
      setChangingPassword(false);
    }
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

  const openSSGIWebsite = () => {
    Linking.openURL('https://ssgi.gov.et/').catch(() => {
      Alert.alert('Error', 'Could not open the SSGI website.');
    });
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderToggleItem = (label, key) => (
    <View style={styles.toggleRow}>
      <Text style={[styles.bodyText, { color: textColor }]}>{label}</Text>
      <Switch
        value={notifications[key]}
        onValueChange={() => toggleNotification(key)}
        trackColor={{ false: '#3a3a5a', true: brandColor }}
        thumbColor={notifications[key] ? '#ffffff' : '#f4f3f4'}
        ios_backgroundColor="#3a3a5a"
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Profile
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar - Tappable */}
        <View style={styles.avatarWrapper}>
          <TouchableOpacity
            style={[styles.avatarContainer, { borderColor: brandColor }]}
            onPress={showImagePickerOptions}
            activeOpacity={0.8}
          >
            <Image
              source={imageUri ? { uri: imageUri } : PROFILE_IMAGE}
              style={styles.avatar}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editAvatarBtn, { backgroundColor: brandColor }]}
            onPress={showImagePickerOptions}
          >
            <Icon name="camera-outline" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {uploading && (
          <View style={styles.uploadingRow}>
            <ActivityIndicator size="small" color={brandColor} />
            <Text style={[styles.caption, { color: secondaryText, marginLeft: SPACING.xs }]}>
              Saving...
            </Text>
          </View>
        )}

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={[styles.heading2, { color: textColor }]}>
            {user?.fullName || user?.name || 'Orbit User'}
          </Text>
          <Text style={[styles.bodyText, { color: secondaryText }]}>
            {user?.email || 'orbiting@chat.com'}
          </Text>

          <View style={styles.detailRow}>
            <Icon name="flask-outline" size={16} color={accentColor} />
            <Text style={[styles.caption, { color: secondaryText, marginLeft: SPACING.xs }]}>
              Research Area: Space Weather & Geospatial Analysis
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="calendar-outline" size={16} color={accentColor} />
            <Text style={[styles.caption, { color: secondaryText, marginLeft: SPACING.xs }]}>
              Member since 2025
            </Text>
          </View>

          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: accentColor + '20' }]}>
              <Text style={{ fontSize: 12, color: accentColor }}>SSGI Staff</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: brandColor + '20' }]}>
              <Text style={{ fontSize: 12, color: brandColor }}>Geospatial Division</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: goldAccent + '20' }]}>
              <Text style={{ fontSize: 12, color: goldAccent }}>Space Science</Text>
            </View>
          </View>
        </View>

        {/* Organization */}
        <View style={[styles.organizationCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <View style={styles.orgHeader}>
            <Icon name="business-outline" size={22} color={goldAccent} />
            <Text style={[styles.orgTitle, { color: textColor }]}>
              Space Science & Geospatial Institute
            </Text>
          </View>
          <Text style={[styles.orgDescription, { color: secondaryText }]}>
            Leading Africa's space and geospatial sector through research, innovation, and collaboration.
          </Text>
          <TouchableOpacity style={[styles.orgButton, { backgroundColor: brandColor }]} onPress={openSSGIWebsite}>
            <Icon name="globe-outline" size={18} color="#ffffff" />
            <Text style={[styles.orgButtonText, { marginLeft: SPACING.sm }]}>
              Visit SSGI Website
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={[styles.optionsCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Text style={[styles.sectionLabel, { color: secondaryText }]}>
            ACCOUNT SETTINGS
          </Text>

          <TouchableOpacity style={styles.optionItem} activeOpacity={0.6} onPress={() => setEditModalVisible(true)}>
            <Icon name="person-outline" size={22} color={accentColor} />
            <Text style={[styles.optionText, { color: textColor }]}>Edit Profile</Text>
            <Icon name="chevron-forward-outline" size={18} color={secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} activeOpacity={0.6} onPress={() => setPasswordModalVisible(true)}>
            <Icon name="key-outline" size={22} color={accentColor} />
            <Text style={[styles.optionText, { color: textColor }]}>Change Password</Text>
            <Icon name="chevron-forward-outline" size={18} color={secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} activeOpacity={0.6} onPress={() => Alert.alert('My Publications', 'Feature coming soon!')}>
            <Icon name="document-text-outline" size={22} color={accentColor} />
            <Text style={[styles.optionText, { color: textColor }]}>My Publications</Text>
            <Icon name="chevron-forward-outline" size={18} color={secondaryText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} activeOpacity={0.6} onPress={() => navigation.navigate('MainTabs', { screen: 'Chats' })}>
            <Icon name="people-outline" size={22} color={accentColor} />
            <Text style={[styles.optionText, { color: textColor }]}>Group Chats</Text>
            <Icon name="chevron-forward-outline" size={18} color={secondaryText} />
          </TouchableOpacity>
        </View>

        {/* Notification Preferences */}
        <View style={[styles.optionsCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Text style={[styles.sectionLabel, { color: secondaryText }]}>
            NOTIFICATION PREFERENCES
          </Text>

          {renderToggleItem('SSGI Announcements', 'announcements')}
          {renderToggleItem('Training & Workshops', 'training')}
          {renderToggleItem('Research Publications', 'research')}
          {renderToggleItem('Events & Conferences', 'events')}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Icon name="log-out-outline" size={20} color="#ffffff" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: secondaryText }]}>
            Orbit Chat v1.0.0
          </Text>
          <Text style={[styles.footerSubtext, { color: secondaryText }]}>
            Secure Communication for Space & Geospatial Teams
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Edit Profile</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: borderColor, backgroundColor: cardColor }]}
              placeholder="Full Name"
              placeholderTextColor={secondaryText}
              value={newName}
              onChangeText={setNewName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#cccccc' }]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: brandColor }]} onPress={handleUpdateProfile} disabled={updating}>
                {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="slide" onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Change Password</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: borderColor, backgroundColor: cardColor }]}
              placeholder="New Password (min 12 chars)"
              placeholderTextColor={secondaryText}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={[styles.input, { color: textColor, borderColor: borderColor, backgroundColor: cardColor, marginTop: 10 }]}
              placeholder="Confirm Password"
              placeholderTextColor={secondaryText}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#cccccc' }]} onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: brandColor }]} onPress={handleChangePassword} disabled={changingPassword}>
                {changingPassword ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Update</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backButton: { padding: SPACING.xs, width: 40 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: SPACING.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a0e1a',
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    width: '100%',
  },
  heading2: { fontSize: 24, fontWeight: 'bold' },
  bodyText: { fontSize: 16 },
  caption: { fontSize: 12 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  organizationCard: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  orgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  orgTitle: {
    marginLeft: SPACING.sm,
    fontSize: 16,
    fontWeight: 'bold',
  },
  orgDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  orgButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  orgButtonText: {
    fontWeight: '600',
    color: '#ffffff',
  },
  optionsCard: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    paddingVertical: SPACING.sm,
    letterSpacing: 1,
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionText: { flex: 1, marginLeft: SPACING.md, fontSize: 16 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: SPACING.base,
    backgroundColor: '#c0392b',
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  logoutText: { fontWeight: '600', color: '#ffffff', marginLeft: SPACING.sm },
  footer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: { opacity: 0.5, fontSize: 12 },
  footerSubtext: { opacity: 0.3, marginTop: SPACING.xs, fontSize: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
