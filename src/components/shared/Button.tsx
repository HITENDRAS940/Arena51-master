import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gradient';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  animatePress?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  animatePress = true,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (animatePress && !disabled && !loading) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (animatePress && !disabled && !loading) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: theme.colors.gray };
      case 'outline':
        return { 
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary 
        };
      case 'danger':
        return { backgroundColor: theme.colors.error };
      default:
        return { backgroundColor: theme.colors.primary };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return { color: theme.colors.primary };
      default:
        return { color: '#FFFFFF' };
    }
  };

  const renderButtonContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </>
  );

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          variant !== 'gradient' && getButtonStyle(),
          (disabled || loading) && styles.disabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        delayPressIn={0}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, (disabled || loading) && styles.disabled]}
          >
            {renderButtonContent()}
          </LinearGradient>
        ) : (
          renderButtonContent()
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});

export default Button;
