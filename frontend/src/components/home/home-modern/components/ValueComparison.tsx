"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const oldMethods = [
  {
    icon: "fa-solid fa-car",
    title: "Driving for Dollars",
    problems: ["Gas & time wasted", "No owner contact info", "No equity data", "Hit or miss results"],
    cost: "$200-500/month in gas & time"
  },
  {
    icon: "fa-solid fa-newspaper",
    title: "Newspaper & Public Notices",
    problems: ["Outdated by the time you see it", "Everyone else sees it too", "Manual research required", "No skip-traced data"],
    cost: "$100-300/month + hours of work"
  },
  {
    icon: "fa-solid fa-phone-slash",
    title: "Cold Calling Random Lists",
    problems: ["90%+ wrong numbers", "No motivation indicators", "Burned leads", "Wasted call hours"],
    cost: "$500+/month for bad lists"
  },
  {
    icon: "fa-solid fa-magnifying-glass",
    title: "Manual County Research",
    problems: ["Hours per county", "Inconsistent formats", "No automation", "Miss time-sensitive leads"],
    cost: "20+ hours/week of manual work"
  }
];

const ValueComparison = () => {
  return (
    <section className={styles.value_comparison_section}>
      <div className={styles.value_comparison_container}>
        <motion.div
          className={styles.value_comparison_header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.value_comparison_title}>
            Why <span>Traditional Methods</span> Don&apos;t Work
          </h2>
        </motion.div>

        <div className={styles.old_methods_grid}>
          {oldMethods.map((method, index) => (
            <motion.div
              key={index}
              className={styles.old_method_card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.old_method_icon}>
                <i className={method.icon}></i>
              </div>
              <h3 className={styles.old_method_title}>{method.title}</h3>
              <ul className={styles.old_method_problems}>
                {method.problems.map((problem, i) => (
                  <li key={i}>
                    <i className="fa-solid fa-xmark"></i>
                    {problem}
                  </li>
                ))}
              </ul>
              <div className={styles.old_method_cost}>
                {method.cost}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.better_way_card}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h3 className={styles.better_way_title}>
            With 99Sellers, Get All This for <span>$97/month</span>
          </h3>
          <div className={styles.better_way_features}>
            <div className={styles.better_way_feature}>
              <i className="fa-solid fa-check-circle"></i>
              <span>Skip-traced contacts ready to call</span>
            </div>
            <div className={styles.better_way_feature}>
              <i className="fa-solid fa-check-circle"></i>
              <span>6 types of motivated sellers</span>
            </div>
            <div className={styles.better_way_feature}>
              <i className="fa-solid fa-check-circle"></i>
              <span>Updated daily from 3,200+ counties</span>
            </div>
            <div className={styles.better_way_feature}>
              <i className="fa-solid fa-check-circle"></i>
              <span>Equity & property data included</span>
            </div>
            <div className={styles.better_way_feature}>
              <i className="fa-solid fa-check-circle"></i>
              <span>Export names & addresses instantly</span>
            </div>
            <div className={styles.better_way_feature}>
              <i className="fa-solid fa-check-circle"></i>
              <span>Works in all 50 states</span>
            </div>
          </div>
          <div className={styles.better_way_cta}>
            <Link href="/search" className={styles.better_way_btn}>
              Start Your 7-Day Free Trial
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueComparison;
