"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/modules/UserSearchLayout_Module";
import styles from "@/components/search/styles/dashboard.module.scss";
import { useAuth } from "@/context/AuthContext";
import { subscriptionAPI, SubscriptionStatus } from "@/services/api";

interface Plan {
  id: string | number;
  name: string;
  price: number;
  billingCycle: string;
  features: Record<string, any> | string[];
  description: string;
  type?: string;
  popular?: boolean;
  trialDays?: number;
}

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionStatus | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "quarterly">("monthly");
  const [processingPlanId, setProcessingPlanId] = useState<string | number | null>(null);

  // Fallback plans constant to ensure UI always works
  const FALLBACK_PLANS = [
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      price: 50,
      billingCycle: 'monthly',
      description: 'Full access to all premium features',
      features: {
        searchLimit: -1,
        exportLimit: 1000,
        fullDataAccess: true,
        advancedSearch: true,
        exportEnabled: true
      },
      popular: false
    },
    {
      id: 'premium_quarterly',
      name: 'Premium Quarterly',
      price: 150,
      billingCycle: 'quarterly',
      description: 'Save with quarterly billing',
      features: {
        searchLimit: -1,
        exportLimit: 3000,
        fullDataAccess: true,
        advancedSearch: true,
        exportEnabled: true
      },
      popular: true
    }
  ];

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansResponse, statusResponse] = await Promise.all([
        subscriptionAPI.getPlans(),
        subscriptionAPI.getStatus(),
      ]);

      console.log('Plans Response:', plansResponse);
      console.log('Status Response:', statusResponse);

      if (plansResponse.success && plansResponse.data && Array.isArray(plansResponse.data) && plansResponse.data.length > 0) {
        const plansData = plansResponse.data;
        console.log('Plans Data:', plansData);
        // Transform features object to array of strings
        const transformedPlans = plansData.map((plan: any) => ({
          ...plan,
          type: plan.id,
          features: transformFeaturesToArray(plan.features, plan.description),
        }));
        setPlans(transformedPlans);
      } else {
        console.warn('API returned no plans, using fallback data:', plansResponse);
        // Fallback plans to ensure UI always shows something
        const fallbackPlans = [
          {
            id: 'premium_monthly',
            name: 'Premium Monthly',
            price: 50,
            billingCycle: 'monthly',
            description: 'Full access to all premium features',
            features: {
              searchLimit: -1,
              exportLimit: 1000,
              fullDataAccess: true,
              advancedSearch: true,
              exportEnabled: true
            },
            popular: false
          },
          {
            id: 'premium_quarterly',
            name: 'Premium Quarterly',
            price: 150,
            billingCycle: 'quarterly',
            description: 'Save with quarterly billing',
            features: {
              searchLimit: -1,
              exportLimit: 3000,
              fullDataAccess: true,
              advancedSearch: true,
              exportEnabled: true
            },
            popular: true
          }
        ];

        const transformedFallback = fallbackPlans.map((plan: any) => ({
          ...plan,
          type: plan.id,
          features: transformFeaturesToArray(plan.features, plan.description),
        }));
        setPlans(transformedFallback);
      }

      if (statusResponse.success && statusResponse.data) {
        setCurrentSubscription(statusResponse.data);
      }
    } catch (error) {
      console.error("Failed to load subscription data:", error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const transformFeaturesToArray = (features: Record<string, any>, description: string): string[] => {
    // ... (same as before)
    const featureList: string[] = [];

    if (features.searchLimit) {
      featureList.push(
        features.searchLimit === -1
          ? "Unlimited property searches"
          : `Up to ${features.searchLimit.toLocaleString()} property searches`
      );
    }

    if (features.exportLimit !== undefined && features.exportLimit !== 0) {
      featureList.push(
        features.exportLimit === -1
          ? "Unlimited data exports"
          : `Export up to ${features.exportLimit.toLocaleString()} properties`
      );
    }

    if (features.fullDataAccess) {
      featureList.push("Full access to property details");
    }

    if (features.apiCallsPerDay) {
      featureList.push(
        features.apiCallsPerDay === -1
          ? "Unlimited API calls"
          : `${features.apiCallsPerDay.toLocaleString()} API calls per day`
      );
    }

    if (features.advancedSearch) {
      featureList.push("Advanced search & filtering");
    }

    if (features.exportEnabled) {
      featureList.push("CSV/Excel export capabilities");
    }

    if (features.apiAccess) {
      featureList.push("Full API access");
    }

    if (featureList.length === 0) {
      featureList.push("Standard property search");
      featureList.push("Limited data access");
    }

    return featureList;
  };

  const handleSubscribe = async (planId: string | number) => {
    // Redirect to billing page for payment
    // We pass the planId and billing cycle as query params
    const billingCycle = selectedBilling;
    window.location.href = `/dashboard/billing?action=upgrade&plan=${planId}&billing=${billingCycle}`;
  };

  const handleCancelSubscription = async () => {
    // ... (same as before)
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    try {
      const result = await subscriptionAPI.cancel();
      if (result.success) {
        alert("Subscription cancelled successfully");
        await loadSubscriptionData();
      } else {
        alert(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("An error occurred while cancelling your subscription");
    }
  };

  const getPlanIcon = (planType: string) => {
    // ... (same as before)
    switch (planType?.toLowerCase()) {
      case "professional":
      case "premium":
        return "fa-rocket";
      default:
        return "fa-box";
    }
  };

  if (loading) {
    return (
      <DashboardShell title="Subscription" subtitle="Manage your subscription plan">
        <div style={{ textAlign: "center", padding: 80 }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#2563eb" }}></i>
          <p style={{ marginTop: 16, color: "#64748b", fontSize: 14 }}>Loading subscription details...</p>
        </div>
      </DashboardShell>
    );
  }

  const filteredPlans = Array.isArray(plans)
    ? plans.filter((plan) => plan.billingCycle?.toLowerCase() === selectedBilling?.toLowerCase())
    : [];

  return (
    <DashboardShell title="Subscription" subtitle="Manage your plan and billing">
      <div className={styles.pageContent}>

        {/* Current Plan Banner */}
        {currentSubscription && (
          <div style={{
            background: '#0f172a',
            borderRadius: 16,
            padding: '32px 32px',
            marginBottom: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap' as const,
            gap: 20
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: currentSubscription.isActive ? '#22c55e' : '#ef4444'
                }} />
                <span style={{
                  fontSize: 12, fontWeight: 600, color: currentSubscription.isActive ? '#86efac' : '#fca5a5',
                  textTransform: 'uppercase' as const, letterSpacing: '0.05em'
                }}>
                  {currentSubscription.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
                {currentSubscription.plan} Plan
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {currentSubscription.billingCycle} billing
                {currentSubscription.expiresAt && (
                  <> · Renews {new Date(currentSubscription.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                )}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                ${currentSubscription.price}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                per {currentSubscription.billingCycle}
              </div>
            </div>
          </div>
        )}

        {/* Billing Toggle */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            borderRadius: 10,
            padding: 3
          }}>
            {(['monthly', 'quarterly'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setSelectedBilling(cycle)}
                style={{
                  padding: '10px 28px',
                  borderRadius: 8,
                  border: 'none',
                  background: selectedBilling === cycle ? '#fff' : 'transparent',
                  color: selectedBilling === cycle ? '#0f172a' : '#64748b',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selectedBilling === cycle ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                {cycle === 'quarterly' && (
                  <span style={{
                    marginLeft: 8, fontSize: 11, fontWeight: 700,
                    background: '#2563eb', color: '#fff',
                    padding: '2px 8px', borderRadius: 50
                  }}>
                    Save 20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan Cards */}
        {filteredPlans.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginBottom: 40
          }}>
            {filteredPlans.map((plan) => {
              const isCurrentPlan =
                currentSubscription?.plan?.toLowerCase() === plan.name?.toLowerCase().replace(' plan', '') ||
                (currentSubscription?.plan?.toLowerCase() === 'premium' && plan.name.toLowerCase().includes('premium'));
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.id}
                  style={{
                    background: isPopular ? '#0f172a' : '#fff',
                    borderRadius: 16,
                    border: isPopular ? '2px solid #0f172a' : '1px solid #e2e8f0',
                    padding: '32px 28px',
                    position: 'relative' as const,
                    display: 'flex',
                    flexDirection: 'column' as const,
                    transition: 'box-shadow 0.2s'
                  }}
                >
                  {isPopular && (
                    <div style={{
                      position: 'absolute' as const, top: -12, left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#2563eb', color: '#fff',
                      fontSize: 11, fontWeight: 700,
                      padding: '5px 16px', borderRadius: 50,
                      letterSpacing: '0.04em', textTransform: 'uppercase' as const
                    }}>
                      Most Popular
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div style={{
                      position: 'absolute' as const, top: -12, right: 16,
                      background: '#22c55e', color: '#fff',
                      fontSize: 11, fontWeight: 700,
                      padding: '5px 12px', borderRadius: 50,
                      letterSpacing: '0.04em', textTransform: 'uppercase' as const
                    }}>
                      Current
                    </div>
                  )}

                  <h3 style={{
                    fontSize: 18, fontWeight: 700, margin: '0 0 4px',
                    color: isPopular ? '#fff' : '#0f172a'
                  }}>
                    {plan.name}
                  </h3>
                  <p style={{
                    fontSize: 13, margin: '0 0 20px',
                    color: isPopular ? 'rgba(255,255,255,0.5)' : '#94a3b8'
                  }}>
                    {plan.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                    <span style={{
                      fontSize: 36, fontWeight: 800, lineHeight: 1,
                      color: isPopular ? '#fff' : '#0f172a'
                    }}>
                      ${plan.price}
                    </span>
                    <span style={{
                      fontSize: 14,
                      color: isPopular ? 'rgba(255,255,255,0.4)' : '#94a3b8'
                    }}>
                      /{plan.billingCycle}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={processingPlanId === plan.id}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: 10,
                      border: isPopular ? 'none' : '1px solid #e2e8f0',
                      background: isCurrentPlan
                        ? (isPopular ? 'rgba(255,255,255,0.1)' : '#f8fafc')
                        : isPopular ? '#2563eb' : '#0f172a',
                      color: isCurrentPlan
                        ? (isPopular ? 'rgba(255,255,255,0.6)' : '#64748b')
                        : '#fff',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: isCurrentPlan ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      marginBottom: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    {processingPlanId === plan.id ? (
                      <><i className="fa-solid fa-spinner fa-spin" /> Processing...</>
                    ) : isCurrentPlan ? (
                      <><i className="fa-solid fa-check" /> Current Plan</>
                    ) : (
                      'Upgrade Now'
                    )}
                  </button>

                  <div style={{
                    height: 1, marginBottom: 20,
                    background: isPopular ? 'rgba(255,255,255,0.08)' : '#f1f5f9'
                  }} />

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                    {Array.isArray(plan.features) && plan.features.map((feature: string, idx: number) => (
                      <li key={idx} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        marginBottom: 12, fontSize: 13,
                        color: isPopular ? 'rgba(255,255,255,0.8)' : '#475569'
                      }}>
                        <i className="fa-solid fa-check" style={{
                          fontSize: 11, marginTop: 4, flexShrink: 0,
                          color: isPopular ? '#60a5fa' : '#2563eb'
                        }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: 60,
            background: '#f8fafc', borderRadius: 16,
            border: '1px solid #e2e8f0', marginBottom: 40
          }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: 36, color: '#cbd5e1', marginBottom: 12 }} />
            <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>
              No plans available for this billing cycle.
            </p>
          </div>
        )}

        {/* Cancel Subscription */}
        {currentSubscription && currentSubscription.isActive && (
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '24px 28px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap' as const,
            gap: 16
          }}>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 4px' }}>
                Cancel Subscription
              </h4>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                You&apos;ll retain access until the end of your current billing period.
              </p>
            </div>
            <button
              onClick={handleCancelSubscription}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid #fecaca',
                background: '#fff',
                color: '#ef4444',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <i className="fa-solid fa-xmark" style={{ fontSize: 12 }} />
              Cancel Plan
            </button>
          </div>
        )}

        {/* FAQ */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 28px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-circle-question" style={{ color: '#2563eb', fontSize: 14 }} />
              Frequently Asked Questions
            </h4>
          </div>
          <div style={{ padding: '8px 28px' }}>
            {[
              { q: "Can I change my plan anytime?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, and PayPal for your convenience." },
              { q: "Is there a free trial available?", a: "Yes! All new users get a 14-day free trial on any plan with no credit card required." },
              { q: "Can I cancel my subscription?", a: "Absolutely. You can cancel anytime from this page. You'll retain access until the end of your billing period." },
            ].map((faq, idx) => (
              <div key={idx} style={{
                padding: '16px 0',
                borderBottom: idx < 3 ? '1px solid #e2e8f0' : 'none'
              }}>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13, marginBottom: 6 }}>
                  {faq.q}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardShell>
  );
};

export default SubscriptionPage;
