"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { authAPI } from "@/services/api";
import styles from "@/styles/auth.module.scss";

const ResetPasswordContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("Invalid reset link");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            const result = await authAPI.resetPassword({ token, password });
            if (result.success) {
                setIsSubmitted(true);
                toast.success("Password reset successfully!");
                setTimeout(() => router.push("/signin"), 3000);
            } else {
                toast.error(result.error || "Failed to reset password");
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className={styles.authFormContainer} style={{ textAlign: 'center' }}>
                <h2 className={styles.authTitle}>Invalid Link</h2>
                <p className={styles.authSubtitle}>This password reset link is invalid or has expired.</p>
                <Link href="/forgot-password" className={styles.submitBtn} style={{ textDecoration: 'none', display: 'inline-block', marginTop: '20px' }}>
                    Request new link
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.authFormContainer}>
            <div className={styles.authHeader}>
                <h2 className={styles.authTitle}>Reset Password</h2>
                <p className={styles.authSubtitle}>Enter your new password below.</p>
            </div>

            {!isSubmitted ? (
                <form className={styles.authForm} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>New Password</label>
                        <div className={styles.inputWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                className={styles.formInput}
                                placeholder="Minimum 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span
                                className={styles.inputIcon}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </span>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Confirm Password</label>
                        <input
                            type="password"
                            className={styles.formInput}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className={styles.spinner}></span>
                                Resetting...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>
            ) : (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p className="text-success fw-bold">Success!</p>
                    <p className="text-muted small">
                        Your password has been reset. Redirecting to sign in...
                    </p>
                    <Link href="/signin" className={styles.formLink}>
                        Click here if you are not redirected
                    </Link>
                </div>
            )}
        </div>
    );
};

const ResetPasswordPage = () => {
    return (
        <div className={styles.authPage} style={{ justifyContent: 'center' }}>
            <div className={styles.authRight} style={{ width: '100%', maxWidth: '500px' }}>
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
