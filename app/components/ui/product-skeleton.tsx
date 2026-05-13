import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="flex flex-col bg-surface rounded-2xl shadow-card h-full overflow-hidden border border-brand-50 animate-pulse-soft">
      {/* Image Placeholder */}
      <div className="relative aspect-[3/4] w-full bg-surface-muted skeleton"></div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-grow gap-3">
        {/* Category */}
        <div className="w-16 h-3 rounded-full skeleton"></div>
        
        {/* Title */}
        <div className="w-full h-4 rounded-full skeleton"></div>
        <div className="w-2/3 h-4 rounded-full skeleton"></div>
        
        {/* Price & Button */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="w-20 h-5 rounded-full skeleton"></div>
          <div className="w-8 h-8 rounded-full lg:hidden skeleton"></div>
        </div>
      </div>
    </div>
  );
}

