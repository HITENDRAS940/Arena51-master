import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing, 
  interpolate 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4, 
  style 
}) => {
  const { theme } = useTheme();
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false // Do not reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerValue.value, [0, 1], [-100, 100]);
    return {
      transform: [{ translateX: `${translateX}%` }],
    };
  });

  // Determine base and highlight colors based on theme
  const isDark = theme.id.includes('dark');
  const baseColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const highlightColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  // Gradient colors for the shimmer
  const gradientColors = [
    baseColor,
    highlightColor,
    baseColor,
  ] as const;

  return (
    <View
      style={[
        styles.container,
        { 
          width, 
          height, 
          borderRadius, 
          backgroundColor: baseColor,
          overflow: 'hidden' 
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // base styles
  },
});

export default Skeleton;
