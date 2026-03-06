"use client";

import React from "react";
import { ProtectedRoute } from "@/modules/CommonUI_Module";

interface SearchLayoutProps {
  children: React.ReactNode;
}

/**
 * Search Layout
 * This layout wraps all search pages with authentication protection.
 * Only authenticated users can access any page under /search/*
 */
const SearchLayout: React.FC<SearchLayoutProps> = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default SearchLayout;
