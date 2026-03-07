// 'use client';

// import React, { useState, useRef, useEffect } from 'react';
// import { State, City } from 'country-state-city';
// import { useRouter } from 'next/navigation';
// import './page.css';

// // --- Validation Regexes ---
// const passwordRegex =
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// const phoneRegex = /^\d{10}$/;

// // --- Icons (Unchanged) ---
// const SendIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="20"
//     height="20"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="m22 2-7 20-4-9-9-4Z" />
//     <path d="m22 2-11 11" />
//   </svg>
// );
// const ArrowLeftIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="20"
//     height="20"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="m12 19-7-7 7-7" />
//     <path d="M19 12H5" />
//   </svg>
// );
// const EyeIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="20"
//     height="20"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
//     <circle cx="12" cy="12" r="3" />
//   </svg>
// );
// const EyeOffIcon = () => (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="20"
//     height="20"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
//     <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
//     <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
//     <line x1="2" x2="22" y1="2" y2="22" />
//   </svg>
// );

// export default function SignupPage() {
//   const router = useRouter();
//   const [step, setStep] = useState('email');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     password: '',
//     streetAddress: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     country: 'India',
//   });

//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
//   const [states, setStates] = useState<any[]>([]);
//   const [cities, setCities] = useState<any[]>([]);
//   const [countdown, setCountdown] = useState(180);
//   const [showResend, setShowResend] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   // --- Load states on mount ---
//   useEffect(() => {
//     setStates(State.getStatesOfCountry('IN'));
//   }, []);

//   useEffect(() => {
//     if (step === 'otp') otpInputs.current[0]?.focus();
//   }, [step]);

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (step === 'otp' && countdown > 0 && !showResend) {
//       timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
//     } else if (countdown === 0 && step === 'otp' && !showResend) {
//       setShowResend(true);
//     }
//     return () => clearInterval(timer);
//   }, [step, countdown, showResend]);

//   // --- Input Handlers ---
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (name === 'state') {
//       const selectedStateData = State.getStatesOfCountry('IN').find(
//         (s) => s.name === value
//       );
//       if (selectedStateData) {
//         setCities(City.getCitiesOfState('IN', selectedStateData.isoCode));
//         setFormData((prev) => ({ ...prev, city: '' }));
//       }
//     }
//   };

//   // --- Step 1: Send OTP ---
//   const handleEmailSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);
//     try {
//       const res = await fetch('/api/send-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: formData.email }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
//       setStep('otp');
//       setCountdown(180);
//       setShowResend(false);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- Step 2: Resend OTP ---
//   const handleResendOtp = async () => {
//     setError('');
//     setSuccess('');
//     setIsLoading(true);
//     try {
//       const res = await fetch('/api/send-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: formData.email }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');
//       setSuccess('A new OTP has been sent.');
//       setCountdown(180);
//       setShowResend(false);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- Step 3: Verify OTP ---
//   const handleOtpSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);
//     const enteredOtp = otp.join('');
//     try {
//       const res = await fetch('/api/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: formData.email, otp: enteredOtp }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'OTP verification failed.');
//       setStep('details');
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- Step 4: Create Account ---
//   const handleDetailsSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');

//     if (!passwordRegex.test(formData.password)) {
//       setError(
//         'Password must be at least 8 characters long and include an uppercase, lowercase, number, and special character.'
//       );
//       return;
//     }
//     if (formData.phone && !phoneRegex.test(formData.phone)) {
//       setError('Phone number must be exactly 10 digits.');
//       return;
//     }

//     setIsLoading(true);

//     // ✅ Proper address object for Prisma
//     const payload = {
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       email: formData.email,
//       phone: formData.phone,
//       password: formData.password,
//       address: {
//         streetAddress: formData.streetAddress,
//         city: formData.city,
//         state: formData.state,
//         zipCode: formData.zipCode,
//         label: 'Home',
//       },
//     };

//     try {
//       const res = await fetch('/api/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Signup failed.');
//       setSuccess('Account created! Redirecting to login...');
//       setTimeout(() => router.push('/login'), 2000);
//     } catch (err: any) {
//       setError(err.message);
//       setIsLoading(false);
//     }
//   };

//   // --- OTP Navigation ---
//   const handleOtpKeyDown = (
//     e: React.KeyboardEvent<HTMLInputElement>,
//     index: number
//   ) => {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       otpInputs.current[index - 1]?.focus();
//     }
//   };

//   const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
//   const goBack = () => {
//     setError('');
//     setOtp(['', '', '', '', '', '']);
//     setStep('email');
//   };

//   // --- UI ---
//   return (
//     <div className="container d-flex align-items-center justify-content-center min-vh-100">
//       <div className="signup-box card shadow-lg p-4 w-100">
//         {step === 'otp' && (
//           <button
//             onClick={goBack}
//             className="btn btn-link d-flex align-items-center mb-3"
//           >
//             <ArrowLeftIcon /> <span className="ms-1">Back</span>
//           </button>
//         )}

//         <h1 className="h4 fw-bold mb-4">
//           {step === 'details' ? 'Complete Your Account' : 'Create an Account'}
//         </h1>

//         {/* --- Step 1: Email --- */}
//         {step === 'email' && (
//           <form onSubmit={handleEmailSubmit}>
//             <label className="form-label">Email Address *</label>
//             <p className="small text-muted mb-2">
//               We'll send a verification code to this email.
//             </p>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="you@example.com"
//               className="form-control mb-3"
//               required
//             />
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="btn btn-danger w-100"
//             >
//               {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
//             </button>
//           </form>
//         )}

//         {/* --- Step 2: OTP --- */}
//         {step === 'otp' && (
//           <form onSubmit={handleOtpSubmit}>
//             <label className="form-label">Verification Code *</label>
//             <p className="small text-muted mb-2">
//               Enter the 6-digit code sent to {formData.email}.
//             </p>
//             <div className="d-flex gap-2 mb-3">
//               {otp.map((digit, index) => (
//                 <input
//                   key={index}
//                   ref={(el) => {
//                     otpInputs.current[index] = el;
//                   }}
//                   type="tel"
//                   maxLength={1}
//                   value={digit}
//                   onChange={(e) => {
//                     const newOtp = [...otp];
//                     newOtp[index] = e.target.value.slice(-1);
//                     setOtp(newOtp);
//                     if (e.target.value && index < otp.length - 1) {
//                       otpInputs.current[index + 1]?.focus();
//                     }
//                     if (e.target.value && index === otp.length - 1) {
//                       handleOtpSubmit(e as any);
//                     }
//                   }}
//                   onKeyDown={(e) => handleOtpKeyDown(e, index)}
//                   className="form-control text-center fs-4 otp-input"
//                   required
//                 />
//               ))}
//             </div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="btn btn-danger w-100"
//             >
//               {isLoading ? 'Verifying...' : 'Verify'}
//             </button>
//             <div className="mt-3 small text-muted">
//               {!showResend ? (
//                 <>Resend available in {countdown}s</>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={handleResendOtp}
//                   disabled={isLoading}
//                   className="btn btn-link p-0"
//                 >
//                   Resend OTP
//                 </button>
//               )}
//             </div>
//           </form>
//         )}

//         {/* --- Step 3: Details --- */}
//         {step === 'details' && (
//           <form onSubmit={handleDetailsSubmit}>
//             <div className="row g-3">
//               <div className="col-12">
//                 <label className="form-label">Verified Email</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   className="form-control"
//                   disabled
//                 />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">First Name *</label>
//                 <input
//                   type="text"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   className="form-control"
//                   required
//                 />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">Last Name</label>
//                 <input
//                   type="text"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                   className="form-control"
//                 />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">Password *</label>
//                 <div className="input-group">
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     className="form-control"
//                     required
//                     minLength={8}
//                   />
//                   <button
//                     type="button"
//                     className="btn btn-outline-secondary"
//                     onClick={togglePasswordVisibility}
//                   >
//                     {showPassword ? <EyeOffIcon /> : <EyeIcon />}
//                   </button>
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">Phone Number</label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className="form-control"
//                   placeholder="10 digits only"
//                 />
//               </div>
//               <div className="col-12">
//                 <label className="form-label">Street Address *</label>
//                 <input
//                   type="text"
//                   name="streetAddress"
//                   value={formData.streetAddress}
//                   onChange={handleChange}
//                   className="form-control"
//                   required
//                 />
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">State *</label>
//                 <select
//                   name="state"
//                   value={formData.state}
//                   onChange={handleChange}
//                   className="form-select"
//                   required
//                 >
//                   <option value="">Select a state</option>
//                   {states.map((s) => (
//                     <option key={s.isoCode} value={s.name}>
//                       {s.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">City *</label>
//                 <select
//                   name="city"
//                   value={formData.city}
//                   onChange={handleChange}
//                   className="form-select"
//                   required
//                   disabled={!formData.state}
//                 >
//                   <option value="">Select a city</option>
//                   {cities.map((c) => (
//                     <option key={c.name} value={c.name}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-6">
//                 <label className="form-label">ZIP Code *</label>
//                 <input
//                   type="text"
//                   name="zipCode"
//                   value={formData.zipCode}
//                   onChange={handleChange}
//                   className="form-control"
//                   required
//                 />
//               </div>
//             </div>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="btn btn-danger w-100 mt-3"
//             >
//               {isLoading ? 'Creating Account...' : 'Create Account'}
//             </button>
//           </form>
//         )}

//         {error && <p className="text-danger text-center mt-3">{error}</p>}
//         {success && <p className="text-success text-center mt-3">{success}</p>}
//         <p className="text-center small mt-3">
//           Already have an account?{' '}
//           <a href="/login" className="text-danger fw-bold">
//             Sign in
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }


'use client';

import React, { useState, useRef, useEffect } from 'react';
import { State, City } from 'country-state-city';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Validation Regexes (Unchanged) ---
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phoneRegex = /^\d{10}$/;

// --- Custom CSS: Fused Oracle (page.css + Sanctum Refinements) ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;500;600&family=Georgia:ital@1&display=swap');
  :root {
    --primary: #e76f51;
    --primary-light: #f7c6c7;
    --bg-gradient: linear-gradient(135deg, #fdf6f0 0%, #f7c6c7 100%);
    --glass: rgba(255, 255, 255, 0.25);
    --shadow: 0 8px 32px rgba(231, 111, 81, 0.2);
    --text: #1e293b;
    --success: #10b981;
    --error: #ef4444;
    --phi: 1.618;
    --phi2: calc(var(--phi) * var(--phi));
    --phi-1: calc(1 / var(--phi));
    --phi-2: calc(var(--phi-1) * var(--phi-1));
    --unit: 1rem;
    --s-xs: calc(var(--unit) * var(--phi-2));
    --s-sm: calc(var(--unit) * var(--phi-1));
    --s-md: var(--unit);
    --s-lg: calc(var(--unit) * var(--phi));
    --s-xl: calc(var(--unit) * var(--phi2));
    --text-sm: calc(0.875rem * var(--phi-1));
    --text-base: 1rem;
    --text-lg: calc(1rem * var(--phi));
    --text-xl: calc(1rem * var(--phi2));
    --heading-lg: calc(2rem * var(--phi));
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg-gradient);
    min-height: 100vh;
    color: var(--text);
    overflow-x: hidden;
    position: relative;
  }
  .motif-drift {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><path d="M0 10 Q25 5 50 10 T100 10" stroke="%23f7c6c7" stroke-width="0.5" fill="none" opacity="0.03"/></svg>');
    background-size: 150px 20px; pointer-events: none; z-index: 0;
    animation: driftWeave 25s linear infinite;
  }
  @keyframes driftWeave { 0% { background-position: 0 0; } 100% { background-position: 150px 20px; } }
  .odyssey-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  align-items: center;
  justify-content: center;
  gap: var(--s-xl);
  padding: var(--s-xl);
}
.legacy-lore {
  padding-block: calc(var(--s-lg) * 1.5);
}
.lore-weave p {
  line-height: 1.6;
  max-width: 90%;
}

  @media (min-width: 768px) {
    .odyssey-container { grid-template-columns: calc(100% * var(--phi-1)) 1fr; }
    .legacy-lore { grid-column: 2; }
    .ritual-chamber { grid-column: 1; }
  }
  .legacy-lore {
    background: var(--glass);
    backdrop-filter: blur(16px);
    border-radius: var(--s-sm); padding: var(--s-xl);
    display: flex; flex-direction: column; justify-content: center;
    order: 1; position: relative; overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  @media (min-width: 768px) { .legacy-lore { order: 2; } }
  .legacy-lore::before {
    content: ''; position: absolute; top: -40%; right: -40%;
    width: 180%; height: 180%; background: radial-gradient(circle, var(--primary) 0%, transparent 50%);
    opacity: 0.06; animation: lorePulse 5s ease-in-out infinite;
  }
  @keyframes lorePulse { 0%, 100% { opacity: 0.06; transform: scale(1); } 50% { opacity: 0.1; transform: scale(1.08); } }
  .lore-weave h1 {
    font-family: 'Playfair Display', serif; font-size: var(--heading-lg); color: var(--primary);
    margin-bottom: var(--s-sm); font-style: italic;
    animation: weaveUnfurl 1.8s ease-out 0.4s both;
  }
  @keyframes weaveUnfurl { from { opacity: 0; transform: translateX(-25px) rotate(-3deg); } to { opacity: 1; transform: translateX(0) rotate(0); } }
  .lore-weave p { font-size: var(--text-lg); opacity: 0.9; max-width: 92%; animation: silkFade 2.2s ease-out 0.9s both; color: #64748b; }
  @keyframes silkFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
 .ritual-chamber {
  max-width: 500px;
  margin: 0 auto;
  padding: var(--s-lg) var(--s-xl);
}

  @media (min-width: 768px) { .ritual-chamber { order: 1; } }
  @keyframes chamberRise { from { opacity: 0; transform: translateY(35px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .chamber-step { display: none; animation: stepReveal 0.8s ease-out; }
  .chamber-step.active { display: block; }
  @keyframes stepReveal { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .chamber-step h2 {
    font-family: 'Playfair Display', serif; font-size: var(--text-xl); margin-bottom: var(--s-lg);
    position: relative; animation: titleWeave 1.1s ease-out; color: var(--primary);
  }
  @keyframes titleWeave { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  .chamber-step h2::after {
    content: ''; position: absolute; left: 0; bottom: -0.4rem;
    width: calc(100% * var(--phi-1)); height: 2px; background: var(--primary);
    border-radius: 1px; animation: phiBloom 1.1s ease-out 0.6s both;
  }
  @keyframes phiBloom { from { width: 0; transform: skewX(-15deg); } to { width: calc(100% * 0.618); transform: skewX(0); } }
  .form-group { position: relative; margin-bottom: var(--s-lg); animation: fieldBloom 0.6s ease-out forwards; z-index: 1; }
  .form-group:nth-child(1) { animation-delay: 0.3s; }
  input, select { width: 100%; padding: 1rem 1rem 0.75rem; font-size: var(--text-base);
    background: rgba(255, 255, 255, 0.8); border: 1.5px solid #e2e8f0; border-radius: 12px;
    color: var(--text); transition: all 0.3s ease; position: relative; z-index: 2; }
  input:focus, select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(231, 111, 81, 0.2); transform: scaleX(1.01); }
  label { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: var(--text-base); color: #94a3b8;
    pointer-events: none; transition: all 0.2s ease; background: transparent; padding: 0 0.25rem; z-index: 3; }
  input:focus ~ label, input:not(:placeholder-shown) ~ label, select:focus ~ label, select:not([value=""]) ~ label { 
    top: 0; font-size: var(--text-sm); color: var(--primary); background: white; transform: translateY(-50%) scale(0.85); z-index: 4; }
  @keyframes fieldBloom { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
.otp-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
}
.otp-input {
  transition: transform 0.2s ease;
}
.otp-input:focus {
  transform: scale(1.05);
}

  .legacy-selector { display: flex; gap: var(--s-xs); margin-bottom: var(--s-lg); }
  .legacy-option { flex: 1; padding: var(--s-sm); background: var(--secondary-bg); border: 1px solid rgba(247, 198, 199, 0.3);
    border-radius: var(--s-xs); text-align: center; font-size: var(--text-sm); cursor: pointer; transition: all 0.3s; }
  .legacy-option:hover, .legacy-option.selected { background: var(--primary-light); border-color: var(--primary); }
  @media (max-width: 480px) { .legacy-selector, .otp-container { flex-direction: column; } .otp-input { width: 100%; } }
  .progress-orb { height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: var(--s-sm); overflow: hidden; }
  .orb-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-light)); width: 0%; transition: width 0.4s ease; border-radius: 2px; }
  .invoke-btn {
    background: linear-gradient(135deg, var(--primary), #d85a40); border: none; border-radius: 12px; padding: 0.9rem;
    font-weight: 600; color: white; font-size: var(--text-base); width: 100%; transition: all 0.3s ease; position: relative; overflow: hidden;
  }
  .invoke-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(231, 111, 81, 0.3); }
  .invoke-btn:active { transform: translateY(0); }
  .invoke-btn::after { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0; background: rgba(255,255,255,0.3); border-radius: 50%; transform: translate(-50%, -50%); transition: width 0.6s, height 0.6s; }
  .invoke-btn:active::after { width: 300px; height: 300px; }
  .invoke-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .back-btn { color: var(--primary); text-decoration: none; font-size: var(--text-sm); display: flex; align-items: center; gap: var(--s-xs); margin-bottom: var(--s-sm); font-weight: 500; transition: color 0.2s; }
  .back-btn:hover { color: #d85a40; }
  .error-msg { color: var(--error); text-align: center; margin-top: var(--s-sm); font-size: var(--text-sm); }
  .success-msg { color: var(--success); text-align: center; margin-top: var(--s-sm); font-size: var(--text-sm); }
  .timer { font-size: var(--text-sm); color: var(--primary); }
  .success-veil { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(247, 198, 199, 0.95);
    display: none; align-items: center; justify-content: center; z-index: 10; text-align: center; color: var(--text); }
  .confetti-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9; display: none; }
  .login-redirect { background: var(--primary); color: white; padding: var(--s-md); border-radius: var(--s-xs); text-decoration: none; margin-top: var(--s-lg); display: inline-block; font-weight: 500; transition: all 0.2s; }
  .login-redirect:hover { background: #d85a40; }
  .row { display: flex; flex-wrap: wrap; margin-right: calc(-0.5 * var(--s-sm)); margin-left: calc(-0.5 * var(--s-sm)); margin-top: calc(-1 * var(--s-sm)); margin-bottom: calc(-1 * var(--s-sm)); }
  .row > * { padding-right: calc(var(--s-sm) / 2); padding-left: calc(var(--s-sm) / 2); padding-top: var(--s-sm); padding-bottom: var(--s-sm); flex: 0 0 auto; width: 50%; }
  @media (max-width: 767.98px) { .row > * { width: 100%; } }
  .position-relative { position: relative; }
  .position-absolute { position: absolute; }
  .position-relative .btn-outline-secondary {
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin-top: 0 !important;
  right: 1rem !important;
}

  .end-0 { right: 0; }
  .top-50 { top: 50%; }
  .translate-middle-y { transform: translateY(-50%); }
  .mt-2 { margin-top: 0.5rem; }
  .mb-3 { margin-bottom: 1rem; }
  .mt-3 { margin-top: 1rem; }
  .small { font-size: var(--text-sm); }
  .text-muted { opacity: 0.7; color: #64748b; }
  .text-center { text-align: center; }
  .w-100 { width: 100%; }
  .btn-link { color: var(--text); text-decoration: none; background: none; border: none; font-weight: 500; }
  .p-0 { padding: 0; }
  .fs-4 { font-size: 1.5rem; }
  .fw-bold { font-weight: 600; }
  .gap-2 { gap: 0.5rem; }
  @media (max-width: 480px) {
    :root { --unit: 0.95rem; }
    .odyssey-container { padding: var(--s-md); gap: var(--s-md); }
    .ritual-chamber, .legacy-lore { padding: var(--s-lg); }
    .lore-weave h1 { font-size: calc(var(--heading-lg) * 0.88); }
  }
  .icon { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; display: block; flex-shrink: 0; }
  .icon-arrow-left path:first-of-type { d: "m12 19-7-7 7-7"; }
  .icon-arrow-left path:last-of-type { d: "M19 12H5"; }
  .icon-eye path:first-of-type { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"; }
  .icon-eye circle { cx: "12"; cy: "12"; r: "3"; }
  .icon-eye-off path:nth-of-type(1) { d: "M9.88 9.88a3 3 0 1 0 4.24 4.24"; }
  .icon-eye-off path:nth-of-type(2) { d: "M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"; }
  .icon-eye-off path:nth-of-type(3) { d: "M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"; }
  .icon-eye-off line { x1: "2"; x2: "22"; y1: "2"; y2: "22"; }
`;

// Inject Styles
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('sanctum-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'sanctum-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

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
  const [selectedLegacy, setSelectedLegacy] = useState<string>('');

  // --- Load States on Mount (Unchanged) ---
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

  // --- Input Handlers (Unchanged) ---
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

  // --- Legacy Selector ---
  const handleLegacySelect = (value: string) => {
    setSelectedLegacy(value);
  };

  // --- Step 1: Send OTP (Unchanged) ---
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

  // --- Step 2: Resend OTP (Unchanged) ---
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

  // --- Step 3: Verify OTP (Unchanged) ---
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
    // silently ignore incomplete auto-submit
    setIsLoading(false);
    return;
  }

  try {
    console.log("📤 Sending OTP:", { email: emailValue, otp: enteredOtp });
    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailValue, otp: enteredOtp }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'OTP verification failed.');

    setSuccess('✅ Email verified successfully!');
    setStep('details');
  } catch (err: any) {
    console.error('❌ OTP Verify Error:', err.message);
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
  // --- OTP Key Navigation (Unchanged) ---
 const handleOtpKeyDown = (
  e: React.KeyboardEvent<HTMLInputElement>,
  index: number
) => {
  if (e.key === 'Backspace' && !otp[index] && index > 0) {
    otpInputs.current[index - 1]?.focus();
  }
};
  // --- OTP Change: Detailed 6-Digit Chambers with Auto-Focus & Submit ---
  const handleOtpChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  index: number
) => {
  const value = e.target.value.replace(/\D/g, '').slice(0, 1);
  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);

  // Move focus to next input if filled
  if (value && index < otp.length - 1) {
    otpInputs.current[index + 1]?.focus();
  }

  // ✅ Small delay to ensure final state is set before submit
  if (newOtp.every((d) => d !== '')) {
    setTimeout(() => {
      const finalOtp = newOtp.join('');
      if (/^\d{6}$/.test(finalOtp)) {
        console.log("🧩 Auto-submitting OTP:", finalOtp);
        handleOtpSubmit(e as any, finalOtp); // pass otp explicitly
      }
    }, 200); // 200ms ensures React updates state fully
  }
};



  // --- Step 4: Create Account (Unchanged) ---
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
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const goBack = () => {
    setError('');
    setOtp(['', '', '', '', '', '']);
    setStep('email');
  };

  const goBackToOtp = () => setStep('otp');

  // --- Render Icons (SVG Components, Unchanged) ---
  const SendIcon = () => (
    <svg className="icon icon-send" viewBox="0 0 24 24">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="m22 2-11 11" />
    </svg>
  );
  const ArrowLeftIcon = () => (
    <svg className="icon icon-arrow-left" viewBox="0 0 24 24">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
  const EyeIcon = () => (
    <svg className="icon icon-eye" viewBox="0 0 24 24">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  const EyeOffIcon = () => (
    <svg className="icon icon-eye-off" viewBox="0 0 24 24">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );

  return (
    <>
      <style jsx global>{styles}</style>
      <div className="motif-drift"></div>
      <div className="confetti-canvas" id="confetti"></div>
      <div className="success-veil" id="successVeil">
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>Odyssey Complete!</h2>
          <p>Your weave is eternal. Enter the sanctum.</p>
          <Link href="/login" className="login-redirect">Warp to Login</Link>
        </div>
      </div>

      <div className="odyssey-container">
        {/* Persistent Legacy Lore */}
        <section className="legacy-lore">
          <div className="lore-weave">
            <h1>Rajwadi Odyssey</h1>
            <p>Layer by layer, drape your destiny. From invocation to eternity, handwoven for the sovereign soul.</p>
          </div>
        </section>

        {/* Ritual Chamber */}
        <section className="ritual-chamber">
          {step === 'otp' && (
            <Link href="#" onClick={goBack} className="back-btn">
              <ArrowLeftIcon /> <span>Back</span>
            </Link>
          )}
          {step === 'details' && (
            <Link href="#" onClick={goBackToOtp} className="back-btn">
              <ArrowLeftIcon /> <span>Back</span>
            </Link>
          )}

          <h2 className="h4 fw-bold mb-4">
            {step === 'details' ? 'Complete Your Weave' : 'Invoke Eternal'}
          </h2>

          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
                {/* <label>Email Address *</label> */}
              </div>
              <p className="small text-muted mb-3">We'll send a verification code to this email.</p>
              <button type="submit" disabled={isLoading} className="invoke-btn">
                {isLoading ? 'Invoking...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* Step 2: OTP – 6 Detailed Digit Chambers */}
          {step === 'otp' && (
  <form onSubmit={(e) => handleOtpSubmit(e)}>
    <div className="form-group">
      <p className="small text-muted mb-3">
        Enter the 6-digit code sent to {formData.email}.
      </p>
      <div className="otp-container">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {otpInputs.current[index] = el}}
            type="tel"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(e, index)}
            onKeyDown={(e) => handleOtpKeyDown(e, index)}
            className="otp-input"
            required
          />
        ))}
      </div>
    </div>

    <div className="progress-orb">
      <div
        className="orb-fill"
        style={{ width: `${(otp.filter((d) => d !== '').length / 6) * 100}%` }}
      />
    </div>

    <button type="submit" disabled={isLoading} className="invoke-btn">
      {isLoading ? 'Verifying your OTP...' : 'Verify Weave'}
    </button>

    <div className="mt-3 small text-muted text-center">
      {!showResend ? (
        <span className="timer">Resend in {countdown}s</span>
      ) : (
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={isLoading}
          className="btn-link p-0"
        >
          Resend OTP
        </button>
      )}
    </div>
  </form>
)}


          {/* Step 3: Details */}
          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit}>
              <div className="form-group">
                <input type="email" value={formData.email} disabled className="form-control" />
                <label>Verified Email</label>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder=" "
                      required
                      className="form-control"
                    />
                    <label>First Name *</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder=" "
                      className="form-control"
                    />
                    <label>Last Name</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group position-relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder=" "
                      required
                      minLength={8}
                      className="form-control"
                    />
                    <label>Password *</label>
                    <button
                      type="button"
                      className="btn btn-outline-secondary position-absolute end-0 top-50 translate-middle-y mt-2"
                      onClick={togglePasswordVisibility}
                      style={{ border: 'none', background: 'transparent', zIndex: 5 }}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder=" "
                      className="form-control"
                    />
                    <label>Phone Number</label>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-group">
                    <input
                      type="text"
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleChange}
                      placeholder=" "
                      required
                      className="form-control"
                    />
                    <label>Street Address *</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="form-control"
                    >
                      <option value="">Select a state</option>
                      {states.map((s) => (
                        <option key={s.isoCode} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <label>State *</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      disabled={!formData.state}
                      className="form-control"
                    >
                      <option value="">Select a city</option>
                      {cities.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <label>City *</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder=" "
                      required
                      className="form-control"
                    />
                    <label>ZIP Code *</label>
                  </div>
                </div>
              </div>
              <div className="legacy-selector">
                {['bridal', 'festive', 'daily'].map((legacy) => (
                  <div
                    key={legacy}
                    className={`legacy-option ${selectedLegacy === legacy ? 'selected' : ''}`}
                    onClick={() => handleLegacySelect(legacy)}
                  >
                    {legacy.charAt(0).toUpperCase() + legacy.slice(1)}
                  </div>
                ))}
              </div>
              <div className="progress-orb">
                <div
                  className="orb-fill"
                  style={{
                    width: `${
                      (Object.values(formData).filter((v) => v && v.trim() !== '').length / 8 + (selectedLegacy ? 1 : 0)) * 100
                    }%`,
                  }}
                />
              </div>
              <button type="submit" disabled={isLoading} className="invoke-btn">
                {isLoading ? 'Weaving Eternal...' : 'Seal Your Weave'}
              </button>
            </form>
          )}

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}
          <p className="text-center small mt-3">
            Already woven? <Link href="/login" className="text-primary fw-bold">Enter Sanctum</Link>
          </p>
        </section>
      </div>
    </>
  );
}