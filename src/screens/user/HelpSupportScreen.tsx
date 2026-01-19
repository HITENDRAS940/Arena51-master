import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated as RNAnimated,
  Linking,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, theme } from '../../contexts/ThemeContext';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import BackIcon from '../../components/shared/icons/BackIcon';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const animation = useSharedValue(0);

  const toggleOpen = () => {
    const nextValue = isOpen ? 0 : 1;
    animation.value = withTiming(nextValue, { duration: 300 });
    setIsOpen(!isOpen);
  };

  const contentStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(animation.value, [0, 1], [0, 120], Extrapolate.CLAMP),
      opacity: interpolate(animation.value, [0, 1], [0, 1], Extrapolate.CLAMP),
      marginTop: interpolate(animation.value, [0, 1], [0, 12], Extrapolate.CLAMP),
      overflow: 'hidden',
    };
  });

  const arrowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${interpolate(animation.value, [0, 1], [0, 180])}deg` }],
    };
  });

  return (
    <TouchableOpacity 
      style={[styles.faqItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} 
      onPress={toggleOpen}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>{question}</Text>
        <Animated.View style={arrowStyle}>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={theme.colors.textSecondary} 
          />
        </Animated.View>
      </View>
      <Animated.View style={contentStyle}>
        <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>
          {answer}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const HelpSupportScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const [isHeaderActive, setIsHeaderActive] = useState(false);

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      const active = value > 60;
      if (active !== isHeaderActive) {
        setIsHeaderActive(active);
      }
    });
    return () => scrollY.removeListener(id);
  }, [isHeaderActive]);

  const faqs = [
    {
      question: "How do I book a service?",
      answer: "Browse through our services on the Home or Explore tab, select a service that fits your needs, choose a convenient time slot, and proceed to payment. Once confirmed, you'll see it in your Bookings tab."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We currently accept all major UPI apps, credit/debit cards, and net banking through Razorpay. You can also use your in-app wallet for faster checkouts."
    },
    {
      question: "Can I cancel a booking?",
      answer: "Yes, you can cancel a booking from the 'Bookings' tab. Please note that cancellations may be subject to a fee depending on how close it is to the scheduled time."
    },
    {
      question: "How do I top up my wallet?",
      answer: "Navigate to the 'Wallet' screen from your Profile, click on the top-up section, enter the amount, and complete the payment. The balance will be updated instantly."
    },
    {
      question: "What if I'm late for my booking?",
      answer: "We recommend arriving at least 10-15 minutes before your scheduled slot. If you're late, it's up to the venue's discretion whether to extend your time, but typically the slot will end at the original scheduled time."
    },
    {
      question: "What should I do if a payment failed but was deducted?",
      answer: "Don't worry! If money was deducted but the booking wasn't confirmed, it usually gets refunded automatically within 5-7 business days. You can also contact our support with the transaction ID for assistance."
    },
    {
      question: "Can I change my booking time?",
      answer: "Rescheduling depends on the venue's policy and availability. You can try contacting the venue directly or cancel and rebook for a different time (subject to cancellation policies)."
    },
    {
      question: "How do I report an issue with a venue?",
      answer: "If you encounter any issues at the venue, please let us know immediately through the 'Contact Us' options on this page. Your feedback helps us maintain high quality standards."
    },
    {
      question: "Are there any hidden charges?",
      answer: "No, the price you see at the time of booking is what you pay. However, some venues might charge for additional amenities like equipment rental or drinking water on-site."
    }
  ];

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@hyper.com');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+919876543210');
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [60, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 60, 100],
    outputRange: [-100, -10, 0],
    extrapolate: 'clamp',
  });

  const mainHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -120],
    extrapolate: 'clamp',
  });

  const renderMainHeader = () => (
    <RNAnimated.View style={[
      styles.mainHeaderContainer, 
      { 
        position: 'absolute',
        top: Math.max(insets.top + 20, 20),
        left: 0,
        right: 0,
        zIndex: 5,
        transform: [{ translateY: mainHeaderTranslateY }]
      }
    ]}>
      <View style={styles.headerTopRow}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.headerBackButton}
          >
            <BackIcon width={24} height={24} fill={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleGroup}>
              <Text style={[styles.headerTitleMain, { color: theme.colors.text }]}>
                  Help & Support.
              </Text>
              <Text style={[styles.headerTitleSub, { color: theme.colors.textSecondary }]}>
                  We're here to help.
              </Text>
          </View>
      </View>
    </RNAnimated.View>
  );

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right']}
    >
      {/* Sticky Header */}
      <RNAnimated.View 
        pointerEvents={isHeaderActive ? 'auto' : 'none'}
        style={[
          styles.stickyHeader, 
          { 
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border + '20',
          }
        ]}
      >
        <View style={styles.stickyHeaderContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.stickyBackButton}
          >
            <BackIcon width={30} height={30} fill={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.stickyTitle, { color: theme.colors.text }]}>SUPPORT</Text>
          <View style={{ width: 40 }} />
        </View>
      </RNAnimated.View>

      {renderMainHeader()}

      <RNAnimated.ScrollView
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      >
        <View style={{ height: insets.top + 140 }} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact Us</Text>
          <View style={styles.contactContainer}>
            <TouchableOpacity 
              style={[styles.contactCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={handleEmailSupport}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="mail-outline" size={24} color="#2196F3" />
              </View>
              <Text style={[styles.contactLabel, { color: theme.colors.text }]}>Email Support</Text>
              <Text style={[styles.contactValue, { color: theme.colors.textSecondary }]}>support@hyper.com</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.contactCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={handleCallSupport}
            >
              <View style={[styles.contactIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="call-outline" size={24} color="#4CAF50" />
              </View>
              <Text style={[styles.contactLabel, { color: theme.colors.text }]}>Call Us</Text>
              <Text style={[styles.contactValue, { color: theme.colors.textSecondary }]}>+91 98765 43210</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Frequently Asked Questions</Text>
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            
          </Text>
        </View>
      </RNAnimated.ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Sticky Header Styles
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  stickyHeaderContent: {
    height: verticalScale(56),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
  },
  stickyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    letterSpacing: 1,
  },
  stickyBackButton: {
    padding: scale(8),
  },
  // Main Header Styles
  mainHeaderContainer: {
    paddingHorizontal: scale(20),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(12),
  },
  headerBackButton: {
    marginTop: verticalScale(8),
    padding: scale(4),
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitleMain: {
    fontSize: moderateScale(34),
    fontWeight: '800',
    fontFamily: theme.fonts.bold,
    lineHeight: moderateScale(40),
    letterSpacing: -1,
  },
  headerTitleSub: {
    fontSize: moderateScale(34),
    fontWeight: '800',
    fontFamily: theme.fonts.bold,
    lineHeight: moderateScale(40),
    letterSpacing: -1,
    opacity: 0.5,
  },
  scrollContent: {
    // padding handled by spacer view
  },
  section: {
    paddingHorizontal: scale(20),
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    marginBottom: verticalScale(16),
    letterSpacing: -0.5,
  },
  contactContainer: {
    flexDirection: 'row',
    gap: scale(12),
  },
  contactCard: {
    flex: 1,
    borderRadius: moderateScale(24),
    padding: scale(20),
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(10),
    elevation: 2,
  },
  contactIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  contactLabel: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    marginBottom: verticalScale(4),
  },
  contactValue: {
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  faqItem: {
    borderRadius: moderateScale(20),
    padding: scale(18),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.02,
    shadowRadius: moderateScale(8),
    elevation: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    flex: 1,
    marginRight: scale(10),
  },
  faqAnswer: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(12),
    lineHeight: moderateScale(22),
    fontWeight: '500',
  },
  footer: {
    marginTop: verticalScale(40),
    alignItems: 'center',
    paddingBottom: verticalScale(20),
  },
  footerText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    opacity: 0.6,
  },
});

export default HelpSupportScreen;
