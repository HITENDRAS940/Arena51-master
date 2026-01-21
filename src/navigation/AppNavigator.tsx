import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';

import { View, StyleSheet, ActivityIndicator } from 'react-native';

import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName="User"
      screenOptions={{ 
        headerShown: false,
        animation: 'fade',
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="User" component={UserNavigator} />
      <Stack.Screen name="Auth" component={AuthNavigator} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
