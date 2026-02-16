"use client";
import React from "react";
import styles from "../styles/homepage.module.scss";

const benefits = [
    {
        icon: "fa-solid fa-bolt",
        title: "Real-Time Updates",
        desc: "Fresh leads added daily from courthouse records"
    },
    {
        icon: "fa-solid fa-shield-check",
        title: "Verified Data",
        desc: "98% contact accuracy, skip-tracing included"
    },
    {
        icon: "fa-solid fa-lock",
        title: "100% Exclusive",
        desc: "No shared leads, you're the only one calling"
    },
    {
        icon: "fa-solid fa-rotate",
        title: "Money-Back Guarantee",
        desc: "Full refund if leads don't meet quality standards"
    }
];

const stats = [
    { value: "12.5M+", label: "Leads Generated" },
    { value: "98%", label: "Accuracy Rate" },
    { value: "50", label: "States Covered" },
    { value: "$2.4B", label: "Deals Closed" }
];

const WhyChooseUs = () => {
    return (
        <section className={styles.split_section}>
            {/* Left Side - Stats */}
            <div className={styles.split_left}>
                <div className={styles.stats_showcase}>
                    <div className={styles.stats_grid}>
                        {stats.map((stat, index) => (
                            <div key={index} className={styles.stat_card}>
                                <span className={styles.stat_value}>{stat.value}</span>
                                <span className={styles.stat_label}>{stat.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.floating_badge}>
                        <i className="fa-solid fa-check-circle"></i>
                        <span>Trusted by 12,000+ Investors</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Benefits */}
            <div className={styles.split_right}>
                <h2 className={styles.split_title}>
                    The Unfair Advantage
                    <br />
                    <span className={styles.gradient_text}>You&apos;ve Been Looking For</span>
                </h2>

                <div className={styles.benefits_list}>
                    {benefits.map((benefit, index) => (
                        <div key={index} className={styles.benefit_item}>
                            <div className={styles.benefit_icon}>
                                <i className={benefit.icon}></i>
                            </div>
                            <div className={styles.benefit_text}>
                                <h4>{benefit.title}</h4>
                                <p>{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
