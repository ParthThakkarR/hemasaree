'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

type Category = { id: string; name: string; description?: string; image?: string };
type Product = {
  id: string; name: string; price: number; stock: number;
  images: string[]; category?: { id: string; name: string } | string;
  description?: string; color?: string; ocassion?: string; rating?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

const getImageSrc = (img?: string) => {
  if (!img) return '/uploads/placeholder.png';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return img.replace(/^\/+/, '/');
};

export default function ProductsListingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sort, setSort] = useState('newest');
  const [wishlist, setWishlist] = useState<string[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/categories`);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error('[CATEGORIES_FETCH_ERROR]', err); }
  }, []);

  const fetchProducts = useCallback(async (p = 1, append = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(p));
      params.append('limit', String(limit));
      if (category) params.append('category', category);
      if (searchTerm) params.append('search', searchTerm);
      if (sort === 'priceLowToHigh') params.append('sortPrice', 'asc');
      else if (sort === 'priceHighToLow') params.append('sortPrice', 'desc');
      params.append('maxPrice', String(maxPrice || 10000));

      const res = await axios.get(`${API_BASE}/api/products?${params.toString()}`, {
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache', Expires: '0' },
      });
      const data = res.data;
      const fetched: Product[] = Array.isArray(data.products) ? data.products : (data.products || []);
      const pagination = data.pagination || {};
      setTotalPages(pagination.totalPages || 1);
      setProducts(prev => append ? [...prev, ...fetched] : fetched);
    } catch (err) {
      console.error('[PRODUCTS_FETCH_ERROR]', err);
      toast.error('Failed to load products.');
    } finally { setLoading(false); }
  }, [category, searchTerm, sort, maxPrice, limit]);

  useEffect(() => { fetchCategories(); fetchProducts(1, false); }, [fetchCategories, fetchProducts]);

  useEffect(() => { setPage(1); fetchProducts(1, false); }, [category, searchTerm, sort, maxPrice, fetchProducts]);

  const loadMore = async () => {
    if (page < totalPages) { const next = page + 1; setPage(next); await fetchProducts(next, true); }
  };

  // Wishlist
  useEffect(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) { try { setWishlist(JSON.parse(saved)); } catch { setWishlist([]); } }
  }, []);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    toast.success(wishlist.includes(id) ? 'Removed from wishlist' : 'Added to wishlist');
  };
  const isInWishlist = (id: string) => wishlist.includes(id);

  // Add to cart
  const addToCart = async (product: Product, qty = 1) => {
    try {
      await axios.post(`${API_BASE}/api/cart`, {
        productId: product.id, quantity: qty, productName: product.name,
        productImage: product.images?.[0] || '', price: product.price, withPolish: false,
      });
      toast.success('Added to cart!');
    } catch (err: any) {
      if (err?.response?.status === 401) toast.error('Please log in to add items to your cart.');
      else toast.error(err?.response?.data?.error || 'Failed to add to cart.');
    }
  };

  const clearFilters = () => {
    setSearchTerm(''); setCategory(''); setMaxPrice(10000); setSort('newest');
    setPage(1); fetchProducts(1, false);
  };

  return (
    <>
      <style jsx>{`
        .products-hero { background: linear-gradient(135deg, #fdf6f0, #fffaf4); padding: 3rem 0; text-align: center; }
        .products-hero h1 { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: var(--text-primary); font-weight: 600; }
        .products-hero p { color: var(--text-secondary); font-size: 1rem; margin-top: 0.5rem; }
        .filter-panel { background: #fff; border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid #f0f0f0; position: sticky; top: 100px; }
        .filter-panel h6 { font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 0.5rem; }
        .product-card { border-radius: var(--radius-lg); overflow: hidden; transition: transform 0.25s, box-shadow 0.25s; border: 1px solid #f0f0f0; background: #fff; }
        .product-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
        .product-img-wrap { aspect-ratio: 3/4; position: relative; overflow: hidden; }
        .product-img-wrap img { transition: transform 0.4s ease; }
        .product-card:hover .product-img-wrap img { transform: scale(1.05); }
        .wish-btn { position: absolute; top: 10px; right: 10px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.9); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s; font-size: 1rem; }
        .wish-btn:hover { transform: scale(1.1); }
        .wish-btn.active { color: #e76f51; }
        .add-btn { background: linear-gradient(135deg, #e76f51, #d85a40); border: none; color: white; font-weight: 600; border-radius: 8px; padding: 0.5rem; font-size: 0.85rem; transition: box-shadow 0.2s; }
        .add-btn:hover { box-shadow: 0 4px 12px rgba(231,111,81,0.3); }
      `}</style>

      {/* Hero */}
      <section className="products-hero">
        <div className="container">
          <h1>Discover Timeless Sarees</h1>
          <p>Elegance woven in every thread</p>
        </div>
      </section>

      <div className="container py-4">
        <div className="row g-4">
          {/* Filters Sidebar */}
          <div className="col-lg-3">
            <div className="filter-panel">
              <h6>Search</h6>
              <input className="form-control mb-3" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g. Red Silk" />

              <h6>Category</h6>
              <select className="form-select mb-3" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>

              <h6>Max Price</h6>
              <input type="range" className="form-range" min={500} max={10000} step={100} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
              <div className="d-flex justify-content-between" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>&#x20B9;500</span>
                <span>{maxPrice >= 10000 ? '&#x20B9;10,000+' : `\u20B9${maxPrice}`}</span>
              </div>

              <button className="btn btn-outline-secondary w-100 mt-3" style={{ borderRadius: 8 }} onClick={clearFilters}>Clear All Filters</button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{products.length} Sarees Found</span>
              <select className="form-select" style={{ width: 'auto', borderRadius: 8 }} value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
              </select>
            </div>

            {loading && <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e76f51' }} /><p className="mt-2" style={{ color: '#94a3b8' }}>Loading sarees...</p></div>}

            <div className="row g-3">
              {products.map(p => (
                <div key={p.id} className="col-lg-4 col-md-6 col-6">
                  <div className="product-card h-100 d-flex flex-column">
                    <div className="product-img-wrap">
                      <Link href={`/product/${p.id}`}>
                        <Image src={getImageSrc(p.images?.[0])} alt={p.name} fill style={{ objectFit: 'cover' }} />
                      </Link>
                      <button className={`wish-btn ${isInWishlist(p.id) ? 'active' : ''}`} onClick={() => toggleWishlist(p.id)}>
                        {isInWishlist(p.id) ? '\u2665' : '\u2661'}
                      </button>
                    </div>
                    <div className="p-3 d-flex flex-column flex-grow-1">
                      <Link href={`/product/${p.id}`} className="text-decoration-none">
                        <h6 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{p.name}</h6>
                      </Link>
                      <p style={{ fontWeight: 700, color: '#e76f51', marginBottom: '0.25rem' }}>{'\u20B9'}{p.price}</p>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.75rem' }}>{(p.category as any)?.name ?? ''}</p>
                      <div className="mt-auto d-flex gap-2">
                        <button className="add-btn flex-grow-1" onClick={() => addToCart(p, 1)}>Add to Cart</button>
                        <Link href={`/product/${p.id}`} className="btn btn-outline-secondary" style={{ borderRadius: 8, fontSize: '0.85rem' }}>View</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {page < totalPages && (
              <div className="text-center mt-4">
                <button className="btn-brand px-4 py-2" onClick={loadMore}>Load More</button>
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-5">
                <h5 style={{ color: 'var(--text-secondary)' }}>No sarees match your filters</h5>
                <button className="btn-brand mt-3" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </>
  );
}
