"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const testimonials = [
  {
    quote: "I closed my first deal within 3 weeks of signing up. The foreclosure leads are incredibly fresh.",
    name: "Marcus Johnson",
    role: "Wholesaler, Phoenix AZ",
    deals: "12",
    profit: "$147K"
  },
  {
    quote: "The contact accuracy is way better than what I was paying for elsewhere. Skip tracing included is a game-changer.",
    name: "Sarah Mitchell",
    role: "Flipper, Atlanta GA",
    deals: "8",
    profit: "$89K"
  },
  {
    quote: "The probate leads alone have been worth it. I've built relationships with estate attorneys who now send me referrals.",
    name: "David Chen",
    role: "Buy & Hold Investor, Houston TX",
    deals: "5",
    profit: "$62K"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className={styles.section_clean}>
      <div className={styles.section_inner}>
        <motion.h2
          className={styles.section_title_clean}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          What Investors Are Saying
        </motion.h2>

        <div className={styles.testimonials_grid_clean}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className={styles.testimonial_card_clean}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
            >
              <div className={styles.stars_row}>
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              
              <p className={styles.testimonial_quote_clean}>&ldquo;{testimonial.quote}&rdquo;</p>
              
              <div className={styles.testimonial_metrics_clean}>
                <div className={styles.metric_clean}>
                  <span className={styles.metric_value_clean}>{testimonial.deals}</span>
                  <span className={styles.metric_label_clean}>Deals</span>
                </div>
                <div className={styles.metric_clean}>
                  <span className={styles.metric_value_clean}>{testimonial.profit}</span>
                  <span className={styles.metric_label_clean}>Profit</span>
                </div>
              </div>
              
              <div className={styles.testimonial_author_clean}>
                <span className={styles.author_name_clean}>{testimonial.name}</span>
                <span className={styles.author_role_clean}>{testimonial.role}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
