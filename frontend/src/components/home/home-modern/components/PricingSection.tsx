"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const plans = [
  {
    id: "free",
    name: "Starter",
    price: "0",
    period: "forever",
    description: "Perfect for trying out 99Sellers",
    features: [
      { text: "50 leads per month", included: true },
      { text: "1 county access", included: true },
      { text: "Basic filters", included: true },
      { text: "Email support", included: true },
      { text: "Skip tracing", included: false },
      { text: "CRM export", included: false },
      { text: "Priority support", included: false }
    ],
    buttonText: "Get Started Free",
    popular: false,
    valueStack: null
  },
  {
    id: "premium",
    name: "Premium",
    price: "97",
    period: "month",
    description: "Everything you need to close deals",
    features: [
      { text: "Unlimited leads", included: true },
      { text: "All 50 states", included: true },
      { text: "All 6 lead types", included: true },
      { text: "Skip tracing included", included: true },
      { text: "CRM export (CSV)", included: true },
      { text: "Priority support", included: true },
      { text: "Daily data updates", included: true }
    ],
    buttonText: "Start 7-Day Free Trial",
    popular: true,
    valueStack: [
      { feature: "Skip tracing", value: "$200/mo" },
      { feature: "All 50 states", value: "$150/mo" },
      { feature: "6 lead types", value: "$100/mo" },
      { feature: "Daily updates", value: "$50/mo" }
    ],
    totalValue: "$500"
  }
];

const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const getPrice = (price: string) => {
    if (price === "0") return "0";
    const monthly = parseInt(price);
    return isAnnual ? Math.round(monthly * 0.8).toString() : price;
  };

  return (
    <section id="pricing" className={styles.pricing_section_new}>
      <div className={styles.pricing_bg}>
        <div className={styles.pricing_gradient}></div>
      </div>

      <div className={styles.pricing_container}>
        <motion.div
          className={styles.pricing_header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.pricing_title}>
            Invest <span>$97/Month</span>, Make <span>$10,000+</span>
          </h2>
          <p className={styles.pricing_subtitle}>
            The average 99Sellers user closes 5+ additional deals per month.
            That&apos;s $50,000+ in profit from a $97 investment.
          </p>

          <div className={styles.pricing_toggle}>
            <span className={!isAnnual ? styles.active : ""}>Monthly</span>
            <button
              className={`${styles.toggle_switch} ${isAnnual ? styles.active : ""}`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <span className={styles.toggle_knob}></span>
            </button>
            <span className={isAnnual ? styles.active : ""}>
              Annual <span className={styles.save_badge}>Save 20%</span>
            </span>
          </div>
        </motion.div>

        <div className={styles.pricing_cards}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`${styles.pricing_card_new} ${plan.popular ? styles.popular : ""}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {plan.popular && (
                <div className={styles.popular_ribbon}>
                  <span>Most Popular</span>
                </div>
              )}

              <div className={styles.card_header}>
                <h3 className={styles.plan_name}>{plan.name}</h3>
                <p className={styles.plan_description}>{plan.description}</p>
              </div>

              <div className={styles.plan_price_wrapper}>
                <span className={styles.currency}>$</span>
                <span className={styles.price_value}>{getPrice(plan.price)}</span>
                <span className={styles.price_period}>/{plan.period}</span>
              </div>

              {/* Value Stack for Premium */}
              {plan.valueStack && (
                <div className={styles.value_stack}>
                  <div className={styles.value_stack_header}>
                    <span>What you&apos;re getting:</span>
                  </div>
                  {plan.valueStack.map((item, i) => (
                    <div key={i} className={styles.value_stack_item}>
                      <span className={styles.value_feature}>{item.feature}</span>
                      <span className={styles.value_worth}>worth {item.value}</span>
                    </div>
                  ))}
                  <div className={styles.value_stack_total}>
                    <span>Total Value:</span>
                    <span className={styles.total_value}>{plan.totalValue}/month</span>
                  </div>
                  <div className={styles.you_pay}>
                    <span>You Pay:</span>
                    <span className={styles.you_pay_amount}>${getPrice(plan.price)}/month</span>
                  </div>
                </div>
              )}

              <ul className={styles.plan_features_list}>
                {plan.features.map((feature, i) => (
                  <li key={i} className={feature.included ? styles.included : styles.not_included}>
                    <i className={`fa-solid ${feature.included ? "fa-check" : "fa-xmark"}`}></i>
                    {feature.text}
                  </li>
                ))}
              </ul>

              <Link
                href="/search"
                className={`${styles.plan_button} ${plan.popular ? styles.btn_primary : styles.btn_secondary}`}
              >
                {plan.buttonText}
              </Link>

              {plan.popular && (
                <p className={styles.guarantee_note}>
                  <i className="fa-solid fa-shield-check"></i>
                  30-Day Money-Back Guarantee
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.pricing_comparison}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.comparison_box}>
            <div className={styles.comparison_left}>
              <span className={styles.comparison_label}>What you&apos;d pay elsewhere:</span>
              <span className={styles.comparison_price}>$500+/month</span>
              <span className={styles.comparison_details}>PropStream + BatchLeads + Skip Tracing</span>
            </div>
            <div className={styles.comparison_vs}>VS</div>
            <div className={styles.comparison_right}>
              <span className={styles.comparison_label}>99Sellers Premium:</span>
              <span className={styles.comparison_price_highlight}>${getPrice("97")}/month</span>
              <span className={styles.comparison_details}>Everything in one platform</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={styles.pricing_faq_preview}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p>
            <i className="fa-solid fa-circle-question"></i>
            Have questions? <Link href="/faq">Check our FAQ</Link> or{" "}
            <Link href="/contact">contact support</Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
