"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Shield, ChevronDown, Cookie, BarChart3, Megaphone } from "lucide-react";

interface CookiePreferences {
  essential: boolean; // always true
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CATEGORIES = [
  {
    id: "essential" as const,
    label: "Essential Cookies",
    icon: Shield,
    required: true,
    description:
      "These cookies are necessary for the website to function and cannot be switched off. They are set in response to actions you take such as logging in, adding items to your cart, or setting your privacy preferences.",
    cookies: [
      { name: "next-auth.session-token", purpose: "Keeps you logged in securely", duration: "Session" },
      { name: "next-auth.csrf-token", purpose: "Protects against cross-site request forgery", duration: "Session" },
      { name: "cart", purpose: "Stores your shopping cart items", duration: "30 days" },
      { name: "cookie_consent", purpose: "Remembers your cookie preferences", duration: "1 year" },
    ],
  },
  {
    id: "analytics" as const,
    label: "Analytics Cookies",
    icon: BarChart3,
    required: false,
    description:
      "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our site experience for you.",
    cookies: [
      { name: "_ga / _gid", purpose: "Google Analytics — tracks page views and sessions", duration: "2 years / 24 hours" },
      { name: "_gat", purpose: "Limits the rate of data collection on high-traffic pages", duration: "1 minute" },
    ],
  },
  {
    id: "marketing" as const,
    label: "Marketing Cookies",
    icon: Megaphone,
    required: false,
    description:
      "These cookies are used to show you ads and content that are more relevant to your interests. They may also be used to limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.",
    cookies: [
      { name: "_fbp", purpose: "Facebook Pixel — personalised social media ads", duration: "3 months" },
      { name: "newsletter_pref", purpose: "Stores your newsletter subscription preferences", duration: "1 year" },
    ],
  },
];

function getStoredConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem("cookie_consent");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && "essential" in parsed) {
      return parsed as CookiePreferences;
    }
    // Legacy: old format was just "accepted" / "rejected" string
    return null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveAndClose = useCallback((prefs: CookiePreferences) => {
    localStorage.setItem("cookie_consent", JSON.stringify({ ...prefs, essential: true }));
    setIsVisible(false);
  }, []);

  const acceptAll = () => {
    saveAndClose({ essential: true, analytics: true, marketing: true });
  };

  const rejectOptional = () => {
    saveAndClose({ essential: true, analytics: false, marketing: false });
  };

  const savePreferences = () => {
    saveAndClose(preferences);
  };

  const toggleCategory = (id: "analytics" | "marketing") => {
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="cookie-banner"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4"
        >
          <div className="max-w-3xl mx-auto rounded-2xl shadow-2xl border overflow-hidden max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain"
            style={{
              background: 'var(--color-chandan, #FDF8F3)',
              borderColor: 'var(--color-chandan-warm, #EDE0D0)',
            }}
          >
            {/* Header */}
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(212,165,55,0.15)', color: 'var(--color-haldi-deep, #B8860B)' }}
                >
                  <Cookie size={20} />
                </div>
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{ fontFamily: 'var(--font-noto-serif)', color: 'var(--color-kajal, #1A1614)' }}
                  >
                    We value your privacy
                  </h3>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-kajal-soft, #6B5E55)' }}>
                    We use cookies to enhance your shopping experience, analyse site traffic, and personalise content.
                    You can choose which cookies to allow below. Read our{" "}
                    <Link href="/privacy-policy" className="underline underline-offset-2 font-medium" style={{ color: 'var(--color-kumkum, #8B2635)' }}>
                      Privacy Policy
                    </Link>{" "}
                    for more details.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                <button
                  onClick={acceptAll}
                  className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
                  style={{ background: 'var(--color-kumkum, #8B2635)' }}
                >
                  Accept All
                </button>
                <button
                  onClick={rejectOptional}
                  className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 border"
                  style={{
                    color: 'var(--color-kajal, #1A1614)',
                    borderColor: 'var(--color-chandan-warm, #EDE0D0)',
                    background: 'var(--color-chandan-deep, #F5EDE3)',
                  }}
                >
                  Reject Optional
                </button>
                <button
                  onClick={() => setShowDetails((d) => !d)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                  style={{ color: 'var(--color-kumkum, #8B2635)' }}
                >
                  Manage Preferences
                  <ChevronDown
                    size={16}
                    className="transition-transform duration-300"
                    style={{ transform: showDetails ? 'rotate(180deg)' : 'rotate(0)' }}
                  />
                </button>
              </div>
            </div>

            {/* Expandable details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  key="cookie-details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 border-t"
                    style={{ borderColor: 'var(--color-chandan-warm, #EDE0D0)' }}
                  >
                    <div className="space-y-3">
                      {COOKIE_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isExpanded = expandedCategory === cat.id;
                        const isEnabled = cat.required || preferences[cat.id];

                        return (
                          <div
                            key={cat.id}
                            className="rounded-xl border overflow-hidden"
                            style={{ borderColor: 'var(--color-chandan-warm, #EDE0D0)' }}
                          >
                            {/* Category header */}
                            <div
                              className="flex items-center justify-between gap-3 p-3.5 cursor-pointer"
                              style={{ background: 'var(--color-chandan-deep, #F5EDE3)' }}
                              onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon size={16} style={{ color: 'var(--color-haldi-deep, #B8860B)' }} />
                                <span className="text-sm font-semibold" style={{ color: 'var(--color-kajal, #1A1614)' }}>
                                  {cat.label}
                                </span>
                                {cat.required && (
                                  <span
                                    className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                      background: 'rgba(212,165,55,0.15)',
                                      color: 'var(--color-haldi-deep, #B8860B)',
                                    }}
                                  >
                                    Always Active
                                  </span>
                                )}
                                <ChevronDown
                                  size={14}
                                  className="transition-transform duration-200"
                                  style={{
                                    color: 'var(--color-kajal-soft, #6B5E55)',
                                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                  }}
                                />
                              </div>

                              {/* Toggle switch */}
                              {!cat.required && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCategory(cat.id as "analytics" | "marketing");
                                  }}
                                  className="relative rounded-full transition-colors duration-200 flex-shrink-0"
                                  role="switch"
                                  aria-checked={isEnabled}
                                  style={{
                                    width: '40px',
                                    height: '22px',
                                    background: isEnabled ? 'var(--color-kumkum, #8B2635)' : '#D1D5DB',
                                  }}
                                  aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${cat.label}`}
                                >
                                  <span
                                    className="absolute top-0.5 rounded-full bg-white shadow-sm transition-transform duration-200"
                                    style={{
                                      left: '2px',
                                      width: '18px',
                                      height: '18px',
                                      transform: isEnabled ? 'translateX(18px)' : 'translateX(0)',
                                    }}
                                  />
                                </button>
                              )}
                            </div>

                            {/* Expanded detail */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  key={`detail-${cat.id}`}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-3.5 text-sm space-y-3" style={{ background: 'var(--color-chandan, #FDF8F3)' }}>
                                    <p className="leading-relaxed" style={{ color: 'var(--color-kajal-soft, #6B5E55)' }}>
                                      {cat.description}
                                    </p>

                                    {/* Cookie table */}
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr style={{ color: 'var(--color-kajal, #1A1614)' }}>
                                            <th className="text-left py-1.5 pr-4 font-semibold">Cookie</th>
                                            <th className="text-left py-1.5 pr-4 font-semibold">Purpose</th>
                                            <th className="text-left py-1.5 font-semibold">Duration</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {cat.cookies.map((c) => (
                                            <tr key={c.name} style={{ color: 'var(--color-kajal-soft, #6B5E55)' }}>
                                              <td className="py-1.5 pr-4 font-mono text-[11px]">{c.name}</td>
                                              <td className="py-1.5 pr-4">{c.purpose}</td>
                                              <td className="py-1.5 whitespace-nowrap">{c.duration}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>

                    {/* Save preferences button */}
                    <button
                      onClick={savePreferences}
                      className="w-full mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
                      style={{ background: 'var(--color-kumkum, #8B2635)' }}
                    >
                      Save My Preferences
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
