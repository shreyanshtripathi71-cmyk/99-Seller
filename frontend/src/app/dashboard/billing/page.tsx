"use client";

import BillingPage from "@/components/dashboard/BillingPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <BillingPage />
    </ProtectedRoute>
  );
}
