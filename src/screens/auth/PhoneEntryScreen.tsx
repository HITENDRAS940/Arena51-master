import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Keyboard,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI } from '../../services/api';
import { Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { validatePhoneNumber, getPhoneForAPI } from '../../utils/phoneUtils';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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
      Alert.alert('OTP Sent', 'Check your phone for the verification code');
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
              <Image 
                source={require('../../../assets/images/arena_logo.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.title}>Your game. Your venue.</Text>
              <Text style={styles.subtitle}>Enter your phone number to continue</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.cardContainer, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Phone Number</Text>
                
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: theme.colors.background,
                    borderColor: isFocused ? theme.colors.primary : theme.colors.border 
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
                      { backgroundColor: theme.colors.primary }, 
                      (loading || phone.length < 10) && styles.buttonDisabled
                    ]}
                    disabled={loading || phone.length < 10}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Get Verification Code</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                
                <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                  By tapping "Get Verification Code", you agree to our{' '}
                  <Text style={[styles.termsLink, { color: theme.colors.primary }]}>Terms of Service</Text> and{' '}
                  <Text style={[styles.termsLink, { color: theme.colors.primary }]}>Privacy Policy</Text>
                </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Using the app's background color
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
    marginBottom: 35,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 12,
    borderRadius: 24,
  },
  brandName: {
    fontSize: 32,
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
    maxWidth: '80%',
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
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    marginBottom: 24,
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
  },
  inputDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
  },
  mainButton: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default PhoneEntryScreen;
