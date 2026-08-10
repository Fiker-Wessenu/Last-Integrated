import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/firestore';

// Simple in-memory cache so the same UID isn't re-fetched from Firestore
// every time a different screen needs to display that person's name.
// Resets on app restart — fine for now since profile info rarely changes
// mid-session. If it needs to reflect live edits later, this would need
// to become an onSnapshot listener instead of a one-time get().
const profileCache = {};
const inFlightFetches = {};

export async function getUserProfile(uid) {
  if (!uid) return null;
  if (profileCache[uid]) return profileCache[uid];
  if (inFlightFetches[uid]) return inFlightFetches[uid];

  const fetchPromise = db
    .collection('users')
    .doc(uid)
    .get()
    .then((doc) => {
      const data = doc.exists
        ? { uid, fullName: doc.data().fullName || null, photoURL: doc.data().photoURL || null }
        : { uid, fullName: null, photoURL: null };
      profileCache[uid] = data;
      delete inFlightFetches[uid];
      return data;
    })
    .catch((error) => {
      console.error('Failed to fetch user profile:', uid, error);
      delete inFlightFetches[uid];
      return { uid, fullName: null, photoURL: null };
    });

  inFlightFetches[uid] = fetchPromise;
  return fetchPromise;
}

// React hook: given an array of UIDs, resolves and returns a
// { [uid]: { fullName, photoURL } } map. Only fetches UIDs it doesn't
// already have, and updates the map as each one resolves.
export function useUserProfiles(uids = []) {
  const [profiles, setProfiles] = useState({});
  const requested = useRef(new Set());

  useEffect(() => {
    const uniqueUids = [...new Set(uids.filter(Boolean))];

    uniqueUids.forEach((uid) => {
      if (requested.current.has(uid)) return;
      requested.current.add(uid);

      getUserProfile(uid).then((profile) => {
        if (profile) {
          setProfiles((prev) => ({ ...prev, [uid]: profile }));
        }
      });
    });
    // Only the actual UID contents matter here, not array identity —
    // joining to a string keeps this from re-running on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uids.join(',')]);

  return profiles;
}

// Falls back to the raw UID if the profile hasn't resolved yet,
// or has no name set — so the UI never shows "undefined".
export function getDisplayName(profiles, uid) {
  if (!uid) return 'Unknown';
  return profiles[uid]?.fullName || uid;
}
