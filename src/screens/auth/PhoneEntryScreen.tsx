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
} from 'react-native';
import BrandedLoader from '../../components/shared/BrandedLoader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI } from '../../services/api';
import { Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { validatePhoneNumber, getPhoneForAPI } from '../../utils/phoneUtils';
import { Ionicons } from '@expo/vector-icons';
import HyperIcon from '../../components/shared/icons/HyperIcon';
import BackIcon from '../../components/shared/icons/BackIcon';
import ArrowRightIcon from '../../components/shared/icons/ArrowRightIcon';

Dimensions.get('window');

const PhoneEntryScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { redirectTo } = route.params || {};

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const inputBorderAnim = useRef(new Animated.Value(0)).current;


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

  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phone)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = getPhoneForAPI(phone);
      await authAPI.sendOTP(formattedPhone);
      navigation.navigate('OTPVerification', { 
        phone: formattedPhone,
        redirectTo 
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
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
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: logoScale }] }
            ]}
          >
            <View style={styles.logoContainer}>
              <HyperIcon size={150} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Hyper</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Your game. Your venue.</Text>
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
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Phone Number</Text>

                <View style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: '#F9FAFB',
                    borderColor: isFocused ? theme.colors.primary : '#E5E7EB'
                  }
                ]}>
                  <View style={styles.countryPicker}>
                    <Text style={styles.flag}>🇮🇳</Text>
                    <Text style={[styles.prefix, { color: theme.colors.text }]}>+91</Text>
                    <View style={[styles.inputDivider, { backgroundColor: theme.colors.border }]} />
                  </View>

                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="00000 00000"
                    placeholderTextColor={theme.colors.textSecondary + '80'}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                    editable={!loading}
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
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <BrandedLoader color="#FFFFFF" size={24} />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Get Verification Code</Text>
                      <ArrowRightIcon size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                  By tapping "Get Verification Code", you agree to our{' '}
                  <Text style={[styles.termsLink, { color: theme.colors.primary }]}>Terms of Service</Text> and{' '}
                  <Text style={[styles.termsLink, { color: theme.colors.primary }]}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </Animated.View>

          {!isKeyboardVisible && (
            <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
              <Text style={styles.footerText}>Secure Login Powered by OTP</Text>
            </Animated.View>
          )}
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  inputDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 16,
    backgroundColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#111827',
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
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    color: '#6B7280',
  },
  termsLink: {
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 32,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default PhoneEntryScreen;
