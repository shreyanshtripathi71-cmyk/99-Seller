"use client";
import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/homepage.module.scss";

const ProblemSolution = () => {
    return (
        <section className={styles.problem_solution}>
            <div className={styles.problem_solution_inner}>
                <motion.div
                    className={styles.problem_solution_content}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <p className={styles.problem_line}>
                        For a closer, selling a distressed home might be an easy task
                    </p>
                    <p className={styles.problem_line_emphasis}>
                        But finding an appropriate seller? That&apos;s where it&apos;s challenging.
                    </p>
                    <p className={styles.problem_question}>
                        So why make it so hard on yourself??
                    </p>
                    <p className={styles.solution_line}>
                        <span className={styles.brand_highlight}>99Sellers</span> got you covered.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default ProblemSolution;
