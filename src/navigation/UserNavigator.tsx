import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/user/HomeScreen';
import ServiceExploreScreen from '../screens/user/ServiceExploreScreen';
import ServiceDetailScreen from '../screens/user/ServiceDetailScreen';
import MyBookingsScreen from '../screens/user/MyBookingsScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import WalletScreen from '../screens/user/WalletScreen';
import PaymentProcessingScreen from '../screens/user/PaymentProcessingScreen';
import BookingSummaryScreen from '../screens/user/BookingSummaryScreen';
import PaymentCheckoutScreen from '../screens/user/PaymentCheckoutScreen';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import CustomTabBar from '../components/shared/CustomTabBar';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

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

// Only HomeScreen lives in this stack - all other screens are in the root stack
const HomeStack = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <RootStack.Screen name="HomeMain" component={HomeScreen} />
  </RootStack.Navigator>
);

// Tab Navigator - ONLY contains the 3 main screens
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
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

// Root Navigator - Tab Navigator + all other screens without tabs
const UserNavigator = () => {
  return (
    <>
      <RedirectHandler />
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 200,
        }}
      >
        {/* Main Tabs */}
        <RootStack.Screen name="MainTabs" component={TabNavigator} />
      
      {/* Screens WITHOUT tab bar - they are outside the Tab Navigator */}
      <RootStack.Screen name="AllServices" component={ServiceExploreScreen} />
      <RootStack.Screen name="CategoryServices" component={ServiceExploreScreen} />
      <RootStack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <RootStack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} />
      <RootStack.Screen name="BookingSummary" component={BookingSummaryScreen} />
      <RootStack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
      <RootStack.Screen name="Wallet" component={WalletScreen} />
      </RootStack.Navigator>
    </>
  );
};

export default UserNavigator;
