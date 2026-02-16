"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard Layout
 * This layout wraps all dashboard pages with authentication protection.
 * Only authenticated users can access any page under /dashboard/*
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default DashboardLayout;
