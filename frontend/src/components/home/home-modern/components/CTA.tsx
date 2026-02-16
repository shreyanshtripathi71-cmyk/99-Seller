"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const CTA = () => {
  return (
    <section className={styles.cta_section}>
      <div className={styles.cta_inner}>
        <motion.h2
          className={styles.cta_title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to Find Your Next Deal?
        </motion.h2>

        <motion.p
          className={styles.cta_subtitle}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Join 12,000+ investors who are finding off-market deals before anyone else.
        </motion.p>

        <motion.div
          className={styles.cta_buttons}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/search" className={styles.cta_btn_primary}>
            Get Started Free
          </Link>
          <Link href="#pricing" className={styles.cta_btn_secondary}>
            View Pricing
          </Link>
        </motion.div>

        <motion.p
          className={styles.cta_note}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <i className="fa-solid fa-shield-check"></i>
          30-day money-back guarantee • No credit card required
        </motion.p>
      </div>
    </section>
  );
};

export default CTA;
