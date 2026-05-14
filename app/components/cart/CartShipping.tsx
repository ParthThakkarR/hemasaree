'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CartShippingProps {
  savedAddresses: any[];
  addressMode: 'saved' | 'new';
  setAddressMode: (mode: 'saved' | 'new') => void;
  selectedSavedAddress: any;
  setSelectedSavedAddress: (addr: any) => void;
  newAddr: any;
  setNewAddr: (addr: any) => void;
  states: any[];
  cities: any[];
}

export default function CartShipping({ 
  savedAddresses, 
  addressMode, 
  setAddressMode, 
  selectedSavedAddress, 
  setSelectedSavedAddress, 
  newAddr, 
  setNewAddr, 
  states, 
  cities 
}: CartShippingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-3xl border border-brand-100 p-6 md:p-10 shadow-sm"
    >
      <h2 className="text-2xl font-serif font-bold text-ink mb-8">Delivery Address</h2>
      
      {savedAddresses.length > 0 && (
        <div className="mb-10">
          <label onClick={() => setAddressMode('saved')} className="flex items-center gap-3 cursor-pointer mb-6 group">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${addressMode === 'saved' ? 'border-brand-800 bg-brand-800' : 'border-brand-200 group-hover:border-brand-400'}`}>
              {addressMode === 'saved' && <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 text-white"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span className="font-semibold text-ink">Use saved address</span>
            <input type="radio" name="addressMode" className="hidden" checked={addressMode === 'saved'} onChange={() => setAddressMode('saved')} />
          </label>
          
          {addressMode === 'saved' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid sm:grid-cols-2 gap-4 ml-8"
            >
              {savedAddresses.map((addr) => (
                <div 
                  key={addr.id}
                  onClick={() => setSelectedSavedAddress(addr)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedSavedAddress?.id === addr.id 
                      ? 'border-brand-800 bg-brand-50 shadow-sm transform scale-[1.02]' 
                      : 'border-brand-100 hover:border-brand-300 hover:shadow-sm'
                  }`}
                >
                  <span className="bg-white text-brand-800 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-brand-200 mb-3 inline-block">
                    {addr.label || 'Home'}
                  </span>
                  <p className="text-sm text-ink font-medium leading-relaxed">
                    {addr.streetAddress}<br />
                    {addr.city}, {addr.state}<br />
                    {addr.zipCode}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      <div>
        <label onClick={() => setAddressMode('new')} className="flex items-center gap-3 cursor-pointer mb-6 group">
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${addressMode === 'new' ? 'border-brand-800 bg-brand-800' : 'border-brand-200 group-hover:border-brand-400'}`}>
            {addressMode === 'new' && <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 text-white"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span className="font-semibold text-ink">Add a new address</span>
          <input type="radio" name="addressMode" className="hidden" checked={addressMode === 'new'} onChange={() => setAddressMode('new')} />
        </label>

        {addressMode === 'new' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 ml-8 mt-4 overflow-hidden"
          >
            <div className="sm:col-span-2">
              <label htmlFor="streetAddress" className="block text-sm font-medium text-ink mb-1.5">Street Address</label>
              <input 
                id="streetAddress"
                type="text" 
                value={newAddr.streetAddress}
                onChange={(e) => setNewAddr({...newAddr, streetAddress: e.target.value})}
                className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink" 
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-ink mb-1.5">State</label>
              <select 
                id="state"
                value={newAddr.state}
                onChange={(e) => setNewAddr({...newAddr, state: e.target.value, city: ''})}
                className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink"
              >
                <option value="">Select State</option>
                {states.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-ink mb-1.5">City</label>
              <select 
                id="city"
                value={newAddr.city}
                onChange={(e) => setNewAddr({...newAddr, city: e.target.value})}
                disabled={!newAddr.state}
                className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow disabled:opacity-50 text-ink"
              >
                <option value="">Select City</option>
                {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="zipCode" className="block text-sm font-medium text-ink mb-1.5">PIN Code</label>
              <input 
                id="zipCode"
                type="text"
                value={newAddr.zipCode}
                onChange={(e) => setNewAddr({...newAddr, zipCode: e.target.value})} 
                className="w-full px-4 py-3 bg-surface border border-brand-200 rounded-xl focus:ring-2 focus:ring-brand-800 focus:outline-none transition-shadow text-ink" 
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
