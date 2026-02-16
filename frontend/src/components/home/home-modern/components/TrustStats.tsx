"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const stats = [
    { value: "2.5M+", label: "Verified Contacts" },
    { value: "98%", label: "Phone Accuracy" },
    { value: "12K+", label: "Active Investors" },
    { value: "500+", label: "Deals Monthly" },
];

const TrustStats = () => {
    return (
        <section className={styles.trust_stats}>
            <div className={styles.trust_stats_inner}>
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        className={styles.stat_box}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <div className={styles.stat_value}>{stat.value}</div>
                        <div className={styles.stat_label}>{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default TrustStats;
