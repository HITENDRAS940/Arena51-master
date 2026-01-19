import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import BackIcon from '../../components/shared/icons/BackIcon';
import HyperIcon from '../../components/shared/icons/HyperIcon';
import { useAlert } from '../../components/shared/CustomAlert';
import { theme as themeObj } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const WalletScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();

  // Animations
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Entrance animations
    logoScale.value = withTiming(1, { duration: 1000 });
    logoOpacity.value = withTiming(1, { duration: 1000 });
    
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(600, withTiming(0, { duration: 800 }));

    // Continuous glow/pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: 1.2 + (glowOpacity.value * 0.2) }],
  }));

  return (
    <ScreenWrapper>
      <StatusBar barStyle="dark-content" />
      
      {/* Minimal Header */}
      <View style={[styles.header, { paddingTop: insets.top + verticalScale(10) }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BackIcon width={30} height={30} fill={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Subtle Background Decoration */}
        <View style={styles.bgDecorationContainer}>
            <View style={[styles.bgCircle, { borderColor: theme.colors.border + '15' }]} />
            <View style={[styles.bgCircle, { width: width * 1.2, height: width * 1.2, borderColor: theme.colors.border + '10' }]} />
        </View>

        <View style={styles.centerContent}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.glow, animatedGlowStyle, { backgroundColor: theme.colors.primary + '20' }]} />
            <Animated.View style={animatedLogoStyle}>
              <HyperIcon size={moderateScale(120)} color={theme.colors.primary} />
            </Animated.View>
          </View>

          {/* Text Section */}
          <Animated.View style={[styles.textContainer, animatedTextStyle]}>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>COMING SOON</Text>
            </View>
            
            <Text style={[styles.title, { color: theme.colors.text }]}>
                Hyper Wallet <Text style={{ color: theme.colors.primary }}>2.0</Text>
            </Text>
            
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                Experience a new era of effortless payments. Tap-to-pay, recurring bookings, and family sharing are just around the corner.
            </Text>

            <View style={[styles.divider, { backgroundColor: theme.colors.border + '40' }]} />
            
            <View style={styles.featureList}>
                <View style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                        <HyperIcon size={moderateScale(16)} color={theme.colors.primary} />
                    </View>
                    <Text style={[styles.featureText, { color: theme.colors.text }]}>Smart Subscriptions</Text>
                </View>
                
            </View>
          </Animated.View>
        </View>

        {/* Footer Info */}
        <Animated.View style={[styles.footer, { paddingBottom: insets.bottom + 20 }, animatedTextStyle]}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                We are building something amazing for you.
            </Text>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: scale(20),
  },
  backButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgDecorationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  bgCircle: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width,
    borderWidth: 1,
    position: 'absolute',
  },
  centerContent: {
    alignItems: 'center',
    paddingHorizontal: scale(32),
  },
  logoContainer: {
    width: scale(200),
    height: scale(200),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  glow: {
    position: 'absolute',
    width: scale(140),
    height: scale(140),
    borderRadius: moderateScale(70),
  },
  textContainer: {
    alignItems: 'center',
  },
  comingSoonBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(100),
    marginBottom: verticalScale(20),
  },
  comingSoonText: {
    color: '#FFD700', // Gold for premium feel
    fontSize: moderateScale(12),
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    fontSize: moderateScale(32),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: verticalScale(16),
    letterSpacing: -1,
  },
  description: {
    fontSize: moderateScale(16),
    textAlign: 'center',
    lineHeight: moderateScale(24),
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: verticalScale(32),
  },
  divider: {
    width: scale(40),
    height: verticalScale(4),
    borderRadius: moderateScale(2),
    marginBottom: verticalScale(32),
  },
  featureList: {
    gap: scale(10),
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  featureItem: {
    gap: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeObj.colors.primary + '08',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(100),
  },
  featureIcon: {
    width: scale(24),
    height: scale(24),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(8),
  },
  featureText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    opacity: 0.6,
  },
});

export default WalletScreen;
