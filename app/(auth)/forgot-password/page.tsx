'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Your Password?</h1>
        <p className="text-sm text-gray-600 mb-6">No problem. Enter your email below and we'll send you a link to reset it.</p>
        
        <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
                type="email" 
                name="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" 
                required 
            />
            <div className="mt-6">
                <button type="submit" disabled={isLoading} className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors">
                    {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
            </div>
        </form>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {success && <p className="text-green-500 text-center mt-4">{success}</p>}
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Remembered your password? <a href="/login" className="font-medium text-red-500 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
