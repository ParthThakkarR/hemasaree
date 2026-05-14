import React from 'react';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductInfoProps {
  product: any;
  displayPrice: number;
  isInWishlist: (id: string) => boolean;
  handleWishlist: (id: string) => void;
  polish: boolean;
  setPolish: (val: boolean) => void;
  POLISH_PRICE: number;
  addToCart: (qty: number) => Promise<void>;
  isAddingToCart: boolean;
  router: any;
}

export default function ProductInfo({ 
  product, 
  displayPrice, 
  isInWishlist, 
  handleWishlist, 
  polish, 
  setPolish, 
  POLISH_PRICE, 
  addToCart, 
  isAddingToCart, 
  router 
}: ProductInfoProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-ink leading-tight">{product.name}</h1>
          <button onClick={() => handleWishlist(product.id)} className="w-12 h-12 rounded-full border border-brand-200 flex items-center justify-center text-[#6B0F1A] hover:bg-brand-50 transition-colors shrink-0 transform hover:scale-110 active:scale-95">
            <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
        <div className="mt-6">
          <p className="text-3xl font-bold text-ink tracking-tight">₹{displayPrice.toLocaleString('en-IN')}</p>
          <p className="text-sm text-ink-faint mt-1">Inclusive of all taxes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
          <button onClick={() => setPolish(true)} className={`p-4 rounded-xl border flex justify-between items-center transition-all ${polish ? 'border-brand-800 bg-brand-50 shadow-sm' : 'border-brand-200 bg-white hover:border-brand-300'}`}>
            <div>
               <p className="font-bold text-sm text-left">With Polish</p>
               <p className="text-xs text-ink-faint text-left">+₹{POLISH_PRICE}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${polish ? 'bg-brand-800 border-brand-800' : 'border-brand-300'}`}>
              {polish && <Check size={12} className="text-white" />}
            </div>
          </button>
          <button onClick={() => setPolish(false)} className={`p-4 rounded-xl border flex justify-between items-center transition-all ${!polish ? 'border-brand-800 bg-brand-50 shadow-sm' : 'border-brand-200 bg-white hover:border-brand-300'}`}>
            <p className="font-bold text-sm">Without Polish</p>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${!polish ? 'bg-brand-800 border-brand-800' : 'border-brand-300'}`}>
              {!polish && <Check size={12} className="text-white" />}
            </div>
          </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => addToCart(1)} disabled={product.stock === 0 || isAddingToCart} className="flex-1 bg-surface-muted text-brand-800 border-2 border-brand-800 py-3.5 rounded-xl font-bold text-lg hover:bg-brand-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:border-ink-faint disabled:text-ink-faint transform hover:-translate-y-1 active:translate-y-0">
          {isAddingToCart ? <div className="w-5 h-5 border-2 border-brand-800 border-t-transparent rounded-full animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
          {product.stock > 0 ? (isAddingToCart ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
        </button>
        <button onClick={async () => {
          await addToCart(1);
          router.push('/cart');
        }} disabled={product.stock === 0 || isAddingToCart} className="flex-1 bg-brand-800 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-brand-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md transform hover:-translate-y-1 active:translate-y-0">
          Buy Now
        </button>
      </div>
    </motion.div>
  );
}
