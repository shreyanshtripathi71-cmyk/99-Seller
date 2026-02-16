"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

const SpotlightCard = ({ children, className = "", style = {} }: any) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`position-relative overflow-hidden rounded-4 border bg-white ${className}`}
      style={{ ...style }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Moving Spotlight Glow */}
      <div
        className="position-absolute"
        style={{
          inset: -1,
          opacity: opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(59,130,246,0.1), transparent 40%)`,
          zIndex: 0,
          pointerEvents: "none",
          transition: "opacity 0.2s",
        }}
      />
      <div className="position-relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </motion.div>
  );
};

export default SpotlightCard;