import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';

import HyperIcon from './icons/HyperIcon';

type Props = {
  onAnimationComplete: () => void;
};

const SplashScreen: React.FC<Props> = ({ onAnimationComplete }) => {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Entrance: Fade and Scale
    opacity.value = withTiming(1, { 
      duration: 800,
      easing: Easing.out(Easing.quad)
    });
    
    scale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.back(1.2))
    });

    // Subtle "Breathing" Pulse
    pulse.value = withDelay(800, 
      withRepeat(
        withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );

    // Fade out and finish after a delay
    const totalDisplayTime = 2500;
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 600 }, (finished) => {
        if (finished && onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      });
    }, totalDisplayTime);

    return () => clearTimeout(timeout);
  }, [onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulse.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <HyperIcon size={120} color="#000000" />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
});