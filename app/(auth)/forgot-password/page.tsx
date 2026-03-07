'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import '../login/page.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) { setError('Please enter your email address.'); return; }

    setIsLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send reset link.');
      setSuccess(data.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Forgot Password?</h1>
        <p className="auth-subtitle">
          Enter your email and we will send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              className="form-control"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="form-label">Email Address</label>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {error && <div className="alert alert-danger py-2 text-center mt-3" style={{ fontSize: '0.88rem' }}>{error}</div>}
        {success && <div className="alert alert-success py-2 text-center mt-3" style={{ fontSize: '0.88rem' }}>{success}</div>}

        <p className="text-center mt-4" style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Remember your password?{' '}
          <Link href="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
