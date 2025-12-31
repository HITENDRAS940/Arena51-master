import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Determine which navigator to show
  const getNavigator = () => {
    // If loading, we've already handled it above
    
    // Admin user - show admin interface
    if (user && isAdmin) {
      return <Stack.Screen name="Admin" component={AdminNavigator} />;
    }
    
    // New user who needs to set name - stay in auth flow if they reached here after OTP
    if (user && user.isNewUser && user.role === 'ROLE_USER') {
      return <Stack.Screen name="Auth" component={AuthNavigator} />;
    }
    
    // Default flow: Regular User or Guest browsing
    return (
      <>
        <Stack.Screen name="User" component={UserNavigator} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      >
        {getNavigator()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AppNavigator;