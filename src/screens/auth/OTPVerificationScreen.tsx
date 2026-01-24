import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Keyboard,
  Animated,
  Dimensions,
  ActivityIndicator,
  Easing,
} from 'react-native';
import { useAlert } from '../../components/shared/CustomAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { OtpInput } from 'react-native-otp-entry';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { useTheme, theme as themeObj } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { jwtDecode } from 'jwt-decode';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import HyperIcon from '../../components/shared/icons/HyperIcon';
import BackIcon from '../../components/shared/icons/BackIcon';

const { width } = Dimensions.get('window');

const OTPVerificationScreen = ({ route, navigation }: any) => {
  const { phone, email, redirectTo } = route.params || {};
  const { login } = useAuth();
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resendAttempts, setResendAttempts] = useState(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const keyboardShiftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

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

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardWillShowListener = Keyboard.addListener(
      showEvent,
      (event) => {
        setKeyboardVisible(true);
        Animated.timing(keyboardShiftAnim, {
          toValue: 1,
          duration: event.duration || 300,
          easing: event.easing === 'keyboard' ? Easing.bezier(0.33, 1, 0.68, 1) : Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      hideEvent,
      (event) => {
        setKeyboardVisible(false);
        Animated.timing(keyboardShiftAnim, {
          toValue: 0,
          duration: event.duration || 300,
          easing: event.easing === 'keyboard' ? Easing.bezier(0.33, 1, 0.68, 1) : Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillHideListener.remove();
      keyboardWillShowListener.remove();
    };
  }, []);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      showAlert({
        title: 'Invalid OTP',
        message: 'Please enter a 6-digit OTP',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      let response;
      if (email) {
        response = await authAPI.verifyEmailOTP(email, otp);
      } else {
        response = await authAPI.verifyOTP(phone, otp);
      }
      const { token, newUser } = response.data;

      // Decode JWT payload to get user info
      const payload: any = jwtDecode(token);
      const userId = payload.userId;
      const name = payload.name;

      // If user is new, navigate to SetName screen to complete profile (Name & Phone)
      if (newUser) {
        navigation.replace('SetName', {
          token,
          phone: phone || payload.phone,
          email: email || payload.email,
          name: payload.name, // Pass name to pre-fill if available
          userId,
          isNewUser: true,
          redirectTo
        });
        return;
      }

      // User has name, complete login
      const userData: User = { 
        id: userId,
        token, 
        phone: phone || '', 
        email: email || payload.email || '',
        role: 'ROLE_USER',
        name: name
      };

      await login(userData);
      
      // Navigate to redirect destination if provided
      if (redirectTo) {
        navigation.navigate(redirectTo.name, redirectTo.params);
      }
      // Otherwise, AppNavigator will handle navigation based on isAuthenticated
      
    } catch (error: any) {
      showAlert({
        title: 'Verification Failed',
        message: error.response?.data?.message || 'Invalid OTP',
        type: 'error'
      });
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    setResending(true);
    try {
      if (email) {
        await authAPI.sendEmailOTP(email);
      } else {
        await authAPI.sendOTP(phone);
      }
      
      const nextAttempts = resendAttempts + 1;
      setResendAttempts(nextAttempts);
      setTimer((nextAttempts + 1) * 30);
      
      showAlert({
        title: 'OTP Resent',
        message: `Check your ${email ? 'email' : 'phone'} for the new code`,
        type: 'success'
      });
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Failed to resend OTP',
        type: 'error'
      });
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View
          style={[
            styles.mainContainer,
            { 
              paddingTop: insets.top + (isKeyboardVisible ? verticalScale(20) : verticalScale(30)),
              paddingBottom: insets.bottom + (isKeyboardVisible ? verticalScale(20) : verticalScale(30))
            }
          ]}
        >
          <Animated.View
            style={{
              opacity: keyboardShiftAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0]
              }),
              height: keyboardShiftAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [verticalScale(54), 0]
              }),
              marginBottom: keyboardShiftAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [verticalScale(12), 0]
              }),
              overflow: 'hidden'
            }}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <BackIcon width={24} height={24} fill={theme.colors.text} />
            </TouchableOpacity>
          </Animated.View>

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
                  outputRange: [verticalScale(110), 0]
                }),
                marginBottom: keyboardShiftAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [verticalScale(10), 0]
                }),
                overflow: 'hidden'
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <HyperIcon size={moderateScale(130)} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Verification</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Code sent to {email || phone}
            </Text>
          </Animated.View>

          <View style={styles.cardContainer}>
            <LinearGradient
              colors={['#000000', '#333333']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, styles.cardShadow]}
            >
              <View style={styles.cardInner}>
                <Text style={[styles.label, { color: '#D1D5DB' }]}>Enter Code</Text>
                
                <View style={styles.otpWrapper}>
                  <OtpInput
                    numberOfDigits={6}
                    onTextChange={setOtp}
                    theme={{
                      containerStyle: styles.otpContainer,
                      pinCodeContainerStyle: styles.otpBox,
                      pinCodeTextStyle: styles.otpText,
                      focusedPinCodeContainerStyle: styles.otpBoxFocused,
                    }}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.mainButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleVerifyOTP}
                  disabled={loading || otp.length < 6}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Confirm Verification</Text>
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
                
                <View style={styles.resendContainer}>
                  <Text style={styles.resendInfo}>
                    {timer > 0 ? `Resend code in ${formatTimer(timer)}` : "Didn't receive the code?"}
                  </Text>
                  {timer === 0 && (
                    <TouchableOpacity onPress={handleResendOTP} disabled={resending}>
                      {resending ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 8 }} />
                      ) : (
                        <Text style={[styles.resendButton, { color: theme.colors.primary }]}>Resend Now</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>

          <Animated.View 
            style={[
              styles.footer, 
              { 
                opacity: keyboardShiftAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0]
                }) 
              }
            ]}
          >
            <Ionicons name="lock-closed" size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
            <Text style={styles.footerText}>Secure, Encrypted Login</Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
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
  mainContainer: {
    flex: 1,
    paddingHorizontal: scale(26),
    justifyContent: 'center',
  },
  backButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    backgroundColor: '#F3F4F6',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.06,
    shadowRadius: moderateScale(10),
    elevation: 2,
    marginLeft: scale(3),
    marginTop: verticalScale(3),
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(10),
    height: verticalScale(110),
  },
  logoContainer: {
    width: scale(64),
    height: scale(64),
    marginBottom: verticalScale(4),
    borderRadius: moderateScale(16),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    marginBottom: verticalScale(4),
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '85%',
  },
  cardContainer: {
    marginVertical: verticalScale(16),
    width: '100%',
  },
  card: {
    borderRadius: moderateScale(28),
    overflow: 'hidden',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(20),
    elevation: 6,
  },
  cardInner: {
    padding: scale(16),
  },
  label: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginBottom: verticalScale(16),
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#9CA3AF',
  },
  otpWrapper: {
    marginBottom: verticalScale(24),
  },
  otpContainer: {
    gap: scale(8),
    width: '100%',
    justifyContent: 'center',
  },
  otpBox: {
    flex: 1,
    height: verticalScale(52),
    borderRadius: moderateScale(14),
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  otpBoxFocused: {
    borderWidth: 2,
    borderColor: themeObj.colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  otpText: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mainButton: {
    width: '100%',
    height: verticalScale(54),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: themeObj.colors.primary,
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 0.5,
    shadowRadius: moderateScale(16),
    elevation: 8,
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(5),
  },
  resendInfo: {
    fontSize: moderateScale(13),
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
  },
  resendButton: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginLeft: scale(8),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(16),
  },
  footerText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9CA3AF',
  },
});

export default OTPVerificationScreen;
