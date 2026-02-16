"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "../styles/homepage.module.scss";

const StopWastingMoney = () => {
  return (
    <section className={styles.stop_wasting}>
      {/* Background Elements */}
      <div className={styles.stop_wasting_bg}>
        <div className={styles.bg_gradient}></div>
        <div className={styles.bg_pattern}></div>
      </div>

      <div className={styles.stop_wasting_inner}>
        <motion.div
          className={styles.section_header_centered}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className={styles.eyebrow_badge}>
            <i className="fa-solid fa-exclamation-triangle"></i>
            Stop Wasting Your Marketing Budget
          </span>
          <h2 className={styles.section_title_gradient}>
            Most Investors Get <span>Burned</span> by Bad Leads
          </h2>
        </motion.div>

        <div className={styles.comparison_grid}>
          {/* Don't Do This */}
          <motion.div
            className={`${styles.comparison_card} ${styles.dont_card}`}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className={styles.card_header_bad}>
              <i className="fa-solid fa-times-circle"></i>
              <h3>Never Do This</h3>
            </div>
            <ul className={styles.card_list}>
              <li>
                <i className="fa-solid fa-xmark"></i>
                <span>Pay monthly retainers for inconsistent results</span>
              </li>
              <li>
                <i className="fa-solid fa-xmark"></i>
                <span>Buy shared leads that 10 other investors get</span>
              </li>
              <li>
                <i className="fa-solid fa-xmark"></i>
                <span>Waste hours calling disconnected numbers</span>
              </li>
              <li>
                <i className="fa-solid fa-xmark"></i>
                <span>Trust &ldquo;guaranteed&rdquo; leads with no refund policy</span>
              </li>
            </ul>
          </motion.div>

          {/* Do This Instead */}
          <motion.div
            className={`${styles.comparison_card} ${styles.do_card}`}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.card_header_good}>
              <i className="fa-solid fa-check-circle"></i>
              <h3>Do This Instead</h3>
            </div>
            <ul className={styles.card_list}>
              <li>
                <i className="fa-solid fa-check"></i>
                <span>Access verified leads from public records daily</span>
              </li>
              <li>
                <i className="fa-solid fa-check"></i>
                <span>Get 100% exclusive leads in your chosen counties</span>
              </li>
              <li>
                <i className="fa-solid fa-check"></i>
                <span>98% contact accuracy with skip tracing included</span>
              </li>
              <li>
                <i className="fa-solid fa-check"></i>
                <span>30-day money-back guarantee on all plans</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Ready to Close */}
        <motion.div
          className={styles.ready_to_close}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.ready_content}>
            <i className="fa-solid fa-rocket"></i>
            <div>
              <h4>Ready to Close More Deals?</h4>
              <p>We deliver the highest quality motivated seller leads in the industry. You just have to close them.</p>
            </div>
          </div>
          <Link href="/search" className={styles.btn_orange_large}>
            <span>Find Leads in Your Market</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default StopWastingMoney;
