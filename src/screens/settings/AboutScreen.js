import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
  Share,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../firebase/context/ThemeContext';
import { LogoSVG as Logo } from '../../components/Branding';

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'share-social-outline') path = 'M18 8a3 3 0 1 0-3-3 3 3 0 0 0 3 3z M6 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3z M18 19a3 3 0 1 0-3-3 3 3 0 0 0 3 3z M8.59 13.51l6.83 3.98 M15.41 6.51L8.59 10.49';
  if (name === 'star-outline') path = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
  if (name === 'globe-outline') path = 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z M12 2v20 M2 12h20';
  if (name === 'chatbubbles-outline') path = 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z';
  if (name === 'lock-closed-outline') path = 'M7 11V7a5 5 0 0 1 10 0v4 M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z';
  if (name === 'people-outline') path = 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0-4-4 4 4 0 0 0 4 4z';
  if (name === 'moon-outline') path = 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z';
  if (name === 'rocket-outline') path = 'M4.5 16.5c0 0 4.5 1.5 7.5-3s3-7.5 3-7.5-4.5-1.5-7.5 3-3 7.5-3 7.5z M8 13l-3 3 M11 10l3-3';
  if (name === 'cloud-outline') path = 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z';
  if (name === 'planet-outline') path = 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v12 M6 12h12';
  if (name === 'code-outline') path = 'M16 18l6-6-6-6 M8 6l-6 6 6 6';
  if (name === 'server-outline') path = 'M3 4h18v11H3z M3 13h18 M12 17h.01';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

export default function AboutScreen({ navigation }) {
  const { colors, theme } = useTheme();
  const isDark = theme === 'dark';

  const bgColor = colors.background;
  const textColor = colors.text;
  const secondaryText = colors.rowTime;
  const borderColor = colors.border;
  const cardColor = colors.rowBg;
  const brandColor = colors.primary;
  const accentColor = colors.tabActiveBg;
  const goldAccent = '#de994a';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroBanner, { backgroundColor: isDark ? '#1a2a4a' : brandColor }]}>
          <View style={styles.heroContent}>
            <Logo width={120} height={120} />
            <Text style={[styles.appName, { color: '#ffffff' }]}>Orbit Chat</Text>
            <Text style={[styles.appVersion, { color: 'rgba(255,255,255,0.8)' }]}>Version 1.0.0</Text>
          </View>
        </View>

        <View style={styles.taglineContainer}>
          <Text style={[styles.tagline, { color: secondaryText }]}>
            Secure Communication for Space & Geospatial Teams
          </Text>
        </View>

        <View style={[styles.aboutCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Text style={[styles.aboutTitle, { color: textColor }]}>About Orbit Chat</Text>
          <Text style={[styles.aboutDescription, { color: secondaryText }]}>
            Orbit Chat is a secure, real‑time messaging platform built exclusively for the Space Science and Geospatial Institute (SSGI).
          </Text>
          <TouchableOpacity style={[styles.websiteButton, { backgroundColor: brandColor }]} onPress={() => Linking.openURL('https://ssgi.gov.et/')}>
            <Text style={styles.buttonText}>Visit SSGI Website</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
          <Text style={[styles.sectionLabel, { color: secondaryText }]}>🚀 Features</Text>
          <View style={styles.featuresGrid}>
            {[
              { icon: 'chatbubbles-outline', label: 'Messaging', color: accentColor },
              { icon: 'lock-closed-outline', label: 'Encrypted', color: '#34c759' },
              { icon: 'people-outline', label: 'Groups', color: '#5ac8fa' },
              { icon: 'moon-outline', label: 'Themes', color: '#ff9f0a' },
            ].map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <Icon name={item.icon} size={18} color={item.color} />
                <Text style={[styles.featureLabel, { color: secondaryText, marginLeft: 8 }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.copyrightText, { color: secondaryText }]}>© 2025 Orbit Chat. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  backButton: { padding: 4, width: 40 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  heroBanner: { paddingVertical: 32, borderRadius: 24, alignItems: 'center', marginBottom: 20 },
  heroContent: { alignItems: 'center' },
  appName: { fontSize: 28, fontWeight: '700', marginTop: 12 },
  appVersion: { fontSize: 14, marginTop: 4 },
  taglineContainer: { paddingVertical: 16, alignItems: 'center' },
  tagline: { fontSize: 15, textAlign: 'center', opacity: 0.8 },
  aboutCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 16 },
  aboutTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  aboutDescription: { fontSize: 14, lineHeight: 22 },
  websiteButton: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 15 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  featureItem: { width: '48%', flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  featureLabel: { fontSize: 13 },
  footer: { alignItems: 'center', marginTop: 20 },
  copyrightText: { fontSize: 12, opacity: 0.6 },
});
