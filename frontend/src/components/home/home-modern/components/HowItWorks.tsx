"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const steps = [
  {
    number: "01",
    icon: "fa-solid fa-map-location-dot",
    title: "Choose Your Market",
    description: "Target specific zip codes, cities, or counties with our intuitive search.",
    time: "30 seconds",
    highlight: false
  },
  {
    number: "02",
    icon: "fa-solid fa-filter",
    title: "Select Lead Types",
    description: "Filter by foreclosure, divorce, tax lien, probate, code violation, or eviction.",
    time: "1 click",
    highlight: false
  },
  {
    number: "03",
    icon: "fa-solid fa-phone",
    title: "Get Contact Info",
    description: "Instantly access skip-traced phone numbers and verified emails.",
    time: "Instant",
    highlight: true
  },
  {
    number: "04",
    icon: "fa-solid fa-handshake",
    title: "Close More Deals",
    description: "Export to CRM, start campaigns, and turn leads into deals.",
    time: "5-10 deals/mo",
    highlight: true
  }
];

const HowItWorks = () => {
  return (
    <section className={styles.how_it_works_simple} id="how-it-works">
      <div className={styles.how_container_simple}>
        {/* Header */}
        <motion.div
          className={styles.how_header_simple}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.how_title_simple}>
            From Zero to Leads in <span>Under 60 Seconds</span>
          </h2>
          <p className={styles.how_subtitle_simple}>
            No complex setup. No learning curve. Just results.
          </p>
        </motion.div>

        {/* Steps */}
        <div className={styles.steps_timeline}>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={styles.step_item_simple}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.step_number_simple}>{step.number}</div>
              <div className={styles.step_icon_simple}>
                <i className={step.icon}></i>
              </div>
              <div className={styles.step_content_simple}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div className={`${styles.step_time_badge} ${step.highlight ? styles.highlight : ""}`}>
                  <i className="fa-solid fa-clock"></i>
                  <span>{step.time}</span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={styles.step_connector_simple}></div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className={styles.how_cta_simple}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/search" className={styles.how_btn_simple}>
            Try It Free — No Credit Card
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
