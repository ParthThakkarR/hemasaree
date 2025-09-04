'use client';

import React, { useState, useRef, useEffect } from 'react';
import { State, City } from 'country-state-city';
import { useRouter } from 'next/navigation';
import './page.css'; 

// --- Helper Icons ---
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="m22 2-11 11" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    password: '', streetAddress: '', city: '',
    state: '', zipCode: '', country: 'India',
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [countdown, setCountdown] = useState(180);
  const [showResend, setShowResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setStates(State.getStatesOfCountry('IN'));
  }, []);

  useEffect(() => {
    if (step === 'otp') otpInputs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0 && step === 'otp') {
      setShowResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'state') {
      const selectedStateData = State.getStatesOfCountry('IN').find(s => s.name === value);
      if (selectedStateData) {
        setCities(City.getCitiesOfState('IN', selectedStateData.isoCode));
        setFormData(prev => ({ ...prev, city: '' }));
      }
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      setStep('otp'); setCountdown(180); setShowResend(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const enteredOtp = otp.join('');
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: enteredOtp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed.');
      setStep('details');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    const fullAddress = `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
    const payload = { ...formData, address: fullAddress };
    try {
      const res = await fetch('/api/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed.');
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);
  const goBack = () => { setError(''); setOtp(['', '', '', '', '', '']); setStep('email'); };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="signup-box card shadow-lg p-4 w-100">
        
        {step === 'otp' && (
          <button onClick={goBack} className="btn btn-link d-flex align-items-center mb-3">
            <ArrowLeftIcon /> <span className="ms-1">Back</span>
          </button>
        )}

        <h1 className="h4 fw-bold mb-4">{step === 'details' ? 'Complete Your Account' : 'Create an Account'}</h1>

        {/* --- Step 1: Email --- */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <label className="form-label">Email Address *</label>
            <p className="small text-muted mb-2">We'll send a verification code to this email.</p>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="form-control mb-3" required />
            <button type="submit" disabled={isLoading} className="btn btn-danger w-100">
              {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* --- Step 2: OTP --- */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            <label className="form-label">Verification Code *</label>
            <p className="small text-muted mb-2">Enter the 6-digit code sent to {formData.email}.</p>
            <div className="d-flex gap-2 mb-3">
              {otp.map((digit, index) => (
                <input key={index} ref={el => { otpInputs.current[index] = el }} type="tel" maxLength={1} value={digit}
                  onChange={(e) => {
                    const newOtp = [...otp]; newOtp[index] = e.target.value.slice(-1); setOtp(newOtp);
                    if (e.target.value && index < otp.length - 1) otpInputs.current[index + 1]?.focus();
                  }}
                  className="form-control text-center fs-4 otp-input"
                  required />
              ))}
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-danger w-100">
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
            <div className="mt-3 small text-muted">
              {!showResend ? (
                <>Resend available in {countdown}s</>
              ) : (
                <button type="button" onClick={() => {}} className="btn btn-link p-0">Resend OTP</button>
              )}
            </div>
          </form>
        )}

        {/* --- Step 3: Details --- */}
        {step === 'details' && (
          <form onSubmit={handleDetailsSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Verified Email</label>
                <input type="email" value={formData.email} className="form-control" disabled />
              </div>
              <div className="col-md-6">
                <label className="form-label">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-control" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Password *</label>
                <div className="input-group">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="form-control" required minLength={8} />
                  <button type="button" className="btn btn-outline-secondary" onClick={togglePasswordVisibility}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" placeholder="+91..." />
              </div>
              <div className="col-12">
                <label className="form-label">Street Address *</label>
                <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">State *</label>
                <select name="state" value={formData.state} onChange={handleChange} className="form-select" required>
                  <option value="">Select a state</option>
                  {states.map((s) => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">City *</label>
                <select name="city" value={formData.city} onChange={handleChange} className="form-select" required disabled={!formData.state}>
                  <option value="">Select a city</option>
                  {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">ZIP Code *</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="form-control" required />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-danger w-100 mt-3">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {error && <p className="text-danger text-center mt-3">{error}</p>}
        {success && <p className="text-success text-center mt-3">{success}</p>}
        <p className="text-center small mt-3">Already have an account? <a href="/login" className="text-danger fw-bold">Sign in</a></p>
      </div>
    </div>
  );
}
