'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HOMEPAGE_FAQS = [
  {
    question: 'What are the best sarees for weddings?',
    answer:
      'For weddings, pure silk sarees like Kanjivaram and Banarasi are considered the finest choices. They feature rich zari work, luxurious fabric, and come in auspicious colors like red, maroon, and gold. At Hema Sarees, our Bridal collection is curated specifically for wedding ceremonies and reception events.',
  },
  {
    question: 'Which fabric saree is best for summer?',
    answer:
      'Cotton sarees, mul cotton, and linen sarees are ideal for summer in India. They are breathable, lightweight, and absorb sweat effectively. Chanderi cotton and Tussar silk are also great summer-friendly options that offer elegance without the weight of heavy silk.',
  },
  {
    question: 'How do I choose a saree online?',
    answer:
      'When shopping for sarees online, check the fabric composition, read the product description carefully, view all product images including close-ups, and review customer ratings and reviews. At Hema Sarees, we provide detailed fabric info, occasion guides, and high-quality images for every product.',
  },
  {
    question: 'What is the difference between silk and cotton sarees?',
    answer:
      'Silk sarees have a natural sheen, heavier drape, and are ideal for formal and festive occasions. They require dry cleaning and careful storage. Cotton sarees are lightweight, breathable, easy to wash, and perfect for daily wear and summer. The choice depends on the occasion, comfort preference, and budget.',
  },
  {
    question: 'What saree should I wear for festivals?',
    answer:
      'Festival sarees should be vibrant and comfortable. For Diwali, choose rich silks in red, gold, or green. For Navratri, follow the day-specific color code. For Pongal and Onam, traditional cotton sarees with temple borders are preferred. Art silk sarees offer a great balance of festive look and comfort.',
  },
  {
    question: 'How to care for silk sarees at home?',
    answer:
      'Always dry clean silk sarees when possible. For light cleaning, use cold water with mild detergent and avoid wringing. Dry in shade, never in direct sunlight. Store wrapped in muslin cloth (not plastic) and refold every 6 months to prevent permanent creases. Add neem leaves to prevent insect damage.',
  },
  {
    question: 'Do you deliver sarees across India?',
    answer:
      'Yes, Hema Sarees offers pan-India delivery. We ship all orders within 24-48 hours with secure packaging. Standard delivery takes 3-7 business days. We accept UPI, credit/debit cards, and cash on delivery (COD) for your convenience.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 lg:py-24 bg-surface-muted" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title text-2xl md:text-3xl mb-3">
            Frequently Asked Questions
          </h2>
          <p className="section-subtitle mx-auto">
            Everything you need to know about buying sarees online at Hema Sarees.
          </p>
          <div className="luxury-divider mt-4">
            <span className="luxury-divider-icon" />
          </div>
        </div>

        <div className="space-y-3">
          {HOMEPAGE_FAQS.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-surface-subtle overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="font-serif text-base font-semibold text-ink pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
                  className={`text-ink-faint flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5">
                      <p className="text-sm text-ink-muted leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * FAQ schema data for use in homepage JSON-LD.
 */
export const HOMEPAGE_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOMEPAGE_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};
