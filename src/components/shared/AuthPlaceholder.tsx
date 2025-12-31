import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenWrapper } from './ScreenWrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AuthPlaceholderProps {
  titleMain: string;
  titleSub: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onLoginPress: () => void;
}

const { width } = Dimensions.get('window');

export const AuthPlaceholder: React.FC<AuthPlaceholderProps> = ({
  titleMain,
  titleSub,
  description,
  icon,
  onLoginPress,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScreenWrapper
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top + 20, 20) }]}>
        <Text style={[styles.headerTitleMain, { color: theme.colors.text }]}>
          {titleMain}
        </Text>
        <Text style={[styles.headerTitleSub, { color: theme.colors.textSecondary }]}>
          {titleSub}
        </Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.card}
          onPress={onLoginPress}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>Join the Community</Text>
                <Text style={styles.cardDescription}>{description}</Text>
              </View>
              
              <View style={styles.actionContainer}>
                <Ionicons name="arrow-forward-circle" size={48} color="#FFFFFF" />
              </View>

              {/* Decorative Background Icon */}
              <View style={styles.decorativeIcon}>
                <Ionicons name={icon} size={120} color="rgba(255, 255, 255, 0.1)" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
          onPress={onLoginPress}
        >
          <Text style={styles.loginButtonText}>Login / Sign Up</Text>
          <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  headerTitleMain: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -1,
  },
  headerTitleSub: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -1,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    marginBottom: 32,
  },
  cardGradient: {
    padding: 32,
    height: 200,
    justifyContent: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
    zIndex: 2,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    lineHeight: 22,
  },
  actionContainer: {
    zIndex: 2,
  },
  decorativeIcon: {
    position: 'absolute',
    bottom: -30,
    right: -20,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
