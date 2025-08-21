// 'use client';

// import React, { useState, useRef, useEffect } from 'react';

// // --- Helper Icons (FIXED) ---
// const SendIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="m22 2-7 20-4-9-9-4Z" />
//     <path d="m22 2-11 11" />
//   </svg>
// );

// const ArrowLeftIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="m12 19-7-7 7-7" />
//     <path d="M19 12H5" />
//   </svg>
// );


// export default function SignupPage() {
//   // --- STATE MANAGEMENT ---
//   const [step, setStep] = useState('email'); // 'email', 'otp', 'details'
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // State for all form data
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
//     country: 'United States',
//   });
  
//   // State for OTP
//   const [otp, setOtp] = useState(['', '', '', '']);
//   const [verificationOtp, setVerificationOtp] = useState(''); // Stores the "correct" OTP from backend
//   const otpInputs = useRef<(HTMLInputElement | null)[]>([]);


//   // --- EVENT HANDLERS ---
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleEmailSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     if (!formData.email.includes('@')) {
//       setError("Please enter a valid email address.");
//       return;
//     }
//     setIsLoading(true);
//     try {
//       // MODIFIED: Call the new email OTP route
//       const res = await fetch('/api/send-email-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: formData.email }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      
//       setVerificationOtp(data.otp); 
//       setStep('otp');
      
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOtpSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     const enteredOtp = otp.join('');
//     if (enteredOtp !== verificationOtp) {
//       setError("The OTP entered is incorrect. Please try again.");
//       return;
//     }
//     setStep('details'); // OTP is correct, show the rest of the form
//   };

//   const handleDetailsSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setIsLoading(true);

//     const fullAddress = `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
//     const payload = {
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       email: formData.email,
//       phone: formData.phone,
//       password: formData.password,
//       address: fullAddress,
//     };

//     try {
//       const res = await fetch('/api/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Signup failed.');
      
//       // Set success message and then redirect
//       setSuccess('Account created successfully! Redirecting to login...');
      
//       // Redirect to login page after 2 seconds
//       setTimeout(() => {
//         window.location.href = 'http://localhost:3000/login';
//       }, 2000);

//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       // We keep isLoading true during redirect to prevent further actions
//       // If there's an error, it will be set to false.
//       if (!success) {
//           setIsLoading(false);
//       }
//     }
//   };
  
//   // --- OTP Input Logic ---
//   const handleOtpChange = (index: number, value: string) => {
//     if (!/^\d*$/.test(value)) return;
//     const newOtp = [...otp];
//     newOtp[index] = value.slice(-1);
//     setOtp(newOtp);
//     if (value && index < otp.length - 1) {
//       otpInputs.current[index + 1]?.focus();
//     }
//   };
  
//   const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
//       if (e.key === 'Backspace' && !otp[index] && index > 0) {
//           otpInputs.current[index - 1]?.focus();
//       }
//   };

//   const goBack = () => {
//     setError('');
//     setOtp(['', '', '', '']);
//     setStep('email');
//   };

//   useEffect(() => {
//     if (step === 'otp') otpInputs.current[0]?.focus();
//   }, [step]);


//   return (
//     <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 font-sans">
//       <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
        
//         {step === 'otp' && (
//             <button onClick={goBack} className="mb-4 text-gray-600 flex items-center gap-2 hover:text-gray-900">
//                 <ArrowLeftIcon /> Back
//             </button>
//         )}

//         <h1 className="text-2xl font-bold text-gray-800 mb-6">
//           {step === 'details' ? 'Complete Your Account' : 'Create an Account'}
//         </h1>
        
//         {/* --- STEP 1: EMAIL INPUT --- */}
//         {step === 'email' && (
//           <form onSubmit={handleEmailSubmit}>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
//             <p className="text-xs text-gray-500 mb-2">We'll send a verification code to this email.</p>
//             <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full md:w-1/2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
//             <div className="mt-6">
//               <button type="submit" disabled={isLoading} className="w-full md:w-1/2 bg-red-500 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors">
//                 {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
//               </button>
//             </div>
//           </form>
//         )}

//         {/* --- STEP 2: OTP VERIFICATION --- */}
//         {step === 'otp' && (
//           <form onSubmit={handleOtpSubmit}>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code *</label>
//             <p className="text-xs text-gray-500 mb-2">Enter the 4-digit code sent to {formData.email}.</p>
//             <div className="flex justify-start gap-3 md:gap-4 mb-6">
//               {otp.map((digit, index) => (
//                 <input
//                   key={index}
//                   ref={el => {otpInputs.current[index] = el}}
//                   type="tel" maxLength={1} value={digit}
//                   onChange={(e) => handleOtpChange(index, e.target.value)}
//                   onKeyDown={(e) => handleOtpKeyDown(index, e)}
//                   className="w-14 h-14 text-center text-2xl font-semibold border-2 bg-gray-100 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 transition" required
//                 />
//               ))}
//             </div>
//             <div className="mt-6">
//               <button type="submit" className="w-full md:w-1/2 bg-red-500 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600 transition-colors">
//                 Verify
//               </button>
//             </div>
//           </form>
//         )}

//         {/* --- STEP 3: FULL DETAILS FORM --- */}
//         {step === 'details' && (
//           <form onSubmit={handleDetailsSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
//               {/* Verified Email (disabled) */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Verified Email</label>
//                 <div className="relative">
//                   <input type="email" name="email" value={formData.email} className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded-md cursor-not-allowed" readOnly disabled />
//                   <div className="absolute right-3 top-2.5 text-gray-400"><SendIcon /></div>
//                 </div>
//               </div>
              
//               {/* Personal Information */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
//                 <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
//                 <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//                 <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required minLength={6} />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//                 <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" />
//               </div>
              
//               {/* Address Information */}
//               <div className="md:col-span-2 mt-4">
//                 <h2 className="text-lg font-semibold text-gray-800">Address Information</h2>
//                 <p className="text-sm text-red-600">(*Must make sure address is verified)</p>
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
//                 <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
//                 <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
//                 <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
//                 <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
//                 <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
//               </div>
//             </div>
//             <div className="mt-6">
//               <button type="submit" disabled={isLoading} className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors">
//                 {isLoading ? 'Creating Account...' : 'Create Account'}
//               </button>
//             </div>
//           </form>
//         )}

//         {/* --- Universal Error/Success Messages & Login Link --- */}
//         {error && <p className="text-red-500 text-center mt-4">{error}</p>}
//         {success && <p className="text-green-500 text-center mt-4">{success}</p>}
        
//         <p className="text-center text-sm text-gray-600 mt-4">
//           Already have an account? <a href="/login" className="font-medium text-red-500 hover:underline">Sign in</a>
//         </p>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useRef, useEffect } from 'react';

// --- Helper Icons (FIXED) ---
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="m22 2-11 11" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);


export default function SignupPage() {
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState('email'); // 'email', 'otp', 'details'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for all form data
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
    country: 'United States',
  });
  
  // State for OTP
  const [otp, setOtp] = useState(['', '', '', '']);
  const [verificationOtp, setVerificationOtp] = useState(''); // Stores the "correct" OTP from backend
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);


  // --- EVENT HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    try {
      // MODIFIED: Call the new email OTP route
      const res = await fetch('/api/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
      
      setVerificationOtp(data.otp); 
      setStep('otp');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const enteredOtp = otp.join('');
    if (enteredOtp !== verificationOtp) {
      setError("The OTP entered is incorrect. Please try again.");
      return;
    }
    setStep('details'); // OTP is correct, show the rest of the form
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const fullAddress = `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      address: fullAddress,
    };

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed.');
      setSuccess('Account created successfully! You can now sign in.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- OTP Input Logic ---
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      otpInputs.current[index + 1]?.focus();
    }
  };
  
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otp[index] && index > 0) {
          otpInputs.current[index - 1]?.focus();
      }
  };

  const goBack = () => {
    setError('');
    setOtp(['', '', '', '']);
    setStep('email');
  };

  useEffect(() => {
    if (step === 'otp') otpInputs.current[0]?.focus();
  }, [step]);


  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
        
        {step === 'otp' && (
            <button onClick={goBack} className="mb-4 text-gray-600 flex items-center gap-2 hover:text-gray-900">
                <ArrowLeftIcon /> Back
            </button>
        )}

        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {step === 'details' ? 'Complete Your Account' : 'Create an Account'}
        </h1>
        
        {/* --- STEP 1: EMAIL INPUT --- */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <p className="text-xs text-gray-500 mb-2">We'll send a verification code to this email.</p>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="w-full md:w-1/2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
            <div className="mt-6">
              <button type="submit" disabled={isLoading} className="w-full md:w-1/2 bg-red-500 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors">
                {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 2: OTP VERIFICATION --- */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code *</label>
            <p className="text-xs text-gray-500 mb-2">Enter the 4-digit code sent to {formData.email}.</p>
            <div className="flex justify-start gap-3 md:gap-4 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => {otpInputs.current[index] = el}}
                  type="tel" maxLength={1} value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-semibold border-2 bg-gray-100 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 transition" required
                />
              ))}
            </div>
            <div className="mt-6">
              <button type="submit" className="w-full md:w-1/2 bg-red-500 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600 transition-colors">
                Verify
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 3: FULL DETAILS FORM --- */}
        {step === 'details' && (
          <form onSubmit={handleDetailsSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Verified Email (disabled) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Verified Email</label>
                <div className="relative">
                  <input type="email" name="email" value={formData.email} className="w-full px-4 py-2 bg-gray-200 border border-gray-300 rounded-md cursor-not-allowed" readOnly disabled />
                  <div className="absolute right-3 top-2.5 text-gray-400"><SendIcon /></div>
                </div>
              </div>
              
              {/* Personal Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required minLength={6} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" />
              </div>
              
              {/* Address Information */}
              <div className="md:col-span-2 mt-4">
                <h2 className="text-lg font-semibold text-gray-800">Address Information</h2>
                <p className="text-sm text-red-600">(*Must make sure address is verified)</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" required />
              </div>
            </div>
            <div className="mt-6">
              <button type="submit" disabled={isLoading} className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600 disabled:bg-red-300 transition-colors">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* --- Universal Error/Success Messages & Login Link --- */}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {success && <p className="text-green-500 text-center mt-4">{success}</p>}
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account? <a href="/login" className="font-medium text-red-500 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}
