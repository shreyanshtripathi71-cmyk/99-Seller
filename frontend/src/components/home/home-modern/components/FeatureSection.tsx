"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

interface FeatureSectionProps {
  layout: "image-left" | "image-right";
  tag?: string;
  title: string;
  subtitle: string;
  description: string;
  features?: string[];
  image: string;
  imageAlt: string;
  ctaText?: string;
  ctaLink?: string;
  stats?: { value: string; label: string }[];
  className?: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  layout,
  tag,
  title,
  subtitle,
  description,
  features,
  image,
  imageAlt,
  ctaText = "Learn More",
  ctaLink = "/search",
  stats,
  className = ""
}) => {
  const isImageLeft = layout === "image-left";

  return (
    <section className={`${styles.feature_section} ${className}`}>
      <div className={`${styles.feature_container} ${isImageLeft ? styles.image_left : styles.image_right}`}>
        {/* Image Side */}
        <motion.div
          className={styles.feature_image_wrapper}
          initial={{ opacity: 0, x: isImageLeft ? -60 : 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className={styles.feature_image_container}>
            <img src={image} alt={imageAlt} className={styles.feature_image} />
            <div className={styles.feature_image_decoration}></div>
            <div className={styles.feature_image_glow}></div>
          </div>
          
          {stats && (
            <div className={styles.floating_stats}>
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className={styles.floating_stat}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <span className={styles.floating_stat_value}>{stat.value}</span>
                  <span className={styles.floating_stat_label}>{stat.label}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content Side */}
        <motion.div
          className={styles.feature_content}
          initial={{ opacity: 0, x: isImageLeft ? 60 : -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        >
          {tag && <span className={styles.feature_tag}>{tag}</span>}
          <h2 className={styles.feature_title}>{title}</h2>
          {subtitle && <p className={styles.feature_subtitle}>{subtitle}</p>}
          <p className={styles.feature_description}>{description}</p>

          {features && features.length > 0 && (
            <ul className={styles.feature_list}>
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <i className="fa-solid fa-check-circle"></i>
                  {feature}
                </motion.li>
              ))}
            </ul>
          )}

          <div className={styles.feature_cta}>
            <Link href={ctaLink} className={styles.btn_feature}>
              {ctaText}
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;
