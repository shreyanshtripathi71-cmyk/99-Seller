"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const userTypes = [
  {
    id: "wholesalers",
    icon: "fa-solid fa-handshake",
    title: "Wholesalers",
    painPoint: "Tired of calling unmotivated sellers?",
    headline: "Find Motivated Sellers, Close Faster",
    description: "Get skip-traced leads for homeowners who NEED to sell — foreclosure, divorce, tax lien. No more wasting time on cold leads.",
    benefits: [
      "Direct contact info for distressed property owners",
      "Motivation indicators show urgency level",
      "Export leads for your dialer campaigns",
      "Find deals before they hit the market"
    ],
    stat: { value: "5-10", label: "deals/month avg." },
    problem: "Most wholesalers waste 20+ hours/week on unmotivated sellers",
    solution: "99Sellers gives you PRE-QUALIFIED motivated sellers only",
    cta: "Start Finding Deals"
  },
  {
    id: "investors",
    icon: "fa-solid fa-building",
    title: "Investors",
    painPoint: "Missing out on deals with 40%+ equity?",
    headline: "Build Your Portfolio with Off-Market Deals",
    description: "Access property data with equity estimates and owner information. Find undervalued properties before they list publicly.",
    benefits: [
      "Equity data to find undervalued properties",
      "All 50 states, 3,200+ counties covered",
      "Probate & inherited property leads",
      "Tax lien and pre-foreclosure alerts"
    ],
    stat: { value: "$180K", label: "avg. equity found" },
    problem: "Investors spend $500+/month on multiple data sources",
    solution: "99Sellers combines everything for just $97/month",
    cta: "Find Investment Deals"
  },
  {
    id: "agents",
    icon: "fa-solid fa-user-tie",
    title: "Agents & Brokers",
    painPoint: "Losing listings to faster competitors?",
    headline: "Win More Listings with Exclusive Leads",
    description: "Reach homeowners before they list publicly. Get verified contact info for motivated sellers in your target market.",
    benefits: [
      "Pre-foreclosure owners looking to sell",
      "Divorce filings with property ownership",
      "Inherited properties seeking quick sales",
      "Build your pipeline with exclusive leads"
    ],
    stat: { value: "3x", label: "more listings" },
    problem: "Agents wait for leads to come to them",
    solution: "With 99Sellers, YOU reach them first",
    cta: "Grow Your Listings"
  },
  {
    id: "flippers",
    icon: "fa-solid fa-hammer",
    title: "Fix & Flippers",
    painPoint: "Can't find properties with enough margin?",
    headline: "Find Distressed Properties with Built-In Profit",
    description: "Identify properties with major equity upside. Target motivated sellers who need to sell fast — perfect for flip deals.",
    benefits: [
      "Code violation properties with owner data",
      "Vacant & abandoned property leads",
      "Direct owner contact for quick deals",
      "Filter by property type & estimated condition"
    ],
    stat: { value: "$45K", label: "avg. profit/flip" },
    problem: "Driving for dollars takes hours with no results",
    solution: "99Sellers delivers distressed leads with contact info",
    cta: "Find Flip Opportunities"
  }
];

const PerfectFor = () => {
  const [activeTab, setActiveTab] = useState("wholesalers");
  const activeUser = userTypes.find(u => u.id === activeTab) || userTypes[0];

  return (
    <section className={styles.perfect_for_section}>
      <div className={styles.perfect_for_container}>
        <motion.div
          className={styles.perfect_for_header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.perfect_for_title}>
            Built for <span>Real Estate Professionals</span> Like You
          </h2>
        </motion.div>

        <div className={styles.user_type_tabs}>
          {userTypes.map((user) => (
            <button
              key={user.id}
              className={`${styles.user_type_tab} ${activeTab === user.id ? styles.active : ""}`}
              onClick={() => setActiveTab(user.id)}
            >
              <i className={user.icon}></i>
              <span>{user.title}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className={styles.user_type_content_new}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Pain Point Header */}
            <div className={styles.pain_point_banner}>
              <i className="fa-solid fa-circle-question"></i>
              <span>{activeUser.painPoint}</span>
            </div>

            <div className={styles.user_type_info}>
              <h3 className={styles.user_type_headline}>{activeUser.headline}</h3>
              <p className={styles.user_type_description}>{activeUser.description}</p>

              <ul className={styles.user_type_benefits}>
                {activeUser.benefits.map((benefit, index) => (
                  <li key={index}>
                    <i className="fa-solid fa-check"></i>
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* Problem/Solution Box */}
              <div className={styles.problem_solution_box}>
                <div className={styles.problem_side}>
                  <span className={styles.ps_label}>The Problem:</span>
                  <p>{activeUser.problem}</p>
                </div>
                <div className={styles.arrow_divider}>
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
                <div className={styles.solution_side}>
                  <span className={styles.ps_label}>The Solution:</span>
                  <p>{activeUser.solution}</p>
                </div>
              </div>

              <div className={styles.user_type_cta}>
                <Link href="/search" className={styles.user_type_btn}>
                  {activeUser.cta}
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            </div>

            <div className={styles.user_type_stat_card}>
              <div className={styles.user_stat_value}>{activeUser.stat.value}</div>
              <div className={styles.user_stat_label}>{activeUser.stat.label}</div>
              <p className={styles.user_stat_note}>Average for 99Sellers users</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PerfectFor;
