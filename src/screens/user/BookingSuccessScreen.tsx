import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HyperIcon from '../../components/shared/icons/HyperIcon'; // Using HyperIcon as a placeholder/brand element
import ArrowRightIcon from '../../components/shared/icons/ArrowRightIcon';
import { Ionicons } from '@expo/vector-icons';

const BookingSuccessScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start background fade and slide in parallel
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      // Sequence for the icon "pop" effect
      Animated.sequence([
        // Initial delay
        Animated.delay(100),
        // Zoom In (Overshoot)
        Animated.timing(scaleAnim, {
          toValue: 1.5,
          duration: 400,
          useNativeDriver: true,
        }),
        // Zoom Out (Bounce back to normal)
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <Animated.View 
          style={[
            styles.iconContainer, 
            { 
              transform: [{ scale: scaleAnim }],
              backgroundColor: theme.colors.primary + '15' // 15% opacity primary
            }
          ]}
        >
          <Ionicons name="checkmark" size={64} color={theme.colors.primary} />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Booking Submitted!</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Your booking request has been received and is currently under review.
          </Text>
          <View style={styles.divider} />
          <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
            We will notify you once your slot is confirmed. You can check the status in your bookings.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            navigation.popToTop();
            navigation.navigate('MainTabs', { screen: 'HomeTab' });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Return to Home</Text>
          <ArrowRightIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 32,
  },
  helperText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  footer: {
    paddingHorizontal: 24,
    width: '100%',
  },
  homeButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});

export default BookingSuccessScreen;
