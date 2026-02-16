"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const features = [
  {
    icon: "fa-solid fa-bolt",
    title: "Real-Time Updates",
    description: "New leads added daily from courthouse records and public filings."
  },
  {
    icon: "fa-solid fa-phone-volume",
    title: "Skip Tracing Included",
    description: "Every lead comes with verified phone numbers and email addresses."
  },
  {
    icon: "fa-solid fa-download",
    title: "Export Anywhere",
    description: "Download as CSV and import directly into your CRM or dialer."
  },
  {
    icon: "fa-solid fa-map-location-dot",
    title: "Nationwide Coverage",
    description: "Access motivated sellers in all 50 states. Filter by county or zip."
  }
];

const Features = () => {
  return (
    <section className={styles.section_clean_alt}>
      <div className={styles.section_inner}>
        <motion.h2
          className={styles.section_title_clean}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Built for Serious Investors
        </motion.h2>

        <div className={styles.features_grid_clean}>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={styles.feature_card_clean}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
            >
              <div className={styles.feature_icon_clean}>
                <i className={feature.icon}></i>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
