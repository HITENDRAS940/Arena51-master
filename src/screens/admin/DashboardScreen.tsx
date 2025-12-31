import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DashboardScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Dashboard</Text>
              <Text style={styles.headerSubtitle}>Admin Overview</Text>
            </View>
            <View style={styles.iconContainer}>
              <Ionicons name="stats-chart" size={24} color={theme.colors.primary} />
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        {/* Coming Soon Banner */}
        <View style={[styles.comingSoonBanner, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.bannerIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
            <Ionicons name="construct-outline" size={64} color={theme.colors.primary} />
          </View>
          <Text style={[styles.bannerTitle, { color: theme.colors.text }]}>Coming Soon</Text>
          <Text style={[styles.bannerDescription, { color: theme.colors.textSecondary }]}>
            We're working on bringing you an amazing dashboard experience with real-time analytics and insights.
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  comingSoonBanner: {
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    maxWidth: 340,
    width: '100%',
  },
  bannerIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  bannerDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default DashboardScreen;