import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import DashboardScreen from '../screens/admin/DashboardScreen';
import ServiceManagementScreen from '../screens/admin/ServiceManagementScreen';
import AllBookingsScreen from '../screens/admin/AllBookingsScreen';
import AdminMoreScreen from '../screens/admin/AdminMoreScreen';
import AdminServiceDetailScreen from '../screens/admin/AdminServiceDetailScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

import CustomTabBar from '../components/shared/CustomTabBar';

// Services Stack Navigator
const ServicesStack = () => {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="ServiceManagementList" component={ServiceManagementScreen} />
      <Stack.Screen name="AdminServiceDetail" component={AdminServiceDetailScreen} />
    </Stack.Navigator>
  );
};

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen 
        name="Services" 
        component={ServicesStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'ServiceManagementList';
          return {
            tabBarStyle: routeName === 'AdminServiceDetail' ? { display: 'none' } : undefined,
          };
        }}
      />
      <Tab.Screen name="Users" component={UserManagementScreen} />
      <Tab.Screen name="Bookings" component={AllBookingsScreen} />
      <Tab.Screen name="More" component={AdminMoreScreen} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
