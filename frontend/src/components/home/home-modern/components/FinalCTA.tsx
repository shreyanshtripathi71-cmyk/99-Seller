"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const FinalCTA = () => {
    return (
        <section className={styles.final_cta_section}>
            <div className={styles.final_cta_bg}>
                <div className={styles.final_cta_gradient}></div>
            </div>

            <div className={styles.final_cta_inner}>
                <motion.div
                    className={styles.final_cta_content}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className={styles.final_cta_title}>
                        Ready to Find Your Next Deal?
                    </h2>
                    <p className={styles.final_cta_subtitle}>
                        Join thousands of real estate professionals using 99Sellers to find motivated sellers every day.
                    </p>

                    <div className={styles.final_cta_buttons}>
                        <Link href="/signup" className={styles.final_cta_btn_primary}>
                            Start Free Trial
                            <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                        <Link href="/contact" className={styles.final_cta_btn_secondary}>
                            <i className="fa-solid fa-phone"></i>
                            Talk to Sales
                        </Link>
                    </div>

                    <div className={styles.final_cta_trust}>
                        <div className={styles.trust_item}>
                            <i className="fa-solid fa-shield-check"></i>
                            <span>No credit card required</span>
                        </div>
                        <div className={styles.trust_item}>
                            <i className="fa-solid fa-rotate-left"></i>
                            <span>30-day money-back guarantee</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalCTA;
