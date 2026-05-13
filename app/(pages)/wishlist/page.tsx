'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/app/contexts/wishlist-context';
import { useCart } from '@/app/contexts/cart-context';
import { useAuth } from '@/app/contexts/auth-context';
import { useRouter } from 'next/navigation';
import ProductCard from '@/app/components/ui/product-card';
import ProductSkeleton from '@/app/components/ui/product-skeleton';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { wishlist, wishlistCount, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?callbackUrl=/wishlist');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchWishlistProducts = async () => {
      setLoading(true);
      try {
        if (wishlist.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Fetch products one by one (or you could create a bulk API endpoint if available)
        const productPromises = wishlist.map(id =>
          fetch(`/api/products/${id}`).then(res => res.json())
        );
        const results = await Promise.all(productPromises);
        
        // Filter out nulls and errors
        const validProducts = results
          .filter(data => data && !data.error);
          
        setProducts(validProducts);
      } catch (err) {
        console.error('Failed to fetch wishlist products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist, user]);

  const handleMoveToCart = async (product: any) => {
    try {
      const success = await addToCart({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        productImage: product.images?.[0],
      });
      if (success) {
        toggleWishlist(product.id); // Remove from wishlist after moving to cart
      }
    } catch (err) {
      console.error('Failed to move to cart', err);
    }
  };

  return (
    <div className="bg-surface-muted min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-center mb-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-ink mb-4 flex items-center justify-center gap-3">
            Your Wishlist
            {wishlistCount > 0 && (
              <span className="bg-brand-50 text-brand-600 text-base font-bold px-3 py-1 rounded-full align-middle">
                {wishlistCount}
              </span>
            )}
          </h1>
          <p className="text-ink-muted">
            Save your favorite sarees here and move them to your cart when you&apos;re ready to buy.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : wishlistCount === 0 || products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-sm border border-surface-subtle">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-brand-400" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-ink mb-3">Your wishlist is empty</h3>
            <p className="text-ink-muted mb-8 max-w-md mx-auto">
              You haven&apos;t saved any items yet. Browse our collections and click the heart icon to add them here.
            </p>
            <Link 
              href="/products" 
              className="premium-btn inline-flex items-center gap-2 px-8 py-3 rounded-full text-white bg-brand-600 hover:bg-brand-700 transition-colors font-medium"
            >
              <ShoppingBag className="w-5 h-5" /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <button
                  onClick={() => handleMoveToCart(product)}
                  className="w-full mt-3 py-2.5 bg-surface border border-brand-200 text-brand-700 font-medium rounded-lg hover:bg-brand-50 hover:border-brand-300 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  Move to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

