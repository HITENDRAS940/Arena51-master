import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Animated,
  StatusBar,
  Keyboard,
} from 'react-native';
import BrandedLoader from '../../components/shared/BrandedLoader';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import BackIcon from '../../components/shared/icons/BackIcon';
import HyperIcon from '../../components/shared/icons/HyperIcon';
import ArrowRightIcon from '../../components/shared/icons/ArrowRightIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OTPVerificationScreen = ({ navigation, route }: any) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const { verifyOTP, requestOTP, setRedirectData } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  // Array for rendering 6 blocks
  const blocks = Array(6).fill(0);

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
    
    // Timer logic
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [timer]);

  const handleVerify = async () => {
    const currentOtp = otp; // Capture current state
    if (currentOtp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      if (route.params?.redirectTo) {
        setRedirectData(route.params.redirectTo);
      }
      
      const isNameMissing = await verifyOTP(phone, currentOtp);
      
      if (isNameMissing) {
        navigation.replace('SetName', { redirectTo: route.params?.redirectTo });
      } else {
        // Name present, AuthContext handles login and navigation to Home
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await requestOTP(phone);
      setTimer(30);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  // Focus the hidden input when user taps the blocks area
  const handleContainerPress = () => {
    inputRef.current?.focus();
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
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: logoScale }] }
            ]}
          >
            <View style={styles.logoContainer}>
              <HyperIcon size={150} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Verification.</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Enter the code sent to {phone}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.cardContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.card}>
              
              {/* Background Watermark Icon */}
              <View style={styles.watermarkContainer}>
                <HyperIcon size={200} color={theme.colors.primary} style={{ opacity: 0.05, transform: [{ rotate: '-15deg' }] }} />
              </View>

              <View style={styles.cardInner}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>ONE TIME PASSWORD</Text>

                <TouchableOpacity 
                  style={styles.otpContainer} 
                  activeOpacity={1} 
                  onPress={handleContainerPress}
                >
                  {blocks.map((_, index) => {
                    const digit = otp[index] || '';
                    const isCurrent = index === otp.length && isFocused;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.otpBlock,
                          {
                            backgroundColor: '#F9FAFB',
                            borderColor: isCurrent ? theme.colors.primary : '#E5E7EB',
                            borderWidth: isCurrent ? 2 : 1.5,
                          }
                        ]}
                      >
                        <Text style={[styles.otpText, { color: theme.colors.text }]}>
                          {digit}
                        </Text>
                      </View>
                    );
                  })}

                  {/* Hidden Input for handling typing */}
                  <TextInput
                    ref={inputRef}
                    style={styles.hiddenInput}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus
                    editable={!loading}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    caretHidden
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleVerify}
                  style={[
                    styles.mainButton,
                    { backgroundColor: theme.colors.primary },
                    (loading || otp.length !== 6) && styles.buttonDisabled
                  ]}
                  disabled={loading || otp.length !== 6}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <BrandedLoader color="#FFFFFF" size={24} />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Verify Access</Text>
                      <ArrowRightIcon size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                  <Text style={[styles.resendText, { color: theme.colors.textSecondary }]}>
                    Didn't receive code?{' '}
                  </Text>
                  <TouchableOpacity onPress={handleResend} disabled={timer > 0 || resending}>
                    {resending ? (
                      <BrandedLoader size={16} color={theme.colors.primary} />
                    ) : (
                      <Text
                        style={[
                          styles.resendLink,
                          { color: timer > 0 ? theme.colors.textSecondary : theme.colors.primary },
                        ]}
                      >
                        {timer > 0 ? `Resend in ${timer}s` : 'Resend Now'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
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
    backgroundColor: '#F3F4F6',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logoContainer: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '80%',
  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  cardInner: {
    padding: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9CA3AF',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    position: 'relative',
  },
  otpBlock: {
    width: 44, // Slightly smaller to fit 6 on screen
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  otpText: {
    fontSize: 24,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  mainButton: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default OTPVerificationScreen;
