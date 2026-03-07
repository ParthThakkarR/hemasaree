'use client';

import React, { useState, useRef, useEffect } from 'react';
import { State, City } from 'country-state-city';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../login/page.css';

type StateOption = { name: string; isoCode: string };
type CityOption = { name: string };

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneRegex = /^\d{10}$/;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp' | 'details'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', streetAddress: '', city: '', state: '',
    zipCode: '', country: 'India',
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [countdown, setCountdown] = useState(180);
  const [showResend, setShowResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { setStates(State.getStatesOfCountry('IN')); }, []);
  useEffect(() => { if (step === 'otp') otpInputs.current[0]?.focus(); }, [step]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0 && !showResend) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0 && step === 'otp' && !showResend) {
      setShowResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown, showResend]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'state') {
      const selectedState = State.getStatesOfCountry('IN').find((s) => s.name === value);
      if (selectedState) {
        setCities(City.getCitiesOfState('IN', selectedState.isoCode));
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError(''); setSuccess(''); setIsLoading(true);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e?: React.SyntheticEvent, autoOtp?: string) => {
    e?.preventDefault();
    setError(''); setIsLoading(true);
    const enteredOtp = (autoOtp || otp.join('')).trim();
    const emailValue = formData.email?.trim().toLowerCase() || '';
    if (!emailValue) { setError('Email missing. Please restart signup.'); setIsLoading(false); return; }
    if (!/^\d{6}$/.test(enteredOtp)) { setIsLoading(false); return; }
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpInputs.current[index - 1]?.focus();
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < otp.length - 1) otpInputs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== '')) {
      setTimeout(() => {
        const finalOtp = newOtp.join('');
        if (/^\d{6}$/.test(finalOtp)) void handleOtpSubmit(undefined, finalOtp);
      }, 200);
    }
  };

  // Step 3: Create Account
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be 8+ chars with uppercase, lowercase, number, and special character.');
      return;
    }
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName, lastName: formData.lastName,
          email: formData.email, phone: formData.phone, password: formData.password,
          address: { streetAddress: formData.streetAddress, city: formData.city, state: formData.state, zipCode: formData.zipCode, label: 'Home' },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed.');
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed.');
      setIsLoading(false);
    }
  };

  const goBack = () => { setError(''); setOtp(['', '', '', '', '', '']); setStep('email'); };

  const stepLabel = step === 'email' ? 'Step 1 of 3' : step === 'otp' ? 'Step 2 of 3' : 'Step 3 of 3';
  const progressWidth = step === 'email' ? '33%' : step === 'otp' ? '66%' : '100%';

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: step === 'details' ? '580px' : '440px' }}>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">
          {step === 'email' && 'Enter your email to get started'}
          {step === 'otp' && 'Verify your email address'}
          {step === 'details' && 'Complete your profile'}
        </p>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: progressWidth, height: '100%', background: 'linear-gradient(90deg, #e76f51, #f7c6c7)', borderRadius: 2, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{stepLabel}</span>
        </div>

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <input type="email" name="email" className="form-control" placeholder=" " value={formData.email} onChange={handleChange} required />
              <label className="form-label">Email Address</label>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>We'll send a 6-digit verification code to this email.</p>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <form onSubmit={(e) => handleOtpSubmit(e)}>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem', textAlign: 'center' }}>
              Enter the 6-digit code sent to <strong>{formData.email}</strong>
            </p>
            <div className="otp-box" style={{ marginBottom: '1.2rem' }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputs.current[index] = el; }}
                  type="tel" maxLength={1} value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className="otp-input" required
                />
              ))}
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem', color: '#94a3b8' }}>
              {!showResend ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <button type="button" onClick={handleResendOtp} disabled={isLoading}
                  style={{ background: 'none', border: 'none', color: '#e76f51', fontWeight: 600, cursor: 'pointer' }}>
                  Resend Code
                </button>
              )}
            </div>
            <button type="button" onClick={goBack}
              style={{ display: 'block', margin: '0.75rem auto 0', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
              &larr; Change email
            </button>
          </form>
        )}

        {/* Step 3: Details */}
        {step === 'details' && (
          <form onSubmit={handleDetailsSubmit}>
            <div className="form-group">
              <input type="email" value={formData.email} disabled className="form-control" placeholder=" " />
              <label className="form-label">Verified Email</label>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <input type="text" name="firstName" className="form-control" placeholder=" " value={formData.firstName} onChange={handleChange} required />
                  <label className="form-label">First Name *</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <input type="text" name="lastName" className="form-control" placeholder=" " value={formData.lastName} onChange={handleChange} />
                  <label className="form-label">Last Name</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group" style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} name="password" className="form-control" placeholder=" "
                    value={formData.password} onChange={handleChange} required minLength={8} style={{ paddingRight: '3rem' }} />
                  <label className="form-label">Password *</label>
                  <button type="button" onClick={() => setShowPassword((p) => !p)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <input type="tel" name="phone" className="form-control" placeholder=" " value={formData.phone} onChange={handleChange} />
                  <label className="form-label">Phone Number</label>
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <input type="text" name="streetAddress" className="form-control" placeholder=" " value={formData.streetAddress} onChange={handleChange} required />
                  <label className="form-label">Street Address *</label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <select name="state" className="form-control" value={formData.state} onChange={handleChange} required>
                    <option value="">Select State</option>
                    {states.map((s) => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <select name="city" className="form-control" value={formData.city} onChange={handleChange} required disabled={!formData.state}>
                    <option value="">Select City</option>
                    {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <input type="text" name="zipCode" className="form-control" placeholder=" " value={formData.zipCode} onChange={handleChange} required />
                  <label className="form-label">ZIP Code *</label>
                </div>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary" style={{ marginTop: '0.5rem' }}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {error && <div className="alert alert-danger py-2 text-center mt-3" style={{ fontSize: '0.88rem' }}>{error}</div>}
        {success && <div className="alert alert-success py-2 text-center mt-3" style={{ fontSize: '0.88rem' }}>{success}</div>}

        <p className="text-center mt-3" style={{ fontSize: '0.88rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link href="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
