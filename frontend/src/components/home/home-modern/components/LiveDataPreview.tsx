"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const sampleLeads = [
    {
        address: "1847 Oak Ridge Dr",
        city: "Phoenix",
        state: "AZ",
        zip: "85021",
        type: "Foreclosure",
        typeColor: "#2563eb",
        owner: "Michael R●●●●●●",
        phone: "(602) 555-●●●●",
        email: "michael●●●@gmail.com",
        equity: "$147,000",
        daysOnList: 3
    },
    {
        address: "2901 Maple Street",
        city: "Austin",
        state: "TX",
        zip: "78745",
        type: "Divorce",
        typeColor: "#7c3aed",
        owner: "Sarah L●●●●●",
        phone: "(512) 555-●●●●",
        email: "sarah●●●@yahoo.com",
        equity: "$203,000",
        daysOnList: 1
    },
    {
        address: "4532 Pine Valley Ln",
        city: "Denver",
        state: "CO",
        zip: "80220",
        type: "Tax Lien",
        typeColor: "#e36b00",
        owner: "Robert J●●●●●●",
        phone: "(303) 555-●●●●",
        email: "robert●●●@outlook.com",
        equity: "$89,000",
        daysOnList: 5
    }
];

const LiveDataPreview = () => {
    const [currentLead, setCurrentLead] = useState(0);
    const [leadsFoundToday, setLeadsFoundToday] = useState(2847);

    useEffect(() => {
        const leadInterval = setInterval(() => {
            setCurrentLead((prev) => (prev + 1) % sampleLeads.length);
        }, 4000);

        // Simulate leads being added
        const countInterval = setInterval(() => {
            setLeadsFoundToday((prev) => prev + Math.floor(Math.random() * 3));
        }, 5000);

        return () => {
            clearInterval(leadInterval);
            clearInterval(countInterval);
        };
    }, []);

    const lead = sampleLeads[currentLead];

    return (
        <section className={styles.live_data_section}>
            <div className={styles.live_data_container}>
                <motion.div
                    className={styles.live_data_header}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className={styles.live_data_title}>
                        See What You&apos;ll Get — <span>Before You Sign Up</span>
                    </h2>
                    <p className={styles.live_data_subtitle}>
                        Here&apos;s a sample of what a 99Sellers lead looks like. Full contact details instantly available.
                    </p>
                </motion.div>

                <div className={styles.live_data_content}>
                    <motion.div
                        className={styles.sample_lead_card}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className={styles.lead_card_header}>
                            <div className={styles.lead_type_badge} style={{ background: lead.typeColor }}>
                                {lead.type}
                            </div>
                            <div className={styles.days_badge}>
                                <i className="fa-solid fa-clock"></i>
                                {lead.daysOnList} days ago
                            </div>
                        </div>

                        <div className={styles.lead_property}>
                            <i className="fa-solid fa-house"></i>
                            <div>
                                <strong>{lead.address}</strong>
                                <span>{lead.city}, {lead.state} {lead.zip}</span>
                            </div>
                        </div>

                        <div className={styles.lead_details_grid}>
                            <div className={styles.lead_detail}>
                                <span className={styles.detail_label}>Owner Name</span>
                                <span className={styles.detail_value}>{lead.owner}</span>
                            </div>
                            <div className={styles.lead_detail}>
                                <span className={styles.detail_label}>Phone</span>
                                <span className={styles.detail_value}>{lead.phone}</span>
                            </div>
                            <div className={styles.lead_detail}>
                                <span className={styles.detail_label}>Email</span>
                                <span className={styles.detail_value}>{lead.email}</span>
                            </div>
                            <div className={styles.lead_detail}>
                                <span className={styles.detail_label}>Est. Equity</span>
                                <span className={styles.detail_value_highlight}>{lead.equity}</span>
                            </div>
                        </div>

                        <div className={styles.lead_card_footer}>
                            <div className={styles.accuracy_badge}>
                                <i className="fa-solid fa-check-circle"></i>
                                98% Contact Accuracy
                            </div>
                            <div className={styles.skip_traced_badge}>
                                <i className="fa-solid fa-bolt"></i>
                                Skip-Traced
                            </div>
                        </div>

                        <div className={styles.lead_carousel_dots}>
                            {sampleLeads.map((_, index) => (
                                <button
                                    key={index}
                                    className={`${styles.lead_dot} ${index === currentLead ? styles.active : ""}`}
                                    onClick={() => setCurrentLead(index)}
                                />
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.live_stats_panel}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className={styles.live_counter}>
                            <div className={styles.counter_label}>Leads Found Today</div>
                            <div className={styles.counter_value}>
                                <span className={styles.counter_number}>{leadsFoundToday.toLocaleString()}</span>
                                <span className={styles.counter_plus}>+</span>
                            </div>
                            <div className={styles.counter_sublabel}>Across all 50 states</div>
                        </div>

                        <div className={styles.live_features}>
                            <div className={styles.live_feature}>
                                <i className="fa-solid fa-check"></i>
                                <span>Phone numbers verified</span>
                            </div>
                            <div className={styles.live_feature}>
                                <i className="fa-solid fa-check"></i>
                                <span>Email addresses included</span>
                            </div>
                            <div className={styles.live_feature}>
                                <i className="fa-solid fa-check"></i>
                                <span>Equity estimates</span>
                            </div>
                            <div className={styles.live_feature}>
                                <i className="fa-solid fa-check"></i>
                                <span>Export to CSV</span>
                            </div>
                        </div>

                        <Link href="/search" className={styles.live_cta_button}>
                            <span>Find Leads in Your Market</span>
                            <i className="fa-solid fa-arrow-right"></i>
                        </Link>

                        <p className={styles.live_cta_note}>
                            <i className="fa-solid fa-shield-check"></i>
                            No credit card required • 7-day free trial
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default LiveDataPreview;
