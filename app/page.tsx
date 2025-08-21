// // 'use client'

// // import Image from "next/image";
// // import styles from "./page.module.css";
// // import { useEffect, useState } from "react";

// // export default function Home() {
// //   const [users,setUSers]=  useState([]);
// //  useEffect(()=>{
// //   async function fetchUsers(){
// //     const user = await fetch('/api/users')
// //     const data = await user.json();
// //     console.log(data);
// //     setUSers(data);
    
// //   }
// //   fetchUsers();
// //  },[])
// // const [categories,setCategories]=  useState([]);
// //  useEffect(()=>{
// //   async function fetchCategories(){
// //     const category = await fetch('/api/categories')
// //     const data = await category.json();
// //     console.log(data);
// //     setCategories(data);
    
// //   }
// //   fetchCategories();
// //  },[])
// // const [Products,setProducts]=  useState([]);
// //  useEffect(()=>{
// //   async function fetchProducts(){
// //     const products=await fetch('/api/products')
// //     const data = await products.json();
// //     console.log(data);
// //     setProducts(data);
    
// //   }
// //   fetchProducts();
// //  },[])
// //   return (
// //     <>
// //     <div>
// //             <h1>User list</h1>  
// //       {users.map((d:any)=>(
// //         <h1>{d.firstName}</h1>
// //       ))}
// //       <h1>Categories List</h1>
// //       {categories.map((c:any)=>(
// //       <div>
// //         <h1>{c.categoryName}</h1>
// //         <img src={c.categoryImage} />
// //         </div>
// //       ))}
// //       <h1>Products List</h1>
// //       {Products.map((p:any)=>(
// //       <div>
// //         <h1>{p.name}</h1>
// //         <h2> {p.description} </h2>
// //         </div>
// //       ))}

      
// //     </div>
// //     </>
// //   );
// // }
// 'use client';

// import { useEffect, useState } from "react";
// import { useRouter } from 'next/navigation'; // Import useRouter
// import { ArrowRight, ShoppingCart } from "lucide-react";

// export default function Home() {
//   const [categories, setCategories] = useState<any[]>([]);
//   const [products, setProducts] = useState<any[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
//   const router = useRouter(); // Initialize the router

//   useEffect(() => {
//     // Fetch categories
//     fetch('/api/categories')
//       .then(r => r.json())
//       .then(d => {
//         console.log("Fetched Categories:", d);
//         setCategories(Array.isArray(d) ? d : []);
//       })
//       .catch(err => console.error("Error fetching categories:", err));

//     // Fetch products
//     fetch('/api/products')
//       .then(r => r.json())
//       .then(d => {
//         console.log("Fetched Products:", d);
//         setProducts(Array.isArray(d) ? d : []);
//       })
//       .catch(err => console.error("Error fetching products:", err));
//   }, []);

//   // Fixed: Match products by category ID (comparing with category.id)
//   const getProductsByCategory = (categoryId: string) => {
//     console.log("Filtering for category:", categoryId);
//     const filteredProducts = products.filter((p) => {
//       console.log("Product category:", p.category);
//       return p.category?.id?.toString() === categoryId;
//     });
//     console.log("Filtered products:", filteredProducts);
//     return filteredProducts;
//   };

//   // Handle image URL with better error handling
//   const getImageUrl = (path?: string | null) => {
//     if (!path) return `/uploads/placeholder.png`;
    
//     // Clean up the path - remove quotes if present
//     let cleanPath = path.toString().trim();
//     if (cleanPath.startsWith('"') && cleanPath.endsWith('"')) {
//       cleanPath = cleanPath.slice(1, -1);
//     }
    
//     // Handle base64 images
//     if (cleanPath.startsWith('data:image/')) {
//       // Check if base64 data is complete
//       if (cleanPath.includes('base64,') && cleanPath.split('base64,')[1]?.length > 10) {
//         return cleanPath;
//       } else {
//         console.warn('Invalid or incomplete base64 image:', cleanPath);
//         return `/uploads/placeholder.png`;
//       }
//     }
    
//     // Handle URLs
//     if (cleanPath.startsWith('http')) return cleanPath;
    
//     // Handle absolute file paths - extract just the filename
//     if (cleanPath.includes('\\') || cleanPath.includes('/')) {
//       const parts = cleanPath.split(/[\\\/]/);
//       const filename = parts[parts.length - 1];
//       return `/uploads/${filename}`;
//     }
    
//     // Handle relative paths
//     if (cleanPath.startsWith('/')) return cleanPath;
    
//     // Default case - assume it's a filename
//     return `/uploads/${cleanPath}`;
//   };

//   // Add to cart handler - MERGED CODE
//   const addToCart = async (product: any) => {
//   try {
//     // --- FIX STARTS HERE ---
//     let imageToSend = null;
//     if (Array.isArray(product.images) && product.images.length > 0) {
//       // Check for the same broken image pattern and reconstruct it if needed
//       if (product.images.length >= 2 &&
//           product.images[0].startsWith('data:image/') &&
//           !product.images[0].includes(',')) {
//         // Rejoin the broken parts before sending to the cart
//         imageToSend = product.images[0] + ',' + product.images[1];
//       } else {
//         // Otherwise, the image is fine, just use the first one
//         imageToSend = product.images[0];
//       }
//     }
//     // --- FIX ENDS HERE ---

//     const payload = {
//       productId: product.id,
//       productName: product.name,
//       productImage: imageToSend, // ✅ Use the fixed image string
//       price: product.price,
//       quantity: 1,
//     };

//     const response = await fetch('/api/cart', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });

//     if (response.status === 401) {
//       alert('Please log in to add items to your cart.');
//       router.push('/login');
//       return;
//     }

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.error || 'Failed to add product to cart');
//     }
    
//     alert(`"${product.name}" was added to your cart!`);

//   } catch (error: any) {
//     console.error("Add to Cart error:", error);
//     alert(`Error: ${error.message}`);
//   }
// };  
//   return (
//     <div className="container py-4">
//       {/* Categories */}
//       <section className="mb-5">
//         <h2 className="mb-3 fw-bold">Shop by Category</h2>
//         <div className="d-flex overflow-auto gap-4 pb-2 category-scroll">
//           {categories.map((c) => (
//             <div
//               key={c.id}
//               className="category-card shadow-sm"
//               onClick={() => {
//                 console.log("Selected category:", c.id);
//                 setSelectedCategory(c.id.toString());
//               }}
//             >
//               <img
//                 src={getImageUrl(c.image || c.categoryImage)} 
//                 alt={c.name || c.categoryName}
//                 className="category-img"
//                 onError={(e) => {
//                   console.log("Image load error for category:", c);
//                   e.currentTarget.src = '/uploads/placeholder.png';
//                 }}
//               />
//               <div className="category-overlay">
//                 <h5>{c.name || c.categoryName}</h5>
//                 <button className="btn btn-light btn-sm fw-semibold">
//                   Shop Now <ArrowRight size={14} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Products */}
//       {selectedCategory && (
//         <section>
//           <h2 className="mb-4 fw-bold">
//             Products in {categories.find(c => c.id.toString() === selectedCategory)?.name || 
//                         categories.find(c => c.id.toString() === selectedCategory)?.categoryName || 
//                         'Selected Category'}
//           </h2>
//           <div className="row g-4">
//             {getProductsByCategory(selectedCategory).length ? (
//               getProductsByCategory(selectedCategory).map((p) => {
//                 let imgSrc: string | undefined;

//                 if (Array.isArray(p.images) && p.images.length > 0) {
//                   // Fix split base64 data
//                   if (p.images.length >= 2 && 
//                       p.images[0].startsWith('data:image/') && 
//                       !p.images[0].includes(',')) {
//                     // Reconstruct the complete base64 string
//                     imgSrc = p.images[0] + ',' + p.images[1];
//                   } else {
//                     imgSrc = p.images[0];
//                   }
//                 } else if (typeof p.images === 'string') {
//                   imgSrc = p.images;
//                 }

//                 return (
//                   <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
//                     <div className="card product-card border-0 shadow-sm">
//                       <div className="image-container">
//                         <img
//                           src={getImageUrl(imgSrc)}
//                           alt={p.name}
//                           className="product-image"
//                           onError={(e) => {
//                             console.log("Image load error for product:", p, "URL was:", e.currentTarget.src);
//                             e.currentTarget.src = '/uploads/placeholder.png';
//                           }}
//                         />
//                         <button
//                           onClick={() => addToCart(p)}
//                           className="btn btn-dark add-to-cart-btn"
//                         >
//                           <ShoppingCart size={16} className="me-1" />
//                           Add to Cart
//                         </button>
//                       </div>
//                       <div className="card-body text-center">
//                         <h6 className="fw-bold">{p.name}</h6>
//                         <p className="text-muted small">{p.description}</p>
//                         {p.price && <p className="fw-bold text-danger">₹{p.price}</p>}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="col-12">
//                 <p className="text-center text-muted">No products found for this category.</p>
//               </div>
//             )}
//           </div>
//         </section>
//       )}

//       {/* Debug info - remove this in production */}
//       {process.env.NODE_ENV === 'development' && (
//         <section className="mt-5 p-3 bg-light rounded">
//           <h3>Debug Info:</h3>
//           <p>Categories loaded: {categories.length}</p>
//           <p>Products loaded: {products.length}</p>
//           <p>Selected category: {selectedCategory}</p>
//           {selectedCategory && (
//             <p>Products in selected category: {getProductsByCategory(selectedCategory).length}</p>
//           )}
//         </section>
//       )}

//       {/* Scoped Styles */}
//       <style jsx>{`
//         .category-card {
//           position: relative;
//           border-radius: 12px;
//           overflow: hidden;
//           min-width: 200px;
//           cursor: pointer;
//           transition: transform 0.3s ease;
//         }
//         .category-card:hover {
//           transform: translateY(-5px);
//         }
//         .category-img {
//           width: 100%;
//           height: 150px;
//           object-fit: cover;
//         }
//         .category-overlay {
//           position: absolute;
//           bottom: 0;
//           left: 0;
//           right: 0;
//           padding: 10px;
//           background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
//           color: white;
//         }
//         .image-container {
//           position: relative;
//           overflow: hidden;
//           border-radius: 8px;
//         }
//         .product-image {
//           width: 100%;
//           height: 220px;
//           object-fit: cover;
//           transition: transform 0.3s ease;
//         }
//         .product-card:hover .product-image {
//           transform: scale(1.05);
//         }
//         .add-to-cart-btn {
//           position: absolute;
//           bottom: 15px;
//           left: 50%;
//           transform: translateX(-50%);
//           opacity: 0;
//           transition: opacity 0.3s ease;
//         }
//         .image-container:hover .add-to-cart-btn {
//           opacity: 1;
//         }
//       `}</style>
//     </div>
//   );
// }


'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { ArrowRight } from "lucide-react";
import Link from 'next/link'; // Import Link for navigation

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        setCategories(Array.isArray(d) ? d : []);
      })
      .catch(err => console.error("Error fetching categories:", err));

    // Fetch products
    fetch('/api/products')
      .then(r => r.json())
      .then(d => {
        setProducts(Array.isArray(d) ? d : []);
      })
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const getProductsByCategory = (categoryId: string) => {
    return products.filter((p) => p.category?.id?.toString() === categoryId);
  };

  const getImageUrl = (path?: string | null) => {
    if (!path) return `/uploads/placeholder.png`;
    
    let cleanPath = path.toString().trim();
    if (cleanPath.startsWith('"') && cleanPath.endsWith('"')) {
      cleanPath = cleanPath.slice(1, -1);
    }
    
    if (cleanPath.startsWith('data:image/')) {
      if (cleanPath.includes('base64,') && cleanPath.split('base64,')[1]?.length > 10) {
        return cleanPath;
      } else {
        return `/uploads/placeholder.png`;
      }
    }
    
    if (cleanPath.startsWith('http')) return cleanPath;
    
    if (cleanPath.includes('\\') || cleanPath.includes('/')) {
      const parts = cleanPath.split(/[\\\/]/);
      const filename = parts[parts.length - 1];
      return `/uploads/${filename}`;
    }
    
    if (cleanPath.startsWith('/')) return cleanPath;
    
    return `/uploads/${cleanPath}`;
  };

  return (
    <div className="container py-4">
      {/* Categories */}
      <section className="mb-5">
        <h2 className="mb-3 fw-bold">Shop by Category</h2>
        <div className="d-flex overflow-auto gap-4 pb-2 category-scroll">
          {categories.map((c) => (
            <div
              key={c.id}
              className="category-card shadow-sm"
              onClick={() => {
                setSelectedCategory(c.id.toString());
              }}
            >
              <img
                src={getImageUrl(c.image || c.categoryImage)} 
                alt={c.name || c.categoryName}
                className="category-img"
                onError={(e) => {
                  e.currentTarget.src = '/uploads/placeholder.png';
                }}
              />
              <div className="category-overlay">
                <h5>{c.name || c.categoryName}</h5>
                <button className="btn btn-light btn-sm fw-semibold">
                  Shop Now <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      {selectedCategory && (
        <section>
          <h2 className="mb-4 fw-bold">
            Products in {categories.find(c => c.id.toString() === selectedCategory)?.name || 
                        categories.find(c => c.id.toString() === selectedCategory)?.categoryName || 
                        'Selected Category'}
          </h2>
          <div className="row g-4">
            {getProductsByCategory(selectedCategory).length ? (
              getProductsByCategory(selectedCategory).map((p) => {
                let imgSrc: string | undefined;

                if (Array.isArray(p.images) && p.images.length > 0) {
                  if (p.images.length >= 2 && 
                      p.images[0].startsWith('data:image/') && 
                      !p.images[0].includes(',')) {
                    imgSrc = p.images[0] + ',' + p.images[1];
                  } else {
                    imgSrc = p.images[0];
                  }
                } else if (typeof p.images === 'string') {
                  imgSrc = p.images;
                }

                return (
                  // --- CHANGE STARTS HERE ---
                  <div key={p.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                    <Link href={`pages/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="card product-card border-0 shadow-sm h-100">
                        <div className="image-container">
                          <img
                            src={getImageUrl(imgSrc)}
                            alt={p.name}
                            className="product-image"
                            onError={(e) => {
                              e.currentTarget.src = '/uploads/placeholder.png';
                            }}
                          />
                          {/* The Add to Cart button has been removed from here */}
                        </div>
                        <div className="card-body text-center">
                          <h6 className="fw-bold">{p.name}</h6>
                          <p className="text-muted small">{p.description}</p>
                          {p.price && <p className="fw-bold text-danger">₹{p.price}</p>}
                        </div>
                      </div>
                    </Link>
                  </div>
                  // --- CHANGE ENDS HERE ---
                );
              })
            ) : (
              <div className="col-12">
                <p className="text-center text-muted">No products found for this category.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Scoped Styles */}
      <style jsx>{`
        .category-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          min-width: 200px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .category-card:hover {
          transform: translateY(-5px);
        }
        .category-img {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }
        .category-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 10px;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
          color: white;
        }
        .image-container {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
        }
        .product-image {
          width: 100%;
          height: 220px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .product-card:hover .product-image {
          transform: scale(1.05);
        }
        /* Removed styles for the old add-to-cart-btn */
      `}</style>
    </div>
  );
}
