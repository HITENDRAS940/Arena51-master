import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Keyboard,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI } from '../../services/api';
import { Alert } from 'react-native';
import { useTheme, theme as themeObj } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import HyperIcon from '../../components/shared/icons/HyperIcon';
import BackIcon from '../../components/shared/icons/BackIcon';
import ArrowRightIcon from '../../components/shared/icons/ArrowRightIcon';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';
import DraggableModal from '../../components/shared/DraggableModal';
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from '../../constants/legal';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

Dimensions.get('window');

const LoginScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLegalVisible, setIsLegalVisible] = useState(false);
  const [legalTitle, setLegalTitle] = useState('');
  const [legalContent, setLegalContent] = useState('');
  const { redirectTo } = route.params || {};

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const inputBorderAnim = useRef(new Animated.Value(0)).current;
  const keyboardShiftAnim = useRef(new Animated.Value(0)).current;


  useEffect(() => {

    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: false,
      }),
    ]).start();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        Animated.timing(keyboardShiftAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        Animated.timing(keyboardShiftAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleInputFocus = () => {
    setIsFocused(true);
    Animated.timing(inputBorderAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    Animated.timing(inputBorderAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const validateEmail = (text: string) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(text);
  };

  const handleSendOTP = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setOtpLoading(true);
    try {
      await authAPI.sendEmailOTP(email);
      navigation.navigate('OTPVerification', { 
        email,
        redirectTo 
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />


      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + (isKeyboardVisible ? 20 : 60) }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {navigation.canGoBack() && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <BackIcon width={24} height={24} fill={theme.colors.text} />
            </TouchableOpacity>
          )}

          <Animated.View
            style={[
              styles.header,
              { 
                opacity: Animated.multiply(fadeAnim, keyboardShiftAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0]
                })), 
                transform: [
                  { translateY: slideAnim }, 
                  { scale: Animated.multiply(logoScale, keyboardShiftAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.5]
                    })) 
                  }
                ],
                height: keyboardShiftAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [verticalScale(140), 0]
                }),
                marginBottom: keyboardShiftAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [verticalScale(20), 0]
                }),
                overflow: 'hidden'
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <HyperIcon size={moderateScale(100)} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Hyper</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Your game. Your venue.</Text>
          </Animated.View>

          <View style={styles.cardContainer}>
            <View style={[styles.card, styles.cardShadow]}>
              
              {/* Background Watermark Icon */}
              <View style={styles.watermarkContainer}>
                <HyperIcon size={200} color={theme.colors.primary} style={{ opacity: 0.05, transform: [{ rotate: '-15deg' }] }} />
              </View>

              <View style={styles.cardInner}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Email Address</Text>

                <View style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: '#F9FAFB',
                    borderColor: isFocused ? theme.colors.primary : '#E5E7EB'
                  }
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={isFocused ? theme.colors.primary : theme.colors.textSecondary} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="your@email.com"
                    placeholderTextColor={theme.colors.textSecondary + '80'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                    editable={!otpLoading && !socialLoading}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    selectionColor={theme.colors.primary}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSendOTP}
                  style={[
                    styles.mainButton,
                    { backgroundColor: theme.colors.primary }
                  ]}
                  disabled={otpLoading || socialLoading}
                  activeOpacity={0.8}
                >
                  {otpLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Get Verification Code</Text>
                      <ArrowRightIcon size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Social Auth Buttons Integration */}
                <SocialAuthButtons
                  onAuthStart={() => setSocialLoading(true)}
                  onAuthSuccess={() => {
                    setSocialLoading(false);
                  }}
                  onAuthError={(error) => {
                    setSocialLoading(false);
                    Alert.alert('Authentication Error', error);
                  }}
                />

                <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                  By continuing, you agree to our{' '}
                  <Text 
                    style={[styles.termsLink, { color: theme.colors.primary }]}
                    onPress={() => {
                      setLegalTitle('Terms of Service');
                      setLegalContent(TERMS_OF_SERVICE);
                      setIsLegalVisible(true);
                    }}
                  >
                    Terms of Service
                  </Text> and{' '}
                  <Text 
                    style={[styles.termsLink, { color: theme.colors.primary }]}
                    onPress={() => {
                      setLegalTitle('Privacy Policy');
                      setLegalContent(PRIVACY_POLICY);
                      setIsLegalVisible(true);
                    }}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <DraggableModal
        visible={isLegalVisible}
        onClose={() => setIsLegalVisible(false)}
        height="80%"
        containerStyle={{ backgroundColor: theme.colors.surface }}
      >
        <View style={[styles.modalInner, { flex: 1 }]}>
          <View style={styles.legalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text, textAlign: 'left', marginBottom: 0, fontSize: 20 }]}>
              {legalTitle}
            </Text>
            <TouchableOpacity onPress={() => setIsLegalVisible(false)}>
              <Ionicons name="close-circle" size={28} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={styles.legalScroll}
            contentContainerStyle={styles.legalScrollContent}
          >
            <Text style={[styles.legalText, { color: theme.colors.textSecondary }]}>
              {legalContent}
            </Text>
          </ScrollView>
        </View>
      </DraggableModal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(40),
  },
  backButton: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    backgroundColor: '#F3F4F6',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(12),
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
    height: verticalScale(140), // Added fixed height for animation
  },
  logoContainer: {
    width: scale(80),
    height: scale(80),
    marginBottom: verticalScale(12),
    borderRadius: moderateScale(20),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(12),
    elevation: 4,
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    marginBottom: verticalScale(8),
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '80%',
  },
  cardContainer: {
    // Shadow moved to card element to prevent rendering before animation
  },
  card: {
    borderRadius: moderateScale(28),
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(20),
    elevation: 6,
  },
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  cardInner: {
    padding: scale(20),
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginBottom: verticalScale(12),
    marginLeft: scale(4),
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9CA3AF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(56),
    borderRadius: moderateScale(16),
    borderWidth: 1.5,
    paddingHorizontal: scale(16),
    marginBottom: verticalScale(20),
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: scale(12),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#111827',
  },
  mainButton: {
    width: '100%',
    height: verticalScale(54),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    shadowColor: themeObj.colors.primary,
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(12),
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginRight: scale(8),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(8),
    paddingVertical: verticalScale(12),
    gap: scale(8),
  },
  emailButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  termsText: {
    paddingVertical: verticalScale(10),
    fontSize: moderateScale(12),
    textAlign: 'center',
    lineHeight: moderateScale(16),
    paddingHorizontal: scale(10),
    color: '#6B7280',
  },
  termsLink: {
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: verticalScale(32),
  },
  footerText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  modalInner: {
    padding: scale(24),
    paddingTop: verticalScale(8),
  },
  legalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  legalScroll: {
    flex: 1,
  },
  legalScrollContent: {
    paddingBottom: verticalScale(40),
  },
  legalText: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    fontWeight: '500',
  },
});

export default LoginScreen;
