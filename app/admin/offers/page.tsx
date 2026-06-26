'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    type: 'percentage',
    value: 10,
    minOrder: 0,
    maxDiscount: '',
    usageLimit: '',
    perUser: 1,
    isActive: true,
    isFirstOrderOnly: false,
    startsAt: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    expiresAt: '',
    categoryId: '',
  });

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchOffers();
    fetchCategories();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/admin/offers');
      if (!res.ok) throw new Error('Failed to fetch offers');
      const data = await res.json();
      setOffers(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      payload.value = Number(payload.value);
      payload.minOrder = Number(payload.minOrder);
      payload.maxDiscount = payload.maxDiscount ? Number(payload.maxDiscount) : null;
      payload.usageLimit = payload.usageLimit ? Number(payload.usageLimit) : null;
      payload.perUser = Number(payload.perUser);
      payload.startsAt = new Date(payload.startsAt).toISOString();
      payload.expiresAt = payload.expiresAt ? new Date(payload.expiresAt).toISOString() : null;
      payload.categoryId = payload.categoryId || null;

      const method = editingOffer ? 'PUT' : 'POST';
      const url = editingOffer ? `/api/admin/offers/${editingOffer.id}` : '/api/admin/offers';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Offer ${editingOffer ? 'updated' : 'created'} successfully`);
      setIsModalOpen(false);
      fetchOffers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleStatus = async (offer: any) => {
    try {
      const res = await fetch(`/api/admin/offers/${offer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Offer ${!offer.isActive ? 'activated' : 'deactivated'}`);
      fetchOffers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openModal = (offer?: any) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        code: offer.code,
        title: offer.title,
        description: offer.description || '',
        type: offer.type,
        value: offer.value,
        minOrder: offer.minOrder,
        maxDiscount: offer.maxDiscount || '',
        usageLimit: offer.usageLimit || '',
        perUser: offer.perUser,
        isActive: offer.isActive,
        isFirstOrderOnly: offer.isFirstOrderOnly,
        startsAt: new Date(offer.startsAt).toISOString().slice(0, 16),
        expiresAt: offer.expiresAt ? new Date(offer.expiresAt).toISOString().slice(0, 16) : '',
        categoryId: offer.categoryId || '',
      });
    } else {
      setEditingOffer(null);
      setFormData({
        code: '',
        title: '',
        description: '',
        type: 'percentage',
        value: 10,
        minOrder: 0,
        maxDiscount: '',
        usageLimit: '',
        perUser: 1,
        isActive: true,
        isFirstOrderOnly: false,
        startsAt: new Date().toISOString().slice(0, 16),
        expiresAt: '',
        categoryId: '',
      });
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-brand-800" /></div>;
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink font-serif">Offers & Promotions</h1>
          <p className="text-ink-muted text-sm mt-1">Manage coupon codes and homepage offers</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-brand-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-brand-900 transition-all text-sm font-bold"
        >
          <Plus size={16} /> Create Offer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brand-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-ink-muted font-medium border-b border-surface-subtle">
            <tr>
              <th className="py-4 px-6">Code & Details</th>
              <th className="py-4 px-6">Discount</th>
              <th className="py-4 px-6">Usage</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-subtle">
            {offers.map(offer => (
              <tr key={offer.id} className="hover:bg-brand-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="font-bold text-ink uppercase tracking-wider">{offer.code}</div>
                  <div className="text-xs text-ink-muted">{offer.title}</div>
                  {offer.isFirstOrderOnly && <span className="text-[10px] bg-accent/20 text-brand-950 px-2 py-0.5 rounded-full mt-1 inline-block">First Order Only</span>}
                </td>
                <td className="py-4 px-6">
                  <div className="font-bold text-brand-800">
                    {offer.type === 'percentage' ? `${offer.value}% OFF` : `₹${offer.value} OFF`}
                  </div>
                  {offer.minOrder > 0 && <div className="text-xs text-ink-muted">Min ₹{offer.minOrder}</div>}
                </td>
                <td className="py-4 px-6">
                  <div className="text-ink font-medium">{offer.usageCount} {offer.usageLimit ? `/ ${offer.usageLimit}` : 'uses'}</div>
                  <div className="text-xs text-ink-muted">Max {offer.perUser}/user</div>
                </td>
                <td className="py-4 px-6">
                  <button 
                    onClick={() => toggleStatus(offer)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      offer.isActive ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-surface-subtle text-ink-muted hover:bg-surface-subtle/80'
                    }`}
                  >
                    {offer.isActive ? <Power size={12} /> : <PowerOff size={12} />}
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="py-4 px-6 text-right">
                  <button onClick={() => openModal(offer)} className="p-2 text-ink-muted hover:text-brand-800 transition-colors">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold font-serif mb-6">{editingOffer ? 'Edit Offer' : 'Create Offer'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Coupon Code</label>
                  <input required disabled={!!editingOffer} type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full border rounded-lg px-3 py-2 uppercase" placeholder="e.g. WELCOME200" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Display Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. ₹200 Off Your First Order" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg px-3 py-2" rows={2} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input required type="number" min="0" step="0.01" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value as any})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                {formData.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Discount (₹)</label>
                    <input type="number" min="0" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Unlimited" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Order Value (₹)</label>
                  <input type="number" min="0" value={formData.minOrder} onChange={e => setFormData({...formData, minOrder: e.target.value as any})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Usage Limit</label>
                  <input type="number" min="1" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Unlimited" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Limit Per User</label>
                  <input type="number" min="1" required value={formData.perUser} onChange={e => setFormData({...formData, perUser: e.target.value as any})} className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input type="datetime-local" required value={formData.startsAt} onChange={e => setFormData({...formData, startsAt: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
                  <input type="datetime-local" value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Specific Category (Optional)</label>
                    <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                      <option value="">All Categories</option>
                      {categories.map(c => (
                         <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                 </div>
                 <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.isFirstOrderOnly} onChange={e => setFormData({...formData, isFirstOrderOnly: e.target.checked})} className="w-5 h-5 rounded" />
                      <span className="text-sm font-medium">Valid for First Order Only</span>
                    </label>
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl text-ink-muted hover:bg-surface-muted transition-colors font-semibold">Cancel</button>
                <button type="submit" className="bg-brand-800 text-white px-5 py-2 rounded-xl hover:bg-brand-900 transition-colors font-bold">Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
