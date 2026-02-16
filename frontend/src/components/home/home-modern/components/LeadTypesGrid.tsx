"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "../styles/homepage.module.scss";

const leadTypes = [
  {
    icon: "fa-solid fa-house-crack",
    title: "Foreclosures",
    count: "24,500+",
    description: "Pre-foreclosure and auction listings updated daily"
  },
  {
    icon: "fa-solid fa-scale-balanced",
    title: "Divorce Filings",
    count: "18,200+",
    description: "Court records from divorce proceedings"
  },
  {
    icon: "fa-solid fa-file-invoice-dollar",
    title: "Tax Liens",
    count: "31,800+",
    description: "Properties with delinquent taxes"
  },
  {
    icon: "fa-solid fa-scroll",
    title: "Probate",
    count: "12,400+",
    description: "Inherited properties ready for sale"
  },
  {
    icon: "fa-solid fa-triangle-exclamation",
    title: "Code Violations",
    count: "9,600+",
    description: "Properties with municipal violations"
  },
  {
    icon: "fa-solid fa-door-open",
    title: "Evictions",
    count: "15,300+",
    description: "Landlords dealing with tenant issues"
  }
];

const LeadTypesGrid = () => {
  return (
    <section className={styles.lead_types_simple}>
      <div className={styles.lead_types_container_simple}>
        <motion.div
          className={styles.lead_types_header_simple}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.lead_types_title_simple}>
            Access Every Type of <span>Motivated Seller</span>
          </h2>
        </motion.div>

        <div className={styles.lead_types_grid_simple}>
          {leadTypes.map((type, index) => (
            <motion.div
              key={index}
              className={styles.lead_type_card_simple}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className={styles.lead_type_icon_simple}>
                <i className={type.icon}></i>
              </div>
              <div className={styles.lead_type_info_simple}>
                <h3>{type.title}</h3>
                <span className={styles.lead_type_count_simple}>{type.count}</span>
                <p>{type.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.lead_types_cta_simple}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/search" className={styles.lead_types_btn_simple}>
            Explore All Leads
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default LeadTypesGrid;
