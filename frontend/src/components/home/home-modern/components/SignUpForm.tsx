"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const SignUpForm = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        investmentBudget: "",
        targetMarkets: "",
        leadTypes: [] as string[],
        message: ""
    });

    const leadTypeOptions = [
        "Pre-Foreclosure",
        "Tax Delinquent",
        "Probate",
        "Divorce",
        "Absentee Owners",
        "High Equity",
        "Code Violations",
        "Vacant Properties"
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLeadTypeChange = (leadType: string) => {
        setFormData(prev => ({
            ...prev,
            leadTypes: prev.leadTypes.includes(leadType)
                ? prev.leadTypes.filter(lt => lt !== leadType)
                : [...prev.leadTypes, leadType]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log("Lead request submitted:", formData);
    };

    return (
        <section className={styles.signup_form_section}>
            <div className={styles.signup_form_inner}>
                <motion.h2
                    className={styles.signup_form_heading}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    REQUEST MOTIVATED SELLER LEADS
                </motion.h2>

                <motion.div
                    className={styles.signup_form_card}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <h3 className={styles.signup_form_title}>
                        Get Exclusive Access to High-Quality MSL Data
                    </h3>
                    <p className={styles.signup_form_required}>*Required Field</p>

                    <form onSubmit={handleSubmit} className={styles.signup_form}>
                        <div className={styles.form_row}>
                            <div className={styles.form_group}>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="FULL NAME *"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className={styles.form_input}
                                />
                            </div>
                            <div className={styles.form_group}>
                                <input
                                    type="text"
                                    name="company"
                                    placeholder="COMPANY / BROKERAGE"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className={styles.form_input}
                                />
                            </div>
                        </div>

                        <div className={styles.form_row}>
                            <div className={styles.form_group}>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="EMAIL *"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={styles.form_input}
                                />
                            </div>
                            <div className={styles.form_group}>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="PHONE *"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className={styles.form_input}
                                />
                            </div>
                        </div>

                        <div className={styles.form_row}>
                            <div className={styles.form_group}>
                                <select
                                    name="investmentBudget"
                                    value={formData.investmentBudget}
                                    onChange={handleChange}
                                    className={styles.form_input}
                                    required
                                >
                                    <option value="">MONTHLY LEAD BUDGET *</option>
                                    <option value="under-500">Under $500/month</option>
                                    <option value="500-1000">$500 - $1,000/month</option>
                                    <option value="1000-2500">$1,000 - $2,500/month</option>
                                    <option value="2500-5000">$2,500 - $5,000/month</option>
                                    <option value="over-5000">$5,000+/month</option>
                                </select>
                            </div>
                            <div className={styles.form_group}>
                                <input
                                    type="text"
                                    name="targetMarkets"
                                    placeholder="TARGET MARKETS (City, State) *"
                                    value={formData.targetMarkets}
                                    onChange={handleChange}
                                    required
                                    className={styles.form_input}
                                />
                            </div>
                        </div>

                        <div className={styles.form_group}>
                            <label className={styles.form_label}>SELECT LEAD TYPES OF INTEREST *</label>
                            <div className={styles.checkbox_grid}>
                                {leadTypeOptions.map((leadType) => (
                                    <label key={leadType} className={styles.checkbox_item}>
                                        <input
                                            type="checkbox"
                                            checked={formData.leadTypes.includes(leadType)}
                                            onChange={() => handleLeadTypeChange(leadType)}
                                        />
                                        <span>{leadType}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.form_group}>
                            <textarea
                                name="message"
                                placeholder="TELL US ABOUT YOUR BUSINESS AND LEAD REQUIREMENTS (Optional)"
                                value={formData.message}
                                onChange={handleChange}
                                className={styles.form_textarea}
                                rows={4}
                            />
                        </div>

                        <button type="submit" className={styles.signup_submit_btn}>
                            REQUEST FREE CONSULTATION
                        </button>

                        <p className={styles.signup_login_link}>
                            Already have an account? <Link href="/signin">Log In</Link>
                        </p>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default SignUpForm;
