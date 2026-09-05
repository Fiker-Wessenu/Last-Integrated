import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme, THEME_PRESETS } from '../../firebase/context/ThemeContext';
import { SPACING, RADIUS } from '../../constants/Typography';

const ACCENT_COLORS = ['#de994a', '#f0c040', '#fd79a8', '#00b894', '#0984e3', '#6c5ce7'];

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'chevron-back-outline') path = 'M15 19l-7-7 7-7';
  if (name === 'sunny-outline') path = 'M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z';
  if (name === 'moon-outline') path = 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z';
  if (name === 'phone-portrait-outline') path = 'M5 4h14a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M12 18h.01';
  if (name === 'ellipse-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z';
  if (name === 'checkmark') path = 'M20 6L9 17l-5-5';
  if (name === 'information-circle-outline') path = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

export default function ThemeScreen({ navigation }) {
  const {
    colors,
    theme,
    isDark,
    themeMode,
    preset,
    accentColor,
    setTheme,
    setThemePreset,
    setCustomAccent,
  } = useTheme();

  const bgColor = colors.background;
  const textColor = colors.text;
  const secondaryText = colors.rowTime;
  const borderColor = colors.border;
  const cardColor = colors.rowBg;
  const brandColor = colors.primary;
  const accent = colors.tabActiveBg;

  const presets = THEME_PRESETS ? Object.entries(THEME_PRESETS) : [];

  const handleModeSelect = (mode) => setTheme && setTheme(mode);
  const handlePresetSelect = (key) => setThemePreset && setThemePreset(key);
  const handleAccentSelect = (color) => setCustomAccent && setCustomAccent(color);
  const resetAccent = () => setCustomAccent && setCustomAccent(null);

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'light': return 'sunny-outline';
      case 'dark': return 'moon-outline';
      case 'system': return 'phone-portrait-outline';
      default: return 'ellipse-outline';
    }
  };

  const PreviewCard = () => (
    <View style={[styles.previewCard, { backgroundColor: cardColor, borderColor: borderColor }]}>
      <Text style={[styles.previewTitle, { color: textColor }]}>Live Preview</Text>
      <View style={[styles.previewChat, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f0f0f5' }]}>
        <View style={[styles.previewBubble, styles.previewBubbleSent, { backgroundColor: brandColor }]}>
          <Text style={[styles.previewBubbleText, { color: '#ffffff' }]}>Hello!</Text>
        </View>
        <View style={[styles.previewBubble, styles.previewBubbleReceived, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#ffffff' }]}>
          <Text style={[styles.previewBubbleText, { color: textColor }]}>Hi there!</Text>
        </View>
      </View>
      <View style={styles.previewMeta}>
        <Text style={[styles.previewMetaText, { color: secondaryText }]}>
          {isDark ? '🌙 Dark' : '☀️ Light'} • {THEME_PRESETS && THEME_PRESETS[preset]?.name || 'SSGI Blue'}
        </Text>
        {accentColor && (
          <Text style={[styles.previewMetaText, { color: secondaryText }]}>
            Accent: {accentColor.toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back-outline" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Theme</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <PreviewCard />

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: secondaryText }]}>Mode</Text>
          <View style={styles.modeOptions}>
            {['light', 'dark', 'system'].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeChip,
                  themeMode === mode && { backgroundColor: brandColor, borderColor: brandColor },
                  { borderColor: borderColor },
                ]}
                onPress={() => handleModeSelect(mode)}
                activeOpacity={0.7}
              >
                <Icon
                  name={getModeIcon(mode)}
                  size={18}
                  color={themeMode === mode ? '#ffffff' : secondaryText}
                />
                <Text
                  style={[
                    styles.modeChipText,
                    { color: themeMode === mode ? '#ffffff' : secondaryText, marginLeft: 6 },
                  ]}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {presets.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: secondaryText }]}>Theme Presets</Text>
            <View style={styles.presetGrid}>
              {presets.map(([key, p]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.presetCard,
                    { backgroundColor: cardColor, borderColor: borderColor },
                    preset === key && { borderColor: brandColor, borderWidth: 2 },
                  ]}
                  onPress={() => handlePresetSelect(key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.presetHeader, { backgroundColor: p.primary }]} />
                  <View style={styles.presetBody}>
                    <Text style={[styles.presetName, { color: textColor }]}>{p.name}</Text>
                    {preset === key && (
                      <View style={[styles.presetCheck, { backgroundColor: brandColor }]}>
                        <Icon name="checkmark" size={12} color="#ffffff" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.accentHeader}>
            <Text style={[styles.sectionLabel, { color: secondaryText }]}>Accent Color</Text>
            {accentColor && (
              <TouchableOpacity onPress={resetAccent} style={styles.resetAccentBtn}>
                <Text style={[styles.resetAccentText, { color: brandColor }]}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.accentRow}>
            {ACCENT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.accentCircle,
                  { backgroundColor: color },
                  (accentColor === color) && { borderColor: textColor, borderWidth: 2 },
                ]}
                onPress={() => handleAccentSelect(color)}
                activeOpacity={0.7}
              >
                {(accentColor === color) && (
                  <Icon name="checkmark" size={14} color="#ffffff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.noteContainer}>
          <Icon name="information-circle-outline" size={18} color={secondaryText} />
          <Text style={[styles.noteText, { color: secondaryText, marginLeft: 8 }]}>
            Changes are saved automatically.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: { padding: 4, width: 40 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  previewCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewChat: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  previewBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginVertical: 4,
    maxWidth: '70%',
  },
  previewBubbleSent: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  previewBubbleReceived: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
  },
  previewBubbleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  previewMetaText: {
    fontSize: 12,
    opacity: 0.6,
  },
  section: {
    width: '100%',
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  modeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
  },
  modeChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  presetHeader: {
    height: 44,
    width: '100%',
  },
  presetBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '600',
  },
  presetCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetAccentBtn: {
    padding: 4,
  },
  resetAccentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  accentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  accentCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  noteText: {
    fontSize: 13,
    opacity: 0.6,
  },
});
