'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { SiteSettings } from '@/sanity/lib/queries';

interface SiteSettingsContextType {
  settings: SiteSettings | null;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({ settings: null });

export function SiteSettingsProvider({ 
  children, 
  settings 
}: { 
  children: ReactNode; 
  settings: SiteSettings | null;
}) {
  return (
    <SiteSettingsContext.Provider value={{ settings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
