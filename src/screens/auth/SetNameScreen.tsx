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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../types';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

Dimensions.get('window');

const SetNameScreen = ({ route, navigation }: any) => {
  const { token, userId, phone, email, isNewUser, redirectTo } = route.params || {};
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { login } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

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

  const handleSetName = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Invalid Name', 'Please enter your name');
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters long');
      return;
    }

    setLoading(true);
    try {
      // First, save the token so API calls work
      if (token) {
        await AsyncStorage.setItem('token', token);
      }

      // Call API to set the name
      await userAPI.setName(trimmedName);

      // Create user object and login
      const userData: User = {
        id: userId,
        token: token,
        phone: phone || '',
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
      Alert.alert('Error', error.response?.data?.message || 'Failed to set name');
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
            <Animated.View 
              style={[
                styles.header, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: logoScale }] }
              ]}
            >
              <Text style={styles.brandName}>Welcome to Hyper</Text>
              <Text style={styles.title}>Create Your Profile</Text>
              <Text style={styles.subtitle}>Let's get you set up. What should we call you?</Text>
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
                <Text style={styles.label}>Full Name</Text>

                <View style={[
                  styles.inputWrapper, 
                  { borderColor: isFocused ? '#10B981' : 'rgba(255, 255, 255, 0.1)' }
                ]}>
                  <Ionicons name="person-outline" size={20} color="rgba(255, 255, 255, 0.3)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="rgba(255, 255, 255, 0.3)"
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    selectionColor="#10B981"
                    autoCapitalize="words"
                    autoComplete="name"
                    maxLength={50}
                  />
                </View>

                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={handleSetName}
                  disabled={loading || name.trim().length < 2}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.gradientButton, (loading || name.trim().length < 2) && styles.buttonDisabled]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>Complete Setup</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.infoText}>
                  You can always update your name later in your profile settings.
                </Text>
              </LinearGradient>
            </Animated.View>

            {!isKeyboardVisible && (
              <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                <Text style={styles.footerText}>Ready to book your first slot?</Text>
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
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(40),
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
    marginTop: verticalScale(20),
  },
  brandName: {
    fontSize: moderateScale(28),
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: verticalScale(8),
    color: '#111827',
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginBottom: verticalScale(8),
    color: '#374151',
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: moderateScale(20),
  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(15) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(25),
    elevation: 10,
  },
  card: {
    borderRadius: moderateScale(32),
    padding: scale(24),
    overflow: 'hidden',
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginBottom: verticalScale(12),
    marginLeft: scale(4),
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(64),
    borderRadius: moderateScale(20),
    borderWidth: 1.5,
    paddingHorizontal: scale(20),
    marginBottom: verticalScale(24),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputIcon: {
    marginRight: scale(12),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mainButton: {
    width: '100%',
    marginBottom: verticalScale(16),
  },
  gradientButton: {
    height: verticalScale(64),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.25,
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
  infoText: {
    fontSize: moderateScale(12),
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: moderateScale(18),
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: verticalScale(32),
  },
  footerText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default SetNameScreen;
