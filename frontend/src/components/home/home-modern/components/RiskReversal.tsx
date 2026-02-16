"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const guarantees = [
    {
        icon: "fa-solid fa-gift",
        title: "7-Day Free Trial",
        description: "Full platform access. No credit card required. Cancel anytime."
    },
    {
        icon: "fa-solid fa-rotate-left",
        title: "30-Day Money-Back",
        description: "Not satisfied? Get a full refund within 30 days. No questions asked."
    },
    {
        icon: "fa-solid fa-calendar-xmark",
        title: "Cancel Anytime",
        description: "No long-term contracts. No hidden fees. Cancel with one click."
    },
    {
        icon: "fa-solid fa-bullseye",
        title: "98% Data Accuracy",
        description: "If our contact data doesn't meet our accuracy promise, we'll credit your account."
    }
];

const RiskReversal = () => {
    return (
        <section className={styles.risk_reversal_section}>
            <div className={styles.risk_reversal_container}>
                <motion.div
                    className={styles.risk_reversal_header}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className={styles.risk_reversal_title}>
                        Try 99Sellers <span>100% Risk-Free</span>
                    </h2>
                    <p className={styles.risk_reversal_subtitle}>
                        We&apos;re so confident you&apos;ll love 99Sellers that we take all the risk off your shoulders.
                    </p>
                </motion.div>

                <div className={styles.guarantees_grid}>
                    {guarantees.map((guarantee, index) => (
                        <motion.div
                            key={index}
                            className={styles.guarantee_card}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className={styles.guarantee_icon}>
                                <i className={guarantee.icon}></i>
                            </div>
                            <h3 className={styles.guarantee_title}>{guarantee.title}</h3>
                            <p className={styles.guarantee_description}>{guarantee.description}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className={styles.risk_reversal_cta}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Link href="/search" className={styles.risk_cta_button}>
                        Start Your Free Trial
                        <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                    <p className={styles.risk_cta_subtext}>
                        Join <strong>12,000+</strong> investors who trust 99Sellers
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default RiskReversal;
