import firestore from '@react-native-firebase/firestore';
import { db } from '../firebase/firestore';
import { updateLastMessage } from './chatService';

// Live-subscribe to messages in a chat, oldest first
export function subscribeToMessages(chatId, callback) {
  return db
    .collection('chats')
    .doc(chatId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .onSnapshot((snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
}

// Send a message, then denormalize it onto the parent chat doc.
// Field is `createdAt` (not `timestamp`) to match the rules' protected-field check.
export async function sendMessage(chatId, { senderId, text, type = 'text' }) {
  await db.collection('chats').doc(chatId).collection('messages').add({
    senderId,
    text,
    type,
    status: 'sent',
    readBy: [senderId],
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  return updateLastMessage(chatId, { text, senderId });
}

// Mark a message as read — allowed for any participant per the rules
// (update only touches `readBy`/`status`, matching the hasOnly check)
export async function markMessageRead(chatId, messageId, uid) {
  return db.collection('chats').doc(chatId).collection('messages').doc(messageId).update({
    readBy: firestore.FieldValue.arrayUnion(uid),
    status: 'read',
  });
}
