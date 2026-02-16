"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const CallToAction = () => {
  return (
    <section className={styles.premium_cta}>
      <div className={styles.premium_cta_bg}>
        <div className={styles.cta_gradient_orb_1}></div>
        <div className={styles.cta_gradient_orb_2}></div>
        <div className={styles.cta_gradient_orb_3}></div>
        <div className={styles.cta_pattern}></div>
      </div>

      <div className={styles.premium_cta_container}>
        <motion.div
          className={styles.premium_cta_content}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className={styles.cta_eyebrow_blue}>Ready to Scale Your Business?</span>
          
          <h2 className={styles.premium_cta_title}>
            Stop Chasing Cold Leads.<br />
            <span className={styles.highlight_blue}>Start Closing Deals.</span>
          </h2>

          <p className={styles.premium_cta_subtitle}>
            Join 12,000+ successful real estate investors who use 99Sellers to find 
            motivated sellers before anyone else. Get instant access to foreclosures, 
            divorces, tax liens, probate, and more.
          </p>

          <div className={styles.cta_benefits}>
            <div className={styles.cta_benefit}>
              <i className="fa-solid fa-check-circle"></i>
              <span>No credit card required</span>
            </div>
            <div className={styles.cta_benefit}>
              <i className="fa-solid fa-check-circle"></i>
              <span>Cancel anytime</span>
            </div>
            <div className={styles.cta_benefit}>
              <i className="fa-solid fa-check-circle"></i>
              <span>30-day money-back guarantee</span>
            </div>
          </div>

          <div className={styles.premium_cta_actions}>
            <Link href="/search" className={styles.btn_cta_primary_blue}>
              <i className="fa-solid fa-rocket"></i>
              Get Started Free
            </Link>
            <Link href="#pricing" className={styles.btn_cta_secondary}>
              View Pricing Plans
            </Link>
          </div>

          <div className={styles.cta_trust_badges}>
            <div className={styles.trust_badge}>
              <i className="fa-solid fa-shield-halved"></i>
              <span>256-bit SSL Encryption</span>
            </div>
            <div className={styles.trust_badge}>
              <i className="fa-solid fa-lock"></i>
              <span>GDPR Compliant</span>
            </div>
            <div className={styles.trust_badge}>
              <i className="fa-solid fa-headset"></i>
              <span>24/7 Support</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={styles.premium_cta_visual}
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className={styles.cta_dashboard_preview}>
            <img src="/images/home/hero-background.png" alt="99Sellers Dashboard" />
            <div className={styles.dashboard_glow}></div>
          </div>

          <div className={styles.floating_cta_cards}>
            <motion.div
              className={styles.floating_card}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <i className="fa-solid fa-chart-line"></i>
              <div>
                <span className={styles.card_value}>+284%</span>
                <span className={styles.card_label}>Deal Velocity</span>
              </div>
            </motion.div>

            <motion.div
              className={`${styles.floating_card} ${styles.card_2}`}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <i className="fa-solid fa-users"></i>
              <div>
                <span className={styles.card_value}>12,847</span>
                <span className={styles.card_label}>Active Users</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
