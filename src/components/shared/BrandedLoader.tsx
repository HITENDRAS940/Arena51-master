import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';
import HyperIcon from './icons/HyperIcon';

interface BrandedLoaderProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const BrandedLoader: React.FC<BrandedLoaderProps> = ({ 
  size = 24, 
  color, 
  style 
}) => {
  const pulseValue = useSharedValue(1);

  useEffect(() => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseValue.value,
    transform: [{ scale: 1 + (1 - pulseValue.value) * 0.2 }],
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={animatedStyle}>
        <HyperIcon size={size} color={color} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BrandedLoader;
