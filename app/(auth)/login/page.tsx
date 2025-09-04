'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import './page.css';

// --- Helper Icons ---
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ emailfirstname: form.email, password: form.password }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      login(data.user);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center">
      <div className="card login-card shadow-lg">
        <div className="card-body">
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold text-dark">Saree Bazaar</h1>
            <p className="text-muted">Welcome back! Please sign in.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-control"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <label className="form-label">Password</label>
                <Link href="/forgot-password" className="small text-danger">
                  Forgot password?
                </Link>
              </div>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="form-control"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="btn btn-outline-secondary"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-danger text-center">{error}</div>
            )}

            {/* Submit */}
            <div className="d-grid">
              <button type="submit" disabled={isLoading} className="btn btn-danger fw-bold">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          <p className="text-center mt-4 small">
            Don’t have an account?{' '}
            <Link href="/signup" className="fw-semibold text-danger">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
