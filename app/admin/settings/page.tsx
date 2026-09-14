'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Save, Loader2, Upload, Trash2, ImageIcon } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    deliveryChargeGujarat: 80,
    deliveryChargeDefault: 150,
    polishPrice: 450,
    isPolishEnabled: true,
    multiCategoryBannerImage: '' as string | null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          multiCategoryBannerImage: data.multiCategoryBannerImage || null,
        });
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image must be smaller than 4MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);

      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Upload failed');
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.urls?.[0];

      if (imageUrl) {
        setSettings(prev => ({ ...prev, multiCategoryBannerImage: imageUrl }));
        toast.success('Banner image uploaded. Click Save to apply.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveBanner = () => {
    setSettings(prev => ({ ...prev, multiCategoryBannerImage: null }));
    toast.success('Banner removed. Click Save to apply.');
  };

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

        {/* Banner Image Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-brand-100 p-6">
          <h2 className="text-lg font-bold text-ink mb-2">Products Page Banner</h2>
          <p className="text-sm text-ink-muted mb-6">
            This image appears as the banner on the products page when visitors select multiple categories or when no category is selected. 
            If not set, a default image will be used.
          </p>

          {/* Current Banner Preview */}
          {settings.multiCategoryBannerImage ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink-muted mb-2">Current Banner</label>
              <div className="relative w-full h-[180px] rounded-xl overflow-hidden border border-surface-subtle bg-surface-muted">
                <Image
                  src={settings.multiCategoryBannerImage}
                  alt="Multi-category banner preview"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-md"
                  title="Remove banner image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 w-full h-[180px] rounded-xl border-2 border-dashed border-surface-subtle bg-surface-muted flex flex-col items-center justify-center gap-2">
              <ImageIcon size={32} className="text-ink-faint" />
              <p className="text-sm text-ink-faint">No banner image set</p>
            </div>
          )}

          {/* Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleBannerUpload}
              className="hidden"
              id="banner-upload"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-muted border border-surface-subtle rounded-xl text-sm font-semibold text-ink hover:bg-brand-50 hover:border-brand-200 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  {settings.multiCategoryBannerImage ? 'Replace Banner Image' : 'Upload Banner Image'}
                </>
              )}
            </button>
            <p className="text-xs text-ink-faint mt-2">Recommended: 1600×400px, JPEG/PNG/WebP, max 4MB</p>
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
