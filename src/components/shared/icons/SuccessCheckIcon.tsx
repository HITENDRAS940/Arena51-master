import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming, 
  Easing,
  interpolate,
  withRepeat,
  withSequence,
  useAnimatedStyle
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SuccessCheckIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const SuccessCheckIcon: React.FC<SuccessCheckIconProps> = ({ 
  size = 100, 
  color = "#10B981",
  style 
}) => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    // Initial checkmark drawing animation + looping
    const timer = setTimeout(() => {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 1000,
            easing: Easing.bezier(0.65, 0, 0.45, 1),
          }),
          withTiming(1, { duration: 500 }), // Pause at finished state
          withTiming(0, { duration: 0 }) // Instant reset for the next loop
        ),
        -1, // Loop infinitely
        false
      );
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [150, 0]),
  }));

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 191.667 191.667"
      style={style as any}
    >
      {/* Background Circle */}
      <Path 
        d="M95.833,0C42.991,0,0,42.99,0,95.833s42.991,95.834,95.833,95.834s95.833-42.991,95.833-95.834S148.676,0,95.833,0z"
        fill={color}
      />
      {/* Animated Checkmark Path (Stroke-based for drawing effect) */}
      <AnimatedPath
        d="M55 102 L85 132 L145 72"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="150"
        animatedProps={animatedProps}
      />
    </Svg>
  );
};

export default SuccessCheckIcon;
