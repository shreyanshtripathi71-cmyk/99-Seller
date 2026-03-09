/**
 * HomeUI_Module.tsx
 * Consolidates: Header, HeroSlider, FeatureSection, TestimonialsSection,
 *               FAQSection, FinalCTA, Footer, HowItWorks from home-modern/components/
 */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import styles from "@/components/home/home-modern/styles/homepage.module.scss";

/* ──────────────────────────────────────────────────────────
   HEADER
────────────────────────────────────────────────────────── */
export const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
            <div className={styles.header_inner}>
                <Link href="/" className={styles.logo}>99<span>Sellers</span></Link>
                <nav className={styles.nav}>
                    <Link href="/">Home</Link>
                    <Link href="/features">Features</Link>
                    <Link href="/pricing">Pricing</Link>
                    <Link href="/about">About Us</Link>
                    <Link href="/contact">Contact Us</Link>
                </nav>
                <div className={styles.header_actions}>
                    <a href="tel:+18005551234" className={styles.header_phone}><i className="fa-solid fa-phone"></i>(800) 555-1234</a>
                    <Link href="/signin" className={styles.btn_secondary}>Sign In</Link>
                    <Link href="/search" className={styles.btn_primary}>Get Started Free</Link>
                </div>
                <button className={styles.mobile_menu_toggle} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
                    <i className={mobileMenuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
                </button>
            </div>
            {mobileMenuOpen && (
                <div className={styles.mobile_menu}>
                    <nav className={styles.mobile_nav}>
                        <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                        <Link href="/features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                        <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                        <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                        <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
                    </nav>
                    <div className={styles.mobile_actions}>
                        <a href="tel:+18005551234" className={styles.mobile_phone}><i className="fa-solid fa-phone"></i>(800) 555-1234</a>
                        <Link href="/signin" className={styles.btn_secondary}>Sign In</Link>
                        <Link href="/search" className={styles.btn_primary}>Get Started Free</Link>
                    </div>
                </div>
            )}
        </header>
    );
};

/* ──────────────────────────────────────────────────────────
   HERO SLIDER
────────────────────────────────────────────────────────── */
interface SlideData { id: number; url: string; title: string; subtitle: string; order: number; }
const defaultSlides: SlideData[] = [
    { id: 1, url: "/images/home/hero-slide-1.jpg", title: "Find 100s of motivated sellers at few clicks", subtitle: "Never let the lack of information stops you from closing deals", order: 1 },
    { id: 2, url: "/images/home/hero-slide-2.jpg", title: "Want basket full of sales lead today?", subtitle: "Hundreds and thousands of distressed sellers are just waiting for you to sell their home.", order: 2 },
    { id: 3, url: "/images/home/hero-slide-3.jpg", title: "Sellers are waiting to sell their property.", subtitle: "Finding the right seller doesn't have to be hard. We make it easy for you.", order: 3 },
];

export const HeroSlider = () => {
    const [slides, setSlides] = useState<SlideData[]>(defaultSlides);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSlides = async () => {
            try {
                const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').trim();
                const response = await fetch(`${apiUrl}/api/content/hero_images`);
                if (response.ok) {
                    const result = await response.json();
                    const data = result.success ? result.data?.value : result.data;
                    if (Array.isArray(data) && data.length > 0) setSlides(data.slice(0, 6));
                    else setSlides(defaultSlides);
                } else { setSlides(defaultSlides); }
            } catch { setSlides(defaultSlides); } finally { setIsLoading(false); }
        };
        loadSlides();
    }, []);

    const nextSlide = useCallback(() => setCurrentIndex((prev) => (prev + 1) % slides.length), [slides.length]);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

    useEffect(() => {
        if (slides.length === 0) return;
        const interval = setInterval(nextSlide, 7000);
        return () => clearInterval(interval);
    }, [nextSlide, slides.length]);

    if (isLoading) return (
        <section className={styles.hero_slider} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#fff' }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32 }}></i></div>
        </section>
    );

    const currentSlide = slides[currentIndex];
    return (
        <section className={styles.hero_slider}>
            <div className={styles.hero_slider_bg}>
                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex} className={styles.hero_slide_image} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
                        <img src={currentSlide.url} alt={currentSlide.title || 'Hero slide'} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </motion.div>
                </AnimatePresence>
                <div className={styles.hero_slider_overlay}></div>
            </div>
            <div className={styles.hero_slider_content}>
                {(currentSlide.title || currentSlide.subtitle) && (
                    <AnimatePresence mode="wait">
                        <motion.div key={currentIndex} className={styles.hero_slider_text} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
                            {currentSlide.title && <h1 className={styles.hero_slider_title}>{currentSlide.title}</h1>}
                            {currentSlide.subtitle && <p className={styles.hero_slider_subtitle}>{currentSlide.subtitle}</p>}
                        </motion.div>
                    </AnimatePresence>
                )}
                <div className={styles.hero_slider_nav}>
                    <button className={styles.hero_nav_arrow} onClick={prevSlide} aria-label="Previous slide"><i className="fa-solid fa-chevron-left"></i></button>
                    <button className={styles.hero_nav_arrow} onClick={nextSlide} aria-label="Next slide"><i className="fa-solid fa-chevron-right"></i></button>
                </div>
                <div className={styles.hero_slider_dots}>
                    {slides.map((_, index) => (
                        <button key={index} className={`${styles.hero_slider_dot} ${index === currentIndex ? styles.active : ""}`} onClick={() => setCurrentIndex(index)} aria-label={`Go to slide ${index + 1}`} />
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ──────────────────────────────────────────────────────────
   FEATURE SECTION
────────────────────────────────────────────────────────── */
interface FeatureSectionProps {
    layout: "image-left" | "image-right";
    tag?: string; title: string; subtitle: string; description: string;
    features?: string[]; image: string; imageAlt: string;
    ctaText?: string; ctaLink?: string;
    stats?: { value: string; label: string }[];
    className?: string;
}

export const FeatureSection: React.FC<FeatureSectionProps> = ({ layout, tag, title, subtitle, description, features, image, imageAlt, ctaText = "Learn More", ctaLink = "/search", stats, className = "" }) => {
    const isImageLeft = layout === "image-left";
    return (
        <section className={`${styles.feature_section} ${className}`}>
            <div className={`${styles.feature_container} ${isImageLeft ? styles.image_left : styles.image_right}`}>
                <motion.div className={styles.feature_image_wrapper} initial={{ opacity: 0, x: isImageLeft ? -60 : 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
                    <div className={styles.feature_image_container}>
                        <img src={image} alt={imageAlt} className={styles.feature_image} />
                        <div className={styles.feature_image_decoration}></div>
                        <div className={styles.feature_image_glow}></div>
                    </div>
                    {stats && (
                        <div className={styles.floating_stats}>
                            {stats.map((stat, index) => (
                                <motion.div key={index} className={styles.floating_stat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + index * 0.1 }}>
                                    <span className={styles.floating_stat_value}>{stat.value}</span>
                                    <span className={styles.floating_stat_label}>{stat.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
                <motion.div className={styles.feature_content} initial={{ opacity: 0, x: isImageLeft ? 60 : -60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}>
                    {tag && <span className={styles.feature_tag}>{tag}</span>}
                    <h2 className={styles.feature_title}>{title}</h2>
                    {subtitle && <p className={styles.feature_subtitle}>{subtitle}</p>}
                    <p className={styles.feature_description}>{description}</p>
                    {features && features.length > 0 && (
                        <ul className={styles.feature_list}>
                            {features.map((feature, index) => (
                                <motion.li key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + index * 0.05 }}>
                                    <i className="fa-solid fa-check-circle"></i>{feature}
                                </motion.li>
                            ))}
                        </ul>
                    )}
                    <div className={styles.feature_cta}>
                        <Link href={ctaLink} className={styles.btn_feature}>{ctaText}<i className="fa-solid fa-arrow-right"></i></Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

/* ──────────────────────────────────────────────────────────
   TESTIMONIALS SECTION
────────────────────────────────────────────────────────── */
const testimonials = [
    { id: 1, name: "Marcus Williams", role: "Real Estate Investor", location: "Dallas, TX", experience: "8+ years in real estate", image: "/images/home/testimonials/testimonial-1.png", quote: "As the Real Estate agent, my life has been a roller coaster ride. Going up slow but decline fast. But when I found out about 99Sellers, the ride's been a one fast flight. Of course there were some turbulence, but with my hard work and customer support of 99Sellers, I overcame every obstacle. Now I am happy with what I am achieving. I don't think I could have been able to get ahead this fast without 99Sellers." },
    { id: 2, name: "Jennifer Thompson", role: "Real Estate Agent", location: "Phoenix, AZ", experience: "5+ years in real estate", image: "/images/home/testimonials/testimonial-2.png", quote: "Let me tell you this. I have been doing everything wrong. Finding an appropriate seller is not a piece of cake. I used to spend time looking at ads, searching newspaper, cold calling, roaming around city to see that one little board called \"FOR SALE\". I tried to do everything on my own and that sucked. When I first made account on the 99Sellers, it was like 99 problems of mine was solved. In an instant!! 1% is my pure hustle, cause my 99 problems are gone now!!" },
];

export const TestimonialsSection = () => (
    <section className={styles.testimonials_section} id="testimonials">
        <div className={styles.testimonials_container}>
            <motion.div className={styles.testimonials_header} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className={styles.testimonials_title}>DON&apos;T JUST TAKE OUR <span>WORD FOR IT</span></h2>
            </motion.div>
            <div className={styles.testimonials_grid}>
                {testimonials.map((testimonial, index) => (
                    <motion.div key={testimonial.id} className={styles.testimonial_card_clean} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}>
                        <div className={styles.testimonial_quote_icon}><i className="fa-solid fa-quote-left"></i></div>
                        <p className={styles.testimonial_text}>{testimonial.quote}</p>
                        <div className={styles.testimonial_author_clean}>
                            <div className={styles.author_avatar_image}>
                                <img src={testimonial.image} alt={testimonial.name} onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) { parent.innerHTML = '<i class="fa-solid fa-user"></i>'; parent.classList.add(styles.author_avatar); parent.classList.remove(styles.author_avatar_image); }
                                }} />
                            </div>
                            <div className={styles.author_details}><h4>{testimonial.name}</h4><p>{testimonial.role}</p><span>{testimonial.location} • {testimonial.experience}</span></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
);

/* ──────────────────────────────────────────────────────────
   FAQ SECTION
────────────────────────────────────────────────────────── */
const faqs = [
    { question: "How fresh is the lead data?", answer: "Our data is updated daily from over 3,200 county records across all 50 states. When a foreclosure is filed, a divorce is recorded, or a tax lien is placed—it shows up in your dashboard within 24-48 hours." },
    { question: "Are the leads exclusive to me?", answer: "We don't sell exclusive territories, which keeps our pricing affordable. However, our data is fresher than most services, so you'll often reach sellers before others even know about them. Speed is your competitive advantage." },
    { question: "What's included in the skip-traced data?", answer: "Each lead includes the property owner's name, mailing address, phone numbers (cell & landline when available), email addresses, and property details including estimated equity. Our skip tracing has 98% accuracy." },
    { question: "Can I cancel anytime?", answer: "Yes! There are no long-term contracts. You can cancel your subscription anytime from your dashboard. If you cancel, you'll retain access until the end of your billing period." },
    { question: "What if my county isn't covered?", answer: "We cover 3,200+ counties across all 50 states—that's about 98% of the US population. If you can't find leads in your specific area, contact us and we'll let you know our coverage or work on adding it." },
    { question: "How do I export leads?", answer: "You can export your leads as a CSV file with one click. The export includes names, addresses, phone numbers, emails, and property details. Perfect for direct mail campaigns or calling lists." },
    { question: "Is there a money-back guarantee?", answer: "Yes! We offer a 30-day money-back guarantee on all paid plans. If you're not finding value in our leads, contact support within 30 days for a full refund—no questions asked." },
    { question: "How is this different from driving for dollars?", answer: "Driving for dollars shows you vacant properties but gives you no owner info, no motivation data, and no contact details. 99Sellers gives you skip-traced contacts for motivated sellers (foreclosure, divorce, tax lien, probate) ready to call immediately." },
];

export const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    return (
        <section className={styles.faq_section}>
            <div className={styles.faq_container}>
                <motion.div className={styles.faq_header} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <h2 className={styles.faq_title}>Frequently Asked <span>Questions</span></h2>
                </motion.div>
                <div className={styles.faq_list}>
                    {faqs.map((faq, index) => (
                        <motion.div key={index} className={`${styles.faq_item} ${openIndex === index ? styles.open : ""}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                            <button className={styles.faq_question} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                                <span>{faq.question}</span>
                                <i className={`fa-solid ${openIndex === index ? "fa-minus" : "fa-plus"}`}></i>
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div className={styles.faq_answer} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                                        <p>{faq.answer}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
                <motion.div className={styles.faq_cta} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <p>Still have questions?</p>
                    <a href="/contact" className={styles.faq_contact_link}><i className="fa-solid fa-envelope"></i>Contact our support team</a>
                </motion.div>
            </div>
        </section>
    );
};

/* ──────────────────────────────────────────────────────────
   FINAL CTA
────────────────────────────────────────────────────────── */
export const FinalCTA = () => (
    <section className={styles.final_cta_section}>
        <div className={styles.final_cta_bg}><div className={styles.final_cta_gradient}></div></div>
        <div className={styles.final_cta_inner}>
            <motion.div className={styles.final_cta_content} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                <h2 className={styles.final_cta_title}>Ready to Find Your Next Deal?</h2>
                <p className={styles.final_cta_subtitle}>Join thousands of real estate professionals using 99Sellers to find motivated sellers every day.</p>
                <div className={styles.final_cta_buttons}>
                    <Link href="/signup" className={styles.final_cta_btn_primary}>Start Free Trial<i className="fa-solid fa-arrow-right"></i></Link>
                    <Link href="/contact" className={styles.final_cta_btn_secondary}><i className="fa-solid fa-phone"></i>Talk to Sales</Link>
                </div>
                <div className={styles.final_cta_trust}>
                    <div className={styles.trust_item}><i className="fa-solid fa-shield-check"></i><span>No credit card required</span></div>
                    <div className={styles.trust_item}><i className="fa-solid fa-rotate-left"></i><span>30-day money-back guarantee</span></div>
                </div>
            </motion.div>
        </div>
    </section>
);

/* ──────────────────────────────────────────────────────────
   FOOTER
────────────────────────────────────────────────────────── */
export const Footer = () => (
    <footer className={styles.footer}>
        <div className={styles.footer_inner}>
            <div className={styles.footer_brand}>
                <Link href="/" className={styles.logo}>99<span>Sellers</span></Link>
                <p>The #1 source for motivated seller leads. Helping real estate investors find off-market deals since 2025.</p>
            </div>
            <div className={styles.footer_links}>
                <div className={styles.footer_column}><h4>Product</h4><ul><li><Link href="#lead-types">Lead Types</Link></li><li><Link href="#how-it-works">How It Works</Link></li><li><Link href="#pricing">Pricing</Link></li><li><Link href="/search">Search Leads</Link></li></ul></div>
                <div className={styles.footer_column}><h4>Company</h4><ul><li><Link href="/about">About Us</Link></li><li><Link href="/contact">Contact</Link></li><li><Link href="/blog">Blog</Link></li><li><Link href="/affiliates">Affiliates</Link></li></ul></div>
                <div className={styles.footer_column}><h4>Support</h4><ul><li><Link href="/faq">FAQ</Link></li><li><Link href="/help">Help Center</Link></li><li><Link href="/privacy">Privacy Policy</Link></li><li><Link href="/terms">Terms of Service</Link></li></ul></div>
            </div>
        </div>
        <div className={styles.footer_bottom}>
            <p>© 2024 99Sellers. All rights reserved.</p>
            <div className={styles.footer_social}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-x-twitter"></i></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-instagram"></i></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
        </div>
    </footer>
);
