'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    deliveryChargeGujarat: 80,
    deliveryChargeDefault: 150,
    polishPrice: 450,
    isPolishEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load settings');
        return res.json();
      })
      .then((data) => {
        setSettings({
          deliveryChargeGujarat: data.deliveryChargeGujarat,
          deliveryChargeDefault: data.deliveryChargeDefault,
          polishPrice: data.polishPrice,
          isPolishEnabled: data.isPolishEnabled,
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      toast.success('Settings saved successfully');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8"><Loader2 className="animate-spin text-brand-800" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-serif font-bold text-ink mb-8">Store Settings</h1>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-6">
          <h2 className="text-lg font-bold text-ink mb-4">Delivery Charges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">Gujarat Delivery (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={settings.deliveryChargeGujarat}
                onChange={(e) => setSettings({ ...settings, deliveryChargeGujarat: Number(e.target.value) })}
                className="w-full rounded-xl border border-surface-subtle bg-surface-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-800/20 focus:border-brand-800 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">Default/National Delivery (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={settings.deliveryChargeDefault}
                onChange={(e) => setSettings({ ...settings, deliveryChargeDefault: Number(e.target.value) })}
                className="w-full rounded-xl border border-surface-subtle bg-surface-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-800/20 focus:border-brand-800 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-6">
          <h2 className="text-lg font-bold text-ink mb-4">Saree Polish Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">Polish Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={settings.polishPrice}
                onChange={(e) => setSettings({ ...settings, polishPrice: Number(e.target.value) })}
                className="w-full rounded-xl border border-surface-subtle bg-surface-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-800/20 focus:border-brand-800 transition-all"
              />
            </div>
            <div className="flex items-center mt-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isPolishEnabled}
                  onChange={(e) => setSettings({ ...settings, isPolishEnabled: e.target.checked })}
                  className="w-5 h-5 rounded border-surface-subtle text-brand-800 focus:ring-brand-800/20 cursor-pointer"
                />
                <span className="text-sm font-medium text-ink-muted">Enable Polish Option for Products</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-brand-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-900 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
