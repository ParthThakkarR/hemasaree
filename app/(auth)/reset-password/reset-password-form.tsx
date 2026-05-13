'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// --- Validation Regex (for password complexity) ---
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// --- Helper Icons for Password Toggle ---
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);


export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- State Management ---
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // --- MODIFIED: Separate state for each password field ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get the token from the URL's query parameters when the page loads
  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      setError("No reset token found. Please request a new reset link.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Frontend Validation ---
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("Password: min 8 chars, with uppercase, lowercase, number, and special character.");
      return;
    }
    if (!token) {
      setError("Missing reset token. Please request a new reset link.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setSuccess("Password has been reset successfully! Redirecting to login...");
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // --- MODIFIED: Separate toggle functions for each input ---
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Reset Your Password</h1>
        
        {!success && token ? (
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-10 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" 
                        required 
                    />
                    <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-10 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" 
                        required 
                    />
                     <button type="button" onClick={toggleConfirmPasswordVisibility} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
              </div>
              <div className="pt-2">
                  <button type="submit" disabled={isLoading} className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors">
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
              </div>
          </form>
        ) : null}

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {success && <p className="text-green-500 text-center mt-4">{success}</p>}
        
        <p className="text-center text-sm text-gray-600 mt-4">
          <Link href="/login" className="font-medium text-red-500 hover:underline">Back to Sign in</Link>
        </p>
      </div>
    </div>
  );
}

