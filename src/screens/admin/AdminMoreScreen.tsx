import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import GradientHeader from '../../components/shared/GradientHeader';

const AdminMoreScreen = () => {
  const { logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Logged Out', 'You have been logged out successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const menuSections = [
    {
      title: 'General',
      items: [
        {
          title: 'Theme Settings',
          subtitle: 'Customize app appearance',
          icon: 'color-palette-outline',
          onPress: () => {
            Alert.alert('Coming Soon', 'Theme settings will be available soon');
          },
        },
        {
          title: 'Notifications',
          subtitle: 'Manage notification preferences',
          icon: 'notifications-outline',
          onPress: () => {
            Alert.alert('Coming Soon', 'Notification settings will be available soon');
          },
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help & FAQ',
          subtitle: 'Get help and find answers',
          icon: 'help-circle-outline',
          onPress: () => {
            Alert.alert('Coming Soon', 'Help section will be available soon');
          },
        },
        {
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          icon: 'mail-outline',
          onPress: () => {
            Alert.alert('Coming Soon', 'Contact support will be available soon');
          },
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          icon: 'document-text-outline',
          onPress: () => {
            Alert.alert('Coming Soon', 'Terms of service will be available soon');
          },
        },
        {
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          icon: 'shield-checkmark-outline',
          onPress: () => {
            Alert.alert('Coming Soon', 'Privacy policy will be available soon');
          },
        },
      ],
    },
  ];

  const renderMenuItem = (item: any, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={item.title}
      style={[
        styles.menuItem, 
        { 
          backgroundColor: theme.colors.card, 
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: theme.colors.border
        }
      ]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.lightGray }]}>
          <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
    </TouchableOpacity>
  );

  const renderSection = (section: any) => (
    <View key={section.title} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{section.title.toUpperCase()}</Text>
      <View style={[
        styles.sectionItems, 
        { 
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
        }
      ]}>
        {section.items.map((item: any, index: number) => 
          renderMenuItem(item, index, index === section.items.length - 1)
        )}
      </View>
    </View>
  );

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right', 'bottom']}
    >
      <GradientHeader
        title="More"
        subtitle="Admin settings and options"
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {menuSections.map(renderSection)}

        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={[
              styles.logoutButton, 
              { 
                borderColor: theme.colors.error, 
                backgroundColor: theme.colors.card,
                shadowColor: theme.colors.shadow,
              }
            ]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: theme.colors.textSecondary }]}>ServiceBooking Admin v1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  sectionItems: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    opacity: 0.8,
  },
  logoutSection: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
  },
});

export default AdminMoreScreen;
