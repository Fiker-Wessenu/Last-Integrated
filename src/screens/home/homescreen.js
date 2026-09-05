import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useAuth } from '../../firebase/context/AuthContext';
import { useTheme } from '../../firebase/context/ThemeContext';
import { getAllUsers } from '../../services/userService';
import { createDirectChat } from '../../services/chatService';

export default function ContactsScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      const filtered = allUsers.filter(u =>
        u.uid !== user?.uid &&
        (u.email?.toLowerCase().includes(searchEmail.toLowerCase()) ||
         u.fullName?.toLowerCase().includes(searchEmail.toLowerCase()))
      );
      setUsers(filtered);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optionally load some initial suggested users
    const loadInitial = async () => {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers.filter(u => u.uid !== user?.uid).slice(0, 10));
      setLoading(false);
    };
    loadInitial();
  }, [user?.uid]);

  const handleStartChat = async (targetUser) => {
    try {
      const chatId = await createDirectChat(user.uid, targetUser.uid);
      navigation.navigate('ChatWindow', {
        chatId: chatId,
        contactName: targetUser.fullName || 'User',
      });
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.userRow, { borderBottomColor: colors.border }]}
      onPress={() => handleStartChat(item)}
    >
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>
          {(item.fullName || 'U').substring(0, 1).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.fullName || 'Unknown'}</Text>
        <Text style={[styles.userEmail, { color: colors.rowTime }]}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <Text style={styles.headerTitle}>Find People</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
          placeholder="Search by name or email..."
          placeholderTextColor={colors.rowTime}
          value={searchEmail}
          onChangeText={setSearchEmail}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={{ color: colors.rowTime }}>No users found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchButton: {
    backgroundColor: '#1B5674',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#de994a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
  },
});
