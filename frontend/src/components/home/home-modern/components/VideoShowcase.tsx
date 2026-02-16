"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const DashboardShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [activeStep, setActiveStep] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Generate stable prices only on client side to avoid hydration mismatch
  const cardPrices = useMemo(() => {
    if (!isClient) return [250, 180, 320, 150, 275, 195]; // Default values for server
    return [250, 180, 320, 150, 275, 195]; // Fixed values to avoid hydration issues
  }, [isClient]);

  // Set client flag after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const steps = [
    { label: "Select Lead Type", icon: "fa-solid fa-layer-group" },
    { label: "Apply Filters", icon: "fa-solid fa-filter" },
    { label: "View Results", icon: "fa-solid fa-list" },
    { label: "Export Data", icon: "fa-solid fa-download" },
  ];

  // Auto-cycle through steps
  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isInView, steps.length]);

  return (
    <section className={styles.dashboard_showcase} ref={ref}>
      <div className={styles.ds_container}>
        {/* Header */}
        <motion.div
          className={styles.ds_header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.ds_title}>
            How It <span>Works</span>
          </h2>
          <p className={styles.ds_subtitle}>
            Find motivated seller leads in just a few clicks
          </p>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          className={styles.ds_preview}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Browser Frame */}
          <div className={styles.ds_browser}>
            <div className={styles.ds_browser_bar}>
              <div className={styles.ds_dots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className={styles.ds_url}>
                <i className="fa-solid fa-lock"></i>
                app.99sellers.com/dashboard
              </div>
            </div>

            {/* Dashboard Content - Animated */}
            <div className={styles.ds_content}>
              {/* Sidebar */}
              <div className={styles.ds_sidebar}>
                <div className={styles.ds_logo_placeholder}>
                  <span>99S</span>
                </div>
                <div className={styles.ds_nav_items}>
                  <div className={`${styles.ds_nav_item} ${styles.active}`}>
                    <i className="fa-solid fa-search"></i>
                  </div>
                  <div className={styles.ds_nav_item}>
                    <i className="fa-solid fa-heart"></i>
                  </div>
                  <div className={styles.ds_nav_item}>
                    <i className="fa-solid fa-download"></i>
                  </div>
                  <div className={styles.ds_nav_item}>
                    <i className="fa-solid fa-gear"></i>
                  </div>
                </div>
              </div>

              {/* Main Area */}
              <div className={styles.ds_main}>
                {/* Top Bar */}
                <div className={styles.ds_topbar}>
                  <div className={styles.ds_search_bar}>
                    <i className="fa-solid fa-search"></i>
                    <span>Search properties...</span>
                  </div>
                  <div className={styles.ds_user}>
                    <i className="fa-solid fa-bell"></i>
                    <div className={styles.ds_avatar}></div>
                  </div>
                </div>

                {/* Filters Row - Animated */}
                <div className={styles.ds_filters}>
                  {["Pre-Foreclosure", "Tax Liens", "Probate", "Vacant"].map((filter, i) => (
                    <motion.div
                      key={filter}
                      className={`${styles.ds_filter_chip} ${activeStep === 0 && i === 0 ? styles.highlight : ""}`}
                      animate={{
                        scale: activeStep === 0 && i === 0 ? [1, 1.05, 1] : 1,
                        boxShadow: activeStep === 0 && i === 0 ? "0 0 20px rgba(59, 130, 246, 0.5)" : "none"
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {filter}
                    </motion.div>
                  ))}
                </div>

                {/* Results Grid - Animated */}
                <div className={styles.ds_results}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      className={styles.ds_result_card}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: activeStep >= 2 ? 1 : 0.3,
                        y: activeStep >= 2 ? 0 : 10,
                      }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                    >
                      <div className={styles.ds_card_top}>
                        <div className={styles.ds_card_img}></div>
                        <div className={styles.ds_card_badge}>
                          ${cardPrices[i]}K
                        </div>
                      </div>
                      <div className={styles.ds_card_info}>
                        <div className={styles.ds_card_line}></div>
                        <div className={styles.ds_card_line_sm}></div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Export Button - Animated */}
                <motion.div
                  className={styles.ds_export_btn}
                  animate={{
                    scale: activeStep === 3 ? [1, 1.05, 1] : 1,
                    boxShadow: activeStep === 3 ? "0 0 30px rgba(59, 130, 246, 0.6)" : "none"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <i className="fa-solid fa-download"></i>
                  Export to CSV
                </motion.div>
              </div>
            </div>
          </div>

          {/* Glow Effect */}
          <div className={styles.ds_glow}></div>
        </motion.div>

        {/* Steps Indicator */}
        <div className={styles.ds_steps}>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`${styles.ds_step} ${activeStep === index ? styles.active : ""}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className={styles.ds_step_num}>{index + 1}</div>
              <div className={styles.ds_step_icon}>
                <i className={step.icon}></i>
              </div>
              <span>{step.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardShowcase;
