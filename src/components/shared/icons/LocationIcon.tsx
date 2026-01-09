import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface LocationIconProps extends SvgProps {
  size?: number;
  color?: string;
}

const LocationIcon: React.FC<LocationIconProps> = ({ 
  size = 24, 
  color = "#000000", 
  ...props 
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    {...props}
  >
    <Path
      fill={color}
      fillRule="evenodd"
      d="M704.70314,112.493674 C703.69889,112.962324 703.778086,113.34224 704.891223,113.34224 L712.027641,113.34224 L712.027641,120.478659 C712.027641,121.586784 712.402768,121.681255 712.876207,120.666741 L719.179075,107.160597 C719.647725,106.156346 719.223799,105.717367 718.209285,106.190807 L704.70314,112.493674 Z M713.027641,112.34224 L713.027641,117.84224 L718.027641,107.34224 L713.027641,112.34224 Z"
      transform="translate(-704 -106)"
    />
  </Svg>
);

export default LocationIcon;
