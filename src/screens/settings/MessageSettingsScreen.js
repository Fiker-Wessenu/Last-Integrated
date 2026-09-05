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
const STORAGE_KEY = 'message_settings';

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'chatbubble-ellipses-outline') path = 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.1c1.5 0 3 .4 4.3 1.1L21 1.5l-1.1 4.2c.7 1.3 1.1 2.8 1.1 4.3z M8 12h.01 M12 12h.01 M16 12h.01';
  if (name === 'text-outline') path = 'M4 7h16 M4 12h16 M4 17h10';
  if (name === 'chevron-forward-outline') path = 'M9 5l7 7-7 7';
  if (name === 'return-down-back-outline') path = 'M9 10l-5 5 5 5 M20 4v7a4 4 0 0 1-4 4H4';
  if (name === 'hand-left-outline') path = 'M5 10V5a2 2 0 0 1 4 0v5 M13 8V5a2 2 0 0 1 4 0v3';
  if (name === 'ellipsis-horizontal-outline') path = 'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0';
  if (name === 'checkmark-circle-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9 12l2 2 4-4';
  if (name === 'checkmark-circle') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9 12l2 2 4-4';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

export default function MessageSettingsScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    enterToSend: true,
    doubleTapReply: true,
    typingIndicators: true,
    autoCorrect: true,
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
        <Text style={[styles.headerTitle, { color: textColor }]}>Message Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Icon name="chatbubble-ellipses-outline" size={18} color={goldAccent} />
          <Text style={[styles.infoText, { color: secondaryText, marginLeft: 10 }]}>
            Customise how you compose and send messages.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Text style={[styles.cardTitle, { color: secondaryText }]}>Font Size</Text>
          <TouchableOpacity style={styles.optionRow} onPress={() => setModalVisible(true)}>
            <View style={styles.optionLeft}>
              <Icon name="text-outline" size={18} color={accentColor} />
              <Text style={[styles.optionText, { color: textColor, marginLeft: 12 }]}>Message Font Size</Text>
            </View>
            <View style={styles.optionRight}>
              <Text style={[styles.optionValue, { color: secondaryText }]}>{settings.fontSize.charAt(0).toUpperCase() + settings.fontSize.slice(1)}</Text>
              <Icon name="chevron-forward-outline" size={16} color={secondaryText} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Text style={[styles.cardTitle, { color: secondaryText }]}>Behavior</Text>
          {renderToggleRow('Enter to Send', 'enterToSend', 'return-down-back-outline', 'Press Enter to send a message')}
          {renderToggleRow('Double‑tap to Reply', 'doubleTapReply', 'hand-left-outline', 'Double‑tap a message to reply')}
          {renderToggleRow('Show Typing Indicators', 'typingIndicators', 'ellipsis-horizontal-outline', 'Show when others are typing')}
          {renderToggleRow('Auto‑Correct', 'autoCorrect', 'checkmark-circle-outline', 'Enable auto‑correct in input')}
        </View>
      </ScrollView>

      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e1e30' : '#ffffff' }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>Select Font Size</Text>
            {['Small', 'Medium', 'Large'].map((label) => (
              <TouchableOpacity
                key={label}
                style={styles.modalOption}
                onPress={() => {
                  setSettings({ ...settings, fontSize: label.toLowerCase() });
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: textColor }]}>{label}</Text>
                {settings.fontSize === label.toLowerCase() && (
                  <Icon name="checkmark-circle" size={20} color={accentColor} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  optionRight: { flexDirection: 'row', alignItems: 'center' },
  optionValue: { fontSize: 14, marginRight: 6, opacity: 0.7 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  modalOptionText: { fontSize: 16, fontWeight: '500' },
});
