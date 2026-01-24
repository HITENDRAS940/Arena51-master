import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Keyboard,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import { useAlert } from '../../components/shared/CustomAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userAPI, authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, theme as themeObj } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../types';
import ArrowRightIcon from '../../components/shared/icons/ArrowRightIcon';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import ProfileIcon from '../../components/shared/icons/ProfileIcon';

Dimensions.get('window');

const SetNameScreen = ({ route, navigation }: any) => {
  const { token, userId, phone, email, name: initialName, isNewUser, redirectTo } = route.params || {};
  const [name, setName] = useState(initialName || '');
  const [phoneNumber, setPhoneNumber] = useState(phone || '');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  const { login } = useAuth();
  const { theme } = useTheme();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

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

  const handleInputFocus = () => {
    setIsFocused(true);
    Animated.timing(inputBorderAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: false,
    }).start();
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    Animated.timing(inputBorderAnim, {
      toValue: 0,
      duration: 350,
      useNativeDriver: false,
    }).start();
  };

  const handleSetName = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showAlert({
        title: 'Invalid Name',
        message: 'Please enter your name',
        type: 'warning'
      });
      return;
    }

    if (trimmedName.length < 2) {
      showAlert({
        title: 'Invalid Name',
        message: 'Name must be at least 2 characters long',
        type: 'warning'
      });
      return;
    }

    const trimmedPhone = phoneNumber.trim();
    if (!trimmedPhone || trimmedPhone.length < 10) {
      showAlert({
        title: 'Invalid Phone',
        message: 'Please enter a valid phone number',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      // First, save the token so API calls work
      if (token) {
        await AsyncStorage.setItem('token', token);
      }

      // Call unified API to set name and phone
      await userAPI.updateBasicInfo(trimmedName, trimmedPhone);

      // Create user object and login
      const userData: User = {
        id: userId,
        token: token,
        phone: trimmedPhone,
        email: email || '',
        role: 'ROLE_USER',
        name: trimmedName,
      };

      await login(userData);

      // Navigate to redirect destination or home
      if (redirectTo) {
        navigation.navigate(redirectTo.name, redirectTo.params);
      } else {
        navigation.navigate('User', { screen: 'HomeTab' });
      }
    } catch (error: any) {
      // If setting name fails, remove the token
      await AsyncStorage.removeItem('token');
      showAlert({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to set name',
        type: 'error'
      });
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
                  outputRange: [verticalScale(180), 0]
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
              <ProfileIcon size={moderateScale(80)} color={theme.colors.primary}/>
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Let's Get Started</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>We just need your name to set up your profile.</Text>
          </Animated.View>

          <View style={styles.cardContainer}>
            <LinearGradient
               colors={['#000000', '#333333']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={[styles.card, styles.cardShadow]}
            >
              <View style={styles.cardInner}>
                <Text style={[styles.label, { color: '#D1D5DB' }]}>Full Name</Text>

                <View style={[
                   styles.inputWrapper,
                   {
                     backgroundColor: '#262626',
                     borderColor: isFocused ? theme.colors.primary : '#4B5563'
                   }
                ]}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={isFocused ? theme.colors.primary : '#D1D5DB'} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.input, { color: '#FFFFFF' }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={'#D1D5DB' + '80'}
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    selectionColor={theme.colors.primary}
                    autoCapitalize="words"
                    autoComplete="name"
                    maxLength={50}
                  />
                </View>

                <Text style={[styles.label, { color: '#D1D5DB' }]}>Phone Number</Text>
                <View style={[
                   styles.inputWrapper,
                   {
                     backgroundColor: '#262626',
                     borderColor: isPhoneFocused ? theme.colors.primary : '#4B5563'
                   }
                ]}>
                  <Ionicons 
                    name="call-outline" 
                    size={20} 
                    color={isPhoneFocused ? theme.colors.primary : '#D1D5DB'} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.input, { color: '#FFFFFF' }]}
                    placeholder="Enter your phone number"
                    placeholderTextColor={'#D1D5DB' + '80'}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    editable={!loading}
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setIsPhoneFocused(false)}
                    selectionColor={theme.colors.primary}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    maxLength={15}
                  />
                </View>

                {/* Phone Number Caution Message */}
                <View style={styles.cautionContainer}>
                  <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
                  <Text style={styles.cautionText}>
                    Please enter your correct number. It will be used to notify you in case of any changes or inconvenience with your booking.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.mainButton,
                    { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={handleSetName}
                  disabled={loading || name.trim().length < 2}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Complete Setup</Text>
                      <ArrowRightIcon size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={styles.infoText}>
                  You can always update your name later in settings.
                </Text>
              </View>
            </LinearGradient>
          </View>

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
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(10),
    height: verticalScale(180),
  },
  logoContainer: {
    width: scale(80),
    height: scale(80),
    marginBottom: verticalScale(8),
    borderRadius: moderateScale(40),
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
    backgroundColor: '#000000', // Ensure shadow visibility on Android
  },
  cardInner: {
    padding: scale(16),
  },
  label: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginBottom: verticalScale(8),
    marginLeft: scale(4),
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9CA3AF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(52),
    borderRadius: moderateScale(14),
    borderWidth: 1.5,
    paddingHorizontal: scale(14),
    marginBottom: verticalScale(16),
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
  infoText: {
    fontSize: moderateScale(12),
    textAlign: 'center',
    color: '#D1D5DB',
    lineHeight: moderateScale(16),
    opacity: 0.6,
  },
  cautionContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: moderateScale(12),
    borderRadius: moderateScale(14),
    marginTop: verticalScale(-8),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'flex-start',
    gap: scale(10),
  },
  cautionText: {
    fontSize: moderateScale(11),
    color: '#9CA3AF',
    flex: 1,
    lineHeight: moderateScale(16),
    fontWeight: '500',
  },
});

export default SetNameScreen;
