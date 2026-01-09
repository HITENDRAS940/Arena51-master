import * as React from "react";
import Svg, { G, Path, Circle, SvgProps } from "react-native-svg";

const BowlingIcon: React.FC<SvgProps & { size?: number; color?: string }> = ({ 
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
      viewBox="-9.5 0 64 64"
      {...props}
    >
      <G
        id="Bowling"
        transform="translate(1.000000, 1.000000)"
        stroke={iconColor}
        strokeWidth={2}
        fill="none"
      >
        <Path
          d="M22.9,32.4 C20.6,26 17.8,19.2 17.8,16.9 C17.8,13 20,8.5 20,6.4 C20,2.3 16.9,5.68434189e-14 13,5.68434189e-14 C9.1,5.68434189e-14 6,2.3 6,6.4 C6,8.5 8.2,12.9 8.2,17 C8.2,21.2 4.54747351e-13,38.5 4.54747351e-13,43.9 C4.54747351e-13,53.9 4.7,57.9 8.6,57.9 L18.1,57.9"
          id="Shape"
        />
        <Path d="M8.3,14.9 L17.6,14.9" id="Shape" />
        <Path d="M8,19 L18,19" id="Shape" />
        <Circle id="Oval" cx={28} cy={47} r={15} />
        <Circle id="Oval" cx={32} cy={41} r={1} fill={iconColor} />
        <Circle
          id="Oval"
          cx={35.9}
          cy={46.9}
          r={0.9}
          fill={iconColor}
        />
        <Circle id="Oval" cx={38} cy={41} r={1} fill={iconColor} />
      </G>
    </Svg>
  );
};

export default BowlingIcon;
