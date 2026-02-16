"use client";
import React from "react";
import styles from "../styles/homepage.module.scss";

interface SectionDividerProps {
  type: "wave" | "curve" | "tilt" | "zigzag";
  position?: "top" | "bottom";
  fillColor?: string;
  bgColor?: string;
  flip?: boolean;
  className?: string;
}

const SectionDivider: React.FC<SectionDividerProps> = ({
  type,
  position = "bottom",
  fillColor = "#ffffff",
  bgColor = "transparent",
  flip = false,
  className = ""
}) => {
  const getPath = () => {
    switch (type) {
      case "wave":
        return "M0,96L48,90.7C96,85,192,75,288,90.7C384,107,480,149,576,154.7C672,160,768,128,864,117.3C960,107,1056,117,1152,138.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z";
      case "curve":
        return "M0,160L1440,64L1440,320L0,320Z";
      case "tilt":
        return "M0,224L1440,96L1440,320L0,320Z";
      case "zigzag":
        return "M0,128L80,138.7C160,149,320,171,480,165.3C640,160,800,128,960,128C1120,128,1280,160,1360,176L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z";
      default:
        return "M0,96L1440,32L1440,320L0,320Z";
    }
  };

  const dividerStyle = {
    transform: `${flip ? "scaleX(-1)" : ""} ${position === "top" ? "rotate(180deg)" : ""}`,
    backgroundColor: bgColor,
  };

  return (
    <div 
      className={`${styles.section_divider} ${styles[`divider_${position}`]} ${className}`}
      style={dividerStyle}
    >
      <svg 
        viewBox="0 0 1440 320" 
        preserveAspectRatio="none"
        className={styles.divider_svg}
      >
        <path
          fill={fillColor}
          fillOpacity="1"
          d={getPath()}
        />
      </svg>
    </div>
  );
};

// Wave divider with gradient
export const WaveDivider: React.FC<{ 
  variant?: "primary" | "secondary" | "dark";
  position?: "top" | "bottom";
  className?: string;
}> = ({ variant = "primary", position = "bottom", className = "" }) => {
  const fills = {
    primary: "#2563eb",
    secondary: "#f8fafc",
    dark: "#0f172a"
  };

  return (
    <div 
      className={`${styles.wave_divider} ${styles[`wave_${variant}`]} ${styles[`wave_${position}`]} ${className}`}
    >
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path
          fill={fills[variant]}
          d="M0,40 C480,120 960,0 1440,80 L1440,120 L0,120 Z"
        />
      </svg>
    </div>
  );
};

// Curved divider with multiple layers
export const CurvedDivider: React.FC<{
  topColor?: string;
  bottomColor?: string;
  position?: "top" | "bottom";
  className?: string;
}> = ({ 
  topColor = "transparent", 
  bottomColor = "#ffffff",
  position = "bottom",
  className = ""
}) => {
  return (
    <div 
      className={`${styles.curved_divider} ${styles[`curved_${position}`]} ${className}`}
      style={{ backgroundColor: topColor }}
    >
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          fill={bottomColor}
          d="M0,100 L0,50 Q720,120 1440,50 L1440,100 Z"
        />
      </svg>
    </div>
  );
};

// Flowing organic curve
export const FlowingDivider: React.FC<{
  color?: string;
  className?: string;
}> = ({ color = "#ffffff", className = "" }) => {
  return (
    <div className={`${styles.flowing_divider} ${className}`}>
      <svg viewBox="0 0 1440 150" preserveAspectRatio="none">
        <path
          fill={color}
          fillOpacity="0.3"
          d="M0,64 C288,128 576,32 864,64 C1152,96 1296,32 1440,64 L1440,150 L0,150 Z"
        />
        <path
          fill={color}
          fillOpacity="0.5"
          d="M0,96 C360,48 720,128 1080,80 C1260,56 1380,88 1440,96 L1440,150 L0,150 Z"
        />
        <path
          fill={color}
          d="M0,128 C240,80 480,140 720,100 C960,60 1200,120 1440,100 L1440,150 L0,150 Z"
        />
      </svg>
    </div>
  );
};

export default SectionDivider;
