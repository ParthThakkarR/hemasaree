// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { ShoppingCart, CheckCircle, AlertTriangle } from 'lucide-react';
// import axios from 'axios';

// // Interface for the product data
// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   images: string[];
//   stock: number;
// }

// export default function ProductDetailPage() {
//   // --- HOOKS ---
//   // All hooks are now declared at the top level of the component, which is required by React.
//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [withPolish, setWithPolish] = useState(false); // Consolidated state for polish option
//   const [imageToDisplay, setImageToDisplay] = useState<string | null>(null);

//   const params = useParams();
//   const router = useRouter();
//   const { id } = params;

//   // --- DATA FETCHING EFFECT ---
//   useEffect(() => {
//     if (id) {
//       fetch(`/api/products/${id}`)
//         .then(res => {
//           if (!res.ok) throw new Error('Product not found');
//           return res.json();
//         })
//         .then((data: Product) => {
//           setProduct(data);
//           // Set initial image
//           if (Array.isArray(data.images) && data.images.length > 0) {
//             // This logic handles a specific case of base64-encoded image pairs
//             if (data.images.length >= 2 && data.images[0].startsWith('data:image/') && !data.images[0].includes(',')) {
//               setImageToDisplay(data.images[0] + ',' + data.images[1]);
//             } else {
//               setImageToDisplay(data.images[0]);
//             }
//           }
//         })
//         .catch(() => setError('Failed to load product. It may not exist.'))
//         .finally(() => setLoading(false));
//     }
//   }, [id]);

//   // --- EVENT HANDLERS ---
//   const handleAddToCart = async () => {
//     if (!product) return;

//     const finalPrice = withPolish ? product.price + 100 : product.price;
//     const productName = withPolish ? `${product.name} (With Polish)` : `${product.name} (Without Polish)`;

//     try {
//       const payload = {
//         productId: product.id,
//         productName: productName,
//         productImage: imageToDisplay,
//         price: finalPrice,
//         quantity: 1,
//         withPolish: withPolish, // This is the key piece of data for the return logic
//       };

//       const response = await axios.post('/api/cart', payload);

//       if (response.status === 200 || response.status === 201) {
//           alert(`"${productName}" was added to your cart!`);
//       }

//     } catch (err: any) {
//       if (err.response?.status === 401) {
//         alert('Please log in to add items to your cart.');
//         router.push('/login');
//         return;
//       }
//       alert(`An error occurred: ${err.response?.data?.error || err.message}`);
//     }
//   };

//   // --- RENDER HELPERS ---
//   const renderStockStatus = () => {
//     if (!product || product.stock === null) return null;

//     if (product.stock > 10) {
//       return <span className="badge bg-success">In Stock</span>;
//     }
//     if (product.stock > 0) {
//       return <span className="badge bg-warning text-dark">Low Stock ({product.stock} left)</span>;
//     }
//     return <span className="badge bg-danger">Out of Stock</span>;
//   };

//   // --- CONDITIONAL RENDERING ---
//   if (loading) return <p className="text-center mt-5">Loading product...</p>;
//   if (error) return <p className="text-center mt-5 text-danger">{error}</p>;
//   if (!product) return <p className="text-center mt-5">Product not found.</p>;

//   // --- MAIN JSX ---
//   return (
//     <div className="container my-5">
//       <div className="row">
//         <div className="col-md-6">
//           <img 
//             src={imageToDisplay || '/uploads/placeholder.png'} 
//             alt={product.name} 
//             className="img-fluid rounded shadow"
//             onError={(e) => { e.currentTarget.src = '/uploads/placeholder.png'; }}
//           />
//         </div>
//         <div className="col-md-6">
//           <div className="d-flex justify-content-between align-items-center">
//             <h2>{product.name}</h2>
//             {renderStockStatus()}
//           </div>
//           <p className="text-muted">{product.description}</p>
//           <h3 className="my-3">
//             Price: ₹{withPolish ? (product.price + 100).toFixed(2) : product.price.toFixed(2)}
//             {withPolish && <small className="text-success ms-2">(+ ₹100 for polish)</small>}
//           </h3>
          
//           <div className="mb-4">
//             <h5>Options</h5>
//             <div className="d-grid gap-2 d-sm-flex">
//               <button 
//                 className={`btn ${!withPolish ? 'btn-primary' : 'btn-outline-primary'}`}
//                 onClick={() => setWithPolish(false)}
//               >
//                 {!withPolish && <CheckCircle size={16} className="me-1"/>}
//                 Without Polish
//               </button>
//               <button 
//                 className={`btn ${withPolish ? 'btn-primary' : 'btn-outline-primary'}`}
//                 onClick={() => setWithPolish(true)}
//               >
//                 {withPolish && <CheckCircle size={16} className="me-1"/>}
//                 With Polish
//               </button>
//             </div>
//           </div>

//           <button 
//             className="btn btn-success btn-lg w-100" 
//             onClick={handleAddToCart}
//             disabled={product.stock === 0}
//           >
//             {product.stock > 0 ? (
//               <>
//                 <ShoppingCart className="me-2"/>
//                 Add to Cart
//               </>
//             ) : (
//               <>
//                 <AlertTriangle className="me-2"/>
//                 Out of Stock
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



// File: /app/products/[id]/page.tsx

'use client';


import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import toast, { Toaster } from 'react-hot-toast';

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
  const [polish, setPolish] = useState(true); // Default to with polish to encourage selection
  const [cartCount, setCartCount] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [activeImage, setActiveImage] = useState(0);
  const router = useRouter();

  // fetch single product
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/products/${productId}`);
      setProduct(res.data);
    } catch (err) {
      console.error('[PRODUCT_FETCH_ERROR]', err);
      toast.error('Failed to load product.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // fetch related products (same category) limit 4 exclude current
  const fetchRelated = useCallback(async (categoryName?: string) => {
    try {
      if (!categoryName) { setRelated([]); return; }
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '8'); // fetch a few and slice/ filter
      params.append('category', categoryName);
      const res = await axios.get(`${API_BASE}/api/products?${params.toString()}`);
      const items: Product[] = Array.isArray(res.data.products) ? res.data.products : (res.data.products || []);
      const filtered = items.filter(p => p.id !== productId).slice(0, 4);
      setRelated(filtered);
    } catch (err) {
      console.error('[RELATED_FETCH_ERROR]', err);
      setRelated([]);
    }
  }, [productId]);

  // fetch cart count
  const fetchCart = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/cart`);
      const cart = res.data?.cart;
      if (!cart || !Array.isArray(cart.items)) { setCartCount(0); return; }
      const count = cart.items.reduce((s: number, i: any) => s + (i.quantity || 0), 0);
      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchCart();
  }, [fetchProduct, fetchCart]);

  useEffect(() => {
    if (product) fetchRelated((product.category as any)?.name ?? String(product.category));
  }, [product, fetchRelated]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const addToCart = async (qty = 1) => {
    if (!product) return;
    try {
      const finalPrice = product.price + (polish ? POLISH_PRICE : 0);
      const body = {
        productId: product.id,
        quantity: qty,
        productName: product.name,
        productImage: product.images?.[0] || '',
        price: finalPrice,
        withPolish: polish
      };
      const res = await axios.post(`${API_BASE}/api/cart`, body);
      const updatedCart = res.data?.cart;
      const newCount = updatedCart?.items?.reduce((s: number, i: any) => s + (i.quantity || 0), 0) ?? cartCount + qty;
      setCartCount(newCount);
      toast.success(`Added to cart${polish ? ' (with polish)' : ''}!`);
    } catch (err: any) {
      console.error('[CART_ADD_ERROR]', err);
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
    } catch {
      toast.error('Wishlist error');
    }
  };

  const isInWishlist = useMemo(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      const arr = saved ? JSON.parse(saved) as string[] : [];
      return (id: string) => arr.includes(id);
    } catch {
      return (_: string) => false;
    }
  }, []);

  if (loading) {
    return (
      <>
        <Head><title>Loading... | Ethereal Sarees</title></Head>
        <div className="container py-6 text-center">Loading product...</div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Head><title>Product Not Found | Ethereal Sarees</title></Head>
        <div className="container py-6 text-center">
          <h4>Product not found</h4>
          <Link href="/products" className="btn btn-primary mt-3">Back to products</Link>
        </div>
      </>
    );
  }

  const displayPrice = product.price + (polish ? POLISH_PRICE : 0);

  return (
    <>
      <Head>
        <title>{product.name} | Ethereal Sarees</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <style jsx global>{`
        :root {
          --bg-main: #fdf6f0;
          --text-primary: #1e293b;
          --accent-primary: #e76f51;
          --accent-secondary: #f7c6c7;
          --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          --gradient-accent: linear-gradient(135deg, #e76f51 0%, #f7c6c7 100%);
        }
        body {
          font-family: 'Inter', sans-serif;
          background: var(--bg-main);
          color: var(--text-primary);
        }
        .navbar {
          background: #ffffff !important;
          box-shadow: var(--shadow);
        }
        .product-image-container {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: box-shadow 0.3s ease;
        }
        .product-image-container:hover {
          box-shadow: 0 12px 24px rgba(231, 111, 81, 0.2);
        }
        .thumbnail {
          cursor: pointer;
          border: 2px solid transparent;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .thumbnail.active {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(231, 111, 81, 0.2);
        }
        .thumbnail:hover {
          transform: scale(1.05);
        }
        .polish-card {
          border-radius: 12px;
          box-shadow: var(--shadow);
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #ffffff;
        }
        .polish-card.active {
          background: var(--gradient-accent);
          color: white !important;
          box-shadow: 0 8px 20px rgba(231, 111, 81, 0.3);
        }
        .polish-card:hover {
          transform: translateY(-4px);
        }
        .polish-card.active .text-muted {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        .polish-card .bi {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .add-to-cart-btn {
          background: var(--gradient-accent) !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(231, 111, 81, 0.3);
          transition: all 0.3s ease;
        }
        .add-to-cart-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(231, 111, 81, 0.4);
        }
        .related-card {
          border: none;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow);
          transition: all 0.3s ease;
        }
        .related-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(231, 111, 81, 0.2);
        }
        .related-image {
          height: 200px;
          object-fit: cover;
        }
      `}</style>

      <nav className="navbar navbar-expand-lg py-3 shadow-sm bg-white">
        <div className="container-fluid">
          <Link href="/" className="navbar-brand fw-light fs-4">Ethereal Sarees</Link>
          <div className="d-flex ms-auto gap-3">
            <Link href="/wishlist" className="nav-link">Wishlist</Link>
            <Link href="/cart" className="nav-link">Cart ({cartCount})</Link>
          </div>
        </div>
      </nav>

      <div className="container my-5">
        <div className="row g-5">
          <div className="col-md-5">
            <div className="product-image-container" ref={imageRef} 
                 onMouseEnter={() => setIsZoomed(true)} 
                 onMouseLeave={() => setIsZoomed(false)} 
                 onMouseMove={handleMouseMove}>
              <Image 
                src={getImageSrc(product.images[activeImage])} 
                alt={product.name}
                width={500}
                height={600}
                className="img-fluid"
                style={{
                  transform: isZoomed ? `scale(2.5) translate(${50 - zoomPosition.x}%, ${50 - zoomPosition.y}%)` : 'scale(1)',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transition: 'transform 0.12s ease',
                  objectFit: 'cover'
                }}
              />
            </div>
            {product.images.length > 1 && (
              <div className="d-flex gap-2 mt-3 justify-content-center">
                {product.images.map((img, idx) => (
                  <div key={idx} className={`thumbnail ${idx === activeImage ? 'active' : ''}`} onClick={() => setActiveImage(idx)}>
                    <Image 
                      src={getImageSrc(img)} 
                      alt={`${product.name} thumbnail ${idx+1}`}
                      width={80}
                      height={100}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-md-7">
            <h1 className="mb-3 fw-bold">{product.name}</h1>
            <p className="fw-bold text-primary fs-3 mb-4">₹{displayPrice.toLocaleString()}</p>
            
            <div className="mb-4">
              <h5 className="mb-3 fw-semibold">Choose Finish</h5>
              <div className="row g-3">
                <div className="col-6" onClick={() => setPolish(true)}>
                  <div className={`polish-card text-center ${polish ? 'active' : ''}`}>
                    <i className="bi bi-gem display-6 mb-2" style={{ color: polish ? '#fff' : '#e76f51' }}></i>
                    <h6 className="mb-1">With Polish</h6>
                    <p className="small text-muted mb-0">+₹{POLISH_PRICE}</p>
                    <p className="small mb-0">Recommended for extra shine & elegance</p>
                  </div>
                </div>
                <div className="col-6" onClick={() => setPolish(false)}>
                  <div className={`polish-card text-center ${!polish ? 'active' : ''}`}>
                    <i className="bi bi-circle display-6 mb-2" style={{ color: !polish ? '#fff' : '#e76f51' }}></i>
                    <h6 className="mb-1">Without Polish</h6>
                    <p className="small text-muted mb-0">Standard finish</p>
                    <p className="small mb-0">Natural look</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="mb-3 fw-semibold">Product Details</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><strong>Category:</strong> {(product.category as any)?.name ?? product.category}</li>
                <li className="mb-2"><strong>Color:</strong> {product.color ?? '-'}</li>
                <li className="mb-2"><strong>Occasion:</strong> {product.ocassion ?? '-'}</li>
                <li className="mb-2"><strong>Stock:</strong> {product.stock} available</li>
                {product.rating && <li className="mb-2"><strong>Rating:</strong> {product.rating}/5</li>}
              </ul>
              <p className="text-muted">{product.description}</p>
            </div>

            <div className="d-flex gap-3 mb-4">
              <button className="btn btn-primary flex-grow-1 add-to-cart-btn" onClick={() => addToCart(1)}>
                <i className="bi bi-bag me-2"></i> Add to Cart
              </button>
              <button className="btn btn-outline-secondary" onClick={() => toggleWishlist(product.id)}>
                <i className={`bi bi-heart${isInWishlist(product.id) ? '-fill' : ''} me-2`}></i>
                {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            <div>
              <button className="btn btn-link p-0" onClick={() => router.push('/products')}>
                <i className="bi bi-arrow-left me-2"></i> Back to products
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <hr className="my-5" />
        <h3 className="mb-4 text-center fw-bold">You May Also Like</h3>
        <div className="row g-4">
          {related.map(r => (
            <div key={r.id} className="col-md-3">
              <div className="related-card">
                <Link href={`/product/${r.id}`}>
                  <Image 
                    src={getImageSrc(r.images?.[0])} 
                    alt={r.name}
                    width={300}
                    height={400}
                    className="related-image w-100"
                  />
                </Link>
                <div className="p-3">
                  <Link href={`/product /${r.id}`} className="text-decoration-none text-dark">
                    <h6 className="mb-1">{r.name}</h6>
                  </Link>
                  <p className="mb-0 fw-bold">₹{r.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
          {related.length === 0 && <p className="text-center text-muted">No related products found.</p>}
        </div>
      </div>

      <Toaster position="top-right" />
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" />
    </>
  );
}