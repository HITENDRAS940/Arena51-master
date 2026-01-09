import * as React from "react";
import Svg, { Path, Circle, G, SvgProps } from "react-native-svg";

const PadelBallIcon: React.FC<SvgProps & { size?: number; color?: string }> = ({
  size = 64,
  color = "rgba(255,255,255,0.4)",
  width,
  height,
  fill,
  ...props
}) => {
  const iconColor = fill || color;
  const iconSize = width || height || size;
  const strokeWidth = 2;

  return (
    <Svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      fill="none"
      {...props}
    >
      {/* Padel Ball */}
      <G transform="translate(5, 10)">
        <Circle
          cx="30"
          cy="45"
          r="18"
          stroke={iconColor}
          strokeWidth={strokeWidth}
        />
        {/* Ball Seams */}
        <Path
          d="M20 31 C 25 35, 25 55, 20 59"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M40 31 C 35 35, 35 55, 40 59"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </G>

      {/* Padel Racket */}
      <G transform="translate(15, 0)">
        {/* Racket Head */}
        <Path
          d="M45 42 C 45 25, 55 15, 70 15 C 85 15, 95 25, 95 42 C 95 55, 88 65, 78 68 L 75 75 L 65 75 L 62 68 C 52 65, 45 55, 45 42 Z"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Handle */}
        <Path
          d="M67 75 L 67 92 C 67 94, 73 94, 73 92 L 73 75"
          stroke={iconColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Grip Detail */}
        <Path
          d="M66 88 L 74 88"
          stroke={iconColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Perforation Holes (Simplified Grid) */}
        <G fill={iconColor}>
          <Circle cx="62" cy="30" r="1.5" />
          <Circle cx="70" cy="30" r="1.5" />
          <Circle cx="78" cy="30" r="1.5" />
          <Circle cx="58" cy="37" r="1.5" />
          <Circle cx="66" cy="37" r="1.5" />
          <Circle cx="74" cy="37" r="1.5" />
          <Circle cx="82" cy="37" r="1.5" />
          <Circle cx="62" cy="44" r="1.5" />
          <Circle cx="70" cy="44" r="1.5" />
          <Circle cx="78" cy="44" r="1.5" />
          <Circle cx="66" cy="51" r="1.5" />
          <Circle cx="74" cy="51" r="1.5" />
        </G>
      </G>
    </Svg>
  );
};

export default PadelBallIcon;
