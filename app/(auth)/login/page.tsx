'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import './page.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed.');

      login(data.user);

      if (data.user.isAdmin) router.replace('/admin');
      else router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your Hema Sarees account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              className="form-control"
              placeholder=" "
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <label className="form-label">Email Address</label>
          </div>

          <div className="form-group">
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder=" "
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: '3rem' }}
              />
              <label className="form-label">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#94a3b8',
                  padding: '4px', fontSize: '0.85rem',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="text-end mb-3">
            <Link href="/forgot-password" className="auth-link" style={{ fontSize: '0.85rem' }}>
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="alert alert-danger py-2 text-center" style={{ fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4" style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="auth-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
