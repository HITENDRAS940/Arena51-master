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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OtpInput } from 'react-native-otp-entry';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { Alert } from 'react-native';
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
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || 'ROLE_USER';
      const userId = payload.userId;
      const name = payload.name;

      // Only navigate to SetName for regular users if 'name' property is missing from payload
      if (role === 'ROLE_USER' && !('name' in payload)) {
        navigation.replace('SetName', {
          token,
          phone,
          userId,
          isNewUser: newUser,
          redirectTo
        });
        return;
      }

      // For all other cases (Admin or User with name), complete login
      const userData = { 
        id: userId,
        token, 
        phone, 
        role, 
        isNewUser: newUser,
        name: name
      } as User;

      await login(userData);
      
      // If there's a redirectTo and we are still a ROLE_USER, go there.
      // Admin will be handled by AppNavigator switching the stack.
      if (role === 'ROLE_USER' && redirectTo) {
        Alert.alert('Success', 'Login successful!');
        navigation.navigate(redirectTo.name, redirectTo.params);
      } else if (role === 'ROLE_USER') {
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Success', 'Welcome Admin!');
        // No manual navigation here; AppNavigator will switch to Admin navigator
      }
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
              style={[styles.backButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <Animated.View 
              style={[
                styles.header, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: logoScale }] }
              ]}
            >
              <Text style={styles.brandName}>ARENA51 Verification</Text>
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
              <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Enter Code</Text>
                
                <View style={styles.otpWrapper}>
                  <OtpInput
                    numberOfDigits={6}
                    onTextChange={setOtp}
                    theme={{
                      containerStyle: styles.otpContainer,
                      pinCodeContainerStyle: StyleSheet.flatten([styles.otpBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]),
                      pinCodeTextStyle: StyleSheet.flatten([styles.otpText, { color: theme.colors.text }]),
                      focusedPinCodeContainerStyle: StyleSheet.flatten([styles.otpBoxFocused, { borderColor: theme.colors.primary }]),
                    }}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleVerifyOTP}
                  style={[
                    styles.mainButton, 
                    { backgroundColor: theme.colors.primary }, 
                    (loading || otp.length < 6) && styles.buttonDisabled
                  ]}
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
                  <Text style={[styles.resendInfo, { color: theme.colors.textSecondary }]}>Didn't receive the code?</Text>
                  <TouchableOpacity onPress={handleResendOTP} disabled={resending}>
                    {resending ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 8 }} />
                    ) : (
                      <Text style={[styles.resendButton, { color: theme.colors.primary }]}>Resend Now</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
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
    backgroundColor: '#F9FAFB',
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
    borderWidth: 1,
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
  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
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
  },
  otpBoxFocused: {
    borderWidth: 2,
  },
  otpText: {
    fontSize: 24,
    fontWeight: '800',
  },
  mainButton: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
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
