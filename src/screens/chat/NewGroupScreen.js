import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../firebase/context/ThemeContext';
import Typography from '../../components/Typography';
import { SPACING, RADIUS } from '../../constants/Typography';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../firebase/context/AuthContext';

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'person-add-outline') path = 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0-4-4 4 4 0 0 0 4 4z M19 8v6 M16 11h6';
  if (name === 'checkmark-circle') path = 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3';
  if (name === 'ellipse-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

const DEPARTMENTS = ['Space Science', 'Geospatial Division', 'Research', 'Operations', 'Support'];

export default function NewGroupScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'addMembers'
  const [groupName, setGroupName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [creating, setCreating] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const bgColor = colors?.background || '#0a0e1a';
  const textColor = colors?.text || '#ffffff';
  const secondaryText = colors?.rowTime || '#a0a0b0';
  const borderColor = colors?.border || 'rgba(255,255,255,0.08)';
  const cardColor = colors?.rowBg || 'rgba(255,255,255,0.06)';
  const brandColor = colors?.primary || '#1a4b8c';
  const accentColor = colors?.tabActiveBg || '#6c5ce7';

  useEffect(() => {
    if (activeTab === 'addMembers' && allUsers.length === 0) {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const snapshot = await firestore().collection('users').get();
      const usersList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== user?.uid);
      setAllUsers(usersList);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUserSelection = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const toggleDepartment = (dept) => {
    setSelectedDepartment(dept === selectedDepartment ? '' : dept);
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name.');
      return;
    }
    if (!selectedDepartment) {
      Alert.alert('Error', 'Please select a department.');
      return;
    }
    if (!user?.uid) return;

    setCreating(true);
    try {
      const participants = [user.uid, ...selectedUserIds];
      const newGroupRef = await firestore().collection('chats').add({
        groupName: groupName.trim(),
        department: selectedDepartment,
        admins: [user.uid],
        participants: participants,
        createdBy: user.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        type: 'group',
        lastMessage: null,
      });

      navigation.replace('ChatWindow', {
        chatId: newGroupRef.id,
        contactName: groupName.trim(),
        groupDetails: {
          name: groupName.trim(),
          department: selectedDepartment,
          admins: [user.uid],
          participants: participants,
        },
      });
    } catch (error) {
      console.error('Failed to create group:', error);
      Alert.alert('Error', 'Could not create the group. Please try again.');
      setCreating(false);
    }
  };

  const renderUserItem = ({ item }) => {
    const isSelected = selectedUserIds.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.userRow, { borderBottomColor: borderColor }]}
        onPress={() => toggleUserSelection(item.id)}
      >
        <View style={[styles.userAvatar, { backgroundColor: brandColor }]}>
          <Text style={styles.avatarText}>{(item.fullName || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Typography variant="body" color={textColor}>{item.fullName || 'Unnamed'}</Typography>
          <Typography variant="caption" color={secondaryText}>{item.email}</Typography>
        </View>
        <Icon
          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={isSelected ? brandColor : secondaryText}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <Typography variant="heading3" color={textColor} style={styles.headerTitle}>
          New Group
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && { borderBottomColor: brandColor }]}
          onPress={() => setActiveTab('create')}
        >
          <Typography variant="body" color={activeTab === 'create' ? brandColor : secondaryText}>Create</Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'addMembers' && { borderBottomColor: brandColor }]}
          onPress={() => setActiveTab('addMembers')}
        >
          <Typography variant="body" color={activeTab === 'addMembers' ? brandColor : secondaryText}>Add Members</Typography>
        </TouchableOpacity>
      </View>

      {activeTab === 'create' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.inputCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
            <Typography variant="label" color={secondaryText}>GROUP NAME</Typography>
            <TextInput
              style={[styles.input, { color: textColor, borderBottomColor: borderColor }]}
              placeholder="Enter group name"
              placeholderTextColor={secondaryText}
              value={groupName}
              onChangeText={setGroupName}
              editable={!creating}
            />
          </View>

          <View style={[styles.inputCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
            <Typography variant="label" color={secondaryText}>DEPARTMENT</Typography>
            <View style={styles.deptContainer}>
              {DEPARTMENTS.map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={[
                    styles.deptChip,
                    { backgroundColor: selectedDepartment === dept ? brandColor : 'rgba(255,255,255,0.05)', borderColor: borderColor },
                  ]}
                  onPress={() => toggleDepartment(dept)}
                  activeOpacity={0.7}
                  disabled={creating}
                >
                  <Typography
                    variant="caption"
                    color={selectedDepartment === dept ? '#ffffff' : secondaryText}
                  >
                    {dept}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.inputCard, { backgroundColor: cardColor, borderColor: borderColor }]}
            onPress={() => setActiveTab('addMembers')}
          >
            <Typography variant="label" color={secondaryText}>SELECTED MEMBERS ({selectedUserIds.length})</Typography>
            <View style={styles.addMembersBtn}>
              <Icon name="person-add-outline" size={20} color={accentColor} />
              <Typography variant="body" color={accentColor} style={styles.addMembersText}>
                {selectedUserIds.length > 0 ? 'Edit selection' : 'Add members now'}
              </Typography>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainCreateButton, { backgroundColor: brandColor }, creating && { opacity: 0.7 }]}
            onPress={createGroup}
            disabled={creating}
            activeOpacity={0.8}
          >
            {creating ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.mainCreateButtonText}>CREATE GROUP</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.membersListContainer}>
          {loadingUsers ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={brandColor} />
          ) : (
            <FlatList
              data={allUsers}
              renderItem={renderUserItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.membersList}
              ListEmptyComponent={
                <Typography variant="body" color={secondaryText} style={{ textAlign: 'center', marginTop: 20 }}>No users found</Typography>
              }
            />
          )}

          <TouchableOpacity
            style={[styles.floatingCreateButton, { backgroundColor: brandColor }]}
            onPress={() => setActiveTab('create')}
            activeOpacity={0.9}
          >
            <Text style={styles.floatingCreateButtonText}>Confirm Selection ({selectedUserIds.length})</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: SPACING.base,
    paddingTop: Platform.OS === 'ios' ? 0 : SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backButton: { padding: SPACING.xs, width: 40 },
  headerTitle: { flex: 1, textAlign: 'center' },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  inputCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: SPACING.sm,
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  deptContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  deptChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  addMembersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  addMembersText: {
    marginLeft: SPACING.sm,
  },
  membersListContainer: { flex: 1 },
  membersList: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  userInfo: { flex: 1 },
  mainCreateButton: {
    height: 56,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  mainCreateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  floatingCreateButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  floatingCreateButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
