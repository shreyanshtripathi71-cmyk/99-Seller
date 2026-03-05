"use client";

import SubscriptionPage from "@/components/dashboard/SubscriptionPage";
import { ProtectedRoute } from "@/modules/CommonUI_Module";

export default function Page() {
  return (
    <ProtectedRoute>
      <SubscriptionPage />
    </ProtectedRoute>
  );
}
