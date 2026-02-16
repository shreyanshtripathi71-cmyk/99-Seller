"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

// For development/testing, we use Google's test keys
// In production, replace with your actual reCAPTCHA site key
// Test key always passes verification (for development only)
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

interface ReCaptchaProps {
    onChange?: (token: string | null) => void;
    onExpired?: () => void;
    size?: "normal" | "compact" | "invisible";
    theme?: "light" | "dark";
}

export interface ReCaptchaRef {
    getValue: () => string | null;
    reset: () => void;
    execute: () => void;
}

const ReCaptchaComponent = forwardRef<ReCaptchaRef, ReCaptchaProps>(
    ({ onChange, onExpired, size = "normal", theme = "light" }, ref) => {
        const recaptchaRef = useRef<ReCAPTCHA>(null);
        const isRecaptchaEnabled = process.env.NEXT_PUBLIC_ENABLE_RECAPTCHA !== 'false';

        React.useEffect(() => {
            if (!isRecaptchaEnabled && onChange) {
                onChange("DISABLED_BY_CONFIG");
            }
        }, [isRecaptchaEnabled, onChange]);

        useImperativeHandle(ref, () => ({
            getValue: () => recaptchaRef.current?.getValue() || (isRecaptchaEnabled ? null : "DISABLED_BY_CONFIG"),
            reset: () => recaptchaRef.current?.reset(),
            execute: () => recaptchaRef.current?.execute(),
        }));

        const handleChange = (token: string | null) => {
            if (onChange) {
                onChange(token);
            }
        };

        const handleExpired = () => {
            if (onExpired) {
                onExpired();
            }
            if (onChange) {
                onChange(null);
            }
        };

        if (!isRecaptchaEnabled) {
            return null;
        }

        return (
            <div style={{ marginTop: 16, marginBottom: 8 }}>
                <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={handleChange}
                    onExpired={handleExpired}
                    onErrored={() => console.error("reCAPTCHA Error: Please check your site key and domain authorization.")}
                    size={size}
                    theme={theme}
                />
            </div>
        );
    }
);

ReCaptchaComponent.displayName = "ReCaptchaComponent";

export default ReCaptchaComponent;
