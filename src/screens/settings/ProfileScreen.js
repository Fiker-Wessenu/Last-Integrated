import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Simple default avatar — a neutral placeholder image URL.
// Swap this for a bundled local asset if you'd rather not depend on a URL:
// require('../assets/default-avatar.png')
const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y&s=200';

export default function AccountScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = auth().currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = firestore()
      .collection('users')
      .doc(uid)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            setProfile(doc.data());
          }
          setLoading(false);
        },
        (error) => {
          console.error('Failed to load profile:', error);
          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const avatarSource = profile?.photoURL
    ? { uri: profile.photoURL }
    : { uri: DEFAULT_AVATAR };

  return (
    <View style={styles.container}>
      <Image source={avatarSource} style={styles.avatar} />

      <Text style={styles.name}>
        {profile?.fullName || 'No name set'}
      </Text>

      <Text style={styles.email}>
        {profile?.email}
      </Text>

      {/* Photo upload button — wire this up when you build that feature */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Change Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={() => auth().signOut()}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#0d1117',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1117',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#161b22',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#8b949e',
    marginBottom: 24,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  editButtonText: {
    color: '#2f81f7',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#da3633',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  signOutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
