"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardShell } from "@/modules/UserSearchLayout_Module";
import styles from "@/components/search/styles/dashboard.module.scss";
import { useAuth } from "@/context/AuthContext";
import { AddPaymentMethodModal } from "@/modules/UserBilling_Module";
import { UpdateBillingAddressModal } from "@/modules/UserBilling_Module";
import { StripePaymentForm } from "@/modules/UserBilling_Module";
import { paymentAPI, subscriptionAPI, billingAPI } from "@/services/api";
import { useRouter, useSearchParams } from "next/navigation";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  description: string;
  downloadUrl?: string;
}

interface PaymentMethod {
  id: string;
  type: "card" | "paypal" | "bank";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  email?: string;
}

const BillingPage: React.FC = () => {
  const { user, subscription, isTrialActive, getTrialDaysRemaining } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "payment">("overview");
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingOverview, setBillingOverview] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<{ id: string, amount: number, clientSecret: string, billingCycle: string } | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadBillingData();
  }, []);

  useEffect(() => {
    const checkUpgradeParams = async () => {
      const action = searchParams.get('action');
      const plan = searchParams.get('plan');
      const billing = searchParams.get('billing');

      if (action === 'upgrade' && plan && billing) {
        // Trigger upgrade flow
        try {
          const result = await paymentAPI.createPaymentIntent(plan, billing);
          if (result.success && result.data) {
            setUpgradePlan({
              id: plan,
              amount: result.data.amount,
              clientSecret: result.data.clientSecret,
              billingCycle: billing
            });
            setShowUpgradeModal(true);
          } else {
            alert('Failed to initialize payment: ' + result.error);
          }
        } catch (error) {
          console.error('Upgrade init error:', error);
        }
      }
    };

    if (searchParams) {
      checkUpgradeParams();
    }
  }, [searchParams]);

  const handlePaymentSuccess = async () => {
    try {
      if (!upgradePlan) return;

      // Call backend to provision the subscription
      const response = await subscriptionAPI.create(upgradePlan.id, upgradePlan.billingCycle) as any;

      if (response.success) {
        // Refresh token if returned (now nested in data)
        const token = response.data?.token || response.token;
        if (token) {
          localStorage.setItem('99sellers_token', token);
          // Update user object in localStorage to reflect new type
          const storedUser = localStorage.getItem('99sellers_user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            user.userType = 'premium';
            localStorage.setItem('99sellers_user', JSON.stringify(user));
          }
        }

        alert('Payment Successful! Your plan has been upgraded to ' + upgradePlan.billingCycle + '.');
        setShowUpgradeModal(false);

        // Clear params
        router.push('/dashboard/billing');

        // Reload data
        loadBillingData();
        // Reload page to refresh subscription context if needed, or use a context refresher
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert('Payment succeeded but subscription update failed: ' + response.error + '. Please contact support.');
      }
    } catch (err) {
      console.error('Provisioning error:', err);
      alert('An error occurred while updating your subscription.');
    }
  };

  const loadBillingData = async () => {
    try {
      setLoading(true);
      const [overviewRes, invoicesRes, paymentRes] = await Promise.all([
        billingAPI.getOverview(),
        billingAPI.getInvoices(),
        billingAPI.getPaymentMethods()
      ]);

      if (overviewRes.success && overviewRes.data) {
        setBillingOverview(overviewRes.data);
      }
      if (invoicesRes.success && invoicesRes.data) {
        setInvoices(invoicesRes.data);
      }
      if (paymentRes.success && paymentRes.data) {
        setPaymentMethods(paymentRes.data);
      }
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const getCurrentPlanDetails = () => {
    if (!subscription) return { name: "Free Plan", price: "$0", period: "forever", nextBilling: null };
    if (isTrialActive()) {
      const daysLeft = getTrialDaysRemaining();
      return { name: "Trial", price: "$0", period: daysLeft + " days remaining", nextBilling: subscription.trialEndDate };
    }
    const planName = (subscription.plan || "free").toLowerCase();
    const planNames: Record<string, string> = { free: "Free", premium: "Premium" };
    const planPrices: Record<string, string> = { free: "$0", premium: "$50" };

    return {
      name: planNames[planName] || "Free",
      price: planPrices[planName] || "$0",
      period: subscription.billingCycle === "yearly" ? "per year" : "per month",
      nextBilling: subscription.endDate
    };
  };

  const planDetails = getCurrentPlanDetails();
  const priceValue = parseFloat(planDetails.price.replace('$', '')) || 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: "fa-chart-pie" },
    { id: "invoices", label: "Invoices", icon: "fa-file-invoice" },
    { id: "payment", label: "Payment Methods", icon: "fa-credit-card" }
  ];

  const getStatusBadgeClass = (status: string) => {
    if (status === "paid") return styles.badge + " " + styles.badgeSuccess;
    if (status === "pending") return styles.badge + " " + styles.badgeWarning;
    return styles.badge + " " + styles.badgeDanger;
  };

  const getPaymentIcon = (type: string) => {
    if (type === "card") return "fa-credit-card";
    if (type === "paypal") return "fa-brands fa-paypal";
    return "fa-building-columns";
  };

  return (
    <DashboardShell
      title="Billing"
      subtitle="Manage your subscription and payment methods"
      actions={
        <Link href="/dashboard/subscription" className={styles.btn + " " + styles.btnPrimary}>
          <i className="fa-solid fa-crown"></i>
          Upgrade Plan
        </Link>
      }
    >
      <div className={styles.pageContent}>
        {isTrialActive() && (
          <div className={styles.trialBanner}>
            <div className={styles.trialBannerContent}>
              <i className={"fa-solid fa-clock " + styles.trialBannerIcon}></i>
              <div className={styles.trialBannerText}>
                <h4>Trial Period Active</h4>
                <p>You have {getTrialDaysRemaining()} days left in your free trial</p>
              </div>
            </div>
            <Link href="/dashboard/subscription" className={styles.btn + " " + styles.btnSecondary}>
              Subscribe Now
            </Link>
          </div>
        )}

        <div className={styles.tabNav}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={styles.tabBtn + (activeTab === tab.id ? " " + styles.active : "")}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              <i className={"fa-solid " + tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className={styles.billingOverviewGrid}>
            <div className={styles.billingStatCard}>
              <div className={styles.billingStatHeader}>
                <h3>Current Plan</h3>
              </div>
              <div className={styles.billingStatValue}>
                <span className={styles.value}>{planDetails.price}</span>
                <span className={styles.period}>{planDetails.period}</span>
              </div>
              <span className={styles.badge + " " + styles.badgePrimary}>{planDetails.name}</span>
              {planDetails.nextBilling && (
                <div className={styles.billingStatRow}>
                  <span className={styles.label}>{isTrialActive() ? "Trial ends" : "Next billing"}</span>
                  <span className={styles.amount}>{formatDate(planDetails.nextBilling)}</span>
                </div>
              )}
            </div>

            <div className={styles.billingStatCard}>
              <div className={styles.billingStatHeader}>
                <h3>Billing Summary</h3>
              </div>
              <div className={styles.billingStatRow}>
                <span className={styles.label}>Total This Month</span>
                <span className={styles.amount}>{formatCurrency(billingOverview?.totalThisMonth || priceValue)}</span>
              </div>
              <div className={styles.billingStatRow}>
                <span className={styles.label}>Year to Date</span>
                <span className={styles.amount}>{formatCurrency(billingOverview?.yearToDate || priceValue)}</span>
              </div>
              <div className={styles.billingStatRow}>
                <span className={styles.label}>Outstanding</span>
                <span className={styles.amount + " " + (billingOverview?.outstanding > 0 ? styles.warning : "")}>{formatCurrency(billingOverview?.outstanding || 0)}</span>
              </div>
            </div>

            <div className={styles.billingStatCard}>
              <div className={styles.billingStatHeader}>
                <h3>Quick Actions</h3>
              </div>
              <div className={styles.billingActionsCard}>
                <Link href="/dashboard/subscription" className={styles.btn + " " + styles.btnPrimary}>
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  Change Plan
                </Link>
                <button onClick={() => setActiveTab("payment")} className={styles.btn + " " + styles.btnSecondary}>
                  <i className="fa-solid fa-credit-card"></i>
                  Update Payment
                </button>
                <button onClick={() => setShowAddressModal(true)} className={styles.btn + " " + styles.btnSecondary}>
                  <i className="fa-solid fa-location-dot"></i>
                  Update Address
                </button>
                <button onClick={() => setActiveTab("invoices")} className={styles.btn + " " + styles.btnSecondary}>
                  <i className="fa-solid fa-download"></i>
                  Download Invoices
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "invoices" && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Invoice History</h3>
            </div>
            <div className={styles.cardBody} style={{ padding: 0 }}>
              <div className={styles.table_container}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>
                          <div>
                            <div style={{ fontWeight: 500 }}>{invoice.id}</div>
                            <div style={{ fontSize: 13, opacity: 0.7 }}>{invoice.description}</div>
                          </div>
                        </td>
                        <td>{formatDate(invoice.date)}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrency(invoice.amount)}</td>
                        <td>
                          <span className={getStatusBadgeClass(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {invoice.downloadUrl && (
                            <button className={styles.btn + " " + styles.btnGhost}>
                              <i className="fa-solid fa-download"></i>
                              Download
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Payment Methods</h3>
                <button onClick={() => setShowPaymentModal(true)} className={styles.btn + " " + styles.btnPrimary}>
                  <i className="fa-solid fa-plus"></i>
                  Add New
                </button>
              </div>
              <div className={styles.cardBody}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={styles.paymentMethodCard + (method.isDefault ? " " + styles.isDefault : "")}
                    >
                      <div className={styles.paymentMethodInfo}>
                        <div className={styles.paymentMethodIcon}>
                          <i className={"fa-solid " + getPaymentIcon(method.type)}></i>
                        </div>
                        <div className={styles.paymentMethodDetails}>
                          <div className={styles.name}>
                            {method.type === "card"
                              ? method.brand + " ending in " + method.last4
                              : "PayPal - " + method.email}
                          </div>
                          <div className={styles.meta}>
                            {method.type === "card" && "Expires " + method.expiryMonth + "/" + method.expiryYear}
                            {method.isDefault && <span className={styles.defaultBadge}> • Default</span>}
                          </div>
                        </div>
                      </div>
                      <div className={styles.paymentMethodActions}>
                        {!method.isDefault && (
                          <button className={styles.btn + " " + styles.btnSecondary}>Set Default</button>
                        )}
                        <button className={styles.btn + " " + styles.btnDanger}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Billing Address</h3>
                <button className={styles.btn + " " + styles.btnSecondary}>
                  <i className="fa-solid fa-pen"></i>
                  Edit
                </button>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.billingAddressContent}>
                  <p className={styles.name}>{user?.name || "Your Name"}</p>
                  <p className={styles.address}>123 Main Street</p>
                  <p className={styles.address}>Suite 100</p>
                  <p className={styles.address}>San Francisco, CA 94102</p>
                  <p className={styles.address}>United States</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showPaymentModal && (
        <AddPaymentMethodModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={loadBillingData}
        />
      )}

      {showAddressModal && (
        <UpdateBillingAddressModal
          onClose={() => setShowAddressModal(false)}
          onSuccess={() => { }}
        />
      )}

      {showUpgradeModal && upgradePlan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <StripePaymentForm
              clientSecret={upgradePlan.clientSecret}
              amount={upgradePlan.amount}
              onSuccess={handlePaymentSuccess}
              onCancel={() => {
                setShowUpgradeModal(false);
                router.push('/dashboard/billing');
              }}
            />
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default BillingPage;
