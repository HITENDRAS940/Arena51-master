import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import HyperIcon from '../../components/shared/icons/HyperIcon';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const AboutScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const features = [
    {
      icon: 'football',
      title: 'Book 50+ Sports & Games',
      description: 'From football turfs to cricket nets, table tennis, PlayStation, Xbox, and esports arenas — all in one place.',
    },
    {
      icon: 'search',
      title: 'Compare. Pick. Play.',
      description: 'Browse venues with real-time availability, pricing, photos, and user reviews. Book your slot in just a few taps.',
    },
    {
      icon: 'card',
      title: 'Secure Payment Options',
      description: 'Pay with Net Banking, Credit/Debit Cards, UPI, and more — powered by Razorpay for seamless checkout.',
    },
    {
      icon: 'refresh',
      title: 'Flexible Cancellation',
      description: 'Plans changed? Reschedule or get a refund with HYPER\'s flexible booking policies.',
    },
    {
      icon: 'people',
      title: 'Play Together, Stay Connected',
      description: 'Follow friends, join open matches, build your sports network, and split payments easily.',
    },
  ];

  const handleContactPress = () => {
    Linking.openURL('mailto:gethyperindia@gmail.com');
  };

  return (
    <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>About HYPER</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary || theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <HyperIcon size={80} color="#FFFFFF" />
            <Text style={styles.heroTitle}>HYPER</Text>
            <Text style={styles.heroTagline}>The Easiest Way to Play Sports</Text>
            <Text style={styles.heroSubtitle}>
              Discover, book, and play — in seconds.
            </Text>
          </LinearGradient>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            HYPER is your go-to platform for finding and booking the best sports and gaming venues near you. 
            Whether you're looking for a quick game after college, a weekend match with friends, or a competitive session, 
            HYPER makes it simple, fast, and hassle-free.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Features</Text>
          {features.map((feature, index) => (
            <View 
              key={index} 
              style={[styles.featureCard, { backgroundColor: theme.colors.surface }]}
            >
              <View style={[styles.featureIconBox, { backgroundColor: theme.colors.primary + '15' }]}>
                <Ionicons name={feature.icon as any} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Get in Touch</Text>
          <TouchableOpacity 
            style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}
            onPress={handleContactPress}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIconBox, { backgroundColor: theme.colors.primary + '15' }]}>
              <Ionicons name="mail" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={[styles.contactLabel, { color: theme.colors.textSecondary }]}>
                Contact us at
              </Text>
              <Text style={[styles.contactEmail, { color: theme.colors.primary }]}>
                gethyperindia@gmail.com
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary || theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaTitle}>Experience the Future of Sports</Text>
            <Text style={styles.ctaSubtitle}>
              Whether you're a casual player or a serious athlete, HYPER helps you find your game — anytime, anywhere.
            </Text>
          </LinearGradient>
        </View>

        {/* Version Info */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.copyrightText, { color: theme.colors.textSecondary }]}>
            © 2026 HYPER. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(15),
  },
  backButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(4),
    elevation: 3,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scrollContent: {
    flex: 1,
  },
  heroSection: {
    marginHorizontal: scale(20),
    marginBottom: verticalScale(24),
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(16),
    elevation: 8,
  },
  heroGradient: {
    padding: scale(32),
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: moderateScale(36),
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: verticalScale(16),
    letterSpacing: -1,
  },
  heroTagline: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(24),
  },
  description: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(24),
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    marginBottom: verticalScale(16),
    letterSpacing: -0.5,
  },
  featureCard: {
    flexDirection: 'row',
    padding: scale(16),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  featureIconBox: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginBottom: verticalScale(4),
  },
  featureDescription: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    fontWeight: '500',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(16),
    borderRadius: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(8),
    elevation: 2,
  },
  contactIconBox: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(2),
  },
  contactEmail: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  ctaSection: {
    marginHorizontal: scale(20),
    marginBottom: verticalScale(24),
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(16),
    elevation: 8,
  },
  ctaGradient: {
    padding: scale(24),
  },
  ctaTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: verticalScale(20),
  },
  versionText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  copyrightText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
});

export default AboutScreen;
