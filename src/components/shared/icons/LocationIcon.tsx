import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface LocationIconProps extends SvgProps {
  size?: number;
  color?: string;
}

const LocationIcon: React.FC<LocationIconProps> = ({ 
  size = 24, 
  color = "#323544", 
  ...props 
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 25 24"
    fill="none"
    {...props}
  >
    <Path
      d="M21.5127 5.77444C22.1665 3.97839 20.4248 2.23663 18.6287 2.89049L4.63167 7.98618C2.69138 8.69256 2.64771 11.4209 4.56441 12.189L9.72779 14.2582C9.91801 14.3344 10.0687 14.4851 10.145 14.6754L12.2142 19.8387C12.9823 21.7554 15.7106 21.7118 16.417 19.7715L21.5127 5.77444Z"
      fill={color}
    />
  </Svg>
);

export default LocationIcon;
