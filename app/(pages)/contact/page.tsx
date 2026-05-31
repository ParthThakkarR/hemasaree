import React from 'react';
import { Mail, MapPin, Phone, Clock, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hemasaree.vercel.app';

  // Organization schema for contact page
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hema Sarees',
    url: baseUrl,
  };

  return (
    <div className="bg-surface min-h-screen pt-32 lg:pt-40 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-muted border border-surface-subtle text-ink-muted text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            We&apos;re Here to Help
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-ink mb-6 leading-tight">
            Get in Touch
          </h1>
          <p className="text-lg text-ink-muted leading-relaxed">
            Have a question about our sarees, need styling advice, or want to track your order? 
            We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            {/* Email */}
            <div className="flex gap-4 p-6 bg-white rounded-2xl border border-surface-subtle shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center flex-shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-1">Email Us</h3>
                <p className="text-sm text-ink-muted mb-2">We typically respond within 24 hours.</p>
                {/* TODO: Add verified business email */}
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4 p-6 bg-white rounded-2xl border border-surface-subtle shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center flex-shrink-0">
                <Phone size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-1">Call Us</h3>
                <p className="text-sm text-ink-muted mb-2">Mon-Sat, 10am-7pm IST</p>
                {/* TODO: Replace with actual phone number */}
                <p className="text-brand-800 font-medium text-sm">Coming soon</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex gap-4 p-6 bg-white rounded-2xl border border-surface-subtle shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center flex-shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-1">Visit Us</h3>
                {/* TODO: Replace with actual business address */}
                <p className="text-sm text-ink-muted">India</p>
              </div>
            </div>

            {/* Business Hours */}
            <div className="flex gap-4 p-6 bg-white rounded-2xl border border-surface-subtle shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center flex-shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-ink mb-1">Business Hours</h3>
                <div className="text-sm text-ink-muted space-y-1">
                  <p>Monday – Saturday: 10:00 AM – 7:00 PM IST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-surface-subtle p-8 shadow-card">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare size={20} className="text-brand-800" />
              <h2 className="text-xl font-serif font-bold text-ink">Send us a Message</h2>
            </div>

            {/* TODO: Connect this form to an API endpoint (e.g., /api/contact) */}
            <form className="space-y-5">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-ink mb-1.5">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all placeholder:text-ink-faint"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-ink mb-1.5">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all placeholder:text-ink-faint"
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-ink mb-1.5">
                  Subject
                </label>
                <select
                  id="contact-subject"
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all text-ink"
                >
                  <option value="">Select a topic</option>
                  <option value="order">Order Inquiry</option>
                  <option value="product">Product Question</option>
                  <option value="styling">Styling Advice</option>
                  <option value="returns">Returns & Exchange</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-ink mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all placeholder:text-ink-faint resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-brand-800 hover:bg-brand-900 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-brand-sm"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
