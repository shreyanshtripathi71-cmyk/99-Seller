"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

interface CenteredContentProps {
    title: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    showCTA?: boolean;
}

const CenteredContent: React.FC<CenteredContentProps> = ({
    title,
    subtitle,
    description,
    ctaText = "Get Started",
    ctaLink = "/signup",
    showCTA = false
}) => {
    return (
        <section className={styles.centered_content_section}>
            <div className={styles.centered_content_inner}>
                <motion.div
                    className={styles.centered_content_wrapper}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {subtitle && (
                        <span className={styles.centered_content_subtitle}>{subtitle}</span>
                    )}
                    <h2 className={styles.centered_content_title}>{title}</h2>
                    {description && (
                        <p className={styles.centered_content_description}>{description}</p>
                    )}
                    {showCTA && (
                        <motion.div
                            className={styles.centered_content_cta}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <Link href={ctaLink} className={styles.centered_cta_btn}>
                                {ctaText}
                                <i className="fa-solid fa-arrow-right"></i>
                            </Link>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    );
};

export default CenteredContent;
