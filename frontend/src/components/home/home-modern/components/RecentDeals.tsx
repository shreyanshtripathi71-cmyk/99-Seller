"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const deals = [
    {
        image: "/images/home/property-phoenix.png",
        location: "Phoenix, AZ 85021",
        type: "Foreclosure",
        purchased: "$85,000",
        sold: "$142,000",
        profit: "$57,000"
    },
    {
        image: "/images/home/property-austin.png",
        location: "Austin, TX 78745",
        type: "Divorce",
        purchased: "$195,000",
        sold: "$289,000",
        profit: "$94,000"
    },
    {
        image: "/images/home/property-denver.png",
        location: "Denver, CO 80220",
        type: "Tax Lien",
        purchased: "$120,000",
        sold: "$185,000",
        profit: "$65,000"
    }
];

const RecentDeals = () => {
    return (
        <section className={styles.recent_deals}>
            <motion.h2
                className={styles.section_title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                Deals Closed By Our Users
            </motion.h2>

            <div className={styles.deals_grid}>
                {deals.map((deal, index) => (
                    <motion.div
                        key={index}
                        className={styles.deal_card}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <div className={styles.deal_image}>
                            <img src={deal.image} alt={`Property in ${deal.location}`} />
                            <span className={styles.deal_type_badge}>{deal.type}</span>
                        </div>
                        <div className={styles.deal_content}>
                            <div className={styles.deal_location}>
                                <i className="fa-solid fa-location-dot"></i>
                                {deal.location}
                            </div>
                            <div className={styles.deal_metrics}>
                                <div className={styles.deal_metric}>
                                    <div className={styles.metric_label}>Purchased</div>
                                    <div className={styles.metric_value}>{deal.purchased}</div>
                                </div>
                                <div className={styles.deal_metric}>
                                    <div className={styles.metric_label}>Sold</div>
                                    <div className={styles.metric_value}>{deal.sold}</div>
                                </div>
                            </div>
                            <div className={styles.deal_profit}>
                                <div className={styles.profit_label}>Profit</div>
                                <div className={styles.profit_value}>{deal.profit}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default RecentDeals;
