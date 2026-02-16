"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

// Client's testimonials with real photos
const testimonials = [
  {
    id: 1,
    name: "Marcus Williams",
    role: "Real Estate Investor",
    location: "Dallas, TX",
    experience: "8+ years in real estate",
    image: "/images/home/testimonials/testimonial-1.png",
    quote: "As the Real Estate agent, my life has been a roller coaster ride. Going up slow but decline fast. But when I found out about 99Sellers, the ride's been a one fast flight. Of course there were some turbulence, but with my hard work and customer support of 99Sellers, I overcame every obstacle. Now I am happy with what I am achieving. I don't think I could have been able to get ahead this fast without 99Sellers."
  },
  {
    id: 2,
    name: "Jennifer Thompson",
    role: "Real Estate Agent",
    location: "Phoenix, AZ",
    experience: "5+ years in real estate",
    image: "/images/home/testimonials/testimonial-2.png",
    quote: "Let me tell you this. I have been doing everything wrong. Finding an appropriate seller is not a piece of cake. I used to spend time looking at ads, searching newspaper, cold calling, roaming around city to see that one little board called \"FOR SALE\". I tried to do everything on my own and that sucked. When I first made account on the 99Sellers, it was like 99 problems of mine was solved. In an instant!! 1% is my pure hustle, cause my 99 problems are gone now!!"
  }
];

const TestimonialsSection = () => {
  return (
    <section className={styles.testimonials_section} id="testimonials">
      <div className={styles.testimonials_container}>
        <motion.div
          className={styles.testimonials_header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className={styles.testimonials_title}>
            DON&apos;T JUST TAKE OUR <span>WORD FOR IT</span>
          </h2>
        </motion.div>

        <div className={styles.testimonials_grid}>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className={styles.testimonial_card_clean}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <div className={styles.testimonial_quote_icon}>
                <i className="fa-solid fa-quote-left"></i>
              </div>

              <p className={styles.testimonial_text}>
                {testimonial.quote}
              </p>

              <div className={styles.testimonial_author_clean}>
                <div className={styles.author_avatar_image}>
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<i class="fa-solid fa-user"></i>';
                        parent.classList.add(styles.author_avatar);
                        parent.classList.remove(styles.author_avatar_image);
                      }
                    }}
                  />
                </div>
                <div className={styles.author_details}>
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                  <span>{testimonial.location} • {testimonial.experience}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
