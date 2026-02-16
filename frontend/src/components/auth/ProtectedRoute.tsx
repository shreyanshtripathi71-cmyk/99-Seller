"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSubscription = false 
}) => {
  const { isAuthenticated, isLoading, canAccessPremium } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to sign-in page with return URL
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
    }
    
    if (!isLoading && isAuthenticated && requireSubscription && !canAccessPremium()) {
      // Redirect to subscription page
      router.push("/dashboard/subscription");
    }
  }, [isAuthenticated, isLoading, requireSubscription, canAccessPremium, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#f8fafc",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            border: "4px solid #e2e8f0",
            borderTopColor: "#2563eb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <span style={{ color: "#64748b", fontSize: 14 }}>Loading...</span>
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if subscription required but not available
  if (requireSubscription && !canAccessPremium()) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
