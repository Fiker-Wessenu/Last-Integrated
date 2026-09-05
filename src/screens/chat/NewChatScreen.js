import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  ActivityIndicator,
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
  if (name === 'chevron-forward-outline') path = 'M9 5l7 7-7 7';
  if (name === 'search-outline') path = 'M21 21l-6-6 m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z';
  if (name === 'close-circle') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M15 9l-6 6 M9 9l6 6';
  if (name === 'people-outline') path = 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0-4-4 4 4 0 0 0 4 4z';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

export default function NewChatScreen({ navigation, route }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingChatWith, setStartingChatWith] = useState(null);

  const bgColor = colors?.background || '#0a0e1a';
  const textColor = colors?.text || '#ffffff';
  const secondaryText = colors?.rowTime || '#a0a0b0';
  const borderColor = colors?.border || 'rgba(255,255,255,0.08)';
  const cardColor = colors?.rowBg || 'rgba(255,255,255,0.06)';
  const brandColor = colors?.primary || '#1a4b8c';

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('users')
      .onSnapshot(
        (snapshot) => {
          const users = snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter((u) => u.id !== user?.uid);
          setAllUsers(users);
          setFilteredUsers(users);
          setLoading(false);
        },
        (error) => {
          console.error('Failed to load users:', error);
          setLoading(false);
        }
      );

    return unsubscribe;
  }, [user?.uid]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim()) {
      const q = text.toLowerCase();
      setFilteredUsers(
        allUsers.filter(
          (u) =>
            (u.fullName || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredUsers(allUsers);
    }
  };

  const startChat = async (otherUser) => {
    if (!user?.uid || startingChatWith) return;
    setStartingChatWith(otherUser.id);
    try {
      if (route.params?.addMemberToChatId) {
        const chatId = route.params.addMemberToChatId;
        await firestore().collection('chats').doc(chatId).update({
          participants: firestore.FieldValue.arrayUnion(otherUser.id),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        Alert.alert('Success', `${otherUser.fullName || 'User'} added to group.`);
        navigation.goBack();
        return;
      }

      const existing = await firestore()
        .collection('chats')
        .where('type', '==', 'direct')
        .where('participants', 'array-contains', user.uid)
        .get();

      let chatId = existing.docs.find((docSnap) =>
        (docSnap.data().participants || []).includes(otherUser.id)
      )?.id;

      if (!chatId) {
        const newChatRef = await firestore().collection('chats').add({
          type: 'direct',
          participants: [user.uid, otherUser.id],
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
          lastMessage: null,
          createdBy: user.uid,
        });
        chatId = newChatRef.id;
      }

      navigation.navigate('ChatWindow', {
        chatId,
        contactName: otherUser.fullName || otherUser.email || 'Chat',
      });
    } catch (error) {
      console.error('Failed to start chat:', error);
      Alert.alert('Error', 'Could not start chat. Please try again.');
    } finally {
      setStartingChatWith(null);
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={[styles.userItem, { backgroundColor: cardColor, borderBottomColor: borderColor }]}
      onPress={() => startChat(item)}
      activeOpacity={0.6}
      disabled={!!startingChatWith}
    >
      <View style={[styles.avatar, { backgroundColor: brandColor }]}>
        <Typography variant="heading3" color="#ffffff">
          {(item.fullName || item.email || '?').charAt(0).toUpperCase()}
        </Typography>
      </View>
      <View style={styles.userInfo}>
        <Typography variant="body" color={textColor}>{item.fullName || 'Unnamed User'}</Typography>
        <Typography variant="caption" color={secondaryText} style={styles.userEmail}>{item.email}</Typography>
      </View>
      {startingChatWith === item.id ? (
        <ActivityIndicator size="small" color={brandColor} />
      ) : (
        <Icon name="chevron-forward-outline" size={18} color={secondaryText} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <Typography variant="heading3" color={textColor} style={styles.headerTitle}>
          New Chat
        </Typography>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.searchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderColor: borderColor }]}>
        <Icon name="search-outline" size={18} color={secondaryText} />
        <TextInput
          style={[styles.searchInput, { color: textColor, marginLeft: 8 }]}
          placeholder="Search by name or email..."
          placeholderTextColor={secondaryText}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close-circle" size={18} color={secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loadingIndicator} size="large" color={brandColor} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={48} color={secondaryText} />
              <Typography variant="body" color={secondaryText} style={styles.emptyText}>
                No users found
              </Typography>
            </View>
          }
        />
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backButton: { padding: SPACING.xs, width: 40 },
  headerTitle: { flex: 1, textAlign: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 0 },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING['2xl'] },
  loadingIndicator: { marginTop: 40 },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderBottomWidth: 1,
    marginBottom: SPACING.xs,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  userInfo: { flex: 1 },
  userEmail: { marginTop: SPACING.xs, opacity: 0.6 },
  emptyContainer: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyText: { marginTop: SPACING.md },
});
