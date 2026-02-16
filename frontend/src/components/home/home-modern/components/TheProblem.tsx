"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const problems = [
    {
        icon: "fa-solid fa-car",
        title: "Driving for Dollars",
        cost: "$300/month in gas",
        result: "0 verified contacts",
        description: "Hours of driving, no owner info"
    },
    {
        icon: "fa-solid fa-users",
        title: "Shared Lead Lists",
        cost: "$500/month",
        result: "10+ people calling same leads",
        description: "By the time you call, they've heard it all"
    },
    {
        icon: "fa-solid fa-phone-slash",
        title: "Cold Calling",
        cost: "$400/month for lists",
        result: "90% wrong numbers",
        description: "Wasted hours on disconnected lines"
    },
    {
        icon: "fa-solid fa-building-columns",
        title: "Manual Courthouse Research",
        cost: "20+ hours/week",
        result: "Always behind competitors",
        description: "Outdated by the time you find it"
    }
];

const TheProblem = () => {
    return (
        <section className={styles.the_problem_section}>
            <div className={styles.problem_container}>
                <motion.div
                    className={styles.problem_header}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className={styles.problem_title}>
                        You&apos;re <span className={styles.text_highlight}>Wasting Money</span> on Leads That Go Nowhere
                    </h2>
                    <p className={styles.problem_subtitle}>
                        Most real estate professionals spend $500-1,000/month on methods that simply don&apos;t work anymore.
                    </p>
                </motion.div>

                <div className={styles.problem_grid}>
                    {problems.map((problem, index) => (
                        <motion.div
                            key={index}
                            className={styles.problem_card}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className={styles.problem_icon_wrapper}>
                                <i className={problem.icon}></i>
                            </div>
                            <h3 className={styles.problem_card_title}>{problem.title}</h3>
                            <p className={styles.problem_description}>{problem.description}</p>
                            <div className={styles.problem_stats}>
                                <div className={styles.problem_stat}>
                                    <span className={styles.stat_label}>Cost:</span>
                                    <span className={styles.stat_value}>{problem.cost}</span>
                                </div>
                                <div className={styles.problem_stat}>
                                    <span className={styles.stat_label}>Result:</span>
                                    <span className={styles.stat_value}>{problem.result}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className={styles.problem_solution_teaser}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <div className={styles.solution_arrow}>
                        <i className="fa-solid fa-arrow-down"></i>
                    </div>
                    <h3>There&apos;s a Better Way</h3>
                    <p>Get <strong>skip-traced, motivated seller leads</strong> delivered daily for just <span className={styles.text_primary}>$97/month</span> — that&apos;s <span className={styles.text_primary}>80% less</span> than what you&apos;re spending now.</p>
                </motion.div>
            </div>
        </section>
    );
};

export default TheProblem;
