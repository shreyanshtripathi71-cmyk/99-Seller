"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const Hero = () => {
  return (
    <section className={styles.hero}>
      {/* Background Image with Blur */}
      <div className={styles.hero_background}>
        <img
          src="/images/home/hero-background.png"
          alt=""
          aria-hidden="true"
        />
      </div>
      <div className={styles.hero_overlay}></div>

      <div className={styles.hero_inner}>
        {/* Title with animated gradient */}
        <motion.h1
          className={styles.hero_title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Find <span className={styles.highlight}>Motivated Sellers</span>
          <br />
          Ready to Sell
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className={styles.hero_subtitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Access foreclosures, divorces, tax liens, probate & more.
          Verified phone & email with 98% accuracy. Contact distressed homeowners
          before your competition does.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className={styles.hero_actions}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/search" className={`${styles.btn_primary} ${styles.btn_large}`}>
            <i className="fa-solid fa-search"></i>
            Find Leads in Your Market
          </Link>
          <Link href="#how-it-works" className={`${styles.btn_outline} ${styles.btn_large}`}>
            <i className="fa-solid fa-play-circle"></i>
            How It Works
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
