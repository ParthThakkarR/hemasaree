// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/app/contexts/AuthContext';
// import './page.css';

// // --- Helper Icons ---
// const EyeIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
//        viewBox="0 0 24 24" fill="none" stroke="currentColor"
//        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
//     <circle cx="12" cy="12" r="3" />
//   </svg>
// );
// const EyeOffIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
//        viewBox="0 0 24 24" fill="none" stroke="currentColor"
//        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
//     <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
//     <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
//     <line x1="2" x2="22" y1="2" y2="22" />
//   </svg>
// );

// export default function LoginPage() {
//   const router = useRouter();
//   const { login } = useAuth();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsLoading(true);

//     try {
//       const res = await fetch('/api/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || 'Login failed.');
//       }

//       // ✅ Update context
//       login(data.user);

//       // ✅ Redirect based on role
//       if (data.user.isAdmin) {
//         router.push('/admin');
//       } else {
//         router.push('/');
//       }
//     } catch (err: any) {
//       setError(err.message);
//       setIsLoading(false);
//     }
//   };

//   const togglePasswordVisibility = () => setShowPassword(prev => !prev);

//   return (
//     <div className="login-container d-flex align-items-center justify-content-center">
//       <div className="card login-card shadow-lg">
//         <div className="card-body">
//           <div className="text-center mb-4">
//             <h1 className="h3 fw-bold text-dark">Saree Bazaar</h1>
//             <p className="text-muted">Welcome back! Please sign in.</p>
//           </div>

//           <form onSubmit={handleSubmit}>
//             {/* Email */}
//             <div className="mb-3">
//               <label className="form-label">Email</label>
//               <input
//                 type="email"
//                 value={form.email}
//                 onChange={(e) => setForm({ ...form, email: e.target.value })}
//                 className="form-control"
//                 required
//               />
//             </div>

//             {/* Password */}
//             <div className="mb-3">
//               <div className="d-flex justify-content-between">
//                 <label className="form-label">Password</label>
//                 <Link href="/forgot-password" className="small text-danger">
//                   Forgot password?
//                 </Link>
//               </div>
//               <div className="input-group">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={form.password}
//                   onChange={(e) => setForm({ ...form, password: e.target.value })}
//                   className="form-control"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={togglePasswordVisibility}
//                   className="btn btn-outline-secondary"
//                 >
//                   {showPassword ? <EyeOffIcon /> : <EyeIcon />}
//                 </button>
//               </div>
//             </div>

//             {/* Error */}
//             {error && <div className="alert alert-danger text-center">{error}</div>}

//             {/* Submit */}
//             <div className="d-grid">
//               <button type="submit" className="btn btn-danger fw-bold" disabled={isLoading}>
//                 {isLoading ? 'Signing In...' : 'Sign In'}
//               </button>
//             </div>
//           </form>

//           <p className="text-center mt-4 small">
//             Don’t have an account?{' '}
//             <Link href="/signup" className="fw-semibold text-danger">
//               Sign up
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }



'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

// --- Elegant Feminine Theme (Golden Ratio Layout) ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Inter:wght@400;500;600&display=swap');
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
  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg-gradient);
    min-height: 100vh;
    color: var(--text);
    overflow-x: hidden;
  }
  .motif-drift {
    position: fixed; inset: 0; pointer-events: none;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><path d="M0 10 Q25 5 50 10 T100 10" stroke="%23f7c6c7" stroke-width="0.5" fill="none" opacity="0.03"/></svg>');
    background-size: 150px 20px;
    animation: driftWeave 25s linear infinite;
  }
  @keyframes driftWeave { 0% { background-position: 0 0; } 100% { background-position: 150px 20px; } }
  .threshold-container {
    display: grid; min-height: 100vh;
    place-items: center; padding: var(--s-lg);
  }
  .entry-chamber {
    background: var(--glass);
    backdrop-filter: blur(16px);
    border-radius: var(--s-sm);
    padding: var(--s-xl);
    box-shadow: var(--shadow);
    border: 1px solid rgba(255,255,255,0.3);
    max-width: 420px; width: 100%;
  }
  .entry-header { text-align: center; margin-bottom: var(--s-lg); }
  .entry-title {
    font-family: 'Playfair Display', serif;
    font-size: var(--text-xl);
    color: var(--primary);
    margin-bottom: var(--s-xs);
  }
  .entry-subtitle { color: #64748b; font-size: var(--text-sm); }
  .form-group { position: relative; margin-bottom: var(--s-lg); }
  input {
    width: 100%; padding: 1rem 1rem 0.75rem;
    font-size: var(--text-base);
    background: rgba(255,255,255,0.8);
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    color: var(--text);
    transition: all 0.3s ease;
  }
  input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(231,111,81,0.2);
  }
  label {
    position: absolute; left: 1rem; top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: var(--text-base);
    pointer-events: none;
    transition: all 0.2s ease;
  }
  input:focus ~ label,
  input:not(:placeholder-shown) ~ label {
    top: 0;
    font-size: var(--text-sm);
    color: var(--primary);
    background: white;
    padding: 0 0.3rem;
  }
  .invoke-btn {
    background: linear-gradient(135deg, var(--primary), #d85a40);
    color: white; border: none;
    border-radius: 12px; padding: 0.9rem;
    font-weight: 600; width: 100%;
    transition: all 0.3s ease;
  }
  .invoke-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(231,111,81,0.3);
  }
  .error-msg { color: var(--error); text-align: center; font-size: var(--text-sm); margin-top: var(--s-sm); }
  .success-msg { color: var(--success); text-align: center; font-size: var(--text-sm); margin-top: var(--s-sm); }
  .signup-link { color: var(--primary); font-weight: 500; text-decoration: none; }
  .signup-link:hover { color: #d85a40; }
`;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Working API logic from the second version
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

      // ✅ Update global auth context
      login(data.user);

      // ✅ Redirect by role
      if (data.user.isAdmin) router.replace('/admin');
      else router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <>
      <style jsx global>{styles}</style>
      <div className="motif-drift" />

      <div className="threshold-container">
        <section className="entry-chamber">
          <div className="entry-header">
            <h2 className="entry-title">Serene Recall</h2>
            <p className="entry-subtitle">Welcome back, sovereign. Reclaim your essence.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <input
                type="email"
                placeholder=" "
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <label>Email</label>
            </div>

            {/* Password */}
            <div className="form-group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder=" "
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <label>Password</label>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {/* Error */}
            {error && <p className="error-msg">{error}</p>}

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="invoke-btn">
              {isLoading ? 'Recalling...' : 'Cross Threshold'}
            </button>
          </form>

          <p className="text-center small mt-3">
            Not yet woven?{' '}
            <Link href="/signup" className="signup-link">
              Invoke Eternal
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
