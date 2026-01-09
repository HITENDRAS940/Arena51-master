import * as React from "react";
import Svg, { G, Rect, Polygon, SvgProps } from "react-native-svg";

const ArcadeIcon: React.FC<SvgProps & { size?: number; color?: string }> = ({ 
  size = 64, 
  color = "rgba(255,255,255,0.4)", 
  width, 
  height, 
  fill,
  ...props 
}) => {
  const iconColor = fill || color;
  const iconSize = width || height || size;

  return (
    <Svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 32 32"
      {...props}
    >
      <G fill={iconColor}>
        <Rect x={10} y={26} width={4} height={3} />
        <Rect
          x={7}
          y={4}
          transform="matrix(6.123234e-17 -1 1 6.123234e-17 3 14)"
          width={3}
          height={3}
        />
        <Rect
          x={22}
          y={4}
          transform="matrix(6.123234e-17 -1 1 6.123234e-17 18 29)"
          width={3}
          height={3}
        />
        <Rect x={18} y={26} width={4} height={3} />
        <Polygon
          points="28,17 28,14 25,14 25,11 22,11 22,7 19,7 19,11 13,11 13,7 10,7 10,11 7,11 7,14 4,14 4,17 1,17 1,20  1,26 4,26 4,20 7,20 7,26 10,26 10,23 11,23 21,23 22,23 22,26 25,26 25,20 28,20 28,26 31,26 31,20 31,17 "
        />
        <Rect x={10} y={16} width={3} height={3} />
        <Rect x={19} y={16} width={3} height={3} />
      </G>
    </Svg>
  );
};

export default ArcadeIcon;
