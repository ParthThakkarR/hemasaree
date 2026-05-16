'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tags, ShoppingCart, LogOut, Store, Mail, Menu, X, Palette, MessageSquare } from 'lucide-react';
import { useAuth } from '@contexts/auth-context';

const adminRoutes = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/product', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Tags },
  { label: 'Orders', href: '/admin/order', icon: ShoppingCart },
  { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
  { label: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Studio (CMS)', href: '/studio', icon: Palette },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1A0A12] text-white flex items-center justify-between px-4 z-40 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 text-[#C9A84C]">
          <Store size={18} />
          <span className="font-serif text-lg font-bold">Hema Sarees</span>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none p-2" aria-label="Toggle Menu">
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full w-64 bg-[#1A0A12] text-white flex flex-col z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 text-[#C9A84C] hover:text-[#e0c070] transition-colors">
              <Store size={18} />
              <span className="font-serif text-lg font-bold">Hema Sarees</span>
            </Link>
            <p className="text-white/40 text-xs mt-1">Admin Panel</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-white/60 hover:text-white p-2 focus:outline-none bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {adminRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#6B0F1A] text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {route.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}


