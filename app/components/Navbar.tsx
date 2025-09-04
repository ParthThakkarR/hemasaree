'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { ShoppingCart, User, Package, Tag, LayoutDashboard, ClipboardList } from 'lucide-react'; // 👈 1. IMPORT NEW ICON

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top">
      <div className="container">
        <Link href="/" className="navbar-brand fw-bold fs-4 brand-gradient">
          Saree Bazaar
        </Link>
         <div className="d-flex align-items-center">
          {isLoading ? (
            <div className="placeholder-glow" style={{ height: '38px', width: '120px' }}><span className="placeholder col-12 h-100 rounded"></span></div>
          ) : user ? (
            <div className="d-flex align-items-center gap-3">
              {user.isAdmin ? (
                // 👇 2. UPDATED ADMIN NAV
                <>
                    <Link href="/admin" className="nav-link d-flex align-items-center gap-1"><LayoutDashboard size={18}/> Dashboard</Link>
                    <Link href="/admin/order" className="nav-link d-flex align-items-center gap-1"><ClipboardList size={18}/> Orders</Link>
                    <Link href="/admin/product" className="nav-link d-flex align-items-center gap-1"><Package size={18}/> Products</Link>
                    <Link href="/admin/categories" className="nav-link d-flex align-items-center gap-1"><Tag size={18}/> Categories</Link>
                </>
              ) : (
                // CUSTOMER NAV
                <>
                    <Link href="/cart" className="nav-link d-flex align-items-center gap-1"><ShoppingCart size={18}/> Cart</Link>
                    <Link href="/orders" className="nav-link d-flex align-items-center gap-1"><User size={18}/> My Orders</Link>
                </>
              )}
              <span className="navbar-text">Hi, {user.firstName}</span>
              <button onClick={logout} className="btn btn-danger rounded-pill btn-sm">Logout</button>
            </div>
          ) : (
            // --- Logged Out View ---
            <>
              <Link href="/login" className="nav-link me-3">Login</Link>
              <Link href="/signup" className="btn btn-danger rounded-pill">Sign Up</Link>
            </>
          )}
        </div>
      </div>
     {/* Custom CSS for the brand gradient text */}
     <style jsx>{`
        .brand-gradient {
            background: -webkit-linear-gradient(45deg, #ef4444, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
     `}</style>
    </nav>
  );
}

