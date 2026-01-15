import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface LogoutIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const LogoutIcon: React.FC<LogoutIconProps> = ({ 
  size = 24, 
  color = "#000000",
  style 
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={style as any}
  >
    <Path
      fill={color}
      fillRule="evenodd"
      d="M6 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H6zm10.293 5.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414L18.586 13H10a1 1 0 1 1 0-2h8.586l-2.293-2.293a1 1 0 0 1 0-1.414z"
      clipRule="evenodd"
    />
  </Svg>
);

export default LogoutIcon;
