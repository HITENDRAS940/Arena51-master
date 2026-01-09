import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import PhoneEntryScreen from '../screens/auth/PhoneEntryScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import SetNameScreen from '../screens/auth/SetNameScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { user } = useAuth();
  
  // If user exists but name is missing, go directly to SetName screen
  const initialRouteName = (user && !user.name) ? 'SetName' : 'PhoneEntry';

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="SetName" component={SetNameScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
