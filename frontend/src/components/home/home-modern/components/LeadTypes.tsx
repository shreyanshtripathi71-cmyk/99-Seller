"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";
const leadTypes = [
  { icon: "fa-solid fa-house-crack", title: "Foreclosures", count: "24,500+" },
  { icon: "fa-solid fa-scale-balanced", title: "Divorce", count: "18,200+" },
  { icon: "fa-solid fa-file-invoice-dollar", title: "Tax Liens", count: "31,800+" },
  { icon: "fa-solid fa-scroll", title: "Probate", count: "12,400+" },
  { icon: "fa-solid fa-triangle-exclamation", title: "Code Violations", count: "9,600+" },
  { icon: "fa-solid fa-door-open", title: "Evictions", count: "15,300+" }
];
const LeadTypes = () => {
  return (
    <section className={styles.lead_types} id="lead-types">
      <h2 className={styles.section_title}>
        Access Every Type of Motivated Seller
      </h2>
      <div className={styles.lead_chips}>
        {leadTypes.map((type, index) => (
          <motion.div
            key={index}
            className={styles.lead_chip}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <i className={type.icon}></i>
            <span className={styles.chip_title}>{type.title}</span>
            <span className={styles.chip_count}>{type.count}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
export default LeadTypes;
