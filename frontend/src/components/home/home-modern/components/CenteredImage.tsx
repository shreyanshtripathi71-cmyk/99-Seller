"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

interface CenteredImageProps {
    image: string;
    imageAlt: string;
    caption?: string;
}

const CenteredImage: React.FC<CenteredImageProps> = ({
    image,
    imageAlt,
    caption
}) => {
    return (
        <section className={styles.centered_image_section}>
            <div className={styles.centered_image_inner}>
                <motion.div
                    className={styles.centered_image_wrapper}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <img src={image} alt={imageAlt} className={styles.centered_image} />
                </motion.div>
                {caption && (
                    <motion.p
                        className={styles.centered_image_caption}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        {caption}
                    </motion.p>
                )}
            </div>
        </section>
    );
};

export default CenteredImage;
