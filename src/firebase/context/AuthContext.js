import React, { createContext, useState, useContext, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { storage } from '../storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = null;

    // Listens for sign-in/sign-out. AppNavigator has its own listener for
    // routing; this one keeps `user` here in sync with the live Firestore profile.
    const unsubscribeAuth = auth().onAuthStateChanged((firebaseUser) => {
      // Tear down any previous profile listener before attaching a new one
      // (or none, if the user just signed out).
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      unsubscribeProfile = firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .onSnapshot(
          (doc) => {
            const data = doc.exists ? doc.data() : {};
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              name: data.fullName || null,
              fullName: data.fullName || null,
              profilePicture: data.photoURL || null,
              ...data,
            });
            setLoading(false);
          },
          (error) => {
            console.error('Failed to load profile:', error);
            setLoading(false);
          }
        );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Sign-in/sign-up themselves happen directly via auth() in LoginScreen/SignUpScreen —
  // this context just reacts to the resulting auth state, so there's no login()
  // to call here anymore.

  const logout = async () => {
    try {
      await auth().signOut();
      // setUser(null) happens automatically via onAuthStateChanged above.
    } catch (error) {
      // fail silently on logout, matching previous behavior
    }
  };

  const updateProfilePicture = async (localUri) => {
    const uid = auth().currentUser?.uid;
    if (!uid) {
      throw new Error('No signed-in user');
    }

    const reference = storage().ref(`profile_pictures/${uid}.jpg`);
    await reference.putFile(localUri);
    const downloadURL = await reference.getDownloadURL();

    await firestore().collection('users').doc(uid).update({
      photoURL: downloadURL,
    });

    // No need to manually setUser — the onSnapshot listener above
    // picks up this Firestore change and updates `user` automatically.
    return downloadURL;
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, updateProfilePicture }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
