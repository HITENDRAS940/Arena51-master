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
import HyperIcon from '../../components/shared/icons/HyperIcon';
import ArrowRightIcon from '../../components/shared/icons/ArrowRightIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SetNameScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const { updateProfile } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

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

  const handleContinue = async () => {
    if (name.trim().length < 3) {
      Alert.alert('Invalid Name', 'Please enter your full name (at least 3 characters).');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(name.trim());
      // AuthContext handles navigation via isAuthenticated state change
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile. Please try again.');
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
          <Animated.View
            style={[
              styles.header,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: logoScale }] }
            ]}
          >
            <View style={styles.logoContainer}>
              <HyperIcon size={150} color={theme.colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Welcome.</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              How should we address you?
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
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>FULL NAME</Text>

                <View style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: '#F9FAFB',
                    borderColor: isFocused ? theme.colors.primary : '#E5E7EB'
                  }
                ]}>
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="John Doe"
                    placeholderTextColor={theme.colors.textSecondary + '80'}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                    editable={!loading}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    selectionColor={theme.colors.primary}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleContinue}
                  style={[
                    styles.mainButton,
                    { backgroundColor: theme.colors.primary },
                    (loading || name.trim().length < 3) && styles.buttonDisabled
                  ]}
                  disabled={loading || name.trim().length < 3}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <BrandedLoader color="#FFFFFF" size={24} />
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Start Exploring</Text>
                      <ArrowRightIcon size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
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
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
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
});

export default SetNameScreen;
