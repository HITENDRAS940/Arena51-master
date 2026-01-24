import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useBookingStatusPolling } from '../../hooks/useBookingStatusPolling';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import SuccessCheckIcon from '../../components/shared/icons/SuccessCheckIcon';

/**
 * PaymentProcessingScreen
 * 
 * Full-screen status checker that polls backend until booking is terminal.
 * Styled to match the HomeScreen aesthetic.
 */
const PaymentProcessingScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Polling starts automatically on mount (inside the hook's useEffect)
  const { status, bookingData } = useBookingStatusPolling(bookingId);
  const isFocused = useIsFocused();
  const [isMinimumWaitDone, setIsMinimumWaitDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimumWaitDone(true);
    }, 2500); // 2.5 seconds minimum wait to show progress steps

    return () => clearTimeout(timer);
  }, []);

  // Animations
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;
  const progressBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Progress bar animation
    Animated.timing(progressBarAnim, {
      toValue: 1,
      duration: 2500, // Matches the minimum wait time
      easing: Easing.linear,
      useNativeDriver: false, // width/flex doesn't support native driver easily
    }).start();

    // Pulse animation for loading
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Success icon bounce animation
    if (status === 'confirmed') {
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [status]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ─────────────────────────────────────────────
  // SUCCESS STATE
  // ─────────────────────────────────────────────
  if (status === 'confirmed' && isMinimumWaitDone) {
    return (
      <ScreenWrapper style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <Animated.View style={[styles.content, { opacity: entranceAnim, transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          {/* Success Icon with Scale Animation */}
          <Animated.View style={[styles.successIconWrapper, { transform: [{ scale: iconScaleAnim }] }]}>
            <SuccessCheckIcon size={moderateScale(140)} color="#10B981" />
          </Animated.View>

          {/* Title */}
          <Text style={[styles.successTitle, { color: '#111827' }]}>Booking Confirmed!</Text>
          <Text style={[styles.successSubtitle, { color: '#6B7280' }]}>Your space is ready for you.</Text>

          {/* Promotion Card */}
          <LinearGradient
            colors={['#4F46E5', '#3730A3']}
            style={styles.promotionCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.promoContent}>
              <View style={styles.promoIconBadge}>
                <Ionicons name="gift" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promoTitle}>Share the Hyper Love!</Text>
                <Text style={styles.promoDescription}>Refer a friend and both of you get 10% off your next booking.</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Refer a Friend</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* CTA Button */}
          <TouchableOpacity 
            style={[styles.successButton, { backgroundColor: '#10B981' }]}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.9}
          >
            <Text style={styles.successButtonText}>Back to Home</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </ScreenWrapper>
    );
  }

  // ─────────────────────────────────────────────
  // FAILURE STATE
  // ─────────────────────────────────────────────
  if (status === 'failed' && isMinimumWaitDone) {
    return (
      <ScreenWrapper style={styles.container}>
        <LinearGradient
          colors={['#7F1D1D', '#991B1B', '#B91C1C']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Decorative Background Elements */}
        <View style={styles.decorContainer}>
          <Animated.View style={[styles.decorCircle, styles.decorCircle1, { transform: [{ rotate: spin }] }]} />
        </View>

        <Animated.View style={[styles.content, { opacity: entranceAnim, transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
          {/* Failure Icon */}
          <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="close" size={moderateScale(60)} color="#FFFFFF" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.successTitle}>Payment Failed</Text>
          <Text style={styles.successSubtitle}>We couldn't confirm your booking.</Text>
          
          {/* Help Text */}
          <View style={[styles.infoCard, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={styles.helpText}>
              If money was deducted, it will be refunded within 3-5 business days.
            </Text>
          </View>

          {/* CTA Buttons */}
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: '#FFFFFF' }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
          >
            <Text style={[styles.primaryButtonText, { color: '#991B1B' }]}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Go Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScreenWrapper>
    );
  }

  // ─────────────────────────────────────────────
  // PROCESSING STATE (polling in progress)
  // ─────────────────────────────────────────────
  return (
    <ScreenWrapper style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={StyleSheet.absoluteFill}
      />
      
      <Animated.View style={[styles.content, { opacity: entranceAnim, transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
        {/* Animated Loader */}
        <Animated.View style={[styles.loaderContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={[styles.loaderRing, { borderColor: theme.colors.primary + '20' }]}>
            <View style={[styles.loaderRingInner, { borderColor: theme.colors.primary + '40' }]}>
              <Ionicons name="sync" size={moderateScale(32)} color={theme.colors.primary} />
            </View>
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={[styles.processingTitle, { color: theme.colors.text }]}>Verifying Payment</Text>
        <Text style={[styles.processingSubtitle, { color: theme.colors.textSecondary }]}>
          Please wait while we sync with the bank...
        </Text>

        {/* Progress Bar Container */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border + '30' }]}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: theme.colors.primary,
                  width: progressBarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>Securing your slot...</Text>
            <Animated.Text style={[styles.progressPercentage, { color: theme.colors.primary }]}>
              {/* Note: In React Native, we can't easily animate text content based on Animated value without a listener or re-render, so we'll just show the bar visually */}
            </Animated.Text>
          </View>
        </View>

        {/* Security Badge */}
        <View style={[styles.securityBadge, { backgroundColor: theme.colors.primary + '10' }]}>
          <Ionicons name="shield-checkmark" size={18} color={theme.colors.primary} />
          <Text style={[styles.securityText, { color: theme.colors.primary }]}>
            Secure 256-bit SSL Payment
          </Text>
        </View>
      </Animated.View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(30),
  },
  decorContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
  },
  decorCircle1: {
    width: scale(400),
    height: scale(400),
    top: -scale(100),
    right: -scale(100),
  },
  decorCircle2: {
    width: scale(300),
    height: scale(300),
    bottom: -scale(50),
    left: -scale(100),
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconWrapper: {
    marginBottom: verticalScale(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: moderateScale(160),
    height: moderateScale(160),
    borderRadius: moderateScale(80),
  },
  iconCircle: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: moderateScale(16),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: verticalScale(8),
    fontWeight: '500',
  },
  infoCard: {
    marginTop: verticalScale(30),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(20),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: verticalScale(8),
  },
  infoLabel: {
    fontSize: moderateScale(13),
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: moderateScale(20),
    color: '#FFFFFF',
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  helpText: {
    fontSize: moderateScale(14),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    width: '100%',
    height: verticalScale(56),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(18),
    marginTop: verticalScale(40),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(16),
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    color: '#065F46',
  },
  secondaryButton: {
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(12),
  },
  secondaryButtonText: {
    fontSize: moderateScale(15),
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  loaderContainer: {
    marginBottom: verticalScale(40),
  },
  loaderRing: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderRingInner: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(35),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  processingSubtitle: {
    fontSize: moderateScale(15),
    textAlign: 'center',
    marginTop: verticalScale(10),
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    marginTop: verticalScale(50),
    paddingHorizontal: scale(10),
  },
  progressTrack: {
    height: verticalScale(12),
    borderRadius: moderateScale(6),
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: moderateScale(6),
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(16),
  },
  progressLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  progressPercentage: {
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginTop: verticalScale(40),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(100),
  },
  securityText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  successIconWrapper: {
    marginBottom: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(10),
    width: '100%',
    height: verticalScale(56),
    borderRadius: moderateScale(18),
    marginTop: verticalScale(50),
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(16),
    elevation: 8,
  },
  successButtonText: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  promotionCard: {
    width: '100%',
    borderRadius: moderateScale(20),
    padding: scale(16),
    marginTop: verticalScale(30),
    flexDirection: 'column',
    gap: verticalScale(16),
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(10),
    elevation: 4,
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  promoIconBadge: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  promoDescription: {
    fontSize: moderateScale(13),
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: verticalScale(2),
  },
  promoButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  promoButtonText: {
    fontWeight: '700',
    color: '#4F46E5',
  },
});

export default PaymentProcessingScreen;
