"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import styles from "../styles/homepage.module.scss";

// Animated counter component
const AnimatedCounter = ({ 
  value, 
  suffix,
  inView 
}: { 
  value: number; 
  suffix: string;
  inView: boolean;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 2000, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(value * easeOutQuart));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [inView, value]);

  return (
    <span className={styles.power_counter}>
      {count}
      <span className={styles.power_suffix}>{suffix}</span>
    </span>
  );
};

const InvestorPlatformSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { value: 160, suffix: "M+", label: "Properties", icon: "fa-solid fa-database" },
    { value: 3200, suffix: "+", label: "Counties", icon: "fa-solid fa-map-location-dot" },
    { value: 98, suffix: "%", label: "Accuracy", icon: "fa-solid fa-bullseye" },
    { value: 6, suffix: "", label: "Lead Types", icon: "fa-solid fa-layer-group" },
  ];

  return (
    <section className={styles.power_section_simple} ref={ref}>
      <div className={styles.power_container_simple}>
        {/* Header */}
        <motion.div
          className={styles.power_header_simple}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.power_title_simple}>
            The Power of <span>99Sellers</span>
          </h2>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          className={styles.power_stats_row}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              className={styles.power_stat_simple}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={styles.power_stat_icon_simple}>
                <i className={stat.icon}></i>
              </div>
              <div className={styles.power_stat_content_simple}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={isInView} />
                <span className={styles.power_stat_label_simple}>{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className={styles.power_cta_simple}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/search" className={styles.power_btn_simple}>
            Start Free Trial
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default InvestorPlatformSection;
