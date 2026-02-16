"use client";

import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { animationCreate } from "@/utils/utils";
import { AuthProvider } from "@/context/AuthContext";
import SocialProofToast from "@/components/ui/SocialProofToast";
import FloatingFeedbackButton from "@/components/ui/FloatingFeedbackButton";

if (typeof window !== "undefined") {
    require("bootstrap/dist/js/bootstrap");
}

const Wrapper = ({ children }: any) => {
    useEffect(() => {
        // animation
        const timer = setTimeout(() => {
            animationCreate();
        }, 100);

        return () => clearTimeout(timer);
    }, []);


    return (
        <AuthProvider>
            {children}
            <ToastContainer position="top-center" />
            <SocialProofToast />
            <FloatingFeedbackButton />
        </AuthProvider>
    );
}

export default Wrapper

