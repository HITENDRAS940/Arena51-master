import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LocationProvider } from './src/contexts/LocationContext';
import AppNavigator from './src/navigation/AppNavigator';

const AppContent = () => {
  return (
    <AppNavigator />
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LocationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
