"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const PremiumCTA = () => {
  return (
    <section className={styles.premium_cta_section}>
      <div className={styles.premium_cta_bg}>
        <div className={styles.cta_gradient}></div>
      </div>

      <div className={styles.premium_cta_container}>
        <motion.div
          className={styles.premium_cta_content}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.premium_cta_title}>
            Your Competition is Already Using This Data
          </h2>
          <p className={styles.premium_cta_subtitle}>
            Every day you wait, someone else is calling your leads.
            Start your free trial now and get to motivated sellers first.
          </p>

          <div className={styles.premium_cta_buttons}>
            <Link href="/search" className={styles.premium_btn_primary}>
              <span>Start Your Free Trial</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div className={styles.premium_cta_guarantees}>
            <div className={styles.cta_guarantee}>
              <i className="fa-solid fa-credit-card"></i>
              <span>No credit card required</span>
            </div>
            <div className={styles.cta_guarantee}>
              <i className="fa-solid fa-calendar-check"></i>
              <span>7-day free trial</span>
            </div>
            <div className={styles.cta_guarantee}>
              <i className="fa-solid fa-rotate-left"></i>
              <span>30-day money-back</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className={styles.cta_social_proof}>
            <div className={styles.avatar_stack}>
              <img src="/images/home/testimonial-marcus.png" alt="" />
              <img src="/images/home/testimonial-sarah.png" alt="" />
              <img src="/images/home/testimonial-david.png" alt="" />
            </div>
            <span>Join <strong>12,000+</strong> investors closing more deals</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PremiumCTA;
