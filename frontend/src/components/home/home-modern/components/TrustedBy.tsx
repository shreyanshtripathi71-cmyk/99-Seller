"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const TrustedBy = () => {
  return (
    <section className={styles.trusted_by}>
      <motion.div
        className={styles.trusted_logos}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className={styles.trusted_text}>Trusted by investors featured in</span>
        <div className={styles.logo_item}>
          <i className="fa-brands fa-fort-awesome"></i>
          <span>Forbes</span>
        </div>
        <div className={styles.logo_item}>
          <i className="fa-solid fa-building"></i>
          <span>Inc.</span>
        </div>
        <div className={styles.logo_item}>
          <i className="fa-solid fa-carrot"></i>
          <span>Carrot</span>
        </div>
        <div className={styles.logo_item}>
          <i className="fa-solid fa-wallet"></i>
          <span>BiggerPockets</span>
        </div>
        <div className={styles.logo_item}>
          <i className="fa-solid fa-users"></i>
          <span>Collective Genius</span>
        </div>
      </motion.div>
    </section>
  );
};

export default TrustedBy;
