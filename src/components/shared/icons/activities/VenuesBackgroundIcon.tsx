import React from 'react';
import Svg, { Path, Circle, SvgProps } from 'react-native-svg';

const VenuesBackgroundIcon: React.FC<SvgProps & { size?: number, color?: string }> = ({ 
  size = 150, 
  color = "rgba(255,255,255,0.1)", 
  ...props 
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M12 21C16 17.5 19 14.4183 19 10C19 6.13401 15.866 3 12 3C8.13401 3 5 6.13401 5 10C5 14.4183 8 17.5 12 21Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="10"
        r="3"
        stroke={color}
        strokeWidth="1.5"
      />
    </Svg>
  );
};

export default VenuesBackgroundIcon;
