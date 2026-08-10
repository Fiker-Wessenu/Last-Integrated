import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setTheme(systemScheme);
  }, [systemScheme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const colors = {
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

  const currentTheme = colors[theme] || colors.light;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
