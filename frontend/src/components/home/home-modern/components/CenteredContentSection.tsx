"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

interface CenteredContentSectionProps {
  tag?: string;
  title: string;
  subtitle: string;
  description?: string;
  features?: { icon: string; title: string; description: string }[];
  stats?: { value: string; label: string }[];
  ctaText?: string;
  ctaLink?: string;
  variant?: "light" | "dark" | "gradient";
}

const CenteredContentSection: React.FC<CenteredContentSectionProps> = ({
  tag,
  title,
  subtitle,
  description,
  features,
  stats,
  ctaText,
  ctaLink = "/search",
  variant = "light"
}) => {
  return (
    <section className={`${styles.centered_content_section} ${styles[`variant_${variant}`]}`}>
      <div className={styles.centered_content_container}>
        <motion.div
          className={styles.centered_content_header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {tag && <span className={styles.content_tag}>{tag}</span>}
          <h2 className={styles.content_title}>{title}</h2>
          <p className={styles.content_subtitle}>{subtitle}</p>
          {description && <p className={styles.content_description}>{description}</p>}
        </motion.div>

        {stats && stats.length > 0 && (
          <div className={styles.content_stats}>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className={styles.content_stat}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <span className={styles.content_stat_value}>{stat.value}</span>
                <span className={styles.content_stat_label}>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        )}

        {features && features.length > 0 && (
          <div className={styles.content_features_grid}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.content_feature_item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + index * 0.08 }}
              >
                <div className={styles.content_feature_icon}>
                  <i className={feature.icon}></i>
                </div>
                <div className={styles.content_feature_text}>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {ctaText && (
          <motion.div
            className={styles.content_cta}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href={ctaLink} className={styles.btn_content_cta}>
              {ctaText}
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CenteredContentSection;
