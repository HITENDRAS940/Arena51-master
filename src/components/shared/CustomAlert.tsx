import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types
interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
  type?: 'success' | 'error' | 'warning' | 'info';
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Hook to use the alert
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Alert Provider Component
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertOptions | null>(null);
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertConfig(options);
    setVisible(true);
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const hideAlert = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 10,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setAlertConfig(null);
      scaleAnim.setValue(0);
      slideAnim.setValue(20);
    });
  }, []);

  const handleButtonPress = (button: AlertButton) => {
    hideAlert();
    if (button.onPress) {
      // Delay to allow animation to complete
      setTimeout(() => {
        button.onPress?.();
      }, 200);
    }
  };

  const getIconConfig = (type?: string) => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle', color: theme.colors.success, bgColor: theme.colors.success + '15', watermark: 'checkmark-circle' };
      case 'error':
        return { name: 'close-circle', color: theme.colors.error, bgColor: theme.colors.error + '15', watermark: 'close-circle' };
      case 'warning':
        return { name: 'warning', color: theme.colors.warning, bgColor: theme.colors.warning + '15', watermark: 'alert-circle' };
      case 'info':
      default:
        return { name: 'information-circle', color: theme.colors.secondary, bgColor: theme.colors.secondary + '15', watermark: 'information-circle' };
    }
  };

  const getButtonGradient = (style?: string): readonly [string, string] => {
    switch (style) {
      case 'destructive':
        return [theme.colors.error, theme.colors.red || '#DC2626'] as const;
      case 'cancel':
        return ['#6B7280', '#4B5563'] as const;
      default:
        return [theme.colors.secondary, theme.colors.primary] as const;
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={hideAlert}
      >
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={hideAlert} 
          />
          
          <Animated.View 
            style={[
              styles.alertContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim }
                ],
                opacity: opacityAnim,
                backgroundColor: theme.colors.surface,
              }
            ]}
          >
            {/* Background Watermark Icon */}
            {alertConfig?.type && (
              <View style={styles.watermarkContainer}>
                <Ionicons 
                  name={getIconConfig(alertConfig.type).watermark as any} 
                  size={moderateScale(180)} 
                  color={getIconConfig(alertConfig.type).color} 
                  style={{ opacity: 0.05, transform: [{ rotate: '-15deg' }] }}
                />
              </View>
            )}

            {/* Icon */}
            {alertConfig?.type && (
              <View style={[styles.iconContainer, { backgroundColor: getIconConfig(alertConfig.type).bgColor }]}>
                <Ionicons 
                  name={getIconConfig(alertConfig.type).name as any} 
                  size={moderateScale(32)} 
                  color={getIconConfig(alertConfig.type).color} 
                />
              </View>
            )}

            {/* Title */}
            <Text style={[styles.title, { color: theme.colors.text }]}>{alertConfig?.title}</Text>
            
            {/* Message */}
            {alertConfig?.message && (
              <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{alertConfig.message}</Text>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {(alertConfig?.buttons || [{ text: 'OK' }]).map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.buttonWrapper}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={getButtonGradient(button.style)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.button,
                      button.style === 'cancel' && styles.cancelButton,
                    ]}
                  >
                    <Text style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.cancelButtonText,
                    ]}>
                      {button.text}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(24),
  },
  alertContainer: {
    width: '100%',
    maxWidth: scale(340),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(20),
    elevation: 15,
  },
  iconContainer: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: verticalScale(8),
  },
  message: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(24),
  },
  watermarkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  buttonContainer: {
    width: '100%',
    gap: verticalScale(10),
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: moderateScale(14),
    overflow: 'hidden',
  },
  button: {
    height: verticalScale(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(14),
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#FFFFFF',
  },
});

export default AlertProvider;
