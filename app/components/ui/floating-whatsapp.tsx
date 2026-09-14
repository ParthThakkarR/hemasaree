'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  message?: string;
}

const SPRING_BTN = { type: 'spring' as const, bounce: 0.2, duration: 0.4 };

/**
 * Floating WhatsApp CTA button — appears after 3s, fixed bottom-right.
 * Positioned above mobile nav on mobile, standalone on desktop.
 * Huge conversion driver for Indian e-commerce.
 */
export default function FloatingWhatsApp({
  phoneNumber = '919429475736',
  message = 'Hi! I\'m interested in your sarees. Can you help me choose?',
}: FloatingWhatsAppProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Show after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Show tooltip briefly after the button appears
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => setIsTooltipVisible(true), 1000);
    const hideTimer = setTimeout(() => setIsTooltipVisible(false), 6000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [isVisible]);

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const buttonVariants = prefersReducedMotion
    ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.2 } },
    }
    : {
      hidden: { opacity: 0, scale: 0.5, y: 20 },
      visible: { opacity: 1, scale: 1, y: 0, transition: SPRING_BTN },
    };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          className="fixed z-50 right-4 sm:right-6"
          style={{
            bottom: 'calc(var(--mobile-nav-height, 4.25rem) + 1rem + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {isTooltipVisible && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-kajal text-chandan text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
              >
                Need help? Chat with us!
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-kajal" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp Button */}
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={SPRING_BTN}
            className="relative flex items-center justify-center w-14 h-14 sm:w-[60px] sm:h-[60px] rounded-full shadow-lg hover:shadow-xl transition-shadow"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageCircle
              size={26}
              className="text-white"
              fill="white"
              strokeWidth={0}
            />
            {/* Pulsing "online" dot */}
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white">
              <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-60" />
            </span>
          </motion.a>

          {/* Desktop hover text */}
          <p className="hidden lg:block text-center text-[10px] text-kajal-whisper font-medium mt-1.5">
            WhatsApp
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
