import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../firebase/context/ThemeContext';

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'phone-portrait-outline') path = 'M5 4h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M12 18h.01';
  if (name === 'laptop-outline') path = 'M4 18h16 M3 14h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2z';
  if (name === 'desktop-outline') path = 'M3 3h18v11H3z M8 21h8 M12 17v4';
  if (name === 'devices-outline') path = 'M18 8a6 6 0 0 1-7.76 5.74l-1.51 1.51 M12 2a10 10 0 1 0 10 10';
  if (name === 'log-out-outline') path = 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

const MOCK_DEVICES = [
  { id: '1', name: 'iPhone 15 Pro', location: 'Addis Ababa, Ethiopia', lastActive: 'Now', isCurrent: true },
  { id: '2', name: 'MacBook Pro', location: 'Addis Ababa, Ethiopia', lastActive: '2 hours ago', isCurrent: false },
  { id: '3', name: 'Chrome (Windows)', location: 'Addis Ababa, Ethiopia', lastActive: 'Yesterday, 4:30 PM', isCurrent: false },
  { id: '4', name: 'Samsung Galaxy S23', location: 'Addis Ababa, Ethiopia', lastActive: '2 days ago', isCurrent: false },
];

export default function DevicesScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';
  const [devices, setDevices] = useState(MOCK_DEVICES);

  const bgColor = colors.background;
  const textColor = colors.text;
  const secondaryText = colors.rowTime;
  const borderColor = colors.border;
  const cardColor = colors.rowBg;
  const brandColor = colors.primary;
  const accentColor = colors.tabActiveBg;
  const goldAccent = '#de994a';

  const handleRevoke = (deviceId) => {
    Alert.alert('Revoke Session', 'Are you sure you want to revoke this session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: () => setDevices(prev => prev.filter(d => d.id !== deviceId)) },
    ]);
  };

  const handleLogoutAll = () => {
    Alert.alert('Log Out All', 'This will log you out of all devices except this one.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out All', style: 'destructive', onPress: () => setDevices(prev => prev.filter(d => d.isCurrent)) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Devices</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Icon name="devices-outline" size={18} color={goldAccent} />
          <Text style={[styles.infoText, { color: secondaryText, marginLeft: 10 }]}>
            Manage your active sessions. Revoke any device you don't recognize.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Text style={[styles.cardTitle, { color: secondaryText }]}>Active Devices</Text>
          {devices.map((device) => (
            <View key={device.id} style={[styles.deviceItem, { borderBottomColor: borderColor }]}>
              <View style={styles.deviceLeft}>
                <View style={[styles.deviceIcon, { backgroundColor: device.isCurrent ? brandColor + '20' : 'rgba(128,128,128,0.1)' }]}>
                  <Icon
                    name={device.name.includes('iPhone') || device.name.includes('Samsung') ? 'phone-portrait-outline' : device.name.includes('MacBook') ? 'laptop-outline' : 'desktop-outline'}
                    size={22}
                    color={device.isCurrent ? brandColor : secondaryText}
                  />
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={[styles.deviceName, { color: textColor }]}>{device.name}</Text>
                  <Text style={[styles.deviceLocation, { color: secondaryText }]}>{device.location}</Text>
                  <Text style={[styles.deviceLastActive, { color: secondaryText }]}>Last active: {device.lastActive}</Text>
                </View>
              </View>
              <View style={styles.deviceRight}>
                {device.isCurrent ? (
                  <View style={[styles.currentBadge, { backgroundColor: brandColor }]}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={[styles.revokeBtn, { borderColor: borderColor }]} onPress={() => handleRevoke(device.id)}>
                    <Text style={[styles.revokeText, { color: accentColor }]}>Revoke</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={[styles.logoutAllBtn, { borderColor: borderColor }]} onPress={handleLogoutAll}>
          <Icon name="log-out-outline" size={18} color="#c0392b" />
          <Text style={[styles.logoutAllText, { color: '#c0392b', marginLeft: 8 }]}>Log Out All Devices</Text>
        </TouchableOpacity>
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
  card: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 16 },
  cardTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', paddingTop: 6, opacity: 0.6 },
  deviceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  deviceLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  deviceIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 15, fontWeight: '500' },
  deviceLocation: { fontSize: 13, opacity: 0.7 },
  deviceLastActive: { fontSize: 12, opacity: 0.5, marginTop: 2 },
  currentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  currentBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '600' },
  revokeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  revokeText: { fontSize: 13, fontWeight: '600' },
  logoutAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  logoutAllText: { fontSize: 15, fontWeight: '600' },
});
