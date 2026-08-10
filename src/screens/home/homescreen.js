import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const INITIAL_CHATS = [
  {
    id: '1',
    name: 'Geology Department',
    message: 'Dr. Alene (Admin): upload terrain reports by 4 PM.',
    time: '11:45 AM',
    type: 'department',
    unread: 2,
    groupDetails: {
      name: 'Geology Department',
      description: 'Space Science and Geospatial Institute — Geology Exploration Team',
      leader: 'Dr. Alene',
      members: [
        { name: 'Dr. Alene', role: 'Geology Dept Head & Admin' },
        { name: 'Natan Ethiopia', role: 'Staff Geologist' },
        { name: 'Sara Tekle', role: 'Geospatial Analyst' },
        { name: 'Abebe Kebede', role: 'Survey Technician' },
      ],
    },
  },
  { id: 'sec-contacts', isSectionHeader: true, title: 'contacts' },
  {
    id: '2',
    name: 'Natan Ethiopia',
    message: 'The telemetry readings are stable.',
    time: '11:42 AM',
    type: 'chats',
    unread: 0,
  },
  {
    id: '3',
    name: 'Space Operations',
    message: 'Dir. Kassa (Admin): launch checklist ready.',
    time: '10:35 AM',
    type: 'department',
    unread: 5,
    groupDetails: {
      name: 'Space Operations',
      description: 'SSGI — Orbital Launch and Telemetry Coordination Division',
      leader: 'Director Kassa',
      members: [
        { name: 'Director Kassa', role: 'Operations Head & Admin' },
        { name: 'Eshatu Tola', role: 'Communications Engineer' },
        { name: 'Biniam Yosef', role: 'Orbit Analyst' },
      ],
    },
  },
  {
    id: '4',
    name: 'Dr. Alene',
    message: 'Meeting scheduled for tomorrow at 10 AM.',
    time: '09:10 AM',
    type: 'chats',
    unread: 1,
  },
  {
    id: '5',
    name: 'Geospatial Division',
    message: 'Amina (Admin): coordinate data updated.',
    time: 'Yesterday',
    type: 'department',
    unread: 0,
    groupDetails: {
      name: 'Geospatial Division',
      description: 'SSGI — Mapping, Cartography & GIS Remote Sensing Staff',
      leader: 'Amina Mohammed',
      members: [
        { name: 'Amina Mohammed', role: 'Division Chief & Admin' },
        { name: 'Yared Tesfaye', role: 'GIS Coordinator' },
        { name: 'Helen Yohannes', role: 'Remote Sensing Expert' },
      ],
    },
  },
  {
    id: '6',
    name: 'Orbit Chat Support',
    message: 'Welcome to your premium orbital terminal.',
    time: 'Yesterday',
    type: 'chats',
    unread: 0,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChatsListScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const searchInputRef = useRef(null);

  const filteredData = INITIAL_CHATS.filter((item) => {
    if (item.isSectionHeader) return true;
    if (activeTab === 'chats' && item.type !== 'chats') return false;
    if (activeTab === 'department' && item.type !== 'department') return false;
    if (searchQuery.trim()) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }).filter((item, index, arr) => {
    if (item.isSectionHeader) {
      const next = arr[index + 1];
      return next && !next.isSectionHeader;
    }
    return true;
  });

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  const handleDayMode = () => {
    setShowMenu(false);
    toggleTheme();
  };

  const handleNewGroup = () => {
    setShowMenu(false);
    Alert.alert('New Group', 'Create a new group chat.');
  };

  const handleSavedMessages = () => {
    setShowMenu(false);
    Alert.alert('Saved Messages', 'Your saved messages will appear here.');
  };

  const handleWallet = () => {
    setShowMenu(false);
    Alert.alert('Wallet', 'Your wallet balance and transactions.');
  };

  const renderItem = ({ item }) => {
    if (item.isSectionHeader) {
      return (
        <View style={[styles.sectionRow, { backgroundColor: colors.rowBg }]}>
          <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.sectionLabel, { color: colors.rowTime }]}>{item.title}</Text>
          <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
        </View>
      );
    }

    const isGroup = item.type === 'department';

    return (
      <TouchableOpacity
        style={[styles.chatRow, { backgroundColor: colors.rowBg }]}
        onPress={() =>
          navigation.navigate('ChatWindow', {
            contactName: item.name,
            groupDetails: item.groupDetails,
          })
        }
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, isGroup && styles.avatarGroup]}>
          <Svg width={26} height={26} viewBox="0 0 24 24">
            {isGroup ? (
              <Path
                d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z"
                fill="#ffffff"
              />
            ) : (
              <Path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                fill="#ffffff"
              />
            )}
          </Svg>
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatTopRow}>
            <Text style={[styles.chatName, { color: colors.rowText }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.chatTime, { color: colors.rowTime }]}>{item.time}</Text>
          </View>
          <View style={styles.chatBottomRow}>
            <Text style={[styles.chatPreview, { color: colors.rowPreview }]} numberOfLines={1}>
              {item.message}
            </Text>
            {item.unread > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.unreadBg }]}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.pillBtn} onPress={() => setShowLogoutModal(true)}>
            <Text style={styles.pillBtnText}>Edit</Text>
          </TouchableOpacity>

          <View style={styles.titlePill}>
            <Text style={styles.titlePillText}>chats</Text>
          </View>

          <View style={styles.rightControls}>
            <TouchableOpacity
              onPress={() => Alert.alert('Notifications', 'No new notifications')}
              activeOpacity={0.7}
              style={{ marginRight: 10 }}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path
                  d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                  fill={colors.headerText}
                />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMenu(true)} activeOpacity={0.7}>
              <Ionicons name="ellipsis-vertical" size={22} color={colors.headerText} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.searchBg }]}>
          <Svg width={15} height={15} viewBox="0 0 24 24" style={{ marginRight: 6 }}>
            <Path
              d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              fill="#8a8a8a"
            />
          </Svg>
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.searchText }]}
            placeholder="Search"
            placeholderTextColor="#8a8a8a"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  fill="#8a8a8a"
                />
              </Svg>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabRow}>
          {['All', 'chats', 'department'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                { backgroundColor: colors.tabBg },
                activeTab === tab && { backgroundColor: colors.tabActiveBg },
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.tabText },
                  activeTab === tab && { color: colors.tabActiveText },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={[styles.list, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: colors.border }]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.rowTime }]}>No chats found</Text>
          </View>
        }
      />

      <View style={[styles.bottomBar, { backgroundColor: colors.bottomBarBg }]}>
        <View style={[styles.navCapsule, { backgroundColor: colors.navCapsuleBg }]}>
          <TouchableOpacity style={styles.navBtn} onPress={() => setActiveTab('All')}>
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path
                d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                fill={activeTab === 'All' ? colors.navIconActive : colors.navIconInactive}
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navBtn} onPress={() => setActiveTab('department')}>
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path
                d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z"
                fill={activeTab === 'department' ? colors.navIconActive : colors.navIconInactive}
              />
            </Svg>
        </TouchableOpacity>

         {/* profile button and finc */}
        <TouchableOpacity style={styles.navBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Profile')}>
          {user?.profilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              style={styles.navAvatar}
            />
          ) : (
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                fill="#aaaaaa"
              />
            </Svg>
          )}
        </TouchableOpacity>
        </View>

        {/* Search button */}
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: colors.navIconActive }]}
          onPress={() => searchInputRef.current && searchInputRef.current.focus()}
          activeOpacity={0.8}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path
              d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              fill="#ffffff"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* 3-dot Menu Modal */}
      <Modal transparent visible={showMenu} onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: colors.modalBg }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleDayMode}>
              <Ionicons name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.modalText} />
              <Text style={[styles.menuText, { color: colors.modalText }]}>
                {theme === 'dark' ? 'Day Mode' : 'Night Mode'}
              </Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.menuItem} onPress={handleNewGroup}>
              <Ionicons name="people-outline" size={22} color={colors.modalText} />
              <Text style={[styles.menuText, { color: colors.modalText }]}>New Group</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.menuItem} onPress={handleSavedMessages}>
              <Ionicons name="bookmark-outline" size={22} color={colors.modalText} />
              <Text style={[styles.menuText, { color: colors.modalText }]}>Saved Messages</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.menuItem} onPress={handleWallet}>
              <Ionicons name="wallet-outline" size={22} color={colors.modalText} />
              <Text style={[styles.menuText, { color: colors.modalText }]}>Wallet</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Logout Modal */}
      <Modal transparent animationType="fade" visible={showLogoutModal} onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.modalBg }]}>
            <Text style={[styles.modalTitle, { color: colors.modalText }]}>Sign Out</Text>
            <Text style={[styles.modalMessage, { color: colors.rowPreview }]}>
              Are you sure you want to sign out{user?.name ? `, ${user.name}` : ''}
              {user?.email ? ` (${user.email})` : ''}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  header: {
    paddingTop: Platform.OS === 'android' ? 10 : 4,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pillBtn: {
    backgroundColor: '#de994a',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 16,
  },
  pillBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  titlePill: {
    backgroundColor: '#de994a',
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 22,
  },
  titlePillText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    padding: 8,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  tabRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  list: { flex: 1 },
  listContent: { paddingBottom: 20 },
  divider: { height: 1, marginLeft: 76 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionLine: { flex: 1, height: 1 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    marginHorizontal: 10,
    textTransform: 'lowercase',
  },

  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#b6b6b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarGroup: { backgroundColor: '#1b5674' },

  chatInfo: { flex: 1 },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  chatTime: { fontSize: 11 },
  chatBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatPreview: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: { fontSize: 16 },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    gap: 12,
  },
  navCapsule: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 28,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  searchBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalBox: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555555',
  },
  logoutBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#c0392b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 55,
    paddingRight: 20,
  },
  menuContainer: {
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  navAvatar: {
  width: 28,
  height: 28,
  borderRadius: 14,
  borderWidth: 2,
  borderColor: '#1B5674',
},
});
