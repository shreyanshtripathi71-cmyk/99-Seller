"use client";

import BillingPage from "@/components/dashboard/BillingPage";
import { ProtectedRoute } from "@/modules/CommonUI_Module";

export default function Page() {
  return (
    <ProtectedRoute>
      <BillingPage />
    </ProtectedRoute>
  );
}
