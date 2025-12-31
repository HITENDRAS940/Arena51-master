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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../types';

Dimensions.get('window');

const SetNameScreen = ({ route, navigation }: any) => {
  const { token, userId, phone, isNewUser, redirectTo } = route.params || {};
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
      if (token) {
        await AsyncStorage.setItem('token', token);
      }

      await userAPI.setName(trimmedName);
      
      const userData: User = {
        id: userId,
        token: token,
        phone: phone,
        role: 'ROLE_USER',
        name: trimmedName,
        isNewUser: false
      };

      await login(userData);
      Alert.alert('Welcome!', 'Your profile has been set up successfully');
      
      if (redirectTo) {
        navigation.navigate(redirectTo.name, redirectTo.params);
      } else {
        navigation.navigate('User', { screen: 'HomeTab' });
      }
    } catch (error: any) {
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
              <Text style={styles.brandName}>Welcome to ARENA51</Text>
              <Text style={styles.title}>Create Your Profile</Text>
              <Text style={styles.subtitle}>Let's get you set up. What should we call you?</Text>
            </Animated.View>

            <Animated.View 
              style={[
                styles.cardContainer, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Full Name</Text>
                
                <View style={[
                  styles.inputWrapper, 
                  { 
                    backgroundColor: theme.colors.background,
                    borderColor: isFocused ? theme.colors.primary : theme.colors.border 
                  }
                ]}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary + '80'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.colors.textSecondary + '80'}
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

                <TouchableOpacity
                  onPress={handleSetName}
                  style={[
                    styles.mainButton, 
                    { backgroundColor: theme.colors.primary }, 
                    (loading || name.trim().length < 2) && styles.buttonDisabled
                  ]}
                  disabled={loading || name.trim().length < 2}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Complete Setup</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
                
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  You can always update your name later in your profile settings.
                </Text>
              </View>
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
    letterSpacing: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
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
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
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

export default SetNameScreen;
