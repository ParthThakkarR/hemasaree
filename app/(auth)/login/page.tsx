'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function LoginPage() {
  const [form, setForm] = useState({ emailfirstname: '', password: '' });
  const [error, setError] = useState('');
  const router=useRouter();
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });
    


    const data = await res.json();
     
    if (res.ok) {
      alert(data.message);
      
    } else {
      setError(data.message || 'Login failed');
    }
    console.log(data);
    if(data.user.isAdmin==true){
      window.location.href='/admin';
    }
    else{
      window.location.href='/';
    }
      
  };

  return (
    <div className="container mt-5">
      <h2>Login to Saree Bazaar</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email or First Name</label>
          <input
            type="text"
            className="form-control"
            value={form.emailfirstname}
            onChange={(e) => setForm({ ...form, emailfirstname: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}
