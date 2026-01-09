import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import ProfileIcon from './icons/ProfileIcon';
import HomeIcon from './icons/HomeIcon';
import LocationIcon from './icons/LocationIcon';
import BasketballIcon from './icons/activities/BasketballIcon';

import CalendarIcon from './icons/CalendarIcon';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap | 'home-custom' | 'profile-custom' | 'location-custom' | 'basketball-custom' | 'calendar-custom';
  title: string;
  description: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {icon === 'home' || icon === 'home-custom' ? (
        <HomeIcon size={64} color={theme.colors.gray} />
      ) : icon === 'person' || icon === 'profile-custom' ? (
        <ProfileIcon size={64} color={theme.colors.gray} />
      ) : icon === 'location' || icon === 'location-custom' ? (
        <LocationIcon size={64} color={theme.colors.gray} />
      ) : icon === 'basketball' || icon === 'basketball-custom' ? (
        <BasketballIcon size={64} color={theme.colors.gray} />
      ) : icon === 'calendar' || icon === 'calendar-outline' || icon === 'calendar-custom' ? (
        <CalendarIcon size={64} color={theme.colors.gray} />
      ) : (
        <Ionicons name={icon as any} size={64} color={theme.colors.gray} />
      )}
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});

export default EmptyState;
