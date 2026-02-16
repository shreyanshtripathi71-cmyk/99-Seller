"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { authAPI } from "@/services/api";
import styles from "@/styles/auth.module.scss";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setIsLoading(true);
        try {
            const result = await authAPI.forgotPassword(email);
            if (result.success) {
                setIsSubmitted(true);
                toast.success(result.data?.message || "Reset link sent to your email.");
            } else {
                toast.error(result.error || "Failed to process request");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authPage} style={{ justifyContent: 'center' }}>
            <div className={styles.authRight} style={{ width: '100%', maxWidth: '500px' }}>
                <div className={styles.authFormContainer}>
                    <div className={styles.authMobileLogo}>
                        <Link href="/">99<span>Sellers</span></Link>
                    </div>

                    <div className={styles.authHeader}>
                        <h2 className={styles.authTitle}>Forgot Password?</h2>
                        <p className={styles.authSubtitle}>
                            {isSubmitted
                                ? "Check your email (and server console) for the reset link."
                                : "Enter your email and we'll send you a link to reset your password."}
                        </p>
                    </div>

                    {!isSubmitted ? (
                        <form className={styles.authForm} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email Address</label>
                                <input
                                    type="email"
                                    className={styles.formInput}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <span className={styles.spinner}></span>
                                        Sending link...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <p className="text-muted small">
                                If you don&apos;t receive an email within a few minutes, please check your spam folder.
                            </p>
                        </div>
                    )}

                    <div style={{ textAlign: "center", marginTop: "30px" }}>
                        <Link href="/signin" className={styles.backLink}>
                            <i className="fa-solid fa-arrow-left"></i>
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
