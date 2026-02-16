"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const sources = [
  { icon: "fa-solid fa-landmark", title: "County Courthouse Records", desc: "Daily filings from 3,200+ counties" },
  { icon: "fa-solid fa-credit-card", title: "Credit Bureaus", desc: "Financial distress indicators" },
  { icon: "fa-solid fa-building-columns", title: "Government Agencies", desc: "Tax liens, code violations" },
  { icon: "fa-solid fa-envelope", title: "Postal Services", desc: "Change of address data" },
  { icon: "fa-solid fa-check-to-slot", title: "Voter Registration", desc: "Owner verification" },
  { icon: "fa-solid fa-database", title: "Public Records", desc: "Probate, divorce filings" }
];

const stats = [
  { value: "12.5M+", label: "Properties in Database" },
  { value: "100%", label: "Include Phone Number" },
  { value: "60%", label: "Include Email Address" }
];

const DataSources = () => {
  return (
    <section className={styles.data_sources_section}>
      {/* Creative Background */}
      <div className={styles.data_sources_bg}>
        <div className={styles.topo_pattern}></div>
        <div className={styles.gradient_overlay}></div>
      </div>

      <div className={styles.data_sources_inner}>
        <motion.div
          className={styles.section_header_centered}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className={styles.eyebrow_light}>How We Source Our Data</span>
          <h2 className={styles.section_title_white}>
            Verified Data From<br />
            <span className={styles.gradient_text_gold}>Multiple Trusted Sources</span>
          </h2>
          <p className={styles.section_subtitle_light}>
            We continually update and cross-verify our motivated seller leads from multiple nationwide sources.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className={styles.data_stats_row}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <div key={index} className={styles.data_stat}>
              <span className={styles.data_stat_value}>{stat.value}</span>
              <span className={styles.data_stat_label}>{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Sources Grid */}
        <div className={styles.sources_grid}>
          {sources.map((source, index) => (
            <motion.div
              key={index}
              className={styles.source_card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * index }}
            >
              <div className={styles.source_icon}>
                <i className={source.icon}></i>
              </div>
              <h4>{source.title}</h4>
              <p>{source.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DataSources;
