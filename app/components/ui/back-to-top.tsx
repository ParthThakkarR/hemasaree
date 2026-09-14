'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const SPRING_BTN = { type: 'spring' as const, bounce: 0.15, duration: 0.35 };

/**
 * Back-to-top floating button that appears after scrolling 2 viewport heights.
 * Positioned on the left side to avoid conflicting with WhatsApp button on the right.
 */
export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 2);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const buttonVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        hidden: { opacity: 0, scale: 0.8, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: SPRING_BTN },
        exit: { opacity: 0, scale: 0.8, y: 10, transition: { duration: 0.15 } },
      };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed z-40 left-4 sm:left-6 w-10 h-10 rounded-full bg-chandan border border-chandan-warm shadow-card hover:shadow-card-hover text-kajal-soft hover:text-kumkum transition-all flex items-center justify-center"
          style={{
            bottom: 'calc(var(--mobile-nav-height, 4.25rem) + 1rem + env(safe-area-inset-bottom, 0px))',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={SPRING_BTN}
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
