export default function PrivacyPolicy() {
  return (
    <div className="bg-surface-muted min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-4">Privacy Policy</h1>
          <div className="w-24 h-1 bg-brand-200 mx-auto rounded-full"></div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-brand-100 p-8 md:p-12 prose max-w-none text-ink-muted">
          <p className="mb-6 italic text-ink-faint">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="font-serif text-2xl font-bold mt-8 mb-4 text-ink">1. Information We Collect</h2>
          <p className="mb-6 leading-relaxed">
            We collect information that you provide directly to us when you create an account, make a purchase, or communicate with us. This may include your name, email address, phone number, shipping address, and payment information.
          </p>

          <h2 className="font-serif text-2xl font-bold mt-8 mb-4 text-ink">2. How We Use Your Information</h2>
          <p className="mb-6 leading-relaxed">
            We use the information we collect to fulfill your orders, provide customer support, improve our services, and send you promotional communications (if you have opted in).
          </p>

          <h2 className="font-serif text-2xl font-bold mt-8 mb-4 text-ink">3. Information Sharing</h2>
          <p className="mb-6 leading-relaxed">
            We do not sell your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
          </p>

          <h2 className="font-serif text-2xl font-bold mt-8 mb-4 text-ink">4. Cookies and Tracking</h2>
          <p className="mb-6 leading-relaxed">
            We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve and analyze our service.
          </p>

          <h2 className="font-serif text-2xl font-bold mt-8 mb-4 text-ink">5. Data Security</h2>
          <p className="mb-6 leading-relaxed">
            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. We strive to use commercially acceptable means to protect your personal information.
          </p>
        </div>
      </div>
    </div>
  );
}

