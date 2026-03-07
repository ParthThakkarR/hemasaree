'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

type Product = {
  id: string; name: string; price: number; stock: number;
  images: string[]; category?: { id: string; name: string } | string;
  description?: string; color?: string; ocassion?: string; rating?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
const POLISH_PRICE = 100;

const getImageSrc = (img?: string) => {
  if (!img) return '/uploads/placeholder.png';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return img.replace(/^\/+/, '/');
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [polish, setPolish] = useState(true);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [activeImage, setActiveImage] = useState(0);
  const router = useRouter();

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/products/${productId}`);
      setProduct(res.data);
    } catch (err) {
      console.error('[PRODUCT_FETCH_ERROR]', err);
      toast.error('Failed to load product.');
    } finally { setLoading(false); }
  }, [productId]);

  const fetchRelated = useCallback(async (categoryName?: string) => {
    try {
      if (!categoryName) { setRelated([]); return; }
      const p = new URLSearchParams();
      p.append('page', '1');
      p.append('limit', '8');
      p.append('category', categoryName);
      const res = await axios.get(`${API_BASE}/api/products?${p.toString()}`);
      const items: Product[] = Array.isArray(res.data.products) ? res.data.products : (res.data.products || []);
      setRelated(items.filter(pr => pr.id !== productId).slice(0, 4));
    } catch (err) { console.error('[RELATED_FETCH_ERROR]', err); setRelated([]); }
  }, [productId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);
  useEffect(() => {
    if (product) fetchRelated((product.category as any)?.name ?? String(product.category));
  }, [product, fetchRelated]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    setZoomPosition({ x: ((e.clientX - left) / width) * 100, y: ((e.clientY - top) / height) * 100 });
  };

  const addToCart = async (qty = 1) => {
    if (!product) return;
    try {
      const finalPrice = product.price + (polish ? POLISH_PRICE : 0);
      await axios.post(`${API_BASE}/api/cart`, {
        productId: product.id, quantity: qty, productName: product.name,
        productImage: product.images?.[0] || '', price: finalPrice, withPolish: polish,
      });
      toast.success(`Added to cart${polish ? ' (with polish)' : ''}!`);
    } catch (err: any) {
      if (err?.response?.status === 401) toast.error('Please log in to add items to your cart.');
      else toast.error(err?.response?.data?.error || 'Failed to add to cart.');
    }
  };

  const toggleWishlist = (id: string) => {
    try {
      const saved = localStorage.getItem('wishlist');
      const arr = saved ? JSON.parse(saved) as string[] : [];
      const updated = arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];
      localStorage.setItem('wishlist', JSON.stringify(updated));
      toast.success(arr.includes(id) ? 'Removed from wishlist' : 'Added to wishlist');
    } catch { toast.error('Wishlist error'); }
  };

  const isInWishlist = useMemo(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      const arr = saved ? JSON.parse(saved) as string[] : [];
      return (id: string) => arr.includes(id);
    } catch { return () => false; }
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" style={{ color: '#e76f51' }} />
        <p className="mt-2" style={{ color: '#94a3b8' }}>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <h4>Product not found</h4>
        <Link href="/products" className="btn-brand mt-3 d-inline-block">Back to products</Link>
      </div>
    );
  }

  const displayPrice = product.price + (polish ? POLISH_PRICE : 0);

  return (
    <>
      <style jsx>{`
        .img-container { border-radius: 16px; overflow: hidden; cursor: crosshair; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .img-container:hover { box-shadow: 0 8px 24px rgba(231,111,81,0.15); }
        .thumb { cursor: pointer; border: 2px solid transparent; border-radius: 8px; overflow: hidden; transition: all 0.2s; }
        .thumb.active { border-color: #e76f51; box-shadow: 0 0 0 3px rgba(231,111,81,0.2); }
        .thumb:hover { transform: scale(1.05); }
        .finish-card { border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 1.25rem; cursor: pointer; transition: all 0.25s; background: #fff; border: 2px solid transparent; text-align: center; }
        .finish-card.active { background: linear-gradient(135deg, #e76f51, #d85a40); color: white; border-color: #e76f51; box-shadow: 0 6px 16px rgba(231,111,81,0.25); }
        .finish-card:hover { transform: translateY(-3px); }
        .cart-btn { background: linear-gradient(135deg, #e76f51, #d85a40); border: none; color: white; font-weight: 600; border-radius: 10px; padding: 0.75rem 1.5rem; font-size: 1rem; transition: all 0.25s; }
        .cart-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(231,111,81,0.3); }
        .related-card { border-radius: 16px; overflow: hidden; border: 1px solid #f0f0f0; transition: all 0.25s; background: #fff; }
        .related-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
      `}</style>

      <div className="container py-4">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb" style={{ fontSize: '0.85rem' }}>
            <li className="breadcrumb-item"><Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link></li>
            <li className="breadcrumb-item"><Link href="/products" style={{ color: '#94a3b8', textDecoration: 'none' }}>Products</Link></li>
            <li className="breadcrumb-item active" style={{ color: '#1e293b' }}>{product.name}</li>
          </ol>
        </nav>

        <div className="row g-5">
          <div className="col-md-5">
            <div className="img-container" ref={imageRef}
              onMouseEnter={() => setIsZoomed(true)} onMouseLeave={() => setIsZoomed(false)} onMouseMove={handleMouseMove}>
              <Image src={getImageSrc(product.images[activeImage])} alt={product.name} width={500} height={600}
                className="img-fluid" style={{
                  transform: isZoomed ? `scale(2.5) translate(${50 - zoomPosition.x}%, ${50 - zoomPosition.y}%)` : 'scale(1)',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transition: 'transform 0.12s ease', objectFit: 'cover',
                }} />
            </div>
            {product.images.length > 1 && (
              <div className="d-flex gap-2 mt-3 justify-content-center">
                {product.images.map((img, idx) => (
                  <div key={idx} className={`thumb ${idx === activeImage ? 'active' : ''}`} onClick={() => setActiveImage(idx)}>
                    <Image src={getImageSrc(img)} alt={`Thumbnail ${idx + 1}`} width={70} height={85} style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-md-7">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: '0.5rem' }}>{product.name}</h1>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e76f51', marginBottom: '1.5rem' }}>{'\u20B9'}{displayPrice.toLocaleString()}</p>

            <h5 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Choose Finish</h5>
            <div className="row g-3 mb-4">
              <div className="col-6" onClick={() => setPolish(true)}>
                <div className={`finish-card ${polish ? 'active' : ''}`}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{'\u2728'}</div>
                  <h6 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>With Polish</h6>
                  <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 0 }}>+{'\u20B9'}{POLISH_PRICE} - Extra shine</p>
                </div>
              </div>
              <div className="col-6" onClick={() => setPolish(false)}>
                <div className={`finish-card ${!polish ? 'active' : ''}`}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{'\u25CB'}</div>
                  <h6 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Without Polish</h6>
                  <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 0 }}>Natural finish</p>
                </div>
              </div>
            </div>

            <h5 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Details</h5>
            <ul className="list-unstyled" style={{ fontSize: '0.92rem', color: '#64748b' }}>
              <li className="mb-2"><strong>Category:</strong> {(product.category as any)?.name ?? product.category}</li>
              {product.color && <li className="mb-2"><strong>Color:</strong> {product.color}</li>}
              {product.ocassion && <li className="mb-2"><strong>Occasion:</strong> {product.ocassion}</li>}
              <li className="mb-2"><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</li>
              {product.rating && <li className="mb-2"><strong>Rating:</strong> {product.rating}/5</li>}
            </ul>
            {product.description && <p style={{ color: '#64748b', lineHeight: 1.7 }}>{product.description}</p>}

            <div className="d-flex gap-3 mt-4">
              <button className="cart-btn flex-grow-1" onClick={() => addToCart(1)} disabled={product.stock <= 0}>
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button className="btn btn-outline-secondary" style={{ borderRadius: 10 }} onClick={() => toggleWishlist(product.id)}>
                {isInWishlist(product.id) ? '\u2665 Saved' : '\u2661 Wishlist'}
              </button>
            </div>

            <button className="btn btn-link p-0 mt-3" style={{ color: '#94a3b8', fontSize: '0.88rem' }} onClick={() => router.push('/products')}>
              {'\u2190'} Back to products
            </button>
          </div>
        </div>

        {related.length > 0 && (
          <>
            <hr className="my-5" />
            <h3 className="text-center mb-4" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>You May Also Like</h3>
            <div className="row g-4">
              {related.map(r => (
                <div key={r.id} className="col-md-3 col-6">
                  <div className="related-card">
                    <Link href={`/product/${r.id}`}>
                      <Image src={getImageSrc(r.images?.[0])} alt={r.name} width={300} height={400}
                        style={{ objectFit: 'cover', width: '100%', height: 200 }} />
                    </Link>
                    <div className="p-3">
                      <Link href={`/product/${r.id}`} className="text-decoration-none" style={{ color: '#1e293b' }}>
                        <h6 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>{r.name}</h6>
                      </Link>
                      <p style={{ fontWeight: 700, color: '#e76f51', marginBottom: 0 }}>{'\u20B9'}{r.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Toaster position="top-right" />
    </>
  );
}
