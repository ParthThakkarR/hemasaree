'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Image from 'next/image';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'CredentialsSignin') {
        setError('Invalid email or password.');
      } else if (errorParam === 'OAuthCallback' || errorParam === 'Callback') {
        setError('There was a problem signing in with Google. Please try again.');
      } else if (errorParam === 'OAuthAccountNotLinked') {
        setError('To confirm your identity, sign in with the same account you used originally.');
      } else if (errorParam === 'EmailSignin') {
        setError('The e-mail could not be sent.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (res?.error) {
        throw new Error(res.error || 'Login failed.');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Panel - Brand Imagery (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-brand-950 text-brand-50 flex-col justify-between p-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 opacity-40">
           <Image 
              src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35" 
              alt="Brand Imagery" 
              fill
              className="object-cover"
              priority
           />
           <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/60 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-brand-800 text-accent flex items-center justify-center font-serif text-2xl font-bold shadow-md">
                H
             </div>
             <span className="font-serif text-2xl font-bold tracking-wide text-white">Hema Sarees</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="font-serif text-4xl font-bold text-white mb-4 leading-tight">
            Elegance Woven in <span className="text-accent italic">Every Thread</span>
          </h2>
          <p className="text-brand-100/80 text-lg leading-relaxed">
            Experience the finest Indian ethnic wear. Handcrafted sarees for the modern woman who honors tradition.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-800 text-accent mb-4 shadow-md">
              <span className="font-serif text-3xl leading-none font-bold">H</span>
            </Link>
            <h1 className="font-serif text-3xl font-bold text-ink mb-2">Welcome Back</h1>
            <p className="text-ink-muted">Sign in to your Hema Sarees account</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h1 className="font-serif text-4xl font-bold text-ink mb-2">Sign In</h1>
            <p className="text-ink-muted">Welcome back to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-800 focus:border-brand-800 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-ink">Password</label>
                <Link href="/forgot-password" className="text-sm text-brand-800 hover:text-brand-900 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-800 focus:border-brand-800 transition-all pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-brand-800 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 text-center font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-800 hover:bg-brand-900 text-white py-3.5 rounded-xl font-semibold shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-brand-100" />
            <span className="text-sm text-ink-muted font-medium">or continue with</span>
            <div className="flex-1 h-px bg-brand-100" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 bg-surface border border-brand-200 hover:border-brand-300 py-3.5 rounded-xl font-medium text-ink hover:bg-surface-muted transition-all shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-ink-muted mt-8">
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand-800 hover:text-brand-900 font-semibold transition-colors">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-10 h-10 animate-spin text-brand-800" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
