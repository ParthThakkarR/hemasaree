'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/auth-context';
import { User, Package, Heart, Settings, LogOut, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AddressFormState {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  label: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<ProfileFormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>({
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    label: 'Home',
    isDefault: true,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const u = data.user || {};
        setForm({
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          phone: u.phone || '',
        });

        const addresses = Array.isArray(u.addresses) ? u.addresses : [];
        const primary =
          addresses.find((a: any) => a.isDefault) || addresses[0] || null;
        if (primary) {
          setAddressForm({
            streetAddress: primary.streetAddress || '',
            city: primary.city || '',
            state: primary.state || '',
            zipCode: primary.zipCode || '',
            label: primary.label || 'Home',
            isDefault: primary.isDefault ?? true,
          });
        }
      } catch (err) {
        console.error('[PROFILE_LOAD_ERROR]', err);
      }
    };
    if (user) loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<ProfileFormState> = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
      };

      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to update profile');
        return;
      }

      toast.success(data.message || 'Profile updated successfully');
    } catch (err) {
      console.error('[PROFILE_SAVE_ERROR]', err);
      toast.error('Something went wrong while saving your profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const payload = {
        streetAddress: addressForm.streetAddress.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        zipCode: addressForm.zipCode.trim(),
        label: addressForm.label.trim() || 'Home',
        isDefault: true,
      };

      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to save address');
        return;
      }

      toast.success('Address saved successfully');
    } catch (err) {
      console.error('[PROFILE_ADDRESS_SAVE_ERROR]', err);
      toast.error('Something went wrong while saving your address.');
    } finally {
      setSavingAddress(false);
    }
  };

  if (isLoading || (!user && !saving && !form.email)) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-16 flex justify-center items-start">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-800 rounded-full animate-spin mt-20" />
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen pt-32 lg:pt-40 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-3xl border border-brand-100 p-6 shadow-sm sticky top-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-brand-800 text-white flex items-center justify-center font-bold text-xl uppercase shadow-md">
                  {form.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="font-bold text-ink truncate w-32">{form.firstName || 'User'}</h2>
                  <p className="text-xs text-ink-muted truncate w-32">{form.email || user?.email}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 text-brand-800 font-semibold transition-colors">
                  <User size={18} /> Profile Settings
                </Link>
                <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-muted hover:bg-surface hover:text-ink transition-colors font-medium">
                  <Package size={18} /> My Orders
                </Link>
                <Link href="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl text-ink-muted hover:bg-surface hover:text-ink transition-colors font-medium">
                  <Heart size={18} /> Wishlist
                </Link>
              </nav>

              <div className="h-px bg-brand-100 my-6" />
              
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-8">
            <h1 className="text-3xl font-serif font-bold text-ink mb-2">Profile Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
              {/* Personal Information */}
              <div className="bg-white rounded-3xl border border-brand-100 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
                   <Settings className="text-brand-800" size={20} /> Personal Information
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-ink mb-1.5">First Name</label>
                       <input
                         type="text"
                         name="firstName"
                         value={form.firstName}
                         onChange={handleChange}
                         className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink"
                         required
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-ink mb-1.5">Last Name</label>
                       <input
                         type="text"
                         name="lastName"
                         value={form.lastName}
                         onChange={handleChange}
                         className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink"
                       />
                     </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Email Address</label>
                    <div className="relative">
                       <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                       <input
                         type="email"
                         name="email"
                         value={form.email}
                         className="w-full pl-10 pr-4 py-3 bg-surface-muted border border-brand-100 rounded-xl text-ink-muted cursor-not-allowed opacity-70"
                         disabled
                       />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Phone Number</label>
                    <div className="relative">
                       <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                       <input
                         type="tel"
                         name="phone"
                         value={form.phone}
                         onChange={handleChange}
                         placeholder="9876543210"
                         className="w-full pl-10 pr-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink"
                       />
                    </div>
                  </div>
                  <button type="submit" disabled={saving} className="w-full bg-[#6B0F1A] text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#5a0c16] transition-colors disabled:opacity-70 mt-2">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-3xl border border-brand-100 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
                   <MapPin className="text-brand-800" size={20} /> Primary Address
                </h2>
                <form onSubmit={handleAddressSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Street Address</label>
                    <input
                      type="text"
                      name="streetAddress"
                      value={addressForm.streetAddress}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1.5">City</label>
                      <input
                        type="text"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1.5">State</label>
                      <input
                        type="text"
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1.5">PIN Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={addressForm.zipCode}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-1.5">Label</label>
                      <input
                        type="text"
                        name="label"
                        value={addressForm.label}
                        onChange={handleAddressChange}
                        placeholder="Home / Work"
                        className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={savingAddress} className="w-full bg-surface text-brand-800 border-2 border-brand-800 py-3 rounded-xl font-bold text-base hover:bg-brand-50 transition-colors disabled:opacity-70 mt-2">
                    {savingAddress ? 'Saving...' : 'Save Address'}
                  </button>
                </form>
              </div>

            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

