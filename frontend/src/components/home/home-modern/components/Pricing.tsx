"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Perfect for trying out 99Sellers with limited access.",
    features: [
      "50 leads per month",
      "1 county access",
      "Basic filters",
      "Email support"
    ],
    buttonText: "Get Started Free",
    popular: false
  },
  {
    name: "Premium",
    price: "$50",
    period: "/month",
    description: "Unlimited access to all leads and features.",
    features: [
      "Unlimited leads",
      "All 50 states",
      "All 6 lead types",
      "Skip tracing included",
      "CRM export (CSV)",
      "Priority support"
    ],
    buttonText: "Start Free Trial",
    popular: true
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className={styles.pricing_section}>
      <div className={styles.pricing_inner}>
        <motion.h2
          className={styles.section_title_clean}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Simple, Transparent Pricing
        </motion.h2>

        <div className={styles.pricing_grid_clean}>
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`${styles.pricing_card_clean} ${plan.popular ? styles.popular : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {plan.popular && (
                <div className={styles.popular_badge_clean}>Most Popular</div>
              )}

              <h3 className={styles.plan_name_clean}>{plan.name}</h3>
              <div className={styles.plan_price_clean}>
                <span className={styles.price_clean}>{plan.price}</span>
                <span className={styles.period_clean}>{plan.period}</span>
              </div>
              <p className={styles.plan_desc_clean}>{plan.description}</p>

              <ul className={styles.plan_features_clean}>
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <i className="fa-solid fa-check"></i>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link 
                href="/search" 
                className={`${styles.plan_btn_clean} ${plan.popular ? styles.plan_btn_primary : styles.plan_btn_secondary}`}
              >
                {plan.buttonText}
              </Link>

              {plan.popular && (
                <p className={styles.guarantee_text}>
                  <i className="fa-solid fa-shield-check"></i>
                  30-Day Money-Back Guarantee
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
