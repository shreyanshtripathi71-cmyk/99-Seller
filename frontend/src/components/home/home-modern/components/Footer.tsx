"use client";
import React from "react";
import Link from "next/link";
import styles from "../styles/homepage.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer_inner}>
        <div className={styles.footer_brand}>
          <Link href="/" className={styles.logo}>
            99<span>Sellers</span>
          </Link>
          <p>
            The #1 source for motivated seller leads. Helping real estate investors
            find off-market deals since 2025.
          </p>
        </div>

        <div className={styles.footer_links}>
          <div className={styles.footer_column}>
            <h4>Product</h4>
            <ul>
              <li><Link href="#lead-types">Lead Types</Link></li>
              <li><Link href="#how-it-works">How It Works</Link></li>
              <li><Link href="#pricing">Pricing</Link></li>
              <li><Link href="/search">Search Leads</Link></li>
            </ul>
          </div>
          <div className={styles.footer_column}>
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/affiliates">Affiliates</Link></li>
            </ul>
          </div>
          <div className={styles.footer_column}>
            <h4>Support</h4>
            <ul>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footer_bottom}>
        <p>© 2024 99Sellers. All rights reserved.</p>
        <div className={styles.footer_social}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-x-twitter"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-linkedin-in"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
