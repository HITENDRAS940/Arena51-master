import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/user/HomeScreen';
import AuthNavigator from './AuthNavigator';
import ServiceExploreScreen from '../screens/user/ServiceExploreScreen';
import ServiceDetailScreen from '../screens/user/ServiceDetailScreen';
import MyBookingsScreen from '../screens/user/MyBookingsScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import WalletScreen from '../screens/user/WalletScreen';
import PaymentProcessingScreen from '../screens/user/PaymentProcessingScreen';
import BookingSummaryScreen from '../screens/user/BookingSummaryScreen';
import PaymentCheckoutScreen from '../screens/user/PaymentCheckoutScreen';
import HelpSupportScreen from '../screens/user/HelpSupportScreen';
import AboutScreen from '../screens/user/AboutScreen';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import CustomTabBar from '../components/shared/CustomTabBar';
import { useNavigation } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();
const MainRootStack = createNativeStackNavigator();
const SubScreenStack = createNativeStackNavigator();

const RedirectHandler = () => {
  const { isAuthenticated, redirectData, setRedirectData } = useAuth();
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    if (isAuthenticated && redirectData) {
      const { name, params } = redirectData;
      setRedirectData(null); // Clear first to avoid loops
      
      // Small delay to ensure navigator is ready after auth swap
      setTimeout(() => {
        navigation.navigate(name, params);
      }, 100);
    }
  }, [isAuthenticated, redirectData]);

  return null;
};

// No longer need HomeStack, we'll use HomeScreen directly in the tab

const TabNavigator = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      tabBarPosition="bottom"
      screenOptions={{ 
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={MyBookingsScreen} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

const UserNavigator = () => {
  return (
    <>
      <RedirectHandler />
      <MainRootStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      >
        {/* Main Tabs */}
        <MainRootStack.Screen name="MainTabs" component={TabNavigator} />
      
        {/* Screens WITHOUT tab bar - they are outside the Tab Navigator */}
        <MainRootStack.Screen name="AllServices" component={ServiceExploreScreen} />
        <MainRootStack.Screen name="CategoryServices" component={ServiceExploreScreen} />
        <MainRootStack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
        <MainRootStack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} />
        <MainRootStack.Screen name="BookingSummary" component={BookingSummaryScreen} />
        <MainRootStack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
        <MainRootStack.Screen name="Wallet" component={WalletScreen} />
        <MainRootStack.Screen name="HelpSupport" component={HelpSupportScreen} />
        <MainRootStack.Screen name="About" component={AboutScreen} />
        <MainRootStack.Screen name="Auth" component={AuthNavigator} />
      </MainRootStack.Navigator>
    </>
  );
};

export default UserNavigator;
