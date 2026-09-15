import React from 'react';
import Svg, { G, Path, Circle } from 'react-native-svg';

export function LogoSVG({ width = 200, height = 90 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 90" fill="none">
      {/* Stylized Orbit Ring */}
      <Path
        d="M20 45 C 20 20, 180 20, 180 45 C 180 70, 20 70, 20 45"
        stroke="#3498db"
        strokeWidth="3"
        strokeDasharray="5,5"
      />
      {/* Central Planet */}
      <Circle cx="100" cy="45" r="20" fill="#2c3e50" />
      {/* Inner Planet core/glow */}
      <Circle cx="95" cy="40" r="7" fill="#e74c3c" />
      {/* Small orbiting satellite */}
      <Circle cx="45" cy="30" r="5" fill="#f1c40f" />
    </Svg>
  );
}

export function AntennaTip({ width = 80, height = 100 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 80 100" fill="none">
      {/* Antenna base and mast */}
      <Path
        d="M40 90 L40 30 M30 90 L50 90 M25 70 L55 70 M32 50 L48 50"
        stroke="#2c3e50"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Dish receiver */}
      <Path
        d="M20 30 Q40 50 60 30"
        stroke="#3498db"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Tip beacon emitter */}
      <Circle cx="40" cy="15" r="6" fill="#e74c3c" />
    </Svg>
  );
}
