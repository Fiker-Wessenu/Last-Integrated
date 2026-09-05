import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../firebase/context/ThemeContext';

const { width } = Dimensions.get('window');
const STORAGE_KEY = 'chat_settings';

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'chatbubbles-outline') path = 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z';
  if (name === 'text-outline') path = 'M4 7h16 M4 12h16 M4 17h10';
  if (name === 'chevron-forward-outline') path = 'M9 5l7 7-7 7';
  if (name === 'return-down-back-outline') path = 'M9 10l-5 5 5 5 M20 4v7a4 4 0 0 1-4 4H4';
  if (name === 'hand-left-outline') path = 'M5 10V5a2 2 0 0 1 4 0v5 M13 8V5a2 2 0 0 1 4 0v3';
  if (name === 'eye-outline') path = 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z';
  if (name === 'image-outline') path = 'M3 3h18v18H3z M3 16l5-5 3 3 5-5 5 5';
  if (name === 'checkmark-circle') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9 12l2 2 4-4';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

export default function ChatSettingsScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    enterToSend: true,
    doubleTapReply: true,
    showPreviews: true,
    wallpaper: 'default',
  });
  const [modalVisible, setModalVisible] = useState(false);

  const bgColor = colors.background;
  const textColor = colors.text;
  const secondaryText = colors.rowTime;
  const borderColor = colors.border;
  const cardColor = colors.rowBg;
  const brandColor = colors.primary;
  const accentColor = colors.tabActiveBg;
  const goldAccent = '#de994a';

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved) setSettings(JSON.parse(saved));
    });
  }, []);

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  const renderToggleRow = (label, key, icon, description) => (
    <View style={[styles.toggleRow, { borderBottomColor: borderColor }]}>
      <View style={styles.toggleLabel}>
        <Icon name={icon} size={18} color={accentColor} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={[styles.toggleText, { color: textColor }]}>{label}</Text>
          {description && <Text style={[styles.toggleDescription, { color: secondaryText }]}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={() => toggleSetting(key)}
        trackColor={{ false: '#3a3a5a', true: brandColor }}
        thumbColor={settings[key] ? '#ffffff' : '#f4f3f4'}
        ios_backgroundColor="#3a3a5a"
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Chats</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Icon name="chatbubbles-outline" size={18} color={goldAccent} />
          <Text style={[styles.infoText, { color: secondaryText, marginLeft: 10 }]}>
            Customise your chat experience. Changes are saved automatically.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Text style={[styles.cardTitle, { color: secondaryText }]}>Behavior</Text>
          {renderToggleRow('Enter to Send', 'enterToSend', 'return-down-back-outline', 'Press Enter to send a message')}
          {renderToggleRow('Double‑tap to Reply', 'doubleTapReply', 'hand-left-outline', 'Double‑tap a message to reply')}
          {renderToggleRow('Show Message Previews', 'showPreviews', 'eye-outline', 'Show message preview in chat list')}
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Text style={[styles.cardTitle, { color: secondaryText }]}>Wallpaper</Text>
          <TouchableOpacity style={styles.optionRow} onPress={() => Alert.alert('Wallpaper', 'Coming soon!')}>
            <View style={styles.optionLeft}>
              <Icon name="image-outline" size={18} color={goldAccent} />
              <Text style={[styles.optionText, { color: textColor, marginLeft: 12 }]}>Chat Wallpaper</Text>
            </View>
            <Icon name="chevron-forward-outline" size={16} color={secondaryText} />
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
  infoCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  card: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 2, marginBottom: 16 },
  cardTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4, paddingTop: 6, opacity: 0.6 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  toggleLabel: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  toggleText: { fontSize: 15, fontWeight: '500' },
  toggleDescription: { fontSize: 12, opacity: 0.6, marginTop: 1 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  optionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  optionText: { fontSize: 15, fontWeight: '500' },
});
