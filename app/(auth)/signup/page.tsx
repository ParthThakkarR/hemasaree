'use client';

import React, { useState, useRef, useEffect } from 'react';
import { State, City } from 'country-state-city';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2, ArrowLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// --- Validation Regexes ---
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneRegex = /^\d{10}$/;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'details'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [countdown, setCountdown] = useState(180);
  const [showResend, setShowResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load states on mount
  useEffect(() => {
    setStates(State.getStatesOfCountry('IN'));
  }, []);

  useEffect(() => {
    if (step === 'otp') otpInputs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0 && !showResend) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0 && step === 'otp' && !showResend) {
      setShowResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown, showResend]);

  // Input handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'state') {
      const selectedStateData = State.getStatesOfCountry('IN').find(
        (s) => s.name === value
      );
      if (selectedStateData) {
        setCities(City.getCitiesOfState('IN', selectedStateData.isoCode));
        setFormData((prev) => ({ ...prev, city: '' }));
      }
    }
  };

  // Step 1: Send OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
      setStep('otp');
      setCountdown(180);
      setShowResend(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
      setSuccess('A new OTP has been sent.');
      setCountdown(180);
      setShowResend(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent, autoOtp?: string) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const enteredOtp = (autoOtp || otp.join('')).trim();
    const emailValue = formData.email?.trim().toLowerCase() || '';

    if (!emailValue) {
      setError('Email missing. Please restart signup.');
      setIsLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(enteredOtp)) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue, otp: enteredOtp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed.');

      setSuccess('Email verified successfully!');
      setStep('details');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Key navigation
  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // OTP Change with auto-submit
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      otpInputs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '')) {
      setTimeout(() => {
        const finalOtp = newOtp.join('');
        if (/^\d{6}$/.test(finalOtp)) {
          handleOtpSubmit(e as any, finalOtp);
        }
      }, 200);
    }
  };

  // Create Account
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordRegex.test(formData.password)) {
      setError(
        'Password must be at least 8 characters long and include an uppercase, lowercase, number, and special character.'
      );
      return;
    }
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setIsLoading(true);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      address: {
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        label: 'Home',
      },
    };

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed.');

      setSuccess('Account created! Logging you in...');

      const loginRes = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (loginRes?.error) {
        throw new Error(loginRes.error);
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setError('');
    setOtp(['', '', '', '', '', '']);
    setStep('email');
  };

  // Step progress
  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2;
  const stepLabels = ['Email', 'Verify', 'Details'];

  // Shared input style
  const inputClass = "w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl text-ink placeholder-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-800 focus:border-brand-800 transition-all";
  const selectClass = "w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand-800 focus:border-brand-800 transition-all appearance-none";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Left Panel - Brand Imagery (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-brand-950 text-brand-50 flex-col justify-between p-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 opacity-40">
           <Image 
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800" 
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
            Begin Your <span className="text-accent italic">Journey</span> With Us
          </h2>
          <p className="text-brand-100/80 text-lg leading-relaxed">
            Create an account to track orders, save your wishlist, and receive exclusive offers.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-800 text-accent mb-4 shadow-md">
              <span className="font-serif text-3xl leading-none font-bold">H</span>
            </Link>
            <h1 className="font-serif text-3xl font-bold text-ink mb-2">Create Account</h1>
            <p className="text-ink-muted">Join the Hema Sarees family</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h1 className="font-serif text-4xl font-bold text-ink mb-2">Create Account</h1>
            <p className="text-ink-muted">Join the Hema Sarees family</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {stepLabels.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= stepIndex ? 'bg-brand-800 text-white shadow-md shadow-brand-200' : 'bg-brand-100 text-brand-400'}`}>
                    {i + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:inline ${i <= stepIndex ? 'text-brand-800' : 'text-ink-faint'}`}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`w-8 h-0.5 ${i < stepIndex ? 'bg-brand-800' : 'bg-brand-100'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Back button */}
          {step !== 'email' && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-brand-800 hover:text-brand-900 mb-6 transition-colors font-medium"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                />
              </div>
              <p className="text-sm text-ink-muted">We&apos;ll send a 6-digit verification code to this email.</p>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-800 hover:bg-brand-900 text-white py-3.5 rounded-xl font-semibold shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <><Loader2 size={20} className="animate-spin" /> Sending...</> : <>Send Verification Code <ChevronRight size={18} /></>}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-8">
                <div className="flex-1 h-px bg-brand-100" />
                <span className="text-sm text-ink-muted font-medium">or</span>
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
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={(e) => handleOtpSubmit(e)} className="space-y-6">
              <p className="text-sm text-ink-muted text-center">
                Enter the 6-digit code sent to <span className="font-semibold text-brand-800">{formData.email}</span>
              </p>

              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputs.current[index] = el; }}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-12 h-14 text-center text-xl font-bold bg-surface border-2 border-brand-200 rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-brand-800 focus:border-brand-800 transition-all"
                    required
                  />
                ))}
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-brand-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-800 rounded-full transition-all duration-300"
                  style={{ width: `${(otp.filter((d) => d !== '').length / 6) * 100}%` }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-800 hover:bg-brand-900 text-white py-3.5 rounded-xl font-semibold shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? <><Loader2 size={20} className="animate-spin" /> Verifying...</> : 'Verify Code'}
              </button>

              <div className="text-center text-sm text-ink-muted">
                {!showResend ? (
                  <span>Resend code in <span className="font-semibold text-brand-800">{countdown}s</span></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-brand-800 hover:text-brand-900 font-semibold underline underline-offset-2"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-5">
              {/* Verified Email (read-only) */}
              <div>
                <label className={labelClass}>Verified Email</label>
                <input type="email" value={formData.email} disabled className={`${inputClass} bg-surface-muted text-ink-muted`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 8 chars"
                      required
                      minLength={8}
                      className={`${inputClass} pr-12`}
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-brand-800 transition-colors" onClick={() => setShowPassword(p => !p)}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit number" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Street Address *</label>
                <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} placeholder="Street address" required className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>State *</label>
                  <select name="state" value={formData.state} onChange={handleChange} required className={selectClass}>
                    <option value="">Select state</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>City *</label>
                  <select name="city" value={formData.city} onChange={handleChange} required disabled={!formData.state} className={selectClass}>
                    <option value="">Select city</option>
                    {cities.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-1/2">
                <label className={labelClass}>ZIP Code *</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="ZIP code" required className={inputClass} />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-800 hover:bg-brand-900 text-white py-3.5 rounded-xl font-semibold shadow-md transition-all transform hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? <><Loader2 size={20} className="animate-spin" /> Creating Account...</> : 'Create Account'}
              </button>
            </form>
          )}

          {/* Messages */}
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

          {/* Footer */}
          <p className="text-center text-sm text-ink-muted mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-800 hover:text-brand-900 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}