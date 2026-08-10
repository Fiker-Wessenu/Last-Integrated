import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../firebase/context/AuthContext';
import { subscribeToMessages, sendMessage } from '../../services/messageService';
import { useUserProfiles, getDisplayName } from '../../services/userService';

export default function ChatWindowScreen({ route, navigation }) {
  const { chatId, contactName, groupDetails } = route.params || { contactName: 'Contact' };
  const { user } = useAuth();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);

  // Live-subscribe to this chat's messages once we have a real chatId.
  // Without one (e.g. still on mock data from ChatsListScreen), this just
  // stays empty rather than trying to read a nonexistent document.
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = subscribeToMessages(chatId, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    return unsubscribe;
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatId || !user?.uid) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      await sendMessage(chatId, { senderId: user.uid, text: textToSend });
      // No manual setMessages needed — the onSnapshot listener above
      // picks up the new message automatically.
    } catch (error) {
      console.error('Failed to send message:', error);
      setInputText(textToSend); // restore so they don't lose what they typed
    }
  };

  // Firestore Timestamps need .toDate() before they can be formatted;
  // a message that hasn't been confirmed by the server yet may briefly
  // have a null createdAt, so guard against that too.
  // Resolve every UID that could show up in this screen — message senders,
  // group admins, and group members — to real names in one batch.
  const messageSenderUids = messages.map((m) => m.senderId).filter(Boolean);
  const groupParticipantUids = groupDetails?.participants || [];
  const groupAdminUids = groupDetails?.admins || [];
  const userProfiles = useUserProfiles([
    ...messageSenderUids,
    ...groupParticipantUids,
    ...groupAdminUids,
  ]);

  const formatMessageTime = (createdAt) => {
    if (!createdAt || typeof createdAt.toDate !== 'function') return '';
    return createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageItem = ({ item }) => {
    const isMe = item.senderId === user?.uid;
    const isGroup = !!groupDetails;
    const isSenderAdmin = isGroup && groupDetails.admins?.includes(item.senderId);
    const senderDisplayName = getDisplayName(userProfiles, item.senderId);

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowThem]}>
        {!isMe && (
          <View style={[styles.miniAvatar, isSenderAdmin && styles.miniAvatarAdmin]}>
            <Text style={styles.miniAvatarText}>
              {isGroup ? senderDisplayName.substring(0, 1).toUpperCase() : contactName.substring(0, 1)}
            </Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          {isGroup && !isMe && (
            <View style={styles.senderHeader}>
              <Text style={[styles.senderNameText, isSenderAdmin && styles.senderNameTextAdmin]}>
                {senderDisplayName}
              </Text>
              {isSenderAdmin && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Leader</Text>
                </View>
              )}
            </View>
          )}
          <Text style={isMe ? styles.bubbleTextMe : styles.bubbleTextThem}>{item.text}</Text>
          <Text style={isMe ? styles.timeTextMe : styles.timeTextThem}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                fill="#ffffff"
              />
            </Svg>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerTitleContainer}
            onPress={() => groupDetails && setShowInfoModal(true)}
            disabled={!groupDetails}
            activeOpacity={groupDetails ? 0.7 : 1}
          >
            <Text style={styles.headerTitle}>{contactName}</Text>
            <Text style={styles.headerSubtitle}>
              {groupDetails
                ? `group • ${groupDetails.participants?.length || 0} members • tap for info`
                : 'satellite linked • active'}
            </Text>
          </TouchableOpacity>

          {groupDetails ? (
            <TouchableOpacity
              style={styles.infoIconWrapper}
              onPress={() => setShowInfoModal(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
                  fill="#ffffff"
                />
              </Svg>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerRightSpacer} />
          )}
        </View>

        {/* Messages List */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesListContent}
          style={styles.messagesList}
          bounces={true}
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your orbital message..."
            placeholderTextColor="#8a8a8a"
            value={inputText}
            onChangeText={setInputText}
            multiline={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                fill="#ffffff"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Department Info Modal */}
        {groupDetails && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showInfoModal}
            onRequestClose={() => setShowInfoModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>Department Group Info</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowInfoModal(false)}
                  >
                    <Svg width={24} height={24} viewBox="0 0 24 24">
                      <Path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                        fill="#333333"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.modalBody}>
                  {/* Department Name & Description */}
                  <View style={styles.infoCard}>
                    <Text style={styles.infoCardName}>{groupDetails.name}</Text>
                    {/* No description field exists on real group chat docs yet — omitted rather than showing undefined */}
                  </View>

                  {/* Staff Leader / Admins section.
                      Real group docs store `admins` as an array of UIDs, not a single
                      named leader — showing all admins here instead of one "leader". */}
                  <Text style={styles.sectionTitle}>ADMINS</Text>
                  {(groupDetails.admins || []).map((adminUid) => (
                    <View style={styles.leaderCard} key={adminUid}>
                      <View style={styles.leaderBadge}>
                        <Svg width={20} height={20} viewBox="0 0 24 24">
                          <Path
                            d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 8h2v2h-2v-2zm0-4h2v2h-2v-2z"
                            fill="#ffffff"
                          />
                        </Svg>
                        <Text style={styles.leaderBadgeText}>Admin</Text>
                      </View>
                      <View style={styles.leaderInfo}>
                        <Text style={styles.leaderName}>{getDisplayName(userProfiles, adminUid)}</Text>
                      </View>
                    </View>
                  ))}

                  {/* Staff Members List — same UID caveat as above */}
                  <Text style={styles.sectionTitle}>
                    MEMBERS ({groupDetails.participants?.length || 0})
                  </Text>
                  <View style={styles.membersListCard}>
                    {(groupDetails.participants || []).map((memberUid, index) => {
                      const isAdmin = groupDetails.admins?.includes(memberUid);
                      const memberDisplayName = getDisplayName(userProfiles, memberUid);
                      return (
                        <View key={memberUid}>
                          <View style={styles.memberRow}>
                            <View style={[styles.memberAvatar, isAdmin && styles.memberAvatarLeader]}>
                              <Text style={styles.memberAvatarText}>
                                {memberDisplayName.substring(0, 1).toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.memberInfo}>
                              <Text style={styles.memberName}>{memberDisplayName}</Text>
                            </View>
                            {isAdmin && (
                              <View style={styles.leaderTag}>
                                <Text style={styles.leaderTagText}>Admin</Text>
                              </View>
                            )}
                          </View>
                          {index < (groupDetails.participants?.length || 0) - 1 && (
                            <View style={styles.modalDivider} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#b6a378', // anchors header color on iOS
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    backgroundColor: '#1B5674',
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#fdfdfd',
    opacity: 0.9,
    marginTop: 2,
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 32, // matches back button hit target for perfect centering
  },
  infoIconWrapper: {
    padding: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    padding: 15,
    paddingBottom: 25,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowThem: {
    justifyContent: 'flex-start',
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#dcdcdc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  miniAvatarAdmin: {
    backgroundColor: '#de994a', // golden orange for admin avatars
  },
  miniAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555555',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '75%',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  bubbleMe: {
    backgroundColor: '#1b5674',
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  senderNameText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1b5674',
  },
  senderNameTextAdmin: {
    color: '#de994a', // golden ochre for department head in group chat
  },
  adminBadge: {
    backgroundColor: '#de994a',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
  },
  adminBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  roleText: {
    fontSize: 10,
    color: '#8a8a8a',
    marginBottom: 4,
    fontWeight: '500',
  },
  bubbleTextMe: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextThem: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 20,
  },
  timeTextMe: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    marginTop: 4,
  },
  timeTextThem: {
    fontSize: 9,
    color: '#8a8a8a',
    textAlign: 'right',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f1f3',
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333333',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#1b5674',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f5f5f7',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '85%',
    paddingBottom: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 2,
  },
  modalBody: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  infoCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b5674',
    marginBottom: 6,
  },
  infoCardDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8a8a8a',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  leaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#de994a',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#de994a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leaderBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  leaderBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  leaderRole: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  membersListCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcdcdc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarLeader: {
    backgroundColor: '#de994a',
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555555',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  memberRoleText: {
    fontSize: 11,
    color: '#8a8a8a',
    marginTop: 2,
  },
  leaderTag: {
    backgroundColor: 'rgba(222, 153, 74, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  leaderTagText: {
    color: '#de994a',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#f1f1f3',
    marginVertical: 4,
  },
});
