"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

interface CenteredImageSectionProps {
  tag?: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  features?: { icon: string; title: string; description: string }[];
}

const CenteredImageSection: React.FC<CenteredImageSectionProps> = ({
  tag,
  title,
  subtitle,
  image,
  imageAlt,
  features
}) => {
  return (
    <section className={styles.dashboard_showcase}>
      <div className={styles.dashboard_container}>
        {/* Header */}
        <motion.div
          className={styles.dashboard_header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {tag && <span className={styles.dashboard_tag}>{tag}</span>}
          <h2 className={styles.dashboard_title}>{title}</h2>
          <p className={styles.dashboard_subtitle}>{subtitle}</p>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          className={styles.dashboard_preview}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Floating UI Elements */}
          <motion.div 
            className={`${styles.floating_ui} ${styles.floating_left}`}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles.floating_card}>
              <div className={styles.floating_card_icon}>
                <i className="fa-solid fa-house-circle-check"></i>
              </div>
              <div className={styles.floating_card_content}>
                <span className={styles.floating_value}>24,500+</span>
                <span className={styles.floating_label}>Active Leads</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className={`${styles.floating_ui} ${styles.floating_right}`}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className={styles.floating_card}>
              <div className={styles.floating_card_icon + ' ' + styles.icon_success}>
                <i className="fa-solid fa-phone-volume"></i>
              </div>
              <div className={styles.floating_card_content}>
                <span className={styles.floating_value}>98%</span>
                <span className={styles.floating_label}>Contact Rate</span>
              </div>
            </div>
          </motion.div>

          {/* Main Dashboard Frame */}
          <div className={styles.dashboard_frame}>
            <div className={styles.dashboard_browser_bar}>
              <div className={styles.browser_controls}>
                <span className={styles.control_red}></span>
                <span className={styles.control_yellow}></span>
                <span className={styles.control_green}></span>
              </div>
              <div className={styles.browser_address}>
                <i className="fa-solid fa-lock"></i>
                <span>app.99sellers.com/dashboard</span>
              </div>
              <div className={styles.browser_actions}>
                <i className="fa-solid fa-arrows-rotate"></i>
              </div>
            </div>
            <div className={styles.dashboard_screen}>
              <img src={image} alt={imageAlt} />
            </div>
          </div>

          {/* Gradient Glow */}
          <div className={styles.dashboard_glow}></div>
        </motion.div>

        {/* Feature Cards */}
        {features && features.length > 0 && (
          <div className={styles.dashboard_features}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.dashboard_feature_card}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className={styles.dashboard_feature_icon}>
                  <i className={feature.icon}></i>
                </div>
                <div className={styles.dashboard_feature_content}>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CenteredImageSection;
