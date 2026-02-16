"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const trustedLogos = [
  { name: "Keller Williams", logo: "/images/home/logos/keller-williams.svg" },
  { name: "RE/MAX", logo: "/images/home/logos/remax.svg" },
  { name: "Century 21", logo: "/images/home/logos/century21.svg" },
  { name: "Coldwell Banker", logo: "/images/home/logos/coldwell-banker.svg" },
  { name: "Berkshire Hathaway", logo: "/images/home/logos/berkshire.svg" },
  { name: "eXp Realty", logo: "/images/home/logos/exp-realty.svg" }
];

const LogoMarquee = () => {
  return (
    <section className={styles.logo_marquee_section}>
      <div className={styles.marquee_container}>
        <motion.p
          className={styles.marquee_title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Trusted by <strong>12,000+</strong> real estate professionals nationwide
        </motion.p>

        <div className={styles.marquee_wrapper}>
          <div className={styles.marquee_track}>
            {[...trustedLogos, ...trustedLogos].map((logo, index) => (
              <div key={index} className={styles.marquee_item}>
                <img src={logo.logo} alt={logo.name} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoMarquee;
