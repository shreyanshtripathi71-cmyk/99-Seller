"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "@/components/search/styles/dashboard.module.scss";

interface MaskedDataProps {
  value: string;
  type?: "name" | "address" | "phone" | "email";
  showUnlockPrompt?: boolean;
}

const MaskedData: React.FC<MaskedDataProps> = ({ 
  value, 
  type = "name",
  showUnlockPrompt = true 
}) => {
  const { canAccessPremium, maskData } = useAuth();
  
  if (canAccessPremium()) {
    return <span>{value}</span>;
  }
  
  const maskedValue = maskData(value, type);
  
  return (
    <span className={styles.maskedData}>
      {maskedValue}
      {showUnlockPrompt && (
        <Link href="/dashboard/subscription" className={styles.unlockBadge}>
          <i className="fa-solid fa-lock"></i>
          Unlock
        </Link>
      )}
    </span>
  );
};

export default MaskedData;
