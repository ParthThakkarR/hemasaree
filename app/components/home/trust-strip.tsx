'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, RefreshCw, CreditCard, CheckCircle2, Lock } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Premium Quality', desc: '100% Authentic Fabric' },
  { icon: CheckCircle2, title: 'Quality Checked', desc: 'Hand-inspected before dispatch' },
  { icon: Lock, title: '100% Secure Payments', desc: 'Safe & Encrypted' },
  { icon: Truck, title: 'Secure Shipping', desc: 'Pan-India Delivery' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: CreditCard, title: 'Multiple Options', desc: 'UPI, Cards & COD' },
];

export default function TrustStrip() {
  return (
    <section className="bg-brand-950 text-white py-12 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-brand-900/60 border border-brand-800/50 flex items-center justify-center">
                <feature.icon size={22} className="text-accent" />
              </div>
              <div>
                <h4 className="font-semibold tracking-wide text-sm text-brand-50">{feature.title}</h4>
                <p className="text-xs text-brand-100/60 mt-0.5">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
