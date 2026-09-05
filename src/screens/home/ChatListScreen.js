import React, { useState, useEffect } from 'react';
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
  Image,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../firebase/context/AuthContext';
import { useTheme } from '../../firebase/context/ThemeContext';
import {
  subscribeToUserChats,
  getOrCreateSelfChat,
  subscribeToPinnedChatIds,
  togglePinChat,
} from '../../services/chatService';
import { useUserProfiles, getDisplayName } from '../../services/userService';

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'planet-outline') path = 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v12 M6 12h12';
  if (name === 'rocket-outline') path = 'M4.5 16.5c0 0 4.5 1.5 7.5-3s3-7.5 3-7.5-4.5-1.5-7.5 3-3 7.5-3 7.5z M8 13l-3 3 M11 10l3-3';
  if (name === 'map-outline') path = 'M1 6v15l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v15 M16 6v15';
  if (name === 'flask-outline') path = 'M9 3v12a3 3 0 0 0 6 0V3 M8 3h8 M12 15h.01';
  if (name === 'radio-outline') path = 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M12 7a5 5 0 1 0 0 10 M12 2a10 10 0 1 0 0 20';
  if (name === 'shield-checkmark') path = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4';
  if (name === 'pin') path = 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z';
  if (name === 'attach-outline') path = 'M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48';
  if (name === 'lock-closed') path = 'M7 11V7a5 5 0 0 1 10 0v4 M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z';
  if (name === 'add-circle-outline') path = 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v8 M8 12h8';
  if (name === 'notifications-outline') path = 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z M13.73 21a2 2 0 0 1-3.46 0';
  if (name === 'ellipsis-vertical') path = 'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0';
  if (name === 'search-outline') path = 'M21 21l-6-6 m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z';
  if (name === 'close-circle') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M15 9l-6 6 M9 9l6 6';
  if (name === 'chatbubble-outline') path = 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.1c1.5 0 3 .4 4.3 1.1L21 1.5l-1.1 4.2c.7 1.3 1.1 2.8 1.1 4.3z';
  if (name === 'people-outline') path = 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0-4-4 4 4 0 0 0 4 4z';
  if (name === 'sunny-outline') path = 'M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z';
  if (name === 'moon-outline') path = 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z';
  if (name === 'bookmark-outline') path = 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z';
  if (name === 'information-circle-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01';
  if (name === 'chatbubble-ellipses-outline') path = 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.1c1.5 0 3 .4 4.3 1.1L21 1.5l-1.1 4.2c.7 1.3 1.1 2.8 1.1 4.3z M8 12h.01 M12 12h.01 M16 12h.01';
  if (name === 'settings-outline') path = 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z';
  if (name === 'person-outline') path = 'M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

// ─── Department Tabs ────────────────────────────────────────────────────────
const DEPARTMENT_TABS = [
  { id: 'all', label: 'All', icon: 'planet-outline' },
  { id: 'space', label: 'Space Science', icon: 'rocket-outline' },
  { id: 'geospatial', label: 'Geospatial', icon: 'map-outline' },
  { id: 'research', label: 'Research', icon: 'flask-outline' },
  { id: 'operations', label: 'Operations', icon: 'radio-outline' },
];

const DEPARTMENT_TAG_MAP = {
  'Space Science': 'space',
  'Geospatial Division': 'geospatial',
  'Research': 'research',
  'Operations': 'operations',
  'Support': 'support',
};

export default function ChatsListScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const isDark = theme === 'dark';
  const [chats, setChats] = useState([]);
  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const searchInputRef = React.useRef(null);

  const bgColor = colors?.background || '#0a0e1a';
  const textColor = colors?.rowText || colors?.text || '#ffffff';
  const secondaryText = colors?.rowTime || '#a0a0b0';
  const cardColor = colors?.rowBg || 'rgba(255,255,255,0.06)';
  const brandColor = colors?.primary || '#1a4b8c';
  const accentColor = colors?.tabActiveBg || '#6c5ce7';
  const goldAccent = '#de994a';
  const borderColor = colors?.border || 'rgba(255,255,255,0.1)';

  const adminBadgeBg = isDark ? 'rgba(108, 92, 231, 0.2)' : 'rgba(108, 92, 231, 0.15)';
  const adminBadgeText = accentColor;
  const pinnedBorderColor = brandColor;
  const pinnedHeaderColor = isDark ? secondaryText : '#555555';

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToUserChats(user.uid, (fetchedChats) => {
      setChats(fetchedChats);
    });
    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToPinnedChatIds(user.uid, (ids) => {
      setPinnedIds(ids);
    });
    return unsubscribe;
  }, [user?.uid]);

  const directChatOtherUids = chats
    .filter((chat) => chat.type === 'direct')
    .map((chat) => chat.participants?.find((uid) => uid !== user?.uid))
    .filter(Boolean);
  const userProfiles = useUserProfiles(directChatOtherUids);

  const getChatDisplayName = (chat) => {
    if (chat.type === 'group') return chat.groupName || chat.name || 'Group';
    const otherUid = chat.participants?.find((uid) => uid !== user?.uid);
    return getDisplayName(userProfiles, otherUid);
  };

  const getChatPreviewText = (chat) => {
    return chat.lastMessage?.text || 'No messages yet';
  };

  const getChatTime = (chat) => {
    const timestamp = chat.lastMessage?.timestamp || chat.updatedAt;
    if (!timestamp || typeof timestamp.toDate !== 'function') return '';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDepartmentTag = (chat) => {
    if (chat.type !== 'group') return 'personal';
    return DEPARTMENT_TAG_MAP[chat.department] || 'other';
  };

  const getDepartmentLabel = (chat) => {
    if (chat.type !== 'group') return 'Personal';
    return chat.department || 'Group';
  };

  const isChatAdmin = (chat) => {
    return chat.type === 'group' && chat.admins?.includes(user?.uid);
  };

  const filteredChats = chats.filter((chat) => {
    if (activeTab !== 'all' && getDepartmentTag(chat) !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = getChatDisplayName(chat).toLowerCase();
      const preview = getChatPreviewText(chat).toLowerCase();
      const dept = getDepartmentLabel(chat).toLowerCase();
      return name.includes(q) || preview.includes(q) || dept.includes(q);
    }
    return true;
  });

  const pinnedChats = filteredChats.filter((c) => pinnedIds.has(c.id));
  const unpinnedChats = filteredChats.filter((c) => !pinnedIds.has(c.id));

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  const handleDayMode = () => {
    setShowMenu(false);
    toggleTheme();
  };

  const openNewChat = () => {
    setShowMenu(false);
    navigation.navigate('NewChat');
  };

  const openNewGroup = () => {
    setShowMenu(false);
    navigation.navigate('NewGroup');
  };

  const handleSavedMessages = async () => {
    setShowMenu(false);
    if (!user?.uid) return;
    try {
      const chatId = await getOrCreateSelfChat(user.uid);
      navigation.navigate('ChatWindow', {
        chatId: chatId,
        contactName: 'Saved Messages',
      });
    } catch (error) {
      console.error('Error starting self-chat:', error);
      Alert.alert('Error', 'Could not open Saved Messages.');
    }
  };

  const openAboutSSGI = () => {
    setShowMenu(false);
    Alert.alert('About SSGI', 'Space Science and Geospatial Institute — established 2022.');
  };

  const handleLongPressChat = (chat) => {
    if (!user?.uid) return;
    const isPinned = pinnedIds.has(chat.id);
    togglePinChat(user.uid, chat.id, !isPinned).catch((error) => {
      console.error('Failed to toggle pin:', error);
      Alert.alert('Error', 'Could not update pin. Please try again.');
    });
  };

  const renderChatItem = ({ item }) => {
    const isGroup = item.type === 'group';
    const isPinned = pinnedIds.has(item.id);
    const isAdmin = isChatAdmin(item);
    const isUrgent = !!item.isUrgent;
    const hasFiles = item.lastMessage?.type === 'file';
    const displayName = getChatDisplayName(item);

    return (
      <TouchableOpacity
        style={[
          styles.chatRow,
          isPinned && [styles.pinnedRow, { borderLeftColor: pinnedBorderColor }],
          { backgroundColor: cardColor, borderBottomColor: borderColor },
        ]}
        onPress={() =>
          navigation.navigate('ChatWindow', {
            chatId: item.id,
            contactName: displayName,
            groupDetails: isGroup
              ? {
                  name: item.groupName,
                  department: item.department,
                  participants: item.participants,
                  admins: item.admins,
                }
              : null,
          })
        }
        onLongPress={() => handleLongPressChat(item)}
        delayLongPress={350}
        activeOpacity={0.6}
      >
        <View style={[styles.avatar, isGroup && styles.avatarGroup]}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          {isAdmin && (
            <View style={[styles.adminDot, { borderColor: isDark ? '#0a0e1a' : '#ffffff' }]}>
              <Icon name="shield-checkmark" size={10} color="#ffffff" />
            </View>
          )}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatTopRow}>
            <View style={styles.nameRow}>
              {isPinned && (
                <Icon
                  name="pin"
                  size={12}
                  color={pinnedBorderColor}
                />
              )}
              <Text style={[styles.chatName, { color: textColor, marginLeft: isPinned ? 4 : 0 }]} numberOfLines={1}>
                {displayName}
              </Text>
              {isUrgent && <Text style={styles.urgentIcon}>🚨</Text>}
              {isAdmin && (
                <View style={[styles.adminBadge, { backgroundColor: adminBadgeBg }]}>
                  <Text style={[styles.adminBadgeText, { color: adminBadgeText }]}>Admin</Text>
                </View>
              )}
            </View>
            <Text style={[styles.chatTime, { color: secondaryText }]}>{getChatTime(item)}</Text>
          </View>

          <View style={styles.chatBottomRow}>
            <Text style={[styles.chatPreview, { color: secondaryText }]} numberOfLines={1}>
              {getChatPreviewText(item)}
            </Text>
            {item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: brandColor }]}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>

          <View style={styles.chatMetaRow}>
            <Text style={[styles.departmentLabel, { color: accentColor }]}>
              {getDepartmentLabel(item)}
            </Text>
            <View style={styles.iconRow}>
              {hasFiles && (
                <Icon name="attach-outline" size={14} color={secondaryText} />
              )}
              <View style={{marginLeft: 4}}>
                <Icon name="lock-closed" size={12} color={secondaryText} />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ item }) => {
    if (!item.isSectionHeader) return null;
    return (
      <View style={[styles.sectionRow, { backgroundColor: cardColor }]}>
        <View style={[styles.sectionLine, { backgroundColor: borderColor }]} />
        <Text style={[styles.sectionLabel, { color: secondaryText }]}>{item.title}</Text>
        <View style={[styles.sectionLine, { backgroundColor: borderColor }]} />
      </View>
    );
  };

  const renderPinnedHeader = () => {
    if (pinnedChats.length === 0) return null;
    return (
      <View style={[styles.pinnedHeader, { borderBottomColor: borderColor }]}>
        <Icon name="pin" size={16} color={brandColor} />
        <Text style={[styles.pinnedHeaderText, { color: pinnedHeaderColor, marginLeft: 6 }]}>PINNED</Text>
      </View>
    );
  };

  const buildUnpinnedListData = () => {
    if (activeTab !== 'all') return unpinnedChats;
    const groupChats = unpinnedChats.filter((c) => c.type === 'group');
    const directChats = unpinnedChats.filter((c) => c.type === 'direct');
    if (directChats.length === 0) return groupChats;
    return [
      ...groupChats,
      { id: 'sec-contacts', isSectionHeader: true, title: 'contacts' },
      ...directChats,
    ];
  };

  const unpinnedListData = buildUnpinnedListData();

  const renderListItem = ({ item }) => {
    if (item.isSectionHeader) return renderSectionHeader({ item });
    return renderChatItem({ item });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={[styles.pillBtn, { backgroundColor: goldAccent }]}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.pillBtnText}>Edit</Text>
          </TouchableOpacity>

          <View style={[styles.titlePill, { backgroundColor: goldAccent }]}>
            <Text style={styles.titlePillText}>chats</Text>
          </View>

          <View style={styles.rightControls}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Contacts')}
              activeOpacity={0.7}
              style={{ marginRight: 12 }}
            >
              <Icon name="add-circle-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.7}
              style={{ marginRight: 12 }}
            >
              <Icon name="notifications-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMenu(!showMenu)} activeOpacity={0.7}>
              <Icon name="ellipsis-vertical" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)', borderColor: borderColor }]}>
          <Icon name="search-outline" size={18} color={secondaryText} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: textColor, marginLeft: 8 }]}
            placeholder="Search chats or people..."
            placeholderTextColor={secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Icon name="close-circle" size={18} color={secondaryText} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {DEPARTMENT_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                { borderColor: borderColor },
                activeTab === tab.id && [styles.tabActive, { backgroundColor: brandColor }],
              ]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.7}
            >
              <Icon
                name={tab.icon}
                size={16}
                color={activeTab === tab.id ? '#ffffff' : secondaryText}
              />
              <Text style={[styles.tabText, { color: activeTab === tab.id ? '#ffffff' : secondaryText, marginLeft: 4 }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={unpinnedListData}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          pinnedChats.length > 0 ? (
            <>
              {renderPinnedHeader()}
              {pinnedChats.map((item) => (
                <View key={item.id}>{renderChatItem({ item })}</View>
              ))}
              <View style={[styles.divider, { borderBottomColor: borderColor, marginLeft: 0 }]} />
            </>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={[styles.divider, { borderBottomColor: borderColor }]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chatbubble-outline" size={48} color={secondaryText} />
            <Text style={[styles.emptyText, { color: secondaryText }]}>No chats found</Text>
          </View>
        }
      />

      {showMenu && (
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuContainer, { backgroundColor: cardColor, borderColor: borderColor }]}>
            <TouchableOpacity style={styles.menuItem} onPress={openNewChat}>
              <Icon name="chatbubble-outline" size={20} color={accentColor} />
              <Text style={[styles.menuItemText, { color: textColor, marginLeft: 12 }]}>New Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={openNewGroup}>
              <Icon name="people-outline" size={20} color={brandColor} />
              <Text style={[styles.menuItemText, { color: textColor, marginLeft: 12 }]}>New Group</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
            <TouchableOpacity style={styles.menuItem} onPress={handleDayMode}>
              <Icon name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={secondaryText} />
              <Text style={[styles.menuItemText, { color: textColor, marginLeft: 12 }]}>
                {isDark ? 'Day Mode' : 'Night Mode'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleSavedMessages}>
              <Icon name="bookmark-outline" size={20} color={secondaryText} />
              <Text style={[styles.menuItemText, { color: textColor, marginLeft: 12 }]}>Saved Messages</Text>
            </TouchableOpacity>
            <View style={[styles.menuDivider, { backgroundColor: borderColor }]} />
            <TouchableOpacity style={styles.menuItem} onPress={openAboutSSGI}>
              <Icon name="information-circle-outline" size={20} color={secondaryText} />
              <Text style={[styles.menuItemText, { color: textColor, marginLeft: 12 }]}>About SSGI</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <View style={[styles.bottomBar, { backgroundColor: bgColor, borderTopColor: borderColor }]}>
        <View style={[styles.navCapsule, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
          <TouchableOpacity style={styles.navBtn} activeOpacity={0.7} onPress={() => setActiveTab('all')}>
            <Icon
              name="chatbubble-ellipses-outline"
              size={24}
              color={activeTab === 'all' ? brandColor : '#aaaaaa'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} activeOpacity={0.7} onPress={openNewGroup}>
            <Icon name="people-outline" size={24} color="#aaaaaa" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings-outline" size={24} color="#aaaaaa" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Profile')}>
            {user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.navAvatar} />
            ) : (
              <Icon name="person-outline" size={24} color="#aaaaaa" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal transparent animationType="fade" visible={showLogoutModal} onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out{user?.fullName || user?.name ? `, ${user.fullName || user.name}` : ''}
              {user?.email ? ` (${user.email})` : ''}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLogoutModal(false)} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                <Text style={styles.logoutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'android' ? 10 : 4,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pillBtn: { borderRadius: 14, paddingVertical: 5, paddingHorizontal: 16 },
  pillBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  titlePill: { borderRadius: 14, paddingVertical: 5, paddingHorizontal: 22 },
  titlePillText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  tabsContainer: { paddingVertical: 4 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
  },
  tabActive: { borderColor: 'transparent' },
  tabText: { fontSize: 12, fontWeight: '600' },
  list: { flex: 1 },
  listContent: { paddingBottom: 20 },
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
    borderBottomWidth: 1,
  },
  pinnedRow: { borderLeftWidth: 3, paddingLeft: 13 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#b6b6b6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    position: 'relative',
  },
  avatarGroup: { borderWidth: 2, borderColor: '#6c5ce7' },
  avatarText: { fontSize: 20, fontWeight: '600', color: '#ffffff' },
  adminDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  chatInfo: { flex: 1 },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  chatName: { fontSize: 15, fontWeight: '600', flex: 1 },
  urgentIcon: { fontSize: 14, marginLeft: 4 },
  adminBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 6 },
  adminBadgeText: { fontSize: 9, fontWeight: '600' },
  chatTime: { fontSize: 11, marginLeft: 8 },
  chatBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatPreview: { fontSize: 13, flex: 1, marginRight: 8 },
  unreadBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { fontSize: 11, fontWeight: 'bold', color: '#ffffff' },
  chatMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  departmentLabel: { fontSize: 11, fontWeight: '500' },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  pinnedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  pinnedHeaderText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  divider: { borderBottomWidth: 1, marginLeft: 76 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, marginTop: 12 },
  menuOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },
  menuContainer: {
    position: 'absolute',
    top: 48,
    right: 14,
    width: 210,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    elevation: 8,
    zIndex: 1000,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  menuItemText: { fontSize: 15 },
  menuDivider: { height: 1, marginVertical: 4, marginHorizontal: 12 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    borderTopWidth: 1,
  },
  navCapsule: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 28,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  navBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  navAvatar: { width: 24, height: 24, borderRadius: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalBox: { backgroundColor: '#ffffff', borderRadius: 20, padding: 24, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#111111' },
  modalMessage: { fontSize: 14, lineHeight: 20, marginBottom: 24, color: '#555555' },
  modalButtons: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#cccccc',
    justifyContent: 'center', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#555555' },
  logoutBtn: {
    flex: 1, height: 46, borderRadius: 12, backgroundColor: '#c0392b',
    justifyContent: 'center', alignItems: 'center',
  },
  logoutBtnText: { fontSize: 15, fontWeight: 'bold', color: '#ffffff' },
});
