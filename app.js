import React from 'react';
import AppNavigator from './src/navigation/Appnavigator';
import { AuthProvider } from './src/firebase/context/AuthContext';
import { ThemeProvider } from './src/firebase/context/ThemeContext';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}
