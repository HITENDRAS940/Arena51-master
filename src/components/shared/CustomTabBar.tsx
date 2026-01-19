import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import CalendarIcon from './icons/CalendarIcon';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring } from 'react-native-reanimated';
import ProfileIcon from './icons/ProfileIcon';
import HomeIcon from './icons/HomeIcon';

const CustomTabBar: React.FC<MaterialTopTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const { isAuthenticated, setRedirectData } = useAuth();
  const insets = useSafeAreaInsets();

  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = descriptors[focusedRoute.key].options;
  
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isHidden = (focusedOptions as any)?.tabBarStyle?.display === 'none';
  
  React.useEffect(() => {
    if (isHidden) {
      translateY.value = withTiming(150, { duration: 300 });
      opacity.value = withTiming(0, { duration: 250 });
    } else {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 250 });
    }
  }, [isHidden]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View 
      style={[styles.container, { paddingBottom: insets.bottom }, animatedStyle]}
      pointerEvents={isHidden ? 'none' : 'auto'}
    >
      <View style={[styles.tabBar, { backgroundColor: theme.colors.background, shadowColor: theme.colors.shadow }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'HomeTab') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = isFocused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = isFocused ? 'person' : 'person-outline';
          }

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <View style={styles.tabItemContent}>
                {route.name === 'Profile' ? (
                  <ProfileIcon 
                    size={24} 
                    color={isFocused ? theme.colors.navy : theme.colors.textSecondary} 
                  />
                ) : route.name === 'HomeTab' ? (
                  <HomeIcon 
                    size={24} 
                    color={isFocused ? theme.colors.navy : theme.colors.textSecondary} 
                  />
                ) : route.name === 'Bookings' ? (
                  <CalendarIcon
                    size={24}
                    color={isFocused ? theme.colors.navy : theme.colors.textSecondary}
                  />
                ) : (
                  <Ionicons 
                    name={iconName} 
                    size={24} 
                    color={isFocused ? theme.colors.navy : theme.colors.textSecondary} 
                  />
                )}
                <Text style={[
                  styles.label, 
                  { 
                    color: isFocused ? theme.colors.navy : theme.colors.textSecondary,
                    fontWeight: isFocused ? '700' : '500'
                  }
                ]}>
                  {label as string}
                </Text>
                {isFocused && (
                  <View style={[styles.activeIndicator, { backgroundColor: theme.colors.navy }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 25,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -12,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export default CustomTabBar;
