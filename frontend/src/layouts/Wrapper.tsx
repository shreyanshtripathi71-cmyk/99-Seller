"use client";

import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { animationCreate } from "@/modules/AppLogic_Module";
import { AuthProvider } from "@/context/AuthContext";
import { SocialProofToast } from "@/modules/CommonUI_Module";
import { FloatingFeedbackButton } from "@/modules/CommonUI_Module";

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

