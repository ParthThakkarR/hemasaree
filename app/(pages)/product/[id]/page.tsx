'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

// Interface for the product data
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
}

export default function ProductDetailPage() {
  // --- HOOKS ---
  // All hooks are now declared at the top level of the component, which is required by React.
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withPolish, setWithPolish] = useState(false); // Consolidated state for polish option
  const [imageToDisplay, setImageToDisplay] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const { id } = params;

  // --- DATA FETCHING EFFECT ---
  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Product not found');
          return res.json();
        })
        .then((data: Product) => {
          setProduct(data);
          // Set initial image
          if (Array.isArray(data.images) && data.images.length > 0) {
            // This logic handles a specific case of base64-encoded image pairs
            if (data.images.length >= 2 && data.images[0].startsWith('data:image/') && !data.images[0].includes(',')) {
              setImageToDisplay(data.images[0] + ',' + data.images[1]);
            } else {
              setImageToDisplay(data.images[0]);
            }
          }
        })
        .catch(() => setError('Failed to load product. It may not exist.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // --- EVENT HANDLERS ---
  const handleAddToCart = async () => {
    if (!product) return;

    const finalPrice = withPolish ? product.price + 100 : product.price;
    const productName = withPolish ? `${product.name} (With Polish)` : `${product.name} (Without Polish)`;

    try {
      const payload = {
        productId: product.id,
        productName: productName,
        productImage: imageToDisplay,
        price: finalPrice,
        quantity: 1,
        withPolish: withPolish, // This is the key piece of data for the return logic
      };

      const response = await axios.post('/api/cart', payload);

      if (response.status === 200 || response.status === 201) {
          alert(`"${productName}" was added to your cart!`);
      }

    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('Please log in to add items to your cart.');
        router.push('/login');
        return;
      }
      alert(`An error occurred: ${err.response?.data?.error || err.message}`);
    }
  };

  // --- RENDER HELPERS ---
  const renderStockStatus = () => {
    if (!product || product.stock === null) return null;

    if (product.stock > 10) {
      return <span className="badge bg-success">In Stock</span>;
    }
    if (product.stock > 0) {
      return <span className="badge bg-warning text-dark">Low Stock ({product.stock} left)</span>;
    }
    return <span className="badge bg-danger">Out of Stock</span>;
  };

  // --- CONDITIONAL RENDERING ---
  if (loading) return <p className="text-center mt-5">Loading product...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;
  if (!product) return <p className="text-center mt-5">Product not found.</p>;

  // --- MAIN JSX ---
  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-md-6">
          <img 
            src={imageToDisplay || '/uploads/placeholder.png'} 
            alt={product.name} 
            className="img-fluid rounded shadow"
            onError={(e) => { e.currentTarget.src = '/uploads/placeholder.png'; }}
          />
        </div>
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center">
            <h2>{product.name}</h2>
            {renderStockStatus()}
          </div>
          <p className="text-muted">{product.description}</p>
          <h3 className="my-3">
            Price: ₹{withPolish ? (product.price + 100).toFixed(2) : product.price.toFixed(2)}
            {withPolish && <small className="text-success ms-2">(+ ₹100 for polish)</small>}
          </h3>
          
          <div className="mb-4">
            <h5>Options</h5>
            <div className="d-grid gap-2 d-sm-flex">
              <button 
                className={`btn ${!withPolish ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setWithPolish(false)}
              >
                {!withPolish && <CheckCircle size={16} className="me-1"/>}
                Without Polish
              </button>
              <button 
                className={`btn ${withPolish ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setWithPolish(true)}
              >
                {withPolish && <CheckCircle size={16} className="me-1"/>}
                With Polish
              </button>
            </div>
          </div>

          <button 
            className="btn btn-success btn-lg w-100" 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? (
              <>
                <ShoppingCart className="me-2"/>
                Add to Cart
              </>
            ) : (
              <>
                <AlertTriangle className="me-2"/>
                Out of Stock
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

