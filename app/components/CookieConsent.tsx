"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setIsVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("cookie_consent", "rejected");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 w-full bg-slate-900 text-white p-4 shadow-lg z-50 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="text-sm">
            <p>
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
            </p>
          </div>
          <div className="flex gap-2 whitespace-nowrap">
            <button
              onClick={rejectCookies}
              className="px-4 py-2 text-sm border border-slate-600 rounded-md hover:bg-slate-800 transition-colors"
            >
              Reject All
            </button>
            <button
              onClick={acceptCookies}
              className="px-4 py-2 text-sm bg-blue-600 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Accept All
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
