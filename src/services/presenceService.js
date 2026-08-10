import firestore from '@react-native-firebase/firestore';
import { db } from '../firebase/firestore';
import { AppState } from 'react-native';

// Presence lives in its own top-level `presence/{uid}` collection per the rules
// (not a field on users/{uid}). React Native has no native onDisconnect the way
// the Realtime DB does, so this uses AppState changes as a best-effort proxy —
// it won't catch a hard app kill or crash.
export function initPresence(uid) {
  const setStatus = (isOnline) =>
    db.collection('presence').doc(uid).set(
      { isOnline, lastSeen: firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );

  setStatus(true);

  const subscription = AppState.addEventListener('change', (nextState) => {
    setStatus(nextState === 'active');
  });

  // Call the returned function on logout / unmount
  return () => {
    setStatus(false);
    subscription.remove();
  };
}