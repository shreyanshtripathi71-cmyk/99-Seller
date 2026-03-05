"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/auth.module.scss";
import { ReCaptchaComponent, ReCaptchaRef } from "@/modules/CommonUI_Module";

interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

const SignInFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register: registerUser } = useAuth();

  // Default to 'register' if we're on /signup route or have it in params
  const tabParam = searchParams?.get("tab");
  const [activeTab, setActiveTab] = useState<"login" | "register">(
    tabParam === "register" ? "register" : "login"
  );

  // Also effect to switch if params change or if we are on /signup
  useEffect(() => {
    const isSignupPath = typeof window !== 'undefined' && window.location.pathname === '/signup';
    if (isSignupPath || tabParam === "register") {
      setActiveTab("register");
    }
  }, [tabParam]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginCaptchaToken, setLoginCaptchaToken] = useState<string | null>(null);
  const [registerCaptchaToken, setRegisterCaptchaToken] = useState<string | null>(null);
  const loginCaptchaRef = useRef<ReCaptchaRef>(null);
  const registerCaptchaRef = useRef<ReCaptchaRef>(null);

  // Redirect to the main search dashboard after login
  const defaultRedirect = "/search";

  const loginSchema = yup.object({
    email: yup.string().required("Email is required").email("Invalid email"),
    password: yup.string().required("Password is required"),
    remember: yup.boolean(),
  }).required();

  const registerSchema = yup.object({
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().required("Email is required").email("Invalid email"),
    password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
    termsAccepted: yup.boolean().oneOf([true], "You must accept the terms and conditions").required(),
  }).required();

  const loginForm = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: false }
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", termsAccepted: false }
  });

  useEffect(() => {
    toast.info("Frontend V5 Connected - Port 5000", { position: "bottom-right", autoClose: 2000 });
  }, []);

  const onLoginSubmit = async (data: LoginFormData) => {
    if (!loginCaptchaToken) {
      toast.error("Please complete the reCAPTCHA", { position: "top-center" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await login(data.email, data.password, loginCaptchaToken!);
      if (result.success) {
        toast.success(result.message, { position: "top-center" });
        loginForm.reset();

        // Determine target destination
        const userType = result.userType?.toLowerCase().trim();
        const isAdmin = userType === "admin";
        const redirectUrl = searchParams?.get("redirect");

        if (isAdmin) {
          // Admins always go to /admin unless they were specifically trying to reach a different admin page
          if (redirectUrl && redirectUrl.startsWith("/admin")) {
            router.push(redirectUrl);
          } else {
            router.push("/admin");
          }
        } else if (redirectUrl) {
          // Regular users follow the redirect parameter if present
          router.push(redirectUrl);
        } else {
          // Default for regular users
          router.push("/search");
        }
      } else {
        toast.error(result.message, { position: "top-center" });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    if (!registerCaptchaToken) {
      toast.error("Please complete the reCAPTCHA", { position: "top-center" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        captchaToken: registerCaptchaToken!
      });
      if (result.success) {
        toast.success(result.message, { position: "top-center" });
        registerForm.reset();

        // Redirect based on user type
        const userType = (result.userType || "").toLowerCase().trim();
        const isAdmin = userType === "admin";
        const redirectUrl = searchParams?.get("redirect");

        if (isAdmin) {
          router.push("/admin");
        } else if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push(defaultRedirect);
        }
      } else {
        toast.error(result.message, { position: "top-center" });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      {/* Left Side - Branding */}
      <div className={styles.authLeft}>
        <div className={styles.authLeftContent}>
          <Link href="/" className={styles.authLogo}>
            99<span>Sellers</span>
          </Link>

          <h1 className={styles.authBrandTitle}>
            Find Off-Market Real Estate Deals Instantly
          </h1>
          <p className={styles.authBrandSubtitle}>
            Access exclusive foreclosure, tax default, and distressed property leads before they hit the market.
          </p>

          <div className={styles.authStats}>
            <div className={styles.authStat}>
              <div className={styles.statValue}>50K+</div>
              <div className={styles.statLabel}>Properties</div>
            </div>
            <div className={styles.authStat}>
              <div className={styles.statValue}>10K+</div>
              <div className={styles.statLabel}>Investors</div>
            </div>
            <div className={styles.authStat}>
              <div className={styles.statValue}>98%</div>
              <div className={styles.statLabel}>Accuracy</div>
            </div>
          </div>

          <div className={styles.authFeatures}>
            <div className={styles.authFeature}>
              <div className={styles.featureIcon}>
                <i className="fa-solid fa-bolt"></i>
              </div>
              <span className={styles.featureText}>Real-time data updates daily</span>
            </div>
            <div className={styles.authFeature}>
              <div className={styles.featureIcon}>
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <span className={styles.featureText}>Verified owner contact information</span>
            </div>
            <div className={styles.authFeature}>
              <div className={styles.featureIcon}>
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <span className={styles.featureText}>Advanced market analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={styles.authRight}>
        <div className={styles.authFormContainer}>
          {/* Back to Home (top) */}
          <div style={{ marginBottom: 20 }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontSize: 14, color: '#64748b', textDecoration: 'none',
                padding: '8px 0', fontWeight: 500, transition: 'color 0.2s'
              }}
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize: 12 }}></i>
              Back to Home
            </Link>
          </div>

          {/* Mobile Logo */}
          <div className={styles.authMobileLogo}>
            <Link href="/">99<span>Sellers</span></Link>
          </div>

          {/* Header */}
          <div className={styles.authHeader}>
            <h2 className={styles.authTitle}>
              {activeTab === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className={styles.authSubtitle}>
              {activeTab === "login"
                ? "Enter your credentials to access your dashboard"
                : "Start your 15-day free trial today"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className={styles.authTabs}>
            <button
              className={`${styles.authTab} ${activeTab === "login" ? styles.active : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Sign In
            </button>
            <button
              className={`${styles.authTab} ${activeTab === "register" ? styles.active : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form className={styles.authForm} onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  className={`${styles.formInput} ${loginForm.formState.errors.email ? styles.hasError : ""}`}
                  placeholder="you@example.com"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email && (
                  <p className={styles.formError}>{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    className={`${styles.formInput} ${loginForm.formState.errors.password ? styles.hasError : ""}`}
                    placeholder="Enter your password"
                    {...loginForm.register("password")}
                  />
                  <span
                    className={styles.inputIcon}
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    <i className={`fa-solid ${showLoginPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </span>
                </div>
                {loginForm.formState.errors.password && (
                  <p className={styles.formError}>{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className={styles.formHelper}>
                <label className={styles.formCheckbox}>
                  <input type="checkbox" {...loginForm.register("remember")} />
                  <span>Remember me</span>
                </label>
                <Link href="/forgot-password" className={styles.formLink}>
                  Forgot password?
                </Link>
              </div>

              <ReCaptchaComponent
                ref={loginCaptchaRef}
                onChange={setLoginCaptchaToken}
                onExpired={() => setLoginCaptchaToken(null)}
              />

              <button type="submit" className={styles.submitBtn} disabled={isLoading || !loginCaptchaToken}>
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <form className={styles.authForm} onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>First Name</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${registerForm.formState.errors.firstName ? styles.hasError : ""}`}
                    placeholder="John"
                    {...registerForm.register("firstName")}
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className={styles.formError}>{registerForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Last Name</label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${registerForm.formState.errors.lastName ? styles.hasError : ""}`}
                    placeholder="Doe"
                    {...registerForm.register("lastName")}
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className={styles.formError}>{registerForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  className={`${styles.formInput} ${registerForm.formState.errors.email ? styles.hasError : ""}`}
                  placeholder="you@example.com"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className={styles.formError}>{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showRegisterPassword ? "text" : "password"}
                    className={`${styles.formInput} ${registerForm.formState.errors.password ? styles.hasError : ""}`}
                    placeholder="Minimum 6 characters"
                    {...registerForm.register("password")}
                  />
                  <span
                    className={styles.inputIcon}
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  >
                    <i className={`fa-solid ${showRegisterPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </span>
                </div>
                {registerForm.formState.errors.password && (
                  <p className={styles.formError}>{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <label className={styles.formCheckbox}>
                <input type="checkbox" {...registerForm.register("termsAccepted")} />
                <span>
                  I agree to the{" "}
                  <Link href="/terms" className={styles.formLink}>Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className={styles.formLink}>Privacy Policy</Link>
                </span>
              </label>
              {registerForm.formState.errors.termsAccepted && (
                <p className={styles.formError}>{registerForm.formState.errors.termsAccepted.message}</p>
              )}

              <ReCaptchaComponent
                ref={registerCaptchaRef}
                onChange={setRegisterCaptchaToken}
                onExpired={() => setRegisterCaptchaToken(null)}
              />

              <button type="submit" className={styles.submitBtn} disabled={isLoading || !registerCaptchaToken}>
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <div className={styles.trialBadge}>
                <i className="fa-solid fa-gift"></i>
                15-day free trial • No credit card required
              </div>
            </form>
          )}

          {/* Back to Home */}
          <div style={{ textAlign: "center" }}>
            <Link href="/" className={styles.backLink}>
              <i className="fa-solid fa-arrow-left"></i>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};



const SignInPage = () => {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <SignInFormContent />
    </Suspense>
  );
}

export default SignInPage;
