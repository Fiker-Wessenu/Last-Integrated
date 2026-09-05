import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Path } from 'react-native-svg';

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'notifications-off-outline') path = 'M18 8a6 6 0 0 0-9.33-5M3 3l18 18 M10.73 5.08A6 6 0 0 0 6 11v5l-2 2h14 M13.73 21a2 2 0 0 1-3.46 0';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

const ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Digital Addressing System eDAS Launched',
    date: 'August 15, 2026',
    summary: 'SSGI launches a new digital addressing system for Adama city.',
    type: 'announcement',
  },
  {
    id: '2',
    title: 'Space Science Conference 2026 (S-ARC2026)',
    date: 'August 12, 2026',
    summary: 'Call for abstracts now open. Submit your research by September 30.',
    type: 'event',
  },
  {
    id: '3',
    title: 'Training: "Journey to the Space"',
    date: 'August 10, 2026',
    summary: 'SSGI offers a 5‑day training program on space science and geospatial analysis.',
    type: 'training',
  },
  {
    id: '4',
    title: 'CORS Network Expansion',
    date: 'August 5, 2026',
    summary: 'New Continuous Operating Reference Stations deployed in Southern Ethiopia.',
    type: 'update',
  },
];

const TYPE_COLORS = {
  announcement: '#1B5674',
  event: '#de994a',
  training: '#4CAF50',
  update: '#6c5ce7',
};

export default function NotificationsScreen({ navigation }) {
  const renderItem = ({ item }) => {
    const badgeColor = TYPE_COLORS[item.type] || '#1B5674';
    return (
      <View style={styles.notificationCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
        <Text style={styles.cardSummary}>{item.summary}</Text>
        <View style={[styles.typeBadge, { backgroundColor: badgeColor + '20' }]}>
          <Text style={[styles.typeText, { color: badgeColor }]}>{item.type.toUpperCase()}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <FlatList
        data={ANNOUNCEMENTS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off-outline" size={48} color="#8a8a8a" />
            <Text style={styles.emptyText}>No new notifications</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: {
    backgroundColor: '#1B5674',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
    paddingBottom: 15,
  },
  backButton: { padding: 4, width: 40 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#ffffff', flex: 1, textAlign: 'center' },
  headerRightSpacer: { width: 32 },
  listContent: { padding: 15, paddingBottom: 30 },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    padding: 15,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  cardDate: { fontSize: 11, color: '#8a8a8a' },
  cardSummary: { fontSize: 13, color: '#666666', marginBottom: 10, lineHeight: 18 },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeText: { fontSize: 10, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { marginTop: 12, color: '#8a8a8a', fontSize: 14 },
});
