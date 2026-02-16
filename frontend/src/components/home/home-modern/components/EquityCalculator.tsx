"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const EquityCalculator = () => {
  const [dealsPerMonth, setDealsPerMonth] = useState(2);
  const avgProfit = 15000; // Average wholesale/flip profit
  
  const monthlyProfit = dealsPerMonth * avgProfit;
  const yearlyProfit = monthlyProfit * 12;
  const subscriptionCost = 97 * 12; // Annual cost
  const netProfit = yearlyProfit - subscriptionCost;
  const roi = Math.round((netProfit / subscriptionCost) * 100);

  return (
    <section className={styles.equity_section}>
      <div className={styles.equity_container}>
        <motion.div
          className={styles.equity_header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.equity_title}>
            One Deal Pays for <span>An Entire Year</span>
          </h2>
        </motion.div>

        <div className={styles.equity_content}>
          <motion.div
            className={styles.equity_calculator}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3>Your Potential Earnings</h3>
            
            <div className={styles.calculator_input}>
              <label>Deals you can close per month:</label>
              <div className={styles.slider_wrapper}>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={dealsPerMonth}
                  onChange={(e) => setDealsPerMonth(parseInt(e.target.value))}
                  className={styles.deals_slider}
                />
                <span className={styles.slider_value}>{dealsPerMonth}</span>
              </div>
            </div>

            <div className={styles.calculator_assumption}>
              <i className="fa-solid fa-info-circle"></i>
              Based on avg. profit of $15,000 per deal (wholesale/flip)
            </div>

            <div className={styles.calculator_results}>
              <div className={styles.result_item}>
                <span className={styles.result_label}>Monthly Potential</span>
                <span className={styles.result_value}>${monthlyProfit.toLocaleString()}</span>
              </div>
              <div className={styles.result_item}>
                <span className={styles.result_label}>Annual Potential</span>
                <span className={styles.result_value}>${yearlyProfit.toLocaleString()}</span>
              </div>
              <div className={styles.result_item}>
                <span className={styles.result_label}>99Sellers Cost (Annual)</span>
                <span className={styles.result_value}>${subscriptionCost.toLocaleString()}</span>
              </div>
              <div className={`${styles.result_item} ${styles.result_total}`}>
                <span className={styles.result_label}>Net Profit</span>
                <span className={styles.result_value}>${netProfit.toLocaleString()}</span>
              </div>
            </div>

            <div className={styles.roi_display}>
              <span className={styles.roi_number}>{roi.toLocaleString()}%</span>
              <span className={styles.roi_label}>Return on Investment</span>
            </div>
          </motion.div>

          <motion.div
            className={styles.equity_stats}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.equity_stat_card}>
              <div className={styles.stat_icon}>
                <i className="fa-solid fa-clock"></i>
              </div>
              <div className={styles.stat_content}>
                <span className={styles.stat_number}>14 Days</span>
                <span className={styles.stat_text}>Average time to first deal</span>
              </div>
            </div>

            <div className={styles.equity_stat_card}>
              <div className={styles.stat_icon}>
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <div className={styles.stat_content}>
                <span className={styles.stat_number}>3.2x</span>
                <span className={styles.stat_text}>More deals vs. traditional methods</span>
              </div>
            </div>

            <div className={styles.equity_stat_card}>
              <div className={styles.stat_icon}>
                <i className="fa-solid fa-piggy-bank"></i>
              </div>
              <div className={styles.stat_content}>
                <span className={styles.stat_number}>$4,200+</span>
                <span className={styles.stat_text}>Saved monthly vs. old methods</span>
              </div>
            </div>

            <div className={styles.equity_stat_card}>
              <div className={styles.stat_icon}>
                <i className="fa-solid fa-users"></i>
              </div>
              <div className={styles.stat_content}>
                <span className={styles.stat_number}>12,000+</span>
                <span className={styles.stat_text}>Investors growing with us</span>
              </div>
            </div>

            <div className={styles.equity_cta}>
              <Link href="/search" className={styles.equity_btn}>
                Start Making Money
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EquityCalculator;
