// "use client";

// import React, { useEffect, useState, useDeferredValue } from "react";
// import Image from "next/image";
// import {
//   Container,
//   Row,
//   Col,
//   Form,
//   Card,
//   Spinner,
//   Button,
// } from "react-bootstrap";
// import "./page.css";

// interface Product {
//   id: string;
//   name: string;
//   description?: string;
//   price: number;
//   stock: number;
//   images: string[];
//   category?: { id: string; name: string };
// }

// interface Category {
//   id: string;
//   name: string;
// }

// const ProductsPage: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [search, setSearch] = useState("");
//   const deferredSearch = useDeferredValue(search);
//   const [sortPrice, setSortPrice] = useState("");
//   const [maxPrice, setMaxPrice] = useState(10000);
//   const [loading, setLoading] = useState(true);

//   // 🔹 Fetch categories
//   const fetchCategories = async () => {
//     try {
//       const res = await fetch("/api/categories");
//       const data = await res.json();
//       setCategories(Array.isArray(data) ? data : data.categories || []);
//     } catch (err) {
//       console.error("Error fetching categories:", err);
//     }
//   };

//   // 🔹 Fetch products
//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       if (selectedCategory) params.append("category", selectedCategory);
//       if (deferredSearch) params.append("search", deferredSearch);
//       if (sortPrice) params.append("sortPrice", sortPrice);
//       if (maxPrice) params.append("maxPrice", maxPrice.toString());

//       const res = await fetch(`/api/products?${params.toString()}`);
//       const data = await res.json();
//       setProducts(Array.isArray(data) ? data : data.products || []);
//     } catch (err) {
//       console.error("Error fetching products:", err);
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     fetchProducts();
//   }, [selectedCategory, deferredSearch, sortPrice, maxPrice]);

//   const handleClearFilter = () => {
//     setSelectedCategory("");
//     setSearch("");
//     setSortPrice("");
//     setMaxPrice(10000);
//   };

//   const getImageSrc = (images?: string[]) => {
//   if (!images || images.length === 0) return "/uploads/placeholder.png";
//   const img = images[0];

//   // If it’s already a full URL or base64 data
//   if (img.startsWith("http") || img.startsWith("data:image/")) return img;

//   // ✅ FIX: Remove duplicate /uploads/ if already included
//   const cleanedPath = img.replace(/^\/+/, "").replace(/^uploads\//, "");

//   return `/uploads/${cleanedPath}`;
// };
 
//   return (
//     <Container className="my-4">
//       <h2 className="text-center fw-bold mb-4">Explore Our Collection</h2>

//       {/* Filters */}
//       <Row className="g-2 mb-4 align-items-center">
//         <Col md={3}>
//           <Form.Select
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//           >
//             <option value="">All Categories</option>
//             {categories.map((c) => (
//               <option key={c.id} value={c.name}>
//                 {c.name}
//               </option>
//             ))}
//           </Form.Select>
//         </Col>

//         <Col md={3}>
//           <Form.Control
//             type="text"
//             placeholder="Search products..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </Col>

//         <Col md={3}>
//           <Form.Select
//             value={sortPrice}
//             onChange={(e) => setSortPrice(e.target.value)}
//           >
//             <option value="">Sort by Price</option>
//             <option value="asc">Low → High</option>
//             <option value="desc">High → Low</option>
//           </Form.Select>
//         </Col>

//         <Col md={2}>
//           <Form.Range
//             min={0}
//             max={10000}
//             step={100}
//             value={maxPrice}
//             onChange={(e) => setMaxPrice(Number(e.target.value))}
//           />
//           <small className="text-muted">Max: ₹{maxPrice}</small>
//         </Col>

//         <Col md={1}>
//           <Button
//             variant="outline-secondary"
//             className="w-100"
//             onClick={handleClearFilter}
//           >
//             Clear
//           </Button>
//         </Col>
//       </Row>

//       {/* Product Grid */}
//       {loading ? (
//         <div className="text-center py-5">
//           <Spinner animation="border" />
//         </div>
//       ) : products.length > 0 ? (
//         <Row>
//           {products.map((p) => (
//             <Col key={p.id} xs={6} sm={4} md={3} className="mb-4">
//               <Card className="product-card border-0 shadow-sm">
//                 <div className="image-wrapper">
//                   <Image
//                     src={getImageSrc(p.images)}
//                     alt={p.name}
//                     fill
//                     sizes="(max-width: 768px) 100vw, 33vw"
//                     className="product-image"
//                     onError={(e) =>
//                       ((e.target as HTMLImageElement).src =
//                         "/uploads/placeholder.png")
//                     }
//                   />
//                   <div className="hover-overlay">
//                     <Button
//                       href={`/product/${p.id}`}
//                       className="btn btn-light view-btn"
//                     >
//                       View Product
//                     </Button>
//                   </div>
//                 </div>
//                 <Card.Body className="text-center">
//                   <h6 className="fw-bold mb-1">{p.name}</h6>
//                   <p className="text-muted small mb-1">{p.category?.name}</p>
//                   <p className="fw-semibold text-danger mb-0">₹{p.price}</p>
//                 </Card.Body>
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       ) : (
//         <p className="text-center text-muted py-5">No products found.</p>
//       )}
//     </Container>
//   );
// };

// export default ProductsPage;
// "use client";

// import React, { useEffect, useState, useDeferredValue } from "react";
// import Image from "next/image";
// import {
//   Container,
//   Row,
//   Col,
//   Form,
//   Card,
//   Spinner,
//   Button,
// } from "react-bootstrap";
// import "./page.css";

// interface Product {
//   id: string;
//   name: string;
//   description?: string;
//   price: number;
//   stock: number;
//   images: string[];
//   category?: { id: string; name: string };
// }

// interface Category {
//   id: string;
//   name: string;
// }

// const ProductsPage: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [search, setSearch] = useState("");
//   const deferredSearch = useDeferredValue(search);
//   const [sortPrice, setSortPrice] = useState("");
//   const [maxPrice, setMaxPrice] = useState(10000);
//   const [loading, setLoading] = useState(true);

//   // 🔹 Fetch categories
//   const fetchCategories = async () => {
//     try {
//       const res = await fetch("/api/categories");
//       const data = await res.json();
//       setCategories(Array.isArray(data) ? data : data.categories || []);
//     } catch (err) {
//       console.error("Error fetching categories:", err);
//     }
//   };

//   // 🔹 Fetch products
//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       if (selectedCategory) params.append("category", selectedCategory);
//       if (deferredSearch) params.append("search", deferredSearch);
//       if (sortPrice) params.append("sortPrice", sortPrice);
//       if (maxPrice) params.append("maxPrice", maxPrice.toString());

//       const res = await fetch(`/api/products?${params.toString()}`);
//       const data = await res.json();
//       setProducts(Array.isArray(data) ? data : data.products || []);
//     } catch (err) {
//       console.error("Error fetching products:", err);
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     fetchProducts();
//   }, [selectedCategory, deferredSearch, sortPrice, maxPrice]);

//   const handleClearFilter = () => {
//     setSelectedCategory("");
//     setSearch("");
//     setSortPrice("");
//     setMaxPrice(10000);
//   };

//   const getImageSrc = (images?: string[]) => {
//   if (!images || images.length === 0) return "/uploads/placeholder.png";
//   const img = images[0];

//   // If it’s already a full URL or base64 data
//   if (img.startsWith("http") || img.startsWith("data:image/")) return img;

//   // ✅ FIX: Remove duplicate /uploads/ if already included
//   const cleanedPath = img.replace(/^\/+/, "").replace(/^uploads\//, "");

//   return `/uploads/${cleanedPath}`;
// };
 
//   return (
//     <Container className="my-4">
//       <h2 className="text-center fw-bold mb-4">Explore Our Collection</h2>

//       {/* Filters */}
//       <Row className="g-2 mb-4 align-items-center">
//         <Col md={3}>
//           <Form.Select
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//           >
//             <option value="">All Categories</option>
//             {categories.map((c) => (
//               <option key={c.id} value={c.name}>
//                 {c.name}
//               </option>
//             ))}
//           </Form.Select>
//         </Col>

//         <Col md={3}>
//           <Form.Control
//             type="text"
//             placeholder="Search products..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </Col>

//         <Col md={3}>
//           <Form.Select
//             value={sortPrice}
//             onChange={(e) => setSortPrice(e.target.value)}
//           >
//             <option value="">Sort by Price</option>
//             <option value="asc">Low → High</option>
//             <option value="desc">High → Low</option>
//           </Form.Select>
//         </Col>

//         <Col md={2}>
//           <Form.Range
//             min={0}
//             max={10000}
//             step={100}
//             value={maxPrice}
//             onChange={(e) => setMaxPrice(Number(e.target.value))}
//           />
//           <small className="text-muted">Max: ₹{maxPrice}</small>
//         </Col>

//         <Col md={1}>
//           <Button
//             variant="outline-secondary"
//             className="w-100"
//             onClick={handleClearFilter}
//           >
//             Clear
//           </Button>
//         </Col>
//       </Row>

//       {/* Product Grid */}
//       {loading ? (
//         <div className="text-center py-5">
//           <Spinner animation="border" />
//         </div>
//       ) : products.length > 0 ? (
//         <Row>
//           {products.map((p) => (
//             <Col key={p.id} xs={6} sm={4} md={3} className="mb-4">
//               <Card className="product-card border-0 shadow-sm">
//                 <div className="image-wrapper">
//                   <Image
//                     src={getImageSrc(p.images)}
//                     alt={p.name}
//                     fill
//                     sizes="(max-width: 768px) 100vw, 33vw"
//                     className="product-image"
//                     onError={(e) =>
//                       ((e.target as HTMLImageElement).src =
//                         "/uploads/placeholder.png")
//                     }
//                   />
//                   <div className="hover-overlay">
//                     <Button
//                       href={`/product/${p.id}`}
//                       className="btn btn-light view-btn"
//                     >
//                       View Product
//                     </Button>
//                   </div>
//                 </div>
//                 <Card.Body className="text-center">
//                   <h6 className="fw-bold mb-1">{p.name}</h6>
//                   <p className="text-muted small mb-1">{p.category?.name}</p>
//                   <p className="fw-semibold text-danger mb-0">₹{p.price}</p>
//                 </Card.Body>
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       ) : (
//         <p className="text-center text-muted py-5">No products found.</p>
//       )}
//     </Container>
//   );
// };

// export default ProductsPage;
// app/(pages)/products/page.tsx

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import toast, { Toaster } from 'react-hot-toast';

type Category = { id: string; name: string; description?: string; image?: string; };
type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  category?: { id: string; name: string } | string;
  description?: string;
  color?: string;
  ocassion?: string;
  rating?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';
const POLISH_PRICE = 100; // used only on detail page

const getImageSrc = (img?: string) => {
  if (!img) return '/uploads/placeholder.png';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return img.replace(/^\/+/, '/');
};

export default function ProductsListingPage() {
  // Data & pagination
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & UI
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sort, setSort] = useState('newest');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);

  // fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/categories`);
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[CATEGORIES_FETCH_ERROR]', err);
    }
  }, []);

  // fetch cart to update cart badge
  const fetchCart = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/cart`);
      const cart = res.data?.cart;
      if (!cart || !Array.isArray(cart.items)) { setCartCount(0); return; }
      const count = cart.items.reduce((s: number, i: any) => s + (i.quantity || 0), 0);
      setCartCount(count);
    } catch (err) {
      setCartCount(0);
    }
  }, []);

  // fetch products (server paginated)
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
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
});

      const data = res.data;
      const fetched: Product[] = Array.isArray(data.products) ? data.products : (data.products || []);
      const pagination = data.pagination || {};
      setTotalPages(pagination.totalPages || 1);

      setProducts(prev => append ? [...prev, ...fetched] : fetched);
    } catch (err) {
      console.error('[PRODUCTS_FETCH_ERROR]', err);
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [category, searchTerm, sort, maxPrice, limit]);

  useEffect(() => {
    fetchCategories();
    fetchCart();
    fetchProducts(1, false);
  }, [fetchCategories, fetchProducts, fetchCart]);

  // when filters change -> reset page
  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
  }, [category, searchTerm, sort, maxPrice, fetchProducts]);

  const loadMore = async () => {
    if (page < totalPages) {
      const next = page + 1;
      setPage(next);
      await fetchProducts(next, true);
    }
  };

  // wishlist persistence
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

  // Add to cart from listing: no polish option here (polish only on detail)
  const addToCart = async (product: Product, qty = 1) => {
    try {
      const body = {
        productId: product.id,
        quantity: qty,
        productName: product.name,
        productImage: product.images?.[0] || '',
        price: product.price, // no polish from listing
        withPolish: false
      };
      const res = await axios.post(`${API_BASE}/api/cart`, body);
      const updatedCart = res.data?.cart;
      const newCount = updatedCart?.items?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) ?? cartCount + qty;
      setCartCount(newCount);
      toast.success('Added to cart!');
    } catch (err: any) {
      console.error('[CART_ADD_ERROR]', err);
      if (err?.response?.status === 401) toast.error('Please log in to add items to your cart.');
      else toast.error(err?.response?.data?.error || 'Failed to add to cart.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setMaxPrice(10000);
    setSort('newest');
    setPage(1);
    fetchProducts(1, false);
  };

  return (
    <>
      <Head>
        <title>All Sarees | Ethereal Sarees</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <style jsx global>{`
        :root{--bg-main:#fff;--bg-secondary:#fdf6f0;--accent-primary:#e76f51;--text-primary:#1e293b;}
        body{font-family:'Inter',sans-serif;background:var(--bg-main);color:var(--text-primary);}
        .product-card{border-radius:12px;transition:transform .2s,box-shadow .2s;overflow:hidden;cursor:pointer}
        .product-card:hover{transform:translateY(-6px);box-shadow:0 8px 18px rgba(231,111,81,0.12)}
        .product-image-container{aspect-ratio:3/4;position:relative;overflow:hidden}
        /*  Add / replace inside the <style jsx global> block  */
.container,
.container-fluid {
  padding-left: 0 !important;
  padding-right: 0 !important;
  max-width: 100% !important;
}

/* Remove side gaps on every row */
.row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* Full-bleed hero */
.hero-title {
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

/* Full-bleed product grid & filters */
.products-wrapper {
  padding: 0 1.5rem;
}

/* Navbar – stretch to edges */
.navbar .container-fluid {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

/* Cart / Orders page – full width cards */
.cart-card,
.order-card {
  margin-left: -1.5rem;
  margin-right: -1.5rem;
  border-radius: 0;
}
      `}</style>

      <nav className="navbar navbar-expand-lg py-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
  <div className="container-fluid">
    {/* Brand (optional) */}
    {/* <Link href="/" className="navbar-brand fw-light fs-4">Ethereal Sarees</Link> */}

    {/* Wishlist & Cart – moved slightly left */}
    <div className="d-flex gap-3" style={{ marginLeft: 'auto', marginRight: '2rem' }}>
      <Link href="/wishlist" className="nav-link">Wishlist ({wishlist.length})</Link>
      <Link href="/cart" className="nav-link">Cart ({cartCount})</Link>
    </div>
  </div>
</nav>

      <section className="hero-title text-center py-5" style={{ background: 'linear-gradient(135deg,#fdf6f0,#fffaf4)' }}>
        <div className="container">
          <h1 className="display-4 fw-light">Discover Timeless Sarees</h1>
          <p className="lead text-muted mt-2">Elegance woven in every thread</p>
        </div>
      </section>

      <div className="products-wrapper my-5">
        <div className="row g-0">
          {/* Filters */}
          <div className="col-lg-3 px-3">
            <div className="p-3 rounded shadow-sm bg-white">
              <h6 className="mb-2">Search Sarees</h6>
              <input className="form-control mb-3" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="e.g. Red Silk" />

              <h6 className="mb-2">Category</h6>
              <select className="form-select mb-3" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>

              <h6 className="mb-2">Max Price</h6>
<input
  type="range"
  className="form-range"
  min={500}
  max={10000}
  step={100}
  value={maxPrice}
  onChange={e => setMaxPrice(Number(e.target.value))}
/>

<div className="small text-muted d-flex justify-content-between">
  <span>₹500</span>
  <span>{maxPrice >= 10000 ? "₹10,000+" : `₹${maxPrice}`}</span>
</div>

              <button className="btn btn-outline-secondary w-100 mt-3" onClick={clearFilters}>Clear All Filters</button>
            </div>
          </div>

          {/* Grid */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">{products.length} Sarees Found</h5>
              <select className="form-select w-auto" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="priceLowToHigh">Price: Low → High</option>
                <option value="priceHighToLow">Price: High → Low</option>
              </select>
            </div>

            {loading && <p className="text-center py-5">Loading sarees...</p>}

            <div className="row g-4">
              {products.map(p => (
                <div key={p.id} className="col-lg-4 col-md-6">
                  <div className="card product-card h-100">
                    <div className="position-relative" style={{ cursor: 'pointer' }}>
                      <Link href={`/product/${p.id}`} className="d-block">
                        <div className="product-image-container">
                          <Image src={getImageSrc(p.images?.[0])} alt={p.name} fill style={{ objectFit: 'cover' }} />
                        </div>
                      </Link>

                      <button className={`btn position-absolute`} style={{ top: 10, right: 10, background: 'rgba(255,255,255,0.9)', borderRadius: '50%' }} onClick={() => toggleWishlist(p.id)}>
                        <i className={`fas ${isInWishlist(p.id) ? 'fa-heart' : 'fa-heart-o'}`} />
                      </button>
                    </div>

                    <div className="card-body d-flex flex-column">
                      <Link href={`/product/${p.id}`} className="text-decoration-none text-dark"><h6 className="card-title">{p.name}</h6></Link>
                      <p className="fw-bold text-primary mb-2">₹{p.price}</p>
                      <p className="text-muted small mb-3">{(p.category as any)?.name ?? p.category}</p>

                      <div className="mt-auto d-flex gap-2">
                        <button className="btn btn-primary w-100" onClick={() => addToCart(p, 1)}>Add to Cart</button>
                        <Link href={`/product/${p.id}`} className="btn btn-outline-secondary">View Details</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {page < totalPages && (
              <div className="text-center mt-5">
                <button className="btn btn-primary px-4 py-2 rounded-pill" onClick={loadMore}>Load More Sarees</button>
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-5 text-muted">
                <h5>No sarees match your filters. Try adjusting them!</h5>
                <button className="btn btn-primary mt-3" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" />
    </>
  );
}
