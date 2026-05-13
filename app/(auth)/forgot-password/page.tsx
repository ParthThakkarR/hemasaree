'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
        setError("Please enter your email address.");
        return;
    }
    
    setIsLoading(true);
    try {
        const res = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Failed to send reset link.');
        }

        // We show the same success message whether the email exists or not for security
        setSuccess(data.message);

    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center px-4 py-12 pt-24 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-brand-100 p-8 md:p-10">
        
        <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-800 text-accent mb-4 shadow-md">
              <span className="font-serif text-3xl leading-none font-bold">H</span>
            </Link>
            <h1 className="font-serif text-3xl font-bold text-ink mb-2">Reset Password</h1>
            <p className="text-ink-muted">Enter your email and we&apos;ll send you a link to reset your password.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email Address</label>
              <input 
                  type="email" 
                  name="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-800 focus:border-brand-800 transition-all" 
                  required 
              />
            </div>
            
            <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-brand-800 hover:bg-brand-900 text-white py-3.5 rounded-xl font-semibold shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {isLoading ? <><Loader2 size={20} className="animate-spin" /> Sending Link...</> : 'Send Reset Link'}
            </button>
        </form>

        {error && (
            <div className="mt-6 bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 text-center font-medium">
              {error}
            </div>
        )}
        {success && (
            <div className="mt-6 bg-green-50 text-green-700 text-sm p-4 rounded-xl border border-green-100 text-center font-medium">
              {success}
            </div>
        )}
        
        <p className="text-center text-sm text-ink-muted mt-8">
          Remembered your password?{' '}
          <Link href="/login" className="text-brand-800 hover:text-brand-900 font-semibold transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

