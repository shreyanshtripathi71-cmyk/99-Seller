"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const trustMetrics = [
    { value: "12,000+", label: "Active Users" },
    { value: "$2.4B", label: "Deals Closed" },
    { value: "4.9★", label: "Average Rating" },
    { value: "50", label: "States Covered" }
];

const brokerageNames = [
    "RE/MAX",
    "Century 21",
    "Keller Williams",
    "Coldwell Banker",
    "Compass",
    "eXp Realty",
    "Berkshire Hathaway",
    "Sotheby's"
];

const SocialProofBar = () => {
    return (
        <section className={styles.social_proof_section}>
            <div className={styles.social_proof_container}>
                {/* Trust Metrics */}
                <motion.div
                    className={styles.trust_metrics_row}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    {trustMetrics.map((metric, index) => (
                        <div key={index} className={styles.trust_metric}>
                            <span className={styles.metric_value}>{metric.value}</span>
                            <span className={styles.metric_label}>{metric.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Brokerage Names Marquee */}
                <motion.div
                    className={styles.trusted_by_section}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <p className={styles.trusted_by_label}>
                        Trusted by professionals from leading brokerages
                    </p>
                    <div className={styles.brokerage_marquee_wrapper}>
                        <div className={styles.brokerage_marquee}>
                            {[...brokerageNames, ...brokerageNames].map((name, index) => (
                                <div key={index} className={styles.brokerage_item}>
                                    <span>{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SocialProofBar;
