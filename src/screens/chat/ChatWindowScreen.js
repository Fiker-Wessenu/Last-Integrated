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
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../firebase/context/ThemeContext';
import Typography from '../../components/Typography';
import { SPACING, RADIUS } from '../../constants/Typography';
import { useAuth } from '../../firebase/context/AuthContext';
import { subscribeToMessages, sendMessage } from '../../services/messageService';
import { useUserProfiles, getDisplayName } from '../../services/userService';

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'location-outline') path = 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z';
  if (name === 'satellite-outline') path = 'M2 10a10 10 0 0 1 10-10 M2 22a10 10 0 0 0 10 10 M22 10a10 10 0 0 0-10-10 M22 22a10 10 0 0 1-10 10';
  if (name === 'document-text-outline') path = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6';
  if (name === 'warning-outline') path = 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01';
  if (name === 'map-outline') path = 'M1 6v15l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v15 M16 6v15';
  if (name === 'school-outline') path = 'M22 10v6M2 10l10-5 10 5-10 5z M6 12.5V16a6 6 0 0 0 12 0v-3.5';
  if (name === 'chevron-forward-outline') path = 'M9 18l6-6-6-6';
  if (name === 'information-circle-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01';
  if (name === 'close') path = 'M18 6L6 18 M6 6l12 12';
  if (name === 'shield-checkmark-outline') path = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4';
  if (name === 'person-add-outline') path = 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0-4-4 4 4 0 0 0 4 4z M19 8v6 M16 11h6';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

// ─── Decision Enablers Data ──────────────────────────────────────────────
const DECISION_ENABLERS = [
  {
    id: 'edas',
    icon: 'location-outline',
    title: 'eDAS Address Lookup',
    description: 'Find digital addresses in 73 Ethiopian cities',
    action: () => Alert.alert('eDAS Lookup', 'Search for digital addresses by city (Adama, Arba Minch, Jinka, etc.)'),
  },
  {
    id: 'satellite',
    icon: 'satellite-outline',
    title: 'Satellite CORS Network',
    description: '9 operational stations · 30 more planned',
    action: () => Alert.alert('Satellite CORS', 'View live satellite data network status.'),
  },
  {
    id: 'research',
    icon: 'document-text-outline',
    title: 'Research Publications',
    description: 'Latest papers from S-ARC 2026 conference',
    action: () => Alert.alert('Publications', 'Browse research papers and conference proceedings.'),
  },
  {
    id: 'disaster',
    icon: 'warning-outline',
    title: 'Disaster Risk Alerts',
    description: 'Flood · Landslide · Earthquake monitoring',
    action: () => Alert.alert('Disaster Alerts', 'View current disaster risk data from remote sensing.'),
  },
  {
    id: 'maps',
    icon: 'map-outline',
    title: 'Geospatial Data Maps',
    description: 'Urban planning · Agriculture · Water resources',
    action: () => Alert.alert('Geospatial Maps', 'Open interactive map viewer for SSGI data.'),
  },
  {
    id: 'training',
    icon: 'school-outline',
    title: 'Training Programs',
    description: 'Journey to the Space · SciGirls · Radio Astronomy',
    action: () => Alert.alert('Training', 'View upcoming training and capacity building programs.'),
  },
];

export default function ChatWindowScreen({ route, navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const { chatId, contactName, groupDetails } = route.params || { contactName: 'Contact' };
  const { user } = useAuth();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);

  const isDecisionChat = contactName === '🔑 Key Decision Enablers';

  // Fallback to the dark space-navy palette if colors are missing/undefined —
  // matches the look ChatWindowScreen had before it moved onto ThemeContext,
  // so the screen won't visually break if theme data hasn't loaded yet.
  const bgColor = colors?.background || '#0a0e1a';
  const textColor = colors?.text || '#ffffff';
  const secondaryText = colors?.rowTime || '#a0a0b0';
  const borderColor = colors?.border || 'rgba(255,255,255,0.1)';
  const brandColor = colors?.primary || '#1a4b8c';
  const cardColor = colors?.rowBg || 'rgba(255,255,255,0.06)';
  const accentColor = colors?.tabActiveBg || '#de994a';

  // Live-subscribe to this chat's messages once we have a real chatId.
  // Without one (e.g. still on mock data from ChatsListScreen), this just
  // stays empty rather than trying to read a nonexistent document.
  useEffect(() => {
    if (!chatId || isDecisionChat) return;

    const unsubscribe = subscribeToMessages(chatId, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    return unsubscribe;
  }, [chatId, isDecisionChat]);

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
          <View style={[styles.miniAvatar, { backgroundColor: cardColor }, isSenderAdmin && { backgroundColor: accentColor }]}>
            <Text style={[styles.miniAvatarText, { color: isSenderAdmin ? '#ffffff' : secondaryText }]}>
              {isGroup ? senderDisplayName.substring(0, 1).toUpperCase() : contactName.substring(0, 1)}
            </Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? [styles.bubbleMe, { backgroundColor: brandColor }] : [styles.bubbleThem, { backgroundColor: cardColor }]]}>
          {isGroup && !isMe && (
            <View style={styles.senderHeader}>
              <Text style={[styles.senderNameText, { color: isSenderAdmin ? accentColor : brandColor }]}>
                {senderDisplayName}
              </Text>
              {isSenderAdmin && (
                <View style={[styles.adminBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.adminBadgeText}>Leader</Text>
                </View>
              )}
            </View>
          )}
          <Text style={{ color: isMe ? '#ffffff' : textColor, fontSize: 14, lineHeight: 20 }}>{item.text}</Text>
          <Text style={{ color: isMe ? 'rgba(255,255,255,0.7)' : secondaryText, fontSize: 9, textAlign: 'right', marginTop: 4 }}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  // ─── Decision Chat View ──────────────────────────────────────────────────
  if (isDecisionChat) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        {/* Header */}
        <View style={[styles.header, { backgroundColor: brandColor }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#ffffff" />
            </Svg>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>🔑 Key Decision Enablers</Text>
            <Text style={styles.headerSubtitle}>Powered by SSGI Data</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.decisionList} showsVerticalScrollIndicator={false}>
          <Typography variant="caption" color={secondaryText} style={styles.decisionHeaderText}>
            Select a tool to access SSGI decision data
          </Typography>
          {DECISION_ENABLERS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.decisionCard, { backgroundColor: cardColor, borderColor: borderColor }]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={[styles.decisionIcon, { backgroundColor: brandColor + '1A' }]}>
                <Icon name={item.icon} size={24} color={brandColor} />
              </View>
              <View style={styles.decisionContent}>
                <Typography variant="body" color={textColor} style={styles.decisionTitle}>{item.title}</Typography>
                <Typography variant="caption" color={secondaryText}>{item.description}</Typography>
              </View>
              <Icon name="chevron-forward-outline" size={18} color={secondaryText} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Normal Chat View ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: brandColor }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#ffffff" />
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
              <Icon name="information-circle-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 32 }} />
          )}
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesListContent}
          bounces={true}
        />

        {/* Input Bar */}
        <View style={[styles.inputContainer, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f0f2f5', color: textColor }]}
            placeholder="Type your orbital message..."
            placeholderTextColor={secondaryText}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: brandColor }, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="#ffffff" />
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
              <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
                {/* Modal Header */}
                <View style={[styles.modalHeader, { backgroundColor: cardColor, borderBottomColor: borderColor }]}>
                  <Typography variant="heading3" color={textColor}>Department Group Info</Typography>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {groupDetails.admins?.includes(user?.uid) && (
                      <TouchableOpacity
                        style={{ marginRight: 15 }}
                        onPress={() => {
                          setShowInfoModal(false);
                          navigation.navigate('NewChat', { addMemberToChatId: chatId });
                        }}
                      >
                        <Icon name="person-add-outline" size={24} color={brandColor} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowInfoModal(false)}
                    >
                      <Icon name="close" size={24} color={secondaryText} />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView contentContainerStyle={styles.modalBody}>
                  {/* Department Name & Description */}
                  <View style={[styles.infoCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
                    <Typography variant="heading3" color={brandColor} style={styles.infoCardName}>{groupDetails.name}</Typography>
                    {/* No description field exists on real group chat docs yet — omitted rather than showing undefined */}
                  </View>

                  {/* Staff Leader / Admins section.
                      Real group docs store `admins` as an array of UIDs, not a single
                      named leader — showing all admins here instead of one "leader". */}
                  <Typography variant="caption" color={secondaryText} style={styles.sectionTitle}>ADMINS</Typography>
                  {(groupDetails.admins || []).map((adminUid) => (
                    <View style={[styles.leaderCard, { backgroundColor: accentColor }]} key={adminUid}>
                      <View style={styles.leaderBadge}>
                        <Icon name="shield-checkmark-outline" size={20} color="#ffffff" />
                        <Text style={styles.leaderBadgeText}>Admin</Text>
                      </View>
                      <View style={styles.leaderInfo}>
                        <Text style={styles.leaderName}>{getDisplayName(userProfiles, adminUid)}</Text>
                      </View>
                    </View>
                  ))}

                  {/* Staff Members List — same UID caveat as above */}
                  <Typography variant="caption" color={secondaryText} style={styles.sectionTitle}>
                    MEMBERS ({groupDetails.participants?.length || 0})
                  </Typography>
                  <View style={[styles.membersListCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
                    {(groupDetails.participants || []).map((memberUid, index) => {
                      const isAdmin = groupDetails.admins?.includes(memberUid);
                      const memberDisplayName = getDisplayName(userProfiles, memberUid);
                      return (
                        <View key={memberUid}>
                          <View style={styles.memberRow}>
                            <View style={[styles.memberAvatar, isAdmin && { backgroundColor: accentColor }]}>
                              <Text style={styles.memberAvatarText}>
                                {memberDisplayName.substring(0, 1).toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.memberInfo}>
                              <Typography variant="body" color={textColor}>{memberDisplayName}</Typography>
                            </View>
                            {isAdmin && (
                              <View style={[styles.leaderTag, { backgroundColor: accentColor + '26' }]}>
                                <Text style={[styles.leaderTagText, { color: accentColor }]}>Admin</Text>
                              </View>
                            )}
                          </View>
                          {index < (groupDetails.participants?.length || 0) - 1 && (
                            <View style={[styles.modalDivider, { backgroundColor: borderColor }]} />
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
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  backButton: { padding: 4 },
  headerTitleContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#ffffff' },
  headerSubtitle: { fontSize: 11, color: '#fdfdfd', opacity: 0.9, marginTop: 2, textAlign: 'center' },
  infoIconWrapper: { padding: 4 },
  decisionList: { padding: SPACING.lg, paddingBottom: 30 },
  decisionHeaderText: { textAlign: 'center', marginBottom: SPACING.md },
  decisionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  decisionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  decisionContent: { flex: 1 },
  decisionTitle: { fontWeight: '600', marginBottom: 2 },
  messagesListContent: { padding: 15, paddingBottom: 25 },
  messageRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowThem: { justifyContent: 'flex-start' },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  miniAvatarText: { fontSize: 12, fontWeight: 'bold' },
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
      android: { elevation: 1 },
    }),
  },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleThem: { borderBottomLeftRadius: 4 },
  senderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  senderNameText: { fontSize: 12, fontWeight: 'bold' },
  adminBadge: { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 6 },
  adminBadgeText: { color: '#ffffff', fontSize: 8, fontWeight: 'bold' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 15,
    fontSize: 14,
    marginRight: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomWidth: 1,
  },
  closeButton: { padding: 2 },
  modalBody: { padding: 20 },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  infoCardName: { marginBottom: 6 },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  leaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
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
  leaderBadgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
  membersListCard: {
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcdcdc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: { fontSize: 14, fontWeight: 'bold', color: '#555555' },
  memberInfo: { flex: 1 },
  leaderTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  leaderTagText: { fontSize: 10, fontWeight: 'bold' },
  modalDivider: { height: 1, marginVertical: 4 },
});
