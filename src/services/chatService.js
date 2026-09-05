import firestore from '@react-native-firebase/firestore';
import { db } from '../firebase/firestore';

// ─── Direct (1:1) chats ──────────────────────────────────────

// Create a direct chat between two users (or self)
export async function createDirectChat(uidA, uidB) {
  // Ensure participants are unique (especially for self-chats)
  const participants = Array.from(new Set([uidA, uidB]));

  // Check if a direct chat already exists between these participants
  const existing = await db
    .collection('chats')
    .where('type', '==', 'direct')
    .where('participants', '==', participants.sort()) // This might not work perfectly due to array order, but good for now if we sort
    .get();

  if (!existing.empty) {
    return existing.docs[0].id;
  }

  const doc = await db.collection('chats').add({
    type: 'direct',
    participants: participants.sort(),
    createdBy: uidA,
    lastMessage: null,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
  return doc.id;
}

// Get or create a self-chat ("Saved Messages")
export async function getOrCreateSelfChat(uid) {
  const q = await db
    .collection('chats')
    .where('type', '==', 'direct')
    .where('participants', '==', [uid])
    .get();

  if (!q.empty) {
    return q.docs[0].id;
  }

  const doc = await db.collection('chats').add({
    type: 'direct',
    participants: [uid],
    createdBy: uid,
    groupName: 'Saved Messages', // Special name for self-chat
    lastMessage: null,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
  return doc.id;
}

// ─── Group chats ─────────────────────────────────────────────
// Groups are just chats/{chatId} docs with type: 'group'.
// There is no separate `groups` collection.

export async function createGroupChat({ creatorUid, memberUids, groupName, groupPhotoUrl = null }) {
  const participants = Array.from(new Set([creatorUid, ...memberUids]));
  return db.collection('chats').add({
    type: 'group',
    participants,
    admins: [creatorUid],
    createdBy: creatorUid,
    groupName,
    groupPhotoUrl,
    lastMessage: null,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

// Only an admin can add/remove members or rename per the rules,
// so these calls will be rejected server-side if the caller isn't one.
export async function addGroupMember(chatId, uid) {
  return db.collection('chats').doc(chatId).update({
    participants: firestore.FieldValue.arrayUnion(uid),
  });
}

export async function removeGroupMember(chatId, uid) {
  return db.collection('chats').doc(chatId).update({
    participants: firestore.FieldValue.arrayRemove(uid),
  });
}

export async function renameGroup(chatId, groupName) {
  return db.collection('chats').doc(chatId).update({ groupName });
}

export async function addGroupAdmin(chatId, uid) {
  return db.collection('chats').doc(chatId).update({
    admins: firestore.FieldValue.arrayUnion(uid),
  });
}

// ─── Shared: chat list ─────────────────────────────────────────

// Live-subscribe to every chat (direct or group) the user belongs to
export function subscribeToUserChats(uid, callback) {
  console.log('Subscribing to chats for UID:', uid);
  return db
    .collection('chats')
    .where('participants', 'array-contains', uid)
    .orderBy('updatedAt', 'desc')
    .onSnapshot(
      (snap) => {
        if (snap) {
          console.log('Received chat snapshot, count:', snap.docs.length);
          callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          console.log('Received null snapshot');
        }
      },
      (error) => {
        console.error('Error in subscribeToUserChats:', error);
      }
    );
}

// Called internally by messageService after a new message is sent
export async function updateLastMessage(chatId, { text, senderId, type = 'text' }) {
  return db.collection('chats').doc(chatId).update({
    lastMessage: { text, senderId, type, timestamp: firestore.FieldValue.serverTimestamp() },
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}

// ─── Pinning (per-user) ──────────────────────────────────────
// Pinning lives under the user's own doc, not the shared chat doc — so one
// person pinning a group chat doesn't pin it for every other member.

/**
 * Pins or unpins a chat for the given user.
 * @param {string} uid - current user's UID
 * @param {string} chatId - the chat to pin/unpin
 * @param {boolean} shouldPin - true to pin, false to unpin
 */
export async function togglePinChat(uid, chatId, shouldPin) {
  if (!uid || !chatId) return;

  const ref = db
    .collection('users')
    .doc(uid)
    .collection('pinnedChats')
    .doc(chatId);

  if (shouldPin) {
    await ref.set({ pinnedAt: firestore.FieldValue.serverTimestamp() });
  } else {
    await ref.delete();
  }
}

/**
 * Live-subscribes to the set of chat IDs the given user has pinned.
 * Calls `callback` with a Set<string> of chat IDs on every change.
 * Returns an unsubscribe function.
 */
export function subscribeToPinnedChatIds(uid, callback) {
  if (!uid) {
    callback(new Set());
    return () => {};
  }

  return db
    .collection('users')
    .doc(uid)
    .collection('pinnedChats')
    .onSnapshot(
      (snap) => {
        callback(new Set(snap.docs.map((d) => d.id)));
      },
      (error) => {
        console.error('Error in subscribeToPinnedChatIds:', error);
      }
    );
}

// ─── Urgent flag (chat-wide, admin-set) ──────────────────────
// Unlike pinning, "urgent" describes the chat itself (e.g. an announcements
// channel), so it's shared across every member — not per-user. Restrict who
// can call this to group admins in your Firestore security rules, e.g.:
//
//   allow update: if request.auth.uid in resource.data.admins
//                 && request.resource.data.diff(resource.data)
//                      .affectedKeys().hasOnly(['isUrgent']);

/**
 * Sets or clears the chat-wide "urgent" flag. Intended to be called only
 * by a group admin (enforce via Firestore security rules).
 */
export async function setChatUrgent(chatId, isUrgent) {
  if (!chatId) return;
  return db.collection('chats').doc(chatId).update({ isUrgent: !!isUrgent });
}
