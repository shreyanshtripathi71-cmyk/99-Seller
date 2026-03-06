"use client";
import { Header, Footer } from "@/modules/HomeUI_Module";

import React, { useState } from "react";


import { useContent } from "@/modules/AppLogic_Module";

const defaultContent = {
  hero: {
    title: "Get In Touch",
    subtitle: "Have questions about our platform? Need help choosing the right plan? Our team is here to help you succeed."
  },
  info: {
    phone: "+1 (888) 99SELLS",
    email: "support@99sellers.com",
    address: "123 Real Estate Ave, Suite 100, Austin, TX 78701"
  },
  sections: [
    {
      id: "lead-types",
      title: "Lead Types We Provide",
      content: "We provide high-quality leads for various property types, including pre-foreclosures, tax defaults, and probate cases."
    },
    {
      id: "how-it-works",
      title: "How It Works",
      content: "Our system aggregates data from thousands of public records and uses proprietary algorithms to identify the most motivated sellers."
    }
  ]
};

export default function ContactPage() {
  const { content: displayContent, loading } = useContent('page_contact', defaultContent);
  const [formData, setFormData] = useState({
    inquiryType: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    contactPreference: "email"
  });
  const [formLoading, setFormLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitted(true);
    setFormLoading(false);
  };

  const heroTitle = displayContent?.hero?.title || "Contact Us";
  const heroSubtitle = displayContent?.hero?.subtitle;

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <Header />

      {/* Hero Section */}
      <section style={{
        background: "#0f172a",
        padding: "140px 24px 60px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 16 }}>
            <span style={{ color: "#ffffff" }}>Get In </span>
            <span style={{ color: "#2563eb" }}>Touch</span>
          </h1>
          <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.8 }}>
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Support Info */}
      <section style={{ background: "#f8fafc", padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            <div style={{ background: "#fff", padding: 32, borderRadius: 16, border: "1px solid #e2e8f0", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, background: "#2563eb", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <i className="fa-solid fa-phone" style={{ fontSize: 22, color: "#fff" }}></i>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>Phone Support</h3>
              <p style={{ color: "#2563eb", fontSize: 17, fontWeight: 500, marginBottom: 4 }}>{displayContent.info?.phone}</p>
              <p style={{ color: "#64748b", fontSize: 14 }}>Mon-Fri: 9am - 6pm EST</p>
            </div>

            <div style={{ background: "#fff", padding: 32, borderRadius: 16, border: "1px solid #e2e8f0", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, background: "#2563eb", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <i className="fa-solid fa-envelope" style={{ fontSize: 22, color: "#fff" }}></i>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>Email Support</h3>
              <p style={{ color: "#2563eb", fontSize: 17, fontWeight: 500, marginBottom: 4 }}>{displayContent.info?.email}</p>
              <p style={{ color: "#64748b", fontSize: 14 }}>Response within 24 hours</p>
            </div>

            <div style={{ background: "#fff", padding: 32, borderRadius: 16, border: "1px solid #e2e8f0", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, background: "#2563eb", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <i className="fa-solid fa-location-dot" style={{ fontSize: 22, color: "#fff" }}></i>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>Our Office</h3>
              <p style={{ color: "#64748b", fontSize: 15 }}>{displayContent.info?.address}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Sections (Lead Types, How it works, etc) */}
      {displayContent.sections && displayContent.sections.length > 0 && (
        <section style={{ background: "#fff", padding: "60px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 40 }}>
              {displayContent.sections.map((section: any) => (
                <div key={section.id} id={section.id}>
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>
                    {section.title}
                  </h2>
                  <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.7 }}>
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Form */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
            Send Us a Message
          </h2>
          <p style={{ color: "#64748b", fontSize: 16 }}>
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        {submitted ? (
          <div style={{ textAlign: "center", padding: 48, background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ width: 64, height: 64, background: "#2563eb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <i className="fa-solid fa-check" style={{ fontSize: 28, color: "#fff" }}></i>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>Message Sent!</h3>
            <p style={{ color: "#64748b", marginBottom: 24 }}>Thank you for reaching out. We&apos;ll respond within 24 hours.</p>
            <button
              onClick={() => setSubmitted(false)}
              style={{ padding: "12px 24px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 500 }}
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 40, borderRadius: 16, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "grid", gap: 24 }}>
              {/* Inquiry Type */}
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#0f172a", marginBottom: 8 }}>
                  What can we help you with?
                </label>
                <select
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  required
                  style={{ width: "100%", padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 15, outline: "none", background: "#fff" }}
                >
                  <option value="">Select an option</option>
                  <option value="sales">Sales & Pricing Questions</option>
                  <option value="support">Technical Support</option>
                  <option value="demo">Request a Demo</option>
                  <option value="partnership">Partnership Inquiry</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Name & Email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#0f172a", marginBottom: 8 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="John Smith"
                    style={{ width: "100%", padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 15, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#0f172a", marginBottom: 8 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="john@example.com"
                    style={{ width: "100%", padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 15, outline: "none" }}
                  />
                </div>
              </div>

              {/* Phone & Company */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#0f172a", marginBottom: 8 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    style={{ width: "100%", padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 15, outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#0f172a", marginBottom: 8 }}>
                    Company / Brokerage
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your company name"
                    style={{ width: "100%", padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 15, outline: "none" }}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#0f172a", marginBottom: 8 }}>
                  Your Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  placeholder="Tell us how we can help you..."
                  style={{ width: "100%", padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 15, resize: "vertical", outline: "none", fontFamily: "inherit" }}
                />
              </div>

              {/* Contact Preference */}
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#0f172a", marginBottom: 12 }}>
                  Preferred contact method
                </label>
                <div style={{ display: "flex", gap: 24 }}>
                  {[
                    { value: "email", label: "Email" },
                    { value: "phone", label: "Phone" },
                    { value: "either", label: "Either" }
                  ].map((option) => (
                    <label key={option.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="contactPreference"
                        value={option.value}
                        checked={formData.contactPreference === option.value}
                        onChange={(e) => setFormData({ ...formData, contactPreference: e.target.value })}
                        style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                      />
                      <span style={{ fontSize: 15, color: "#334155" }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: formLoading ? "not-allowed" : "pointer",
                  opacity: formLoading ? 0.7 : 1,
                  marginTop: 8
                }}
              >
                {formLoading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        )}
      </section>

      <Footer />
    </div>
  );
}