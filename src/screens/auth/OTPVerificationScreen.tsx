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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OtpInput } from 'react-native-otp-entry';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const OTPVerificationScreen = ({ route, navigation }: any) => {
  const { phone, redirectTo } = route.params || {};
  const { login } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(phone, otp);
      const { token, newUser } = response.data;

      // Decode JWT payload to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;
      const name = payload.name;

      // If 'name' is missing from payload, navigate to SetName screen
      if (!('name' in payload) || !name) {
        navigation.replace('SetName', {
          token,
          phone,
          userId,
          isNewUser: newUser,
          redirectTo
        });
        return;
      }

      // User has name, complete login
      const userData: User = { 
        id: userId,
        token, 
        phone, 
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
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      await authAPI.sendOTP(phone);
      Alert.alert('OTP Resent', 'Check your phone for the new code');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.background}>
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>

            <Animated.View 
              style={[
                styles.header, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: logoScale }] }
              ]}
            >
              <Text style={styles.brandName}>Hyper Verification</Text>
              <Text style={styles.title}>Secure Identity Shield</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to{' '}
                <Text style={styles.phoneText}>{formatPhoneForDisplay(phone)}</Text>
              </Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.cardContainer, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <LinearGradient
                colors={['#1F2937', '#111827']}
                style={styles.card}
              >
                <Text style={styles.label}>Enter Code</Text>
                
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
                  style={styles.mainButton}
                  onPress={handleVerifyOTP}
                  disabled={loading || otp.length < 6}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradientButton, (loading || otp.length < 6) && styles.buttonDisabled]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Confirm Verification</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                
                <View style={styles.resendContainer}>
                  <Text style={styles.resendInfo}>Didn't receive the code?</Text>
                  <TouchableOpacity onPress={handleResendOTP} disabled={resending}>
                    {resending ? (
                      <ActivityIndicator size="small" color="#10B981" style={{ marginLeft: 8 }} />
                    ) : (
                      <Text style={styles.resendButton}>Resend Now</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>

            {!isKeyboardVisible && (
              <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                <Ionicons name="lock-closed" size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
                <Text style={styles.footerText}>Secure, Encrypted Login</Text>
              </Animated.View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
    color: '#111827',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 20,
  },
  phoneText: {
    fontWeight: '700',
    color: '#10B981',
  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  card: {
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  otpWrapper: {
    marginBottom: 32,
  },
  otpContainer: {
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  otpBox: {
    flex: 1,
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  otpBoxFocused: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  otpText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mainButton: {
    width: '100%',
    marginBottom: 24,
  },
  gradientButton: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    color: '#10B981',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 32,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9CA3AF',
  },
});

export default OTPVerificationScreen;
