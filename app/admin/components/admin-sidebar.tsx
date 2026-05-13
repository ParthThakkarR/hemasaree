'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tags, ShoppingCart, LogOut, Store, Mail } from 'lucide-react';
import { useAuth } from '@contexts/auth-context';

const adminRoutes = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/product', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Tags },
  { label: 'Orders', href: '/admin/order', icon: ShoppingCart },
  { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#1A0A12] text-white flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 text-[#C9A84C] hover:text-[#e0c070] transition-colors">
          <Store size={18} />
          <span className="font-serif text-lg font-bold">Hema Sarees</span>
        </Link>
        <p className="text-white/40 text-xs mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {adminRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#6B0F1A] text-white'
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
  );
}


