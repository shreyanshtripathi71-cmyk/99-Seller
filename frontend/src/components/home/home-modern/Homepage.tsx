"use client";
import React from "react";
import { motion, Variants } from "framer-motion";
import { Header, HeroSlider, FeatureSection, TestimonialsSection, FAQSection, FinalCTA, Footer } from "@/modules/HomeUI_Module";
import DashboardAnimation from "./components/DashboardAnimation";
import styles from "./styles/homepage.module.scss";
import { useContent } from "@/modules/AppLogic_Module";

interface Section {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  ctaText?: string;
  imageAlt?: string;
  text?: string;
  author?: string;
  deals?: any[];
}

interface HomepageContent {
  quote1: Section;
  benefit1: Section;
  benefit2: Section;
  dealShowcase: Section;
  benefit3: Section;
  quote2: Section;
  howItWorks: Section;
}

const defaultContent: HomepageContent = {
  quote1: {
    text: "The best deals aren't found. They're created with better data."
  },
  benefit1: {
    title: "Close Deals From Your Couch",
    subtitle: "REMOTE WHOLESALING",
    description: "Forget driving for dollars. Access thousands of motivated seller leads—pre-foreclosures, divorce, tax liens—instantly. Pick up the phone, make the offer, and assign the contract without leaving your home office.",
    features: [
      "Direct-to-Seller Contact Info (Mobile & Email)",
      "Daily Updates from County Records",
      "Skip-Trace with 98% Accuracy"
    ],
    ctaText: "Start Finding Deals",
    imageAlt: "Reach clients remotely"
  },
  benefit2: {
    title: "Automate Your Empire",
    subtitle: "SYSTEMS & SPEED",
    description: "Stop wasting time on bad data. Our AI-driven filters help you identify the 1% of properties with actual equity and seller motivation. Be the first to call, not the last.",
    features: [
      "Save Custom Search Criteria",
      "Get Instant Notifications on New Leads",
      "Export to CSV/CRM in One Click"
    ],
    ctaText: "Automate Now",
    imageAlt: "Save time with 99Sellers"
  },
  dealShowcase: {
    title: "Real Deals. Real Profit.",
    deals: [
      { title: "Austin Fix & Flip", profit: "$45,000", badge: "Flip", time: "30 Days", img: "/images/home/property-austin.png" },
      { title: "Phoenix Wholesale", profit: "$12,500", badge: "Wholesale", time: "4 Hours", img: "/images/home/property-phoenix.png" },
      { title: "Denver BRRRR", profit: "$350/mo", badge: "Rental", time: "Infinite", img: "/images/home/property-denver.png" }
    ]
  },
  benefit3: {
    title: "Data That Dominates",
    subtitle: "MARKET INTELLIGENCE",
    description: "Spot trends before the competition. Our dashboard visualizes market heat, inventory levels, and price corrections so you can move with confidence.",
    features: [
      "Live Market Heatmaps",
      "Comparable Sales Reports (Comps)",
      "Investment Calculator"
    ],
    ctaText: "Explore Data",
    imageAlt: "Maximize your profit"
  },
  quote2: {
    text: "99Sellers is the unfair advantage I was looking for.",
    author: "— Join 10,000+ Investors, Wholesalers, and Agents"
  },
  howItWorks: {
    title: "From Lead to Closing",
    subtitle: "3 SIMPLE STEPS",
    description: "We built this for speed. No complex onboarding. Just sign up, search, and start calling sellers today.",
    features: [
      "1. Define Your Buy Box (Location, Equity, Distress)",
      "2. Unlock Seller Contact Info Instantly",
      "3. Close The Deal"
    ],
    ctaText: "Start Your Free Trial",
    imageAlt: "How 99Sellers works"
  }
};

const Homepage = () => {
  const { content: displayContent } = useContent<HomepageContent>('page_home', defaultContent);

  // Safe access helpers
  const getSection = (key: keyof HomepageContent) => displayContent?.[key] || defaultContent[key];

  const quote1 = getSection('quote1');
  const benefit1 = getSection('benefit1');
  const benefit2 = getSection('benefit2');
  const dealShowcase = getSection('dealShowcase');
  const benefit3 = getSection('benefit3');
  const quote2 = getSection('quote2');
  const howItWorks = getSection('howItWorks');

  // Animation variants
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const scaleUp: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className={styles.homepage} style={{ overflowX: "hidden" }}>
      <Header />

      {/* 1. Hero */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <HeroSlider />
      </motion.div>

      {/* Quote Section */}
      <section style={{ padding: "80px 24px", textAlign: "center", background: "#f8fafc" }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={scaleUp}
          style={{ maxWidth: 800, margin: "0 auto" }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 300, color: "#475569", fontStyle: "italic", marginBottom: 16 }}>
            "{quote1.text || ""}"
          </h2>
          <div style={{ width: 60, height: 4, background: "#3b82f6", margin: "0 auto" }}></div>
        </motion.div>
      </section>

      {/* 2. Image | Content - Key Benefit 1 */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <FeatureSection
          layout="image-left"
          title={benefit1.title || ""}
          subtitle={benefit1.subtitle || ""}
          description={benefit1.description || ""}
          features={benefit1.features || []}
          image="/images/home/benefit-reach.jpg"
          imageAlt={benefit1.imageAlt || ""}
          ctaText={benefit1.ctaText || ""}
          ctaLink="/signup"
        />
      </motion.div>

      {/* 3. Content | Image - Key Benefit 2 */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <FeatureSection
          layout="image-right"
          title={benefit2.title || ""}
          subtitle={benefit2.subtitle || ""}
          description={benefit2.description || ""}
          features={benefit2.features || []}
          image="/images/home/benefit-time-new.png"
          imageAlt={benefit2.imageAlt || ""}
          ctaText={benefit2.ctaText || ""}
          ctaLink="/features"
          className={styles.bg_alternate}
        />
      </motion.div>

      {/* Deal Showcase Section */}
      <section style={{ padding: "100px 24px", background: "#0f172a", color: "#fff", textAlign: "center" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            style={{ fontSize: 42, fontWeight: 700, marginBottom: 60 }}
          >
            <span style={{ color: '#ffffff' }}>Real Deals. </span>
            <span style={{ color: '#3b82f6' }}>Real Profit.</span>
          </motion.h2>

          <div className="row">
            {(dealShowcase.deals || []).map((deal: any, idx: number) => (
              <motion.div
                key={idx}
                className="col-lg-4 mb-4"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                transition={{ delay: idx * 0.2 }}
              >
                <div style={{ background: "#1e293b", borderRadius: 24, overflow: "hidden", height: "100%", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" }}>
                  <div style={{ height: 200, overflow: "hidden", position: "relative" }}>
                    <img src={deal.img} alt={deal.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} className="hover-zoom" />
                    <div style={{ position: "absolute", top: 16, right: 16, background: "#2563eb", color: "#fff", padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{deal.badge}</div>
                  </div>
                  <div style={{ padding: 24, textAlign: "left" }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#ffffff' }}>{deal.title}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #334155", paddingTop: 16, marginTop: 16 }}>
                      <div>
                        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 0 }}>Net Profit / Fee</p>
                        <p style={{ fontSize: 24, fontWeight: 700, color: "#4ade80", marginBottom: 0 }}>{deal.profit}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 0 }}>Time to Close</p>
                        <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 0 }}>{deal.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Animated Dashboard Preview */}
      <DashboardAnimation />

      {/* 5. Image | Content - Benefit 3 */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <FeatureSection
          layout="image-left"
          title={benefit3.title || ""}
          subtitle={benefit3.subtitle || ""}
          description={benefit3.description || ""}
          features={benefit3.features || []}
          image="/images/home/benefit-profit-new.png"
          imageAlt={benefit3.imageAlt || ""}
          ctaText={benefit3.ctaText || ""}
          ctaLink="/signup"
          className={styles.bg_alternate}
        />
      </motion.div>

      {/* Quote Section 2 */}
      <section style={{ padding: "100px 24px", textAlign: "center", background: "#2563eb", color: "#fff" }}>
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleUp}
          style={{ maxWidth: 900, margin: "0 auto" }}
        >
          <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 24 }}>"{quote2.text || ""}"</h2>
          <p style={{ fontSize: 20, opacity: 0.9 }}>{quote2.author || ""}</p>
        </motion.div>
      </section>

      {/* 6. Content | Image - How It Works */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <FeatureSection
          layout="image-right"
          title={howItWorks.title || ""}
          subtitle={howItWorks.subtitle || ""}
          description={howItWorks.description || ""}
          features={howItWorks.features || []}
          image="/images/home/how-it-works-new.png"
          imageAlt={howItWorks.imageAlt || ""}
          ctaText={howItWorks.ctaText || ""}
          ctaLink="#demo"
        />
      </motion.div>

      <TestimonialsSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Homepage;
