import React from "react";
import { AbsoluteFill } from "remotion";
import { sparklePath } from "./lib";

// Placeholder brand mark drawn in code: a white geometric "A" with a 4-point sparkle.
// Rendered once to public/logo-mark.png (npm run logo). Swap that PNG for the official file if needed.
export const LogoMarkSvg: React.FC<{ size?: number }> = ({ size = 1024 }) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024">
    <path
      fillRule="evenodd"
      fill="#FFFFFF"
      d="M 150 900 L 420 150 L 604 150 L 874 900 L 690 900 L 640 750 L 384 750 L 334 900 Z M 436 610 L 588 610 L 512 380 Z"
    />
    <path fill="#FFFFFF" d={sparklePath(806, 236, 150, 0.13)} />
  </svg>
);

export const LogoMark: React.FC = () => (
  <AbsoluteFill style={{ background: "transparent", alignItems: "center", justifyContent: "center" }}>
    <LogoMarkSvg />
  </AbsoluteFill>
);
