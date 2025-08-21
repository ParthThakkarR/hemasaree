// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { ShoppingCart, CheckCircle, AlertTriangle } from 'lucide-react';

// // Updated interface to include stock
// interface Product {
//   id: string;
//   name: string;
//   description: string;
//   price: number;
//   images: string[];
//   stock: number; // Added stock property
// }

// export default function ProductDetailPage() {
//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [polish, setPolish] = useState(false);
//   const [imageToDisplay, setImageToDisplay] = useState<string | null>(null);

//   const params = useParams();
//   const router = useRouter();
//   const { id } = params;

//   useEffect(() => {
//     if (id) {
//       fetch(`/api/products/${id}`)
//         .then(res => {
//           if (!res.ok) throw new Error('Product not found');
//           return res.json();
//         })
//         .then((data: Product) => {
//           setProduct(data);
//           // Fix the image URL on load
//           if (Array.isArray(data.images) && data.images.length > 0) {
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

//   const addToCart = async () => {
//       // ... (your addToCart function remains the same)
//   };

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

//   if (loading) return <p className="text-center mt-5">Loading product...</p>;
//   if (error) return <p className="text-center mt-5 text-danger">{error}</p>;
//   if (!product) return <p className="text-center mt-5">Product not found.</p>;

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
//             Price: ₹{polish ? (product.price + 100).toFixed(2) : product.price.toFixed(2)}
//             {polish && <small className="text-success ms-2">(+ ₹100 for polish)</small>}
//           </h3>
          
//           <div className="mb-4">
//             <h5>Options</h5>
//             <div className="d-grid gap-2 d-sm-flex">
//               <button 
//                 className={`btn ${!polish ? 'btn-primary' : 'btn-outline-primary'}`}
//                 onClick={() => setPolish(false)}
//               >
//                 {!polish && <CheckCircle size={16} className="me-1"/>}
//                 Without Polish
//               </button>
//               <button 
//                 className={`btn ${polish ? 'btn-primary' : 'btn-outline-primary'}`}
//                 onClick={() => setPolish(true)}
//               >
//                 {polish && <CheckCircle size={16} className="me-1"/>}
//                 With Polish
//               </button>
//             </div>
//           </div>

//           <button 
//             className="btn btn-success btn-lg w-100" 
//             onClick={addToCart}
//             disabled={product.stock === 0} // Disable button if out of stock
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



'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, CheckCircle, AlertTriangle } from 'lucide-react';

// Updated interface to include stock
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number; // Added stock property
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polish, setPolish] = useState(false);
  const [imageToDisplay, setImageToDisplay] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Product not found');
          return res.json();
        })
        .then((data: Product) => {
          setProduct(data);
          // Fix the image URL on load
          if (Array.isArray(data.images) && data.images.length > 0) {
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

  // --- FIXED FUNCTION ---
  const addToCart = async () => {
    if (!product) return;

    // The price and name sent to the backend depend on the polish option
    const finalPrice = polish ? product.price + 100 : product.price;
    const productName = polish ? `${product.name} (With Polish)` : product.name;

    try {
      const payload = {
        productId: product.id,
        productName: productName,
        productImage: imageToDisplay,
        price: finalPrice,
        quantity: 1,
      };

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        alert('Please log in to add items to your cart.');
        router.push('/login');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product to cart');
      }

      alert(`"${productName}" was added to your cart!`);

    } catch (err: any) {
      alert(`An error occurred: ${err.message}`);
    }
  };

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

  if (loading) return <p className="text-center mt-5">Loading product...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;
  if (!product) return <p className="text-center mt-5">Product not found.</p>;

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
            Price: ₹{polish ? (product.price + 100).toFixed(2) : product.price.toFixed(2)}
            {polish && <small className="text-success ms-2">(+ ₹100 for polish)</small>}
          </h3>
          
          <div className="mb-4">
            <h5>Options</h5>
            <div className="d-grid gap-2 d-sm-flex">
              <button 
                className={`btn ${!polish ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setPolish(false)}
              >
                {!polish && <CheckCircle size={16} className="me-1"/>}
                Without Polish
              </button>
              <button 
                className={`btn ${polish ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setPolish(true)}
              >
                {polish && <CheckCircle size={16} className="me-1"/>}
                With Polish
              </button>
            </div>
          </div>

          <button 
            className="btn btn-success btn-lg w-100" 
            onClick={addToCart}
            disabled={product.stock === 0} // Disable button if out of stock
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
