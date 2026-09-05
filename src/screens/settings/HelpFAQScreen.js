import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../firebase/context/ThemeContext';

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'chatbubble-outline') path = 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.1c1.5 0 3 .4 4.3 1.1L21 1.5l-1.1 4.2c.7 1.3 1.1 2.8 1.1 4.3z';
  if (name === 'lock-closed-outline') path = 'M7 11V7a5 5 0 0 1 10 0v4 M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z';
  if (name === 'people-outline') path = 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0-4-4 4 4 0 0 0 4 4z';
  if (name === 'business-outline') path = 'M3 21h18 M3 7v14 M21 7v14 M9 21V11h6v10 M7 7h10 M7 3h10';
  if (name === 'satellite-outline') path = 'M2 10a10 10 0 0 1 10-10 M2 22a10 10 0 0 0 10 10 M22 10a10 10 0 0 0-10-10 M22 22a10 10 0 0 1-10 10';
  if (name === 'school-outline') path = 'M22 10v6M2 10l10-5 10 5-10 5z M6 12.5V16a6 6 0 0 0 12 0v-3.5';
  if (name === 'map-outline') path = 'M1 6v15l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v15 M16 6v15';
  if (name === 'radio-outline') path = 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M12 7a5 5 0 1 0 0 10 M12 2a10 10 0 1 0 0 20';
  if (name === 'help-circle-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01';
  if (name === 'search-outline') path = 'M21 21l-6-6 m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z';
  if (name === 'close-circle') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M15 9l-6 6 M9 9l6 6';
  if (name === 'chevron-up-outline') path = 'M18 15l-6-6-6 6';
  if (name === 'chevron-down-outline') path = 'M6 9l6 6 6-6';
  if (name === 'bug-outline') path = 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M12 7v10 M12 2v3';
  if (name === 'globe-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 2v20 M2 12h20';
  if (name === 'mail-outline') path = 'M3 8l9 6 9-6 M21 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z';
  if (name === 'chevron-forward-outline') path = 'M9 5l7 7-7 7';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

const FAQ_DATA = [
  { id: '1', question: 'How do I start a new chat?', answer: 'Tap the "New Chat" button in the bottom navigation or tap the "💬" icon in the chat list header.', icon: 'chatbubble-outline' },
  { id: '2', question: 'Are my messages encrypted?', answer: 'Yes, all messages in Orbit Chat are end‑to‑end encrypted. Only you and the recipient can read them.', icon: 'lock-closed-outline' },
  { id: '3', question: 'How do I create a department group?', answer: 'Tap "New Group" from the main menu (⋮) and select a department. Add members and tap "Create".', icon: 'people-outline' },
  { id: '4', question: 'What is SSGI?', answer: 'The Space Science and Geospatial Institute (SSGI) is Ethiopia\'s premier institution for space science and geospatial research, established in 2022.', icon: 'business-outline' },
  { id: '5', question: 'How do I access satellite data?', answer: 'Satellite data can be accessed through the "Satellite Data" menu option under the main menu (⋮).', icon: 'satellite-outline' },
  { id: '6', question: 'How do I join SSGI training programs?', answer: 'Training programs are announced via the "Announcements" channel. You can also check the "Training" section under the main menu.', icon: 'school-outline' },
  { id: '7', question: 'How do I report a geospatial issue?', answer: 'Report geospatial issues by tapping "Report an Issue" in this screen or by contacting the Geospatial Division directly.', icon: 'map-outline' },
  { id: '8', question: 'How do I get technical support for telemetry?', answer: 'For telemetry support, contact the Operations team via the "Telemetry Monitoring" chat or email support@orbit-chat.com.', icon: 'radio-outline' },
];

export default function HelpFAQScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const bgColor = colors.background;
  const textColor = colors.text;
  const secondaryText = colors.rowTime;
  const borderColor = colors.border;
  const cardColor = colors.rowBg;
  const brandColor = colors.primary;
  const accentColor = colors.tabActiveBg;
  const goldAccent = '#de994a';

  const filteredFAQs = FAQ_DATA.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Help & FAQ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.searchBar, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Icon name="search-outline" size={20} color={secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search FAQs..."
            placeholderTextColor={secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color={secondaryText} />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Icon name="help-circle-outline" size={28} color={goldAccent} />
          <Text style={[styles.infoText, { color: secondaryText, marginLeft: 12 }]}>
            Find answers to common questions or get in touch with our support team.
          </Text>
        </View>

        <View style={styles.faqContainer}>
          {filteredFAQs.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.faqItem, { backgroundColor: cardColor, borderColor: borderColor }]}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <View style={styles.faqTitle}>
                    <Icon name={item.icon} size={20} color={accentColor} />
                    <Text style={[styles.faqQuestion, { color: textColor, marginLeft: 10 }]}>{item.question}</Text>
                  </View>
                  <Icon name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={20} color={secondaryText} />
                </View>
                {isExpanded && (
                  <Text style={[styles.faqAnswer, { color: secondaryText }]}>{item.answer}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Text style={[styles.cardTitle, { color: secondaryText }]}>Quick Actions</Text>
          <TouchableOpacity style={[styles.row, { borderBottomColor: borderColor }]} onPress={() => Alert.alert('Action', 'Feature coming soon!')}>
            <Icon name="bug-outline" size={20} color={brandColor} />
            <Text style={[styles.rowText, { color: textColor, marginLeft: 12 }]}>Report Issue</Text>
            <Icon name="chevron-forward-outline" size={18} color={secondaryText} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.row, { borderBottomColor: borderColor }]} onPress={() => Alert.alert('Action', 'Feature coming soon!')}>
            <Icon name="chatbubble-outline" size={20} color={goldAccent} />
            <Text style={[styles.rowText, { color: textColor, marginLeft: 12 }]}>Send Feedback</Text>
            <Icon name="chevron-forward-outline" size={18} color={secondaryText} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  backButton: { padding: 4, width: 40 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 4, paddingHorizontal: 8 },
  infoCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16 },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20, opacity: 0.8 },
  faqContainer: { marginBottom: 16 },
  faqItem: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 8 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqTitle: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  faqQuestion: { fontSize: 15, fontWeight: '600', flex: 1 },
  faqAnswer: { fontSize: 14, lineHeight: 20, marginTop: 12, opacity: 0.8, paddingLeft: 30 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4, opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  rowText: { fontSize: 16, fontWeight: '500', flex: 1 },
});
