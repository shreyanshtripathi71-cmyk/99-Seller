"use client";

import SubscriptionPage from "@/components/dashboard/SubscriptionPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function Page() {
  return (
    <ProtectedRoute>
      <SubscriptionPage />
    </ProtectedRoute>
  );
}
