"use client";
import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorksComponent from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import styles from "./styles/homepage.module.scss";

const ModernHome = () => {
  return (
    <div className={styles.homepage}>
      <Header />
      <Hero />
      <section id="features">
        <Features />
      </section>
      <HowItWorksComponent />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
};

export default ModernHome;
