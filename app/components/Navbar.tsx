'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import {
  ShoppingCart,
  User as UserIcon,
  Package,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Tag,
  Home,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isAdmin = user?.isAdmin ?? false;
  const isUser = !!user && !user.isAdmin;

  const navLinkStyle = (href: string) => {
    const active = pathname === href;
    return {
      color: active ? 'var(--primary)' : undefined,
      background: active ? 'rgba(231,111,81,0.08)' : undefined,
    };
  };

  const navLinkClass = (href: string) =>
    `nav-link d-flex align-items-center gap-1 px-3 py-2 rounded-3${pathname === href ? ' active fw-semibold' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg sticky-top" style={{
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--primary)',
          }}>
            Hema Sarees
          </span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain" aria-controls="navbarMain" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <Link className={navLinkClass('/')} href="/" style={navLinkStyle('/')}>
                <Home size={16} /> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={navLinkClass('/products')} href="/products" style={navLinkStyle('/products')}>
                <Tag size={16} /> Products
              </Link>
            </li>

            {isUser && (
              <>
                <li className="nav-item">
                  <Link className={navLinkClass('/cart')} href="/cart" style={navLinkStyle('/cart')}>
                    <ShoppingCart size={16} /> Cart
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={navLinkClass('/orders')} href="/orders" style={navLinkStyle('/orders')}>
                    <ClipboardList size={16} /> Orders
                  </Link>
                </li>
              </>
            )}

            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className={navLinkClass('/admin')} href="/admin" style={navLinkStyle('/admin')}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={navLinkClass('/admin/product')} href="/admin/product" style={navLinkStyle('/admin/product')}>
                    <Package size={16} /> Products
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={navLinkClass('/admin/categories')} href="/admin/categories" style={navLinkStyle('/admin/categories')}>
                    <Tag size={16} /> Categories
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={navLinkClass('/admin/order')} href="/admin/order" style={navLinkStyle('/admin/order')}>
                    <ClipboardList size={16} /> Orders
                  </Link>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav ms-auto">
            {user ? (
              <li className="nav-item dropdown">
                <button className="nav-link dropdown-toggle btn btn-link d-flex align-items-center gap-2 px-3 py-2" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ textDecoration: 'none' }}>
                  <div className="d-flex align-items-center justify-content-center rounded-circle" style={{
                    width: 32, height: 32,
                    background: 'linear-gradient(135deg, #e76f51, #d85a40)',
                    color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                  }}>
                    {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="d-none d-lg-inline">{user.firstName}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="userDropdown" style={{ borderRadius: '12px', minWidth: '200px' }}>
                  <li className="px-3 py-2 border-bottom">
                    <small className="text-muted">Signed in as</small>
                    <div className="fw-semibold">{user.firstName}</div>
                  </li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={logout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item d-flex gap-2 align-items-center">
                <Link className="btn btn-sm px-3 py-2 fw-semibold" href="/login" style={{ color: 'var(--primary)', border: '2px solid var(--primary)', borderRadius: '10px' }}>
                  Sign In
                </Link>
                <Link className="btn btn-sm px-3 py-2 fw-semibold text-white" href="/signup" style={{ background: 'linear-gradient(135deg, #e76f51, #d85a40)', border: 'none', borderRadius: '10px' }}>
                  Sign Up
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .nav-link {
          color: #64748b;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          color: #e76f51 !important;
          background: rgba(231, 111, 81, 0.06);
        }
        .dropdown-item:hover {
          background: rgba(231, 111, 81, 0.06);
        }
      `}</style>
    </nav>
  );
}
