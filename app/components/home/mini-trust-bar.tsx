import { Truck, RotateCcw, ShieldCheck, Heart } from 'lucide-react';

const ITEMS = [
  { icon: Truck,   title: 'Free shipping over ₹999', sub: 'Across India' },
  { icon: RotateCcw, title: 'Easy 7-day returns',     sub: 'No questions asked' },
  { icon: ShieldCheck, title: 'Secure checkout',      sub: 'UPI · Cards · COD' },
  { icon: Heart,   title: 'Artisan direct',           sub: 'No middlemen' },
];

export default function MiniTrustBar() {
  return (
    <section
      aria-label="Why shop with Hema Sarees"
      className="bg-chandan border-b border-chandan-warm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5 py-6">
        {ITEMS.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-10 h-10 flex-shrink-0 rounded-full bg-kumkum/10 text-kumkum flex items-center justify-center">
              <Icon size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-kajal leading-snug">{title}</p>
              <p className="text-[11px] text-kajal-soft">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}