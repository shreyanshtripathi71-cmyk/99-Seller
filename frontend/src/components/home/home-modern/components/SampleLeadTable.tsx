"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const sampleLeads = [
    {
        name: "Robert M. Johnson",
        address: "1847 Oak Valley Dr, Phoenix, AZ 85021",
        phone: "(602) 555-XXXX",
        email: "r•••••@gmail.com",
        equity: "$87,500",
        type: "foreclosure",
        typeLabel: "Foreclosure"
    },
    {
        name: "Sarah & David Chen",
        address: "3921 Maple Street, Austin, TX 78745",
        phone: "(512) 555-XXXX",
        email: "s•••••@yahoo.com",
        equity: "$124,000",
        type: "divorce",
        typeLabel: "Divorce"
    },
    {
        name: "Michael Thompson",
        address: "2156 Pine Ridge Ln, Denver, CO 80220",
        phone: "(303) 555-XXXX",
        email: "m•••••@gmail.com",
        equity: "$95,200",
        type: "taxlien",
        typeLabel: "Tax Lien"
    },
    {
        name: "Estate of Helen Garcia",
        address: "4782 Sunset Blvd, Miami, FL 33155",
        phone: "(305) 555-XXXX",
        email: "e•••••@aol.com",
        equity: "$156,800",
        type: "probate",
        typeLabel: "Probate"
    }
];

const SampleLeadTable = () => {
    return (
        <section className={styles.section_clean_alt}>
            <div className={styles.section_inner}>
                <motion.h2
                    className={styles.section_title_clean}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    See Exactly What You Get
                </motion.h2>

                <motion.div
                    className={styles.sample_table_container}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className={styles.sample_table_header}>
                        <h3>
                            <i className="fa-solid fa-table-list"></i>
                            Sample Lead Data
                        </h3>
                        <div className={styles.live_badge}>
                            <span className={styles.pulse}></span>
                            Updated Daily
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.sample_table}>
                            <thead>
                                <tr>
                                    <th>Owner Name</th>
                                    <th>Property Address</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Equity</th>
                                    <th>Lead Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sampleLeads.map((lead, index) => (
                                    <tr key={index}>
                                        <td>{lead.name}</td>
                                        <td>{lead.address}</td>
                                        <td className={styles.blurred}>{lead.phone}</td>
                                        <td className={styles.blurred}>{lead.email}</td>
                                        <td className={styles.equity_positive}>{lead.equity}</td>
                                        <td>
                                            <span className={`${styles.lead_type_badge} ${styles[lead.type]}`}>
                                                {lead.typeLabel}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.sample_table_footer}>
                        <div className={styles.footer_text}>
                            Showing <strong>4 of 87,713</strong> available leads. Contact info revealed with Premium access.
                        </div>
                        <Link href="/search" className={styles.btn_primary}>
                            Unlock Full Access
                            <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SampleLeadTable;
