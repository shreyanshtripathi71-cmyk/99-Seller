"use client";

console.log("--- 99SELLERS AUTH CONTEXT V8.1 LOADED ---");

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authAPI, subscriptionAPI, SubscriptionStatus } from "@/services/api";

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  userType?: string;
  createdAt: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
}

export interface Subscription {
  id?: number;
  plan: "free" | "premium";
  status: "active" | "trialing" | "expired" | "cancelled" | "suspended";
  billingCycle: "monthly" | "yearly";
  startDate?: string;
  endDate?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  trialDaysRemaining?: number;
  price?: number;
  autoRenew?: boolean;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
  features?: {
    searchLimit?: number;
    exportLimit?: number;
    apiCallsPerDay?: number;
    advancedSearch?: boolean;
    fullDataAccess?: boolean;
    exportEnabled?: boolean;
    leadGeneration?: boolean;
    realTimeAlerts?: boolean;
  };
}

interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, captchaToken?: string) => Promise<{ success: boolean; message: string; userType?: string }>;
  register: (data: { firstName: string; lastName: string; email: string; password: string; captchaToken?: string }) => Promise<{ success: boolean; message: string; userType?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  updateSubscription: (data: Partial<Subscription>) => void;
  refreshSubscription: () => Promise<void>;
  startTrial: () => Promise<{ success: boolean; message: string }>;
  canAccessPremium: () => boolean;
  isTrialActive: () => boolean;
  getTrialDaysRemaining: () => number;
  maskData: (data: string, type?: "name" | "address" | "phone" | "email") => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "99sellers_user",
  SUBSCRIPTION: "99sellers_subscription",
  AUTH_TOKEN: "99sellers_token",
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    subscription: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
  });

  const getDefaultSubscription = (): Subscription => ({
    plan: "free",
    status: "active",
    billingCycle: "monthly",
    features: {
      searchLimit: 50,
      exportLimit: 0,
      advancedSearch: false,
      fullDataAccess: false,
      exportEnabled: false,
      leadGeneration: false,
      realTimeAlerts: false,
    },
  });

  const mapBackendSubscription = (data: SubscriptionStatus): Subscription => ({
    // id and startDate are not present in new SubscriptionStatus
    plan: (data.plan || "free") as Subscription["plan"],
    status: (data.isActive ? "active" : "expired") as Subscription["status"],
    billingCycle: (data.billingCycle || "monthly") as Subscription["billingCycle"],
    endDate: data.expiresAt || undefined,
    price: data.price,
    autoRenew: data.autoRenew,
    // features not in new SubscriptionStatus top level, might be implicit or we need to fetch them. 
    // For now, let's leave features empty or default if not provided.
    // actually, api.ts `SubscriptionStatus` doesn't have features anymore. 
    // We should probably rely on `plan` to determine features in the context or fetch them.
    // Or we keep features empty. 
    features: {},
  });

  const refreshSubscription = useCallback(async () => {
    try {
      const result = await subscriptionAPI.getStatus();
      if (result.success && result.data) {
        const subscription = mapBackendSubscription(result.data);
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
        setState((prev) => ({ ...prev, subscription }));
      }
    } catch (error) {
      console.error("Error refreshing subscription:", error);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, captchaToken?: string): Promise<{ success: boolean; message: string; userType?: string }> => {
    try {
      const result = await authAPI.login(email, password, captchaToken);
      if (result.success && result.data) {
        const data = result.data;
        const tokenPayload = JSON.parse(atob(data.token.split(".")[1]));

        const user: User = {
          id: tokenPayload.id.toString(),
          email: data.user?.Email || email,
          name: data.user?.FirstName || email.split("@")[0],
          firstName: data.user?.FirstName,
          lastName: data.user?.LastName,
          userType: data.user?.UserType || data.userType,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);

        let subscription = getDefaultSubscription();
        try {
          const subResult = await subscriptionAPI.getStatus();
          if (subResult.success && subResult.data) {
            subscription = mapBackendSubscription(subResult.data);
          }
        } catch (e) {
          console.log("Could not fetch subscription, using default");
        }
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));

        const isAdminUser = (data.user?.UserType || data.userType)?.toLowerCase() === "admin";

        setState({
          user,
          subscription,
          isAuthenticated: true,
          isLoading: false,
          isAdmin: isAdminUser,
        });

        return { success: true, message: "Login successful", userType: data.user?.UserType || data.userType };
      }
      return { success: false, message: result.error || "Invalid credentials" };
    } catch (error: any) {
      console.error("Login Error:", error);
      return { success: false, message: `Connection Error: ${error.message}` };
    }
  }, []);

  const register = useCallback(async (data: { firstName: string; lastName: string; email: string; password: string; captchaToken?: string }): Promise<{ success: boolean; message: string; userType?: string }> => {
    try {
      const result = await authAPI.register(data);
      if (result.success) {
        return await login(data.email, data.password, data.captchaToken);
      }
      return { success: false, message: result.error || "Registration failed" };
    } catch (error: any) {
      return { success: false, message: "Server connection failed" };
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    authAPI.logout();
    setState({ user: null, subscription: null, isAuthenticated: false, isLoading: false, isAdmin: false });
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedSubscription = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (storedUser && token) {
          const user = JSON.parse(storedUser);
          let subscription = storedSubscription ? JSON.parse(storedSubscription) : getDefaultSubscription();

          try {
            const subResult = await subscriptionAPI.getStatus();
            if (subResult.success && subResult.data) {
              subscription = mapBackendSubscription(subResult.data);
              localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
            }
          } catch (e) {
            console.log("Using cached subscription state");
          }

          setState({
            user,
            subscription,
            isAuthenticated: true,
            isLoading: false,
            isAdmin: user.userType?.toLowerCase() === "admin",
          });

          console.log('[AuthContext] Loaded state:', {
            userType: user.userType,
            subscriptionPlan: subscription.plan,
            isAdmin: user.userType?.toLowerCase() === "admin"
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Auth init error:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };
    loadUser();
  }, []);

  const updateUser = async (data: Partial<User>) => {
    if (!state.user) return;

    try {
      const result = await authAPI.updateProfile(data);
      if (result.success && result.data?.user) {
        const updatedUser = { ...state.user, ...result.data.user };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        setState((prev) => ({ ...prev, user: updatedUser }));
      } else {
        console.error("Failed to update profile on backend:", result.error);
        // Fallback or handle error
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  const updateSubscription = (data: Partial<Subscription>) => {
    if (!state.subscription) return;
    const updatedSubscription = { ...state.subscription, ...data };
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(updatedSubscription));
    setState((prev) => ({ ...prev, subscription: updatedSubscription }));
  };

  const startTrial = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await subscriptionAPI.startTrial();
      if (result.success) {
        await refreshSubscription();
        return { success: true, message: "Your 15-day trial has started!" };
      }
      return { success: false, message: result.error || "Could not start trial" };
    } catch (error) {
      return { success: false, message: "Error starting trial" };
    }
  };

  const isTrialActive = (): boolean => {
    if (!state.subscription || state.subscription.status !== "trialing") return false;
    return !!state.subscription.trialEndDate && new Date(state.subscription.trialEndDate) > new Date();
  };

  const getTrialDaysRemaining = (): number => {
    if (state.subscription?.trialDaysRemaining !== undefined) return state.subscription.trialDaysRemaining;
    if (!state.subscription?.trialEndDate) return 0;
    const diff = new Date(state.subscription.trialEndDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const canAccessPremium = (): boolean => {
    if (!state.user) return false;
    const type = state.user.userType?.toLowerCase();
    if (type === "admin" || type === "premium") return true;
    if (!state.subscription) return false;
    return !!state.subscription.features?.fullDataAccess || state.subscription.plan !== "free" || isTrialActive();
  };

  const maskData = (data: string, type: "name" | "address" | "phone" | "email" = "name"): string => {
    if (!data || canAccessPremium()) return data || "N/A";
    if (type === "phone") return "(***) ***-" + (data.length >= 4 ? data.slice(-4) : "****");
    if (type === "email") {
      const atIndex = data.indexOf("@");
      if (atIndex <= 0) return "****@****.com";
      return data[0] + "****" + data.substring(atIndex);
    }
    if (type === "address") {
      const parts = data.split(" ");
      if (parts.length > 1) {
        return parts[0].substring(0, 1) + "*** " + parts.slice(1).join(" ");
      }
      return "*** " + data;
    }
    // Name masking
    const parts = data.split(" ");
    return parts.map(part => part[0] + "****").join(" ");
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, updateSubscription, refreshSubscription, startTrial, canAccessPremium, isTrialActive, getTrialDaysRemaining, maskData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthContext;
