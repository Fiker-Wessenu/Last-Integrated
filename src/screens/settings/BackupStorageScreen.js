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
const STORAGE_KEY = 'backup_settings';

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'cloud-outline') path = 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z';
  if (name === 'chatbubbles-outline') path = 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z';
  if (name === 'image-outline') path = 'M3 3h18v18H3z M3 16l5-5 3 3 5-5 5 5';
  if (name === 'trash-outline') path = 'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2';
  if (name === 'videocam-outline') path = 'M23 7l-7 5 7 5V7z M1 5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H1a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z';
  if (name === 'musical-notes-outline') path = 'M9 18V5l12-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
  if (name === 'calendar-outline') path = 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18';
  if (name === 'chevron-forward-outline') path = 'M9 5l7 7-7 7';
  if (name === 'cloud-upload-outline') path = 'M16 16l-4-4-4 4 M12 12v9 M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3';
  if (name === 'checkmark-circle') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9 12l2 2 4-4';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

export default function BackupStorageScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const [settings, setSettings] = useState({
    autoDownloadImages: true,
    autoDownloadVideos: false,
    autoDownloadAudio: true,
    backupFrequency: 'weekly',
    lastBackup: 'Yesterday, 10:30 AM',
  });
  const [storageUsage, setStorageUsage] = useState({ chats: 12.5, media: 45.8, cache: 8.2, total: 66.5 });
  const [frequencyModalVisible, setFrequencyModalVisible] = useState(false);

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
        <Text style={[styles.headerTitle, { color: textColor }]}>Backup & Storage</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Icon name="cloud-outline" size={18} color={goldAccent} />
          <Text style={[styles.infoText, { color: secondaryText, marginLeft: 10 }]}>
            Manage your data, backups, and storage usage.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: secondaryText }]}>Storage Usage</Text>
            <Text style={[styles.storageTotal, { color: textColor }]}>{storageUsage.total.toFixed(1)} MB</Text>
          </View>
          <View style={styles.storageItem}>
            <Icon name="chatbubbles-outline" size={16} color={brandColor} />
            <Text style={[styles.storageLabel, { color: textColor, marginLeft: 8 }]}>Chats</Text>
            <Text style={[styles.storageValue, { color: secondaryText, marginLeft: 'auto' }]}>{storageUsage.chats} MB</Text>
          </View>
          <View style={styles.storageItem}>
            <Icon name="image-outline" size={16} color={accentColor} />
            <Text style={[styles.storageLabel, { color: textColor, marginLeft: 8 }]}>Media</Text>
            <Text style={[styles.storageValue, { color: secondaryText, marginLeft: 'auto' }]}>{storageUsage.media} MB</Text>
          </View>

          <TouchableOpacity style={[styles.clearCacheBtn, { borderColor: borderColor }]} onPress={() => Alert.alert('Clear Cache', 'Cache cleared!')}>
            <Icon name="trash-outline" size={16} color="#c0392b" />
            <Text style={[styles.clearCacheText, { color: '#c0392b', marginLeft: 6 }]}>Clear Cache</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Text style={[styles.cardTitle, { color: secondaryText }]}>Auto-Download</Text>
          {renderToggleRow('Images', 'autoDownloadImages', 'image-outline', 'Download images automatically')}
          {renderToggleRow('Videos', 'autoDownloadVideos', 'videocam-outline', 'Download videos automatically')}
          {renderToggleRow('Audio', 'autoDownloadAudio', 'musical-notes-outline', 'Download audio files automatically')}
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: secondaryText }]}>Backup</Text>
            <Text style={[styles.lastBackupText, { color: secondaryText }]}>Last: {settings.lastBackup}</Text>
          </View>
          <TouchableOpacity style={[styles.backupNowBtn, { backgroundColor: brandColor }]} onPress={() => Alert.alert('Backup', 'Backup started!')}>
            <Icon name="cloud-upload-outline" size={18} color="#ffffff" />
            <Text style={[styles.backupNowText, { marginLeft: 8 }]}>Backup Now</Text>
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
  card: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', paddingTop: 6, opacity: 0.6 },
  storageItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  storageLabel: { fontSize: 14 },
  storageValue: { fontSize: 13 },
  storageTotal: { fontSize: 14, fontWeight: '700' },
  clearCacheBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, marginTop: 4, borderRadius: 8, borderWidth: 1 },
  clearCacheText: { fontSize: 13, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  toggleLabel: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  toggleText: { fontSize: 15, fontWeight: '500' },
  toggleDescription: { fontSize: 12, opacity: 0.6, marginTop: 1 },
  backupNowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, marginTop: 10 },
  backupNowText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  lastBackupText: { fontSize: 12, opacity: 0.6 },
});
