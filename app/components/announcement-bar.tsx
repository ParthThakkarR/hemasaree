import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-brand-950 text-brand-100/85 text-[12px] sm:text-[13px] relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-5 h-9">
        <p className="flex items-center gap-1.5 whitespace-nowrap">
          <Truck size={13} className="text-accent" aria-hidden="true" />
          <span className="hidden sm:inline">Free shipping on orders over </span>
          <span className="sm:hidden">Free shipping over </span>
          <span className="font-semibold text-white">₹999</span>
        </p>
        <span className="w-px h-3.5 bg-brand-800" aria-hidden="true" />
        <p className="flex items-center gap-1.5 whitespace-nowrap">
          <RotateCcw size={13} className="text-accent" aria-hidden="true" />
          Easy 7-day returns
        </p>
        <span className="hidden sm:block w-px h-3.5 bg-brand-800" aria-hidden="true" />
        <p className="hidden sm:flex items-center gap-1.5 whitespace-nowrap">
          <ShieldCheck size={13} className="text-accent" aria-hidden="true" />
          Secure checkout
        </p>
      </div>
    </div>
  );
}