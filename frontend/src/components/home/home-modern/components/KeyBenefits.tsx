"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const benefits = [
    {
        icon: "fa-solid fa-couch",
        title: "Reach clients without leaving the chair",
        description: "50 years ago, this was not possible. Now you can call them and close them while sitting on your chair.",
        image: "/images/home/benefit-reach.jpg"
    },
    {
        icon: "fa-solid fa-clock",
        title: "Save time",
        description: "Not only you get more clients with 99Sellers account, you get MORE TIME!!",
        image: "/images/home/benefit-time.jpg"
    },
    {
        icon: "fa-solid fa-chart-line",
        title: "10X your PROFIT!!",
        description: "Simple tiny account giving the mountain size ROI is the biggest benefit.",
        image: "/images/home/benefit-profit.jpg"
    }
];

const KeyBenefits = () => {
    return (
        <section className={styles.key_benefits}>
            <div className={styles.key_benefits_inner}>
                <motion.div
                    className={styles.key_benefits_header}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className={styles.key_benefits_title}>Key Benefits</h2>
                    <p className={styles.key_benefits_subtitle}>
                        Why real estate agents choose 99Sellers
                    </p>
                </motion.div>

                <div className={styles.key_benefits_grid}>
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            className={styles.benefit_card}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className={styles.benefit_image}>
                                <div className={styles.benefit_image_placeholder}>
                                    <i className={benefit.icon}></i>
                                </div>
                            </div>
                            <div className={styles.benefit_content}>
                                <h3 className={styles.benefit_title}>{benefit.title}</h3>
                                <p className={styles.benefit_description}>{benefit.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default KeyBenefits;
