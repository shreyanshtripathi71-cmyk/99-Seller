"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const leadTypes = [
    "Pre-Foreclosure",
    "Divorce",
    "Probate & Inherited",
    "Tax Lien",
    "Vacant Properties",
    "Eviction",
    "Absentee Owners",
    "Distressed Sellers"
];

const stats = [
    { value: "12.5M+", label: "Motivated Seller Leads" },
    { value: "100%", label: "Include Phone Numbers" },
    { value: "50", label: "States Covered" }
];

const LeadTypesShowcase = () => {
    return (
        <section id="lead-types" className={styles.lead_types_msl}>
            <div className={styles.msl_container}>
                <div className={styles.msl_content}>
                    <div className={styles.msl_left}>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            Access Every Type of <span>Motivated Seller</span>
                        </motion.h2>
                        <motion.p
                            className={styles.msl_desc}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            We compile the best leads based on your specifications. 
                            Connect with motivated sellers ready to move on their property.
                        </motion.p>

                        <motion.ul
                            className={styles.msl_list}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            {leadTypes.map((type, index) => (
                                <li key={index}>
                                    <i className="fa-solid fa-check"></i>
                                    {type}
                                </li>
                            ))}
                        </motion.ul>

                        <motion.a
                            href="/register"
                            className={styles.msl_cta}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            Start Finding Leads <i className="fa-solid fa-arrow-right"></i>
                        </motion.a>
                    </div>

                    <div className={styles.msl_right}>
                        <motion.div
                            className={styles.msl_stats_card}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            {stats.map((stat, index) => (
                                <div key={index} className={styles.msl_stat}>
                                    <span className={styles.msl_stat_value}>{stat.value}</span>
                                    <span className={styles.msl_stat_label}>{stat.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LeadTypesShowcase;
