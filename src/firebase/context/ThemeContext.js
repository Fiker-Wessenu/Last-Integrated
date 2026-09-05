import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Theme Presets ──────────────────────────────────────────
// Each preset overrides the accent-driven keys only (primary, active tab,
// unread badges, active nav icon) — structural colors (headerBg, bottomBarBg,
// card backgrounds, text, borders) still come from the base light/dark palette.
export const THEME_PRESETS = {
  ssgiBlue: {
    name: 'SSGI Blue',
    primary: '#0088cc',
    accent: '#de994a',
  },
  gold: {
    name: 'Gold',
    primary: '#b8860b',
    accent: '#f0c040',
  },
  purple: {
    name: 'Purple',
    primary: '#6c5ce7',
    accent: '#a29bfe',
  },
  deepSpace: {
    name: 'Deep Space',
    primary: '#1a1a2e',
    accent: '#6c5ce7',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();

  // ─── State ──────────────────────────────────────────────────
  const [themeMode, setThemeMode] = useState('system'); // 'light' | 'dark' | 'system'
  const [preset, setPreset] = useState('ssgiBlue');
  const [accentColor, setAccentColor] = useState(null); // overrides preset accent when set

  // ─── Resolve light/dark from mode + device scheme ──────────
  const theme = themeMode === 'system'
    ? (systemScheme === 'dark' ? 'dark' : 'light')
    : themeMode;

  const isDark = theme === 'dark';

  // ─── Base palettes (unchanged from your existing app) ──────
  const baseColors = {
    light: {
      background: '#ffffff',
      text: '#1a1a1a',
      headerBg: '#1B5674',
      headerText: '#ffffff',
      searchBg: 'rgba(255,255,255,0.88)',
      searchText: '#333333',
      tabBg: 'transparent',
      tabActiveBg: '#de994a',
      tabText: '#4a3b1f',
      tabActiveText: '#ffffff',
      rowBg: '#ffffff',
      rowText: '#111111',
      rowPreview: '#666666',
      rowTime: '#8a8a8a',
      border: '#e0e0e0',
      unreadBg: '#1b5674',
      bottomBarBg: '#b6a378',
      navCapsuleBg: '#ffffff',
      navIconActive: '#1b5674',
      navIconInactive: '#aaaaaa',
      modalBg: '#ffffff',
      modalText: '#111111',
      primary: '#0088cc',
    },
    dark: {
      background: '#121212',
      text: '#e6e6e6',
      headerBg: '#0a2a3a',
      headerText: '#e6e6e6',
      searchBg: '#2a2a2a',
      searchText: '#e6e6e6',
      tabBg: 'transparent',
      tabActiveBg: '#de994a',
      tabText: '#a0a0a0',
      tabActiveText: '#ffffff',
      rowBg: '#1e1e1e',
      rowText: '#e6e6e6',
      rowPreview: '#a0a0a0',
      rowTime: '#8a8a8a',
      border: '#333333',
      unreadBg: '#0088cc',
      bottomBarBg: '#1a1a1a',
      navCapsuleBg: '#2a2a2a',
      navIconActive: '#0088cc',
      navIconInactive: '#666666',
      modalBg: '#1e1e1e',
      modalText: '#e6e6e6',
      primary: '#0088cc',
    },
  };

  // ─── Layer preset + custom accent on top of the base palette ─
  const presetColors = THEME_PRESETS[preset] || THEME_PRESETS.ssgiBlue;
  const resolvedAccent = accentColor || presetColors.accent;

  const currentTheme = {
    ...(baseColors[theme] || baseColors.light),
    primary: presetColors.primary,
    tabActiveBg: resolvedAccent,
    unreadBg: resolvedAccent,
    navIconActive: presetColors.primary,
  };

  // ─── Persistence ───────────────────────────────────────────
  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    savePreferences();
  }, [themeMode, preset, accentColor]);

  const loadPreferences = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme_prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        if (prefs.themeMode) setThemeMode(prefs.themeMode);
        if (prefs.preset) setPreset(prefs.preset);
        if (prefs.accentColor) setAccentColor(prefs.accentColor);
      }
    } catch (error) {
      console.warn('Failed to load theme preferences', error);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem('theme_prefs', JSON.stringify({
        themeMode,
        preset,
        accentColor,
      }));
    } catch (error) {
      console.warn('Failed to save theme preferences', error);
    }
  };

  const setTheme = (mode) => setThemeMode(mode);
  const setThemePreset = (p) => setPreset(p);
  const setCustomAccent = (color) => setAccentColor(color);

  // toggleTheme keeps its old two-value behavior for any screen that
  // just wants a day/night switch — it always resolves to an explicit
  // 'light' or 'dark', taking the app out of 'system' mode.
  const toggleTheme = () => {
    setThemeMode(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        themeMode,
        preset,
        accentColor,
        colors: currentTheme,
        toggleTheme,
        setTheme,
        setThemePreset,
        setCustomAccent,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};