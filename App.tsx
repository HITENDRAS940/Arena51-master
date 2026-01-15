import React from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { preventAutoHideAsync, hideAsync } from 'expo-splash-screen';
import { 
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold 
} from '@expo-google-fonts/inter';

import AnimatedSplashScreen from './src/components/shared/AnimatedSplashScreen';
import { AlertProvider } from './src/components/shared/CustomAlert';

// Keep the splash screen visible while we fetch resources
preventAutoHideAsync();

const AppContent = () => {
  const [showSplash, setShowSplash] = React.useState(true);
  const [appIsReady, setAppIsReady] = React.useState(false);
  
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  const onSplashFinished = React.useCallback(async () => {
    setShowSplash(false);
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      // This tells the native splash screen to hide immediately
      // The AnimatedSplashScreen is already rendered underneath
      await hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {showSplash ? (
        <AnimatedSplashScreen onAnimationComplete={onSplashFinished} />
      ) : (
        <NavigationContainer>

          <AppNavigator />
        </NavigationContainer>
      )}
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LocationProvider>
          <AuthProvider>
            <AlertProvider>
              <AppContent />
            </AlertProvider>
          </AuthProvider>
        </LocationProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
