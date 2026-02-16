"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const faqs = [
  {
    question: "How fresh is the lead data?",
    answer: "Our data is updated daily from over 3,200 county records across all 50 states. When a foreclosure is filed, a divorce is recorded, or a tax lien is placed—it shows up in your dashboard within 24-48 hours."
  },
  {
    question: "Are the leads exclusive to me?",
    answer: "We don't sell exclusive territories, which keeps our pricing affordable. However, our data is fresher than most services, so you'll often reach sellers before others even know about them. Speed is your competitive advantage."
  },
  {
    question: "What's included in the skip-traced data?",
    answer: "Each lead includes the property owner's name, mailing address, phone numbers (cell & landline when available), email addresses, and property details including estimated equity. Our skip tracing has 98% accuracy."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes! There are no long-term contracts. You can cancel your subscription anytime from your dashboard. If you cancel, you'll retain access until the end of your billing period."
  },
  {
    question: "What if my county isn't covered?",
    answer: "We cover 3,200+ counties across all 50 states—that's about 98% of the US population. If you can't find leads in your specific area, contact us and we'll let you know our coverage or work on adding it."
  },
  {
    question: "How do I export leads?",
    answer: "You can export your leads as a CSV file with one click. The export includes names, addresses, phone numbers, emails, and property details. Perfect for direct mail campaigns or calling lists."
  },
  {
    question: "Is there a money-back guarantee?",
    answer: "Yes! We offer a 30-day money-back guarantee on all paid plans. If you're not finding value in our leads, contact support within 30 days for a full refund—no questions asked."
  },
  {
    question: "How is this different from driving for dollars?",
    answer: "Driving for dollars shows you vacant properties but gives you no owner info, no motivation data, and no contact details. 99Sellers gives you skip-traced contacts for motivated sellers (foreclosure, divorce, tax lien, probate) ready to call immediately."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={styles.faq_section}>
      <div className={styles.faq_container}>
        <motion.div
          className={styles.faq_header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.faq_title}>
            Frequently Asked <span>Questions</span>
          </h2>
        </motion.div>

        <div className={styles.faq_list}>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className={`${styles.faq_item} ${openIndex === index ? styles.open : ""}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                className={styles.faq_question}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span>{faq.question}</span>
                <i className={`fa-solid ${openIndex === index ? "fa-minus" : "fa-plus"}`}></i>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    className={styles.faq_answer}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.faq_cta}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p>Still have questions?</p>
          <a href="/contact" className={styles.faq_contact_link}>
            <i className="fa-solid fa-envelope"></i>
            Contact our support team
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
