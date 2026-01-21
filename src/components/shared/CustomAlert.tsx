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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, theme as themeObj } from '../../contexts/ThemeContext';
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
        return [theme.colors.error, '#B91C1C'] as const;
      case 'cancel':
        return ['#9CA3AF', '#4B5563'] as const;
      default:
        return [theme.colors.primary, theme.colors.secondary || theme.colors.primary] as const;
    }
  };

  const getHeaderGradient = (type?: string): readonly [string, string] => {
    switch (type) {
      case 'success':
        return [theme.colors.success + 'DD', theme.colors.success] as const;
      case 'error':
        return [theme.colors.error + 'DD', theme.colors.error] as const;
      case 'warning':
        return [theme.colors.warning + 'DD', theme.colors.warning] as const;
      case 'info':
      default:
        return [theme.colors.primary, theme.colors.secondary || theme.colors.primary] as const;
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
              }
            ]}
          >
            {/* Top Gloss Effect */}
            <View style={styles.glossOverlay} />
            
            {/* Content Container */}
            <View style={styles.alertContent}>
              {/* Type Accent Icon */}
              <View style={styles.headerContainer}>
                <View style={[
                  styles.iconWrapper, 
                  { backgroundColor: getIconConfig(alertConfig?.type).color + '20' }
                ]}>
                  <Ionicons 
                    name={getIconConfig(alertConfig?.type).name as any} 
                    size={moderateScale(32)} 
                    color={getIconConfig(alertConfig?.type).color} 
                  />
                </View>
              </View>
              
              <View style={styles.textContainer}>
                <Text style={styles.titleText}>
                  {alertConfig?.title || 'Notification'}
                </Text>
                
                {alertConfig?.message && (
                  <Text style={styles.messageText}>
                    {alertConfig.message}
                  </Text>
                )}
              </View>

              <View style={styles.buttonContainer}>
                {(alertConfig?.buttons || [{ text: 'OK' }]).map((button, index) => {
                  const isCancel = button.style === 'cancel';
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.actionButton,
                        isCancel ? styles.cancelButton : styles.primaryButton
                      ]}
                      onPress={() => handleButtonPress(button)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.buttonText,
                        isCancel ? styles.cancelButtonText : styles.primaryButtonText
                      ]}>
                        {button.text}
                      </Text>
                      {!isCancel && index === 0 && (
                        <Ionicons name="chevron-forward" size={16} color="#000000" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
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
    width: '85%',
    maxWidth: scale(320),
    borderRadius: moderateScale(24),
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(20) },
    shadowOpacity: 0.5,
    shadowRadius: moderateScale(40),
    elevation: 24,
    overflow: 'hidden',
  },
  glossOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ skewY: '-15deg' }, { translateY: -verticalScale(40) }],
  },
  alertContent: {
    padding: moderateScale(24),
    paddingBottom: moderateScale(28),
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: verticalScale(20),
  },
  iconWrapper: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(28),
  },
  titleText: {
    fontSize: moderateScale(24),
    fontWeight: 'condensedBold',
    fontFamily: themeObj.fonts.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: verticalScale(10),
    letterSpacing: -0.5,
  },
  messageText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  buttonContainer: {
    width: '100%',
    gap: moderateScale(12),
  },
  actionButton: {
    width: '100%',
    height: verticalScale(52),
    borderRadius: moderateScale(14),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(8),
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  primaryButtonText: {
    color: '#000000',
  },
  cancelButtonText: {
    color: '#D1D5DB',
  },
});

export default AlertProvider;
