import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../firebase/context/AuthContext';
import { useTheme } from '../../firebase/context/ThemeContext';
import { getUserProfile } from '../../services/userService';

const DEFAULT_AVATAR = require('../../../assets/icon.png');

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'camera-outline') path = 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z';
  if (name === 'id-card-outline') path = 'M3 4h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M7 8h10 M7 12h10 M7 16h6';
  if (name === 'person-outline') path = 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2';
  if (name === 'mail-outline') path = 'M3 8l9 6 9-6 M21 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z';
  if (name === 'business-outline') path = 'M3 21h18 M3 7v14 M21 7v14 M9 21V11h6v10 M7 7h10 M7 3h10';
  if (name === 'briefcase-outline') path = 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 7V5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2';
  if (name === 'flask-outline') path = 'M9 3v12a3 3 0 0 0 6 0V3 M8 3h8 M12 15h.01';
  if (name === 'layers-outline') path = 'M12 2l9 4.91L12 11.82 3 6.91 12 2z M3 11.45l9 4.91 9-4.91 M3 15.91l9 4.91 9-4.91';
  if (name === 'text-outline') path = 'M4 7h16 M4 12h16 M4 17h10';
  if (name === 'information-circle-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01';
  if (name === 'close') path = 'M18 6L6 18 M6 6l12 12';
  if (name === 'checkmark-circle') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9 12l2 2 4-4';
  if (name === 'chevron-down') path = 'M6 9l6 6 6-6';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

const RESEARCH_AREAS = [
  'Space Weather',
  'Geospatial Analysis',
  'Satellite Technology',
  'Climate Modeling',
  'Planetary Science',
  'Aeronomy',
  'Magnetism',
  'Remote Sensing',
  'GIS Mapping',
  'Data Science',
];

const DIVISIONS = [
  'Aeronomy',
  'GIS Remote Sensing',
  'Planetary Science',
  'Space Operations',
  'Geospatial Division',
  'Research & Development',
  'Space Science',
];

export default function AccountScreen({ navigation }) {
  const { user } = useAuth();
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [staffId, setStaffId] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [division, setDivision] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [showDivisionModal, setShowDivisionModal] = useState(false);

  const bgColor = colors.background;
  const textColor = colors.text;
  const secondaryText = colors.rowTime;
  const borderColor = colors.border;
  const cardColor = colors.rowBg;
  const brandColor = colors.primary;
  const accentColor = colors.tabActiveBg;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.uid) {
          setName(user?.fullName || user?.name || '');
          setEmail(user?.email || '');
          setLoading(false);
          return;
        }

        const profile = await getUserProfile(user.uid);
        if (profile) {
          setName(profile.fullName || profile.name || user?.fullName || user?.name || '');
          setEmail(profile.email || user?.email || '');
          setStaffId(profile.staffId || '');
          setDepartment(profile.department || '');
          setRole(profile.role || '');
          setBio(profile.bio || '');
          setResearchArea(profile.researchArea || '');
          setDivision(profile.division || '');
          setAvatar(profile.photoURL || profile.avatar || null);
        } else {
          setName(user?.fullName || user?.name || '');
          setEmail(user?.email || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setName(user?.fullName || user?.name || '');
        setEmail(user?.email || '');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    Alert.alert('Save Profile', 'Feature coming soon!');
  };

  const renderPickerModal = (title, data, selectedValue, onSelect, visible, setVisible) => (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={() => setVisible(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
        <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a2e' : '#ffffff' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Icon name="close" size={24} color={secondaryText} />
            </TouchableOpacity>
          </View>

          <View style={[styles.modalDivider, { backgroundColor: borderColor }]} />

          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  selectedValue === item && { backgroundColor: accentColor + '20', borderColor: accentColor, borderWidth: 1 },
                ]}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    { color: selectedValue === item ? accentColor : textColor },
                    selectedValue === item && { fontWeight: '600' },
                  ]}
                >
                  {item}
                </Text>
                {selectedValue === item && (
                  <Icon name="checkmark-circle" size={22} color={accentColor} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColor} />
          <Text style={[styles.loadingText, { color: secondaryText }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Account</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
          <Text style={[styles.saveText, { color: brandColor, opacity: saving ? 0.5 : 1 }]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.avatarWrapper} onPress={() => Alert.alert('Avatar', 'Changing avatar coming soon!')}>
          <View style={[styles.avatarContainer, { borderColor: accentColor }]}>
            <Image
              source={avatar ? { uri: avatar } : DEFAULT_AVATAR}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={[styles.editAvatarBtn, { backgroundColor: accentColor }]}>
              <Icon name="camera-outline" size={18} color="#ffffff" />
            </View>
          </View>
          <Text style={[styles.changePhotoText, { color: secondaryText }]}>Tap to change photo</Text>
        </TouchableOpacity>

        <View style={[styles.formCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Icon name="id-card-outline" size={16} color={accentColor} />
              <Text style={[styles.label, { color: secondaryText, marginLeft: 6 }]}>Staff ID</Text>
            </View>
            <TextInput
              style={[styles.input, { color: textColor, borderBottomColor: borderColor }]}
              value={staffId}
              onChangeText={setStaffId}
              placeholder="e.g., SSGI-2025-001"
              placeholderTextColor={secondaryText}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Icon name="person-outline" size={16} color={accentColor} />
              <Text style={[styles.label, { color: secondaryText, marginLeft: 6 }]}>Full Name</Text>
            </View>
            <TextInput
              style={[styles.input, { color: textColor, borderBottomColor: borderColor }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={secondaryText}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Icon name="mail-outline" size={16} color={accentColor} />
              <Text style={[styles.label, { color: secondaryText, marginLeft: 6 }]}>Email</Text>
            </View>
            <TextInput
              style={[styles.input, { color: textColor, borderBottomColor: borderColor }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={secondaryText}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Icon name="business-outline" size={16} color={accentColor} />
              <Text style={[styles.label, { color: secondaryText, marginLeft: 6 }]}>Department</Text>
            </View>
            <TextInput
              style={[styles.input, { color: textColor, borderBottomColor: borderColor }]}
              value={department}
              onChangeText={setDepartment}
              placeholder="e.g., Geospatial Division"
              placeholderTextColor={secondaryText}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Icon name="briefcase-outline" size={16} color={accentColor} />
              <Text style={[styles.label, { color: secondaryText, marginLeft: 6 }]}>Role / Title</Text>
            </View>
            <TextInput
              style={[styles.input, { color: textColor, borderBottomColor: borderColor }]}
              value={role}
              onChangeText={setRole}
              placeholder="e.g., Geospatial Analyst"
              placeholderTextColor={secondaryText}
            />
          </View>

          <TouchableOpacity style={styles.formGroup} onPress={() => setShowResearchModal(true)} activeOpacity={0.7}>
            <View style={styles.labelRow}>
              <Icon name="flask-outline" size={16} color={accentColor} />
              <Text style={[styles.label, { color: secondaryText, marginLeft: 6 }]}>Research Area</Text>
            </View>
            <View style={[styles.pickerField, { borderBottomColor: borderColor }]}>
              <Text style={[styles.pickerText, { color: researchArea ? textColor : secondaryText }]}>
                {researchArea || 'Select research area...'}
              </Text>
              <Icon name="chevron-down" size={20} color={secondaryText} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.formGroup} onPress={() => setShowDivisionModal(true)} activeOpacity={0.7}>
            <View style={styles.labelRow}>
              <Icon name="layers-outline" size={16} color={accentColor} />
              <Text style={[styles.label, { color: secondaryText, marginLeft: 6 }]}>Division</Text>
            </View>
            <View style={[styles.pickerField, { borderBottomColor: borderColor }]}>
              <Text style={[styles.pickerText, { color: division ? textColor : secondaryText }]}>
                {division || 'Select division...'}
              </Text>
              <Icon name="chevron-down" size={20} color={secondaryText} />
            </View>
          </TouchableOpacity>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Icon name="text-outline" size={16} color={accentColor} />
              <Text style={[styles.label, { color: secondaryText, marginLeft: 6 }]}>Bio / About Me</Text>
            </View>
            <TextInput
              style={[styles.bioInput, { color: textColor, borderColor: borderColor }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={secondaryText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.noteContainer}>
          <Icon name="information-circle-outline" size={18} color={secondaryText} />
          <Text style={[styles.noteText, { color: secondaryText, marginLeft: 8 }]}>
            Changes will be saved to your profile.
          </Text>
        </View>
      </ScrollView>

      {renderPickerModal(
        'Select Research Area',
        RESEARCH_AREAS,
        researchArea,
        setResearchArea,
        showResearchModal,
        setShowResearchModal
      )}

      {renderPickerModal(
        'Select Division',
        DIVISIONS,
        division,
        setDivision,
        showDivisionModal,
        setShowDivisionModal
      )}
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
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  saveButton: { padding: 8 },
  saveText: { fontSize: 16, fontWeight: '600' },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 16 },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    overflow: 'hidden',
  },
  avatar: {
    width: 100,
    height: 100,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a0e1a',
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 13,
    opacity: 0.6,
  },
  formCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    fontSize: 16,
    paddingLeft: 0,
  },
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  pickerText: {
    fontSize: 16,
  },
  bioInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 80,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  noteText: {
    fontSize: 13,
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '75%',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalDivider: {
    height: 1,
    marginBottom: 12,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
  },
  modalItemText: {
    fontSize: 16,
  },
});
