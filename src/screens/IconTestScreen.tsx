import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const IconTestScreen: React.FC = () => {
  const { theme } = useTheme();
  
  const testIcons = [
    { name: 'analytics', label: 'Dashboard' },
    { name: 'analytics-outline', label: 'Dashboard Outline' },
    { name: 'football', label: 'Turfs' },
    { name: 'football-outline', label: 'Turfs Outline' },
    { name: 'calendar', label: 'Bookings' },
    { name: 'calendar-outline', label: 'Bookings Outline' },
    { name: 'menu', label: 'More' },
    { name: 'menu-outline', label: 'More Outline' },
    { name: 'person', label: 'Person' },
    { name: 'person-outline', label: 'Person Outline' },
    { name: 'location', label: 'Location' },
    { name: 'location-outline', label: 'Location Outline' },
    { name: 'time', label: 'Time' },
    { name: 'time-outline', label: 'Time Outline' },
    { name: 'call', label: 'Call' },
    { name: 'call-outline', label: 'Call Outline' },
    { name: 'mail', label: 'Mail' },
    { name: 'mail-outline', label: 'Mail Outline' },
    { name: 'checkmark-circle', label: 'Success' },
    { name: 'close-circle', label: 'Error' },
    { name: 'information-circle', label: 'Info' },
    { name: 'warning', label: 'Warning' },
    { name: 'star', label: 'Star' },
    { name: 'star-outline', label: 'Star Outline' },
    { name: 'heart', label: 'Heart' },
    { name: 'heart-outline', label: 'Heart Outline' },
    { name: 'add', label: 'Add' },
    { name: 'remove', label: 'Remove' },
    { name: 'search', label: 'Search' },
    { name: 'filter', label: 'Filter' },
    { name: 'settings', label: 'Settings' },
    { name: 'settings-outline', label: 'Settings Outline' },
    { name: 'help-circle', label: 'Help' },
    { name: 'help-circle-outline', label: 'Help Outline' },
    { name: 'notifications', label: 'Notifications' },
    { name: 'notifications-outline', label: 'Notifications Outline' },
    { name: 'log-out', label: 'Logout' },
    { name: 'log-out-outline', label: 'Logout Outline' },
    { name: 'arrow-back', label: 'Back' },
    { name: 'arrow-forward', label: 'Forward' },
    { name: 'chevron-up', label: 'Chevron Up' },
    { name: 'chevron-down', label: 'Chevron Down' },
    { name: 'chevron-back', label: 'Chevron Back' },
    { name: 'chevron-forward', label: 'Chevron Forward' },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Icon Test Screen</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Testing all Ionicons used in the app
      </Text>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.grid}>
        {testIcons.map((icon, index) => (
          <View key={index} style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name={icon.name} size={32} color={theme.colors.primary} />
            <Text style={[styles.iconLabel, { color: theme.colors.text }]}>{icon.label}</Text>
            <Text style={[styles.iconName, { color: theme.colors.textSecondary }]}>{icon.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  iconContainer: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  iconName: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default IconTestScreen;
