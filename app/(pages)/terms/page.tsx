export default function TermsAndConditions() {
  return (
    <div className="bg-surface-muted min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-4">Terms & Conditions</h1>
          <div className="w-24 h-1 bg-brand-200 mx-auto rounded-full"></div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-brand-100 p-8 md:p-12 prose max-w-none text-ink-muted">
          <p className="mb-6 italic text-ink-faint">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="font-serif text-2xl font-bold mt-8 mb-4 text-ink">1. Acceptance of Terms</h2>
          <p className="mb-6 leading-relaxed">
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="font-serif text-2xl font-bold mt-8 mb-4 text-ink">2. Products and Pricing</h2>
          <p className="mb-6 leading-relaxed">
            All products and services are subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice.
          </p>

          <h2 className="font-serif text-2xl font-bold mt-8 mb-4 text-ink">3. Returns and Refunds</h2>
          <p className="mb-6 leading-relaxed">
            Our return policy allows for returns within 7 days of delivery, subject to conditions outlined in our detailed Return Policy. Items must be unused and in their original packaging.
          </p>

          <h2 className="font-serif text-2xl font-bold mt-8 mb-4 text-ink">4. User Accounts</h2>
          <p className="mb-6 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.
          </p>

          <h2 className="font-serif text-2xl font-bold mt-8 mb-4 text-ink">5. Limitation of Liability</h2>
          <p className="mb-6 leading-relaxed">
            We shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our services or products.
          </p>
        </div>
      </div>
    </div>
  );
}
