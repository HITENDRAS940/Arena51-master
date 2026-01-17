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
            {/* Header / Bulge Section */}
            <View style={styles.headerContainer}>
              <View style={styles.headerBulge} />
              <View style={styles.iconWrapper}>
                <Ionicons 
                  name={getIconConfig(alertConfig?.type).name as any} 
                  size={moderateScale(60)} 
                  color={getIconConfig(alertConfig?.type).color} 
                />
              </View>
            </View>
            
            <View style={styles.content}>
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
              {(alertConfig?.buttons || [{ text: 'OK' }]).map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionButtonWrapper}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionButtonText}>
                      {button.text}
                    </Text>
                    {(!alertConfig?.buttons || alertConfig.buttons.length <= 1) && (
                      <Ionicons name="arrow-forward" size={moderateScale(20)} color="#FFFFFF" style={styles.buttonIcon} />
                    )}
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
    width: '90%',
    maxWidth: scale(340),
    borderRadius: moderateScale(40),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(12) },
    shadowOpacity: 0.15,
    shadowRadius: moderateScale(30),
    elevation: 20,
    alignItems: 'center',
    paddingBottom: moderateScale(32),
  },
  headerContainer: {
    width: '100%',
    height: verticalScale(80),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(30),
  },
  headerBulge: {
    position: 'absolute',
    top: -verticalScale(50),
    width: moderateScale(160),
    height: moderateScale(160),
    borderRadius: moderateScale(80),
    backgroundColor: '#FFFFFF',
  },
  iconWrapper: {
    position: 'absolute',
    top: -verticalScale(30),
    width: moderateScale(120),
    height: moderateScale(120),
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: moderateScale(20),
    right: moderateScale(20),
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: moderateScale(32),
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  titleText: {
    fontSize: moderateScale(28),
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: verticalScale(12),
    letterSpacing: -0.5,
  },
  messageText: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: moderateScale(22),
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: moderateScale(32),
    gap: moderateScale(12),
  },
  actionButtonWrapper: {
    flex: 1,
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    shadowColor: themeObj.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButton: {
    height: verticalScale(56),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(20),
  },
  actionButtonText: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: moderateScale(8),
  },
  buttonIcon: {
    marginLeft: moderateScale(4),
  },
});

export default AlertProvider;
