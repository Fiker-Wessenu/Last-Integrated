import firestore from '@react-native-firebase/firestore';
import { db } from '../firebase/firestore';

// ─── Direct (1:1) chats ──────────────────────────────────────

// Create a direct chat between two users
export async function createDirectChat(uidA, uidB) {
  return db.collection('chats').add({
    type: 'direct',
    participants: [uidA, uidB],
    createdBy: uidA,
    lastMessage: null,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
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
  return db
    .collection('chats')
    .where('participants', 'array-contains', uid)
    .orderBy('updatedAt', 'desc')
    .onSnapshot((snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

// Called internally by messageService after a new message is sent
export async function updateLastMessage(chatId, { text, senderId }) {
  return db.collection('chats').doc(chatId).update({
    lastMessage: { text, senderId, timestamp: firestore.FieldValue.serverTimestamp() },
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
}
