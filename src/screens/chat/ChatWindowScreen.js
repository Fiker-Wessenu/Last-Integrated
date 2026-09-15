import React, { useState, useEffect, useRef } from 'react';
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
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { useTheme } from '../../firebase/context/ThemeContext';
import Typography from '../../components/Typography';
import { SPACING, RADIUS } from '../../constants/Typography';
import { useAuth } from '../../firebase/context/AuthContext';
import { subscribeToMessages, sendMessage, uploadChatAttachment } from '../../services/messageService';
import { useUserProfiles, getDisplayName } from '../../services/userService';

const audioRecorderPlayer = new AudioRecorderPlayer();

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
  if (name === 'attach-outline') path = 'M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48';
  if (name === 'mic-outline') path = 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v1a7 7 0 0 1-14 0v-1 M12 18v4 M8 22h8';
  if (name === 'image-outline') path = 'M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M8.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z M21 15l-5-5L5 21';
  if (name === 'stop-circle-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9 9h6v6H9z';
  if (name === 'play-outline') path = 'M5 3l14 9-14 9V3z';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

// ─── Decision Enablers Data ──────────────────────────────────────────────
const DECISION_ENABLERS = [
  { id: 'edas', icon: 'location-outline', title: 'eDAS Address Lookup', description: 'Find digital addresses in 73 Ethiopian cities', action: () => Alert.alert('eDAS Lookup', 'Search for digital addresses by city') },
  { id: 'satellite', icon: 'satellite-outline', title: 'Satellite CORS Network', description: '9 operational stations · 30 more planned', action: () => Alert.alert('Satellite CORS', 'View live satellite data network status.') },
  { id: 'research', icon: 'document-text-outline', title: 'Research Publications', description: 'Latest papers from S-ARC 2026 conference', action: () => Alert.alert('Publications', 'Browse research papers.') },
  { id: 'disaster', icon: 'warning-outline', title: 'Disaster Risk Alerts', description: 'Flood · Landslide · Earthquake monitoring', action: () => Alert.alert('Disaster Alerts', 'View current disaster risk data.') },
  { id: 'maps', icon: 'map-outline', title: 'Geospatial Data Maps', description: 'Urban planning · Agriculture · Water resources', action: () => Alert.alert('Geospatial Maps', 'Open interactive map viewer.') },
  { id: 'training', icon: 'school-outline', title: 'Training Programs', description: 'Journey to the Space · SciGirls · Radio Astronomy', action: () => Alert.alert('Training', 'View upcoming training programs.') },
];

export default function ChatWindowScreen({ route, navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const { chatId, contactName, groupDetails } = route.params || { contactName: 'Contact' };
  const { user } = useAuth();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);

  // Attachment state
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00:00');

  const isDecisionChat = contactName === '🔑 Key Decision Enablers';

  const bgColor = colors?.background || '#0a0e1a';
  const textColor = colors?.text || '#ffffff';
  const secondaryText = colors?.rowTime || '#a0a0b0';
  const borderColor = colors?.border || 'rgba(255,255,255,0.1)';
  const brandColor = colors?.primary || '#1a4b8c';
  const cardColor = colors?.rowBg || 'rgba(255,255,255,0.06)';
  const accentColor = colors?.tabActiveBg || '#de994a';

  const senderUids = [...new Set(messages.map((m) => m.senderId))];
  const userProfiles = useUserProfiles(senderUids);

  useEffect(() => {
    if (!chatId || isDecisionChat) return;
    const unsubscribe = subscribeToMessages(chatId, (fetchedMessages) => setMessages(fetchedMessages));
    return unsubscribe;
  }, [chatId, isDecisionChat]);

  const handleSendMessage = async (type = 'text', attachment = null) => {
    if ((type === 'text' && !inputText.trim()) || !chatId || !user?.uid) return;

    const textToSend = type === 'text' ? inputText.trim() : '';
    if (type === 'text') setInputText('');

    try {
      if (attachment) {
        setUploading(true);
        const url = await uploadChatAttachment(chatId, attachment.uri, attachment.name, type);
        await sendMessage(chatId, {
          senderId: user.uid,
          text: textToSend,
          type,
          attachmentUrl: url,
          attachmentName: attachment.name
        });
        setUploading(false);
      } else {
        await sendMessage(chatId, { senderId: user.uid, text: textToSend, type });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      if (type === 'text') setInputText(textToSend);
      setUploading(false);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'mixed',
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      handleSendMessage(asset.type?.includes('video') ? 'video' : 'image', {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.${asset.uri.split('.').pop()}`
      });
    }
  };

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      if (res && res.length > 0) {
        const file = res[0];
        handleSendMessage('file', { uri: file.uri, name: file.name });
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error(err);
      }
    }
  };

  const startRecording = async () => {
    try {
      const result = await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecorderBackListener((e) => {
        setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        return;
      });
      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecorderBackListener();
      setIsRecording(false);
      setRecordTime('00:00:00');
      handleSendMessage('voice', { uri: result, name: `voice_${Date.now()}.m4a` });
    } catch (err) {
      console.error(err);
    }
  };

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
              {senderDisplayName.substring(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? [styles.bubbleMe, { backgroundColor: brandColor }] : [styles.bubbleThem, { backgroundColor: cardColor }]]}>
          {isGroup && !isMe && (
            <Text style={[styles.senderNameText, { color: isSenderAdmin ? accentColor : brandColor }]}>{senderDisplayName}</Text>
          )}

          {item.type === 'text' && <Text style={{ color: isMe ? '#ffffff' : textColor, fontSize: 14 }}>{item.text}</Text>}

          {item.type === 'image' && (
            <Image source={{ uri: item.attachmentUrl }} style={styles.messageImage} resizeMode="cover" />
          )}

          {(item.type === 'file' || item.type === 'video') && (
            <TouchableOpacity style={styles.fileAttachment} onPress={() => Linking.openURL(item.attachmentUrl)}>
              <Icon name="document-text-outline" size={24} color={isMe ? '#fff' : brandColor} />
              <Text style={{ color: isMe ? '#fff' : textColor, marginLeft: 8, fontSize: 12 }}>{item.attachmentName || 'Attachment'}</Text>
            </TouchableOpacity>
          )}

          {item.type === 'voice' && (
            <TouchableOpacity style={styles.voiceAttachment} onPress={() => Linking.openURL(item.attachmentUrl)}>
              <Icon name="play-outline" size={20} color={isMe ? '#fff' : brandColor} />
              <View style={[styles.voiceWaveform, { backgroundColor: isMe ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)' }]} />
              <Text style={{ color: isMe ? '#fff' : secondaryText, fontSize: 10, marginLeft: 8 }}>Voice</Text>
            </TouchableOpacity>
          )}

          <Text style={{ color: isMe ? 'rgba(255,255,255,0.7)' : secondaryText, fontSize: 9, textAlign: 'right', marginTop: 4 }}>
            {formatMessageTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: brandColor }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerTitleContainer} onPress={() => groupDetails && setShowInfoModal(true)} activeOpacity={0.7}>
            <Text style={styles.headerTitle}>{contactName}</Text>
            <Text style={styles.headerSubtitle}>{groupDetails ? `${groupDetails.participants?.length || 0} members` : 'online'}</Text>
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesListContent}
          inverted={false}
        />

        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color={brandColor} />
            <Text style={{ color: brandColor, marginLeft: 10 }}>Uploading attachment...</Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={[styles.inputContainer, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
          {!isRecording ? (
            <>
              <TouchableOpacity onPress={pickImage} style={styles.attachBtn}>
                <Icon name="image-outline" size={24} color={secondaryText} />
              </TouchableOpacity>
              <TouchableOpacity onPress={pickDocument} style={styles.attachBtn}>
                <Icon name="attach-outline" size={24} color={secondaryText} />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f0f2f5', color: textColor }]}
                placeholder="Message..."
                placeholderTextColor={secondaryText}
                value={inputText}
                onChangeText={setInputText}
              />
              {inputText.trim() ? (
                <TouchableOpacity style={[styles.sendButton, { backgroundColor: brandColor }]} onPress={() => handleSendMessage('text')}>
                  <Icon name="chevron-forward-outline" size={24} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.micBtn} onPress={startRecording}>
                  <Icon name="mic-outline" size={24} color={brandColor} />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.recordingContainer}>
              <Icon name="mic-outline" size={20} color="#ff4d4d" />
              <Text style={styles.recordingTimer}>{recordTime}</Text>
              <View style={styles.recordingWave} />
              <TouchableOpacity onPress={stopRecording} style={styles.stopBtn}>
                <Icon name="stop-circle-outline" size={32} color="#ff4d4d" />
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  },
  backButton: { padding: 4 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 11, color: '#fff', opacity: 0.8 },
  messagesListContent: { padding: 15, paddingBottom: 25 },
  messageRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowThem: { justifyContent: 'flex-start' },
  miniAvatar: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  miniAvatarText: { fontSize: 12, fontWeight: 'bold' },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '75%' },
  bubbleMe: { borderBottomRightRadius: 4 },
  bubbleThem: { borderBottomLeftRadius: 4 },
  senderNameText: { fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  messageImage: { width: 200, height: 200, borderRadius: 12, marginVertical: 4 },
  fileAttachment: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', padding: 8, borderRadius: 8, marginVertical: 4 },
  voiceAttachment: { flexDirection: 'row', alignItems: 'center', minWidth: 150, padding: 8 },
  voiceWaveform: { flex: 1, height: 2, marginHorizontal: 10, borderRadius: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1 },
  input: { flex: 1, borderRadius: 20, height: 40, paddingHorizontal: 15, marginHorizontal: 10 },
  attachBtn: { padding: 5 },
  micBtn: { padding: 5 },
  sendButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  recordingContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  recordingTimer: { marginLeft: 10, fontWeight: 'bold', color: '#ff4d4d' },
  recordingWave: { flex: 1, height: 2, backgroundColor: '#ff4d4d', marginHorizontal: 20, opacity: 0.3 },
  stopBtn: { padding: 5 },
  uploadingOverlay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: 'rgba(255,255,255,0.9)' },
});
