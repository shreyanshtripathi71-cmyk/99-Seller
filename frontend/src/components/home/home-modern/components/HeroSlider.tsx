"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/homepage.module.scss";

interface SlideData {
  id: number;
  url: string;
  title: string;
  subtitle: string;
  order: number;
}

// Default fallback slides
const defaultSlides: SlideData[] = [
  {
    id: 1,
    url: "/images/home/hero-slide-1.jpg",
    title: "Find 100s of motivated sellers at few clicks",
    subtitle: "Never let the lack of information stops you from closing deals",
    order: 1
  },
  {
    id: 2,
    url: "/images/home/hero-slide-2.jpg",
    title: "Want basket full of sales lead today?",
    subtitle: "Hundreds and thousands of distressed sellers are just waiting for you to sell their home.",
    order: 2
  },
  {
    id: 3,
    url: "/images/home/hero-slide-3.jpg",
    title: "Sellers are waiting to sell their property.",
    subtitle: "Finding the right seller doesn't have to be hard. We make it easy for you.",
    order: 3
  }
];

const HeroSlider = () => {
  const [slides, setSlides] = useState<SlideData[]>(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load slides from simple JSON config file
  useEffect(() => {
    const loadSlides = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const response = await fetch(`${apiUrl}/api/content/hero_images`);
        if (response.ok) {
          const result = await response.json();
          const data = result.success ? result.data?.value : result.data;

          if (Array.isArray(data) && data.length > 0) {
            setSlides(data.slice(0, 6));
          } else {
            console.log('No slides found in database, using defaults');
            setSlides(defaultSlides);
          }
        } else {
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.log('Error fetching slides, using defaults:', error);
        setSlides(defaultSlides);
      } finally {
        setIsLoading(false);
      }
    };

    loadSlides();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [nextSlide, slides.length]);

  if (isLoading) {
    return (
      <section className={styles.hero_slider} style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32 }}></i>
        </div>
      </section>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <section className={styles.hero_slider}>
      {/* Background Images with Ken Burns effect */}
      <div className={styles.hero_slider_bg}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className={styles.hero_slide_image}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <img
              src={currentSlide.url}
              alt={currentSlide.title || 'Hero slide'}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                console.error('Failed to load hero image:', currentSlide.url);
              }}
            />
          </motion.div>
        </AnimatePresence>
        <div className={styles.hero_slider_overlay}></div>
      </div>

      {/* Content - Only show if title or subtitle exists */}
      <div className={styles.hero_slider_content}>
        {(currentSlide.title || currentSlide.subtitle) && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className={styles.hero_slider_text}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              {currentSlide.title && (
                <h1 className={styles.hero_slider_title}>
                  {currentSlide.title}
                </h1>
              )}
              {currentSlide.subtitle && (
                <p className={styles.hero_slider_subtitle}>
                  {currentSlide.subtitle}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Navigation Arrows */}
        <div className={styles.hero_slider_nav}>
          <button
            className={styles.hero_nav_arrow}
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            className={styles.hero_nav_arrow}
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        {/* Slide Indicators */}
        <div className={styles.hero_slider_dots}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.hero_slider_dot} ${index === currentIndex ? styles.active : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
