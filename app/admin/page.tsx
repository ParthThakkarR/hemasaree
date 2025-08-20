// 'use client';

// import { useEffect, useState } from 'react';

// export default function AdminPage() {
//   const [categories, setCategories] = useState<any[]>([]);
//   const [categoryName, setCategoryName] = useState('');
//   const [categoryImage, setCategoryImage] = useState<File | null>(null);
//   const [categoryImageUrl, setCategoryImageUrl] = useState('');

//   const [productData, setProductData] = useState({
//     name: '',
//     description: '',
//     price: '',
//     stock: '',
//     category: '', // will hold categoryId now
//   });
//   const [productImages, setProductImages] = useState<FileList | null>(null);
//   const [productImageUrls, setProductImageUrls] = useState<string[]>([]);

//   // Fetch all categories from API
//   const fetchCategories = async () => {
//     try {
//       const res = await fetch('/api/categories');
//       const data = await res.json();
//       setCategories(data);
//     } catch (err) {
//       console.error('Error fetching categories:', err);
//     }
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   // Upload image file and get back URL
//   const uploadImage = async (file: File) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     const res = await fetch('/api/admin/upload', {
//       method: 'POST',
//       body: formData,
//     });
//     const data = await res.json();
//     return data.url;
//   };

//   // Handle category add
//   const handleAddCategory = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!categoryName || (!categoryImage && !categoryImageUrl))
//       return alert('Category name and at least one image is required');

//     let finalImageUrl = '';

//     if (categoryImage) {
//       finalImageUrl = await uploadImage(categoryImage);
//     } else if (categoryImageUrl) {
//       finalImageUrl = categoryImageUrl;
//     }

//     const res = await fetch('/api/admin/add/categories', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name: categoryName,
//         image: finalImageUrl,
//       }),
//     });

//     if (res.ok) {
//       setCategoryName('');
//       setCategoryImage(null);
//       setCategoryImageUrl('');
//       fetchCategories();
//       alert('Category added!');
//     } else {
//       alert('Error adding category');
//     }
//   };

//   // Handle product add
//   const handleAddProduct = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const { name, description, price, stock, category } = productData;

//     if (
//       !name ||
//       !description ||
//       !price ||
//       !stock ||
//       !category ||
//       (!productImages && productImageUrls.length === 0)
//     ) {
//       return alert('All product fields are required');
//     }

//     let uploadedUrls: string[] = [];

//     // Upload product images
//     if (productImages) {
//       for (const file of Array.from(productImages)) {
//         const url = await uploadImage(file);
//         uploadedUrls.push(url);
//       }
//     }

//     // Append URLs from input
//     uploadedUrls = [...uploadedUrls, ...productImageUrls];

//     const res = await fetch('/api/admin/add/products', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name,
//         description,
//         price: parseFloat(price),
//         stock: parseInt(stock),
//         categoryId: category, // Send categoryId (not category name)
//         images: uploadedUrls,
//       }),
//     });

//     if (res.ok) {
//       setProductData({
//         name: '',
//         description: '',
//         price: '',
//         stock: '',
//         category: '',
//       });
//       setProductImages(null);
//       setProductImageUrls([]);
//       alert('Product added!');
//     } else {
//       alert('Error adding product');
//     }
//   };

//   return (
//     <main style={{ padding: '2rem' }}>
//       <h1>🛍️ Admin Dashboard</h1>

//       {/* Add Category */}
//       <section>
//         <h2>Add Category</h2>
//         <form onSubmit={handleAddCategory}>
//           <input
//             type="text"
//             placeholder="Category Name"
//             value={categoryName}
//             onChange={(e) => setCategoryName(e.target.value)}
//           />
//           <input
//             type="file"
//             onChange={(e) => setCategoryImage(e.target.files?.[0] || null)}
//           />
//           <input
//             type="url"
//             placeholder="Image URL"
//             value={categoryImageUrl}
//             onChange={(e) => setCategoryImageUrl(e.target.value)}
//           />
//           <button type="submit">Add Category</button>
//         </form>
//       </section>

//       <hr />

//       {/* Add Product */}
//       <section>
//         <h2>Add Product</h2>
//         <form onSubmit={handleAddProduct}>
//           <input
//             type="text"
//             placeholder="Product Name"
//             value={productData.name}
//             onChange={(e) =>
//               setProductData({ ...productData, name: e.target.value })
//             }
//           />
//           <textarea
//             placeholder="Product Description"
//             value={productData.description}
//             onChange={(e) =>
//               setProductData({ ...productData, description: e.target.value })
//             }
//           />
//           <input
//             type="number"
//             placeholder="Price"
//             value={productData.price}
//             onChange={(e) =>
//               setProductData({ ...productData, price: e.target.value })
//             }
//           />
//           <input
//             type="number"
//             placeholder="Stock"
//             value={productData.stock}
//             onChange={(e) =>
//               setProductData({ ...productData, stock: e.target.value })
//             }
//           />

//           <select
//             value={productData.category}
//             onChange={(e) =>
//               setProductData({ ...productData, category: e.target.value })
//             }
//           >
//             <option value="">Select Category</option>
//             {categories.map((cat) => (
//               <option key={cat.id} value={cat.id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>

//           <input
//             type="file"
//             multiple
//             onChange={(e) => setProductImages(e.target.files)}
//           />

//           // Fixed version of the image URL input handling
// <input
//   type="text"
//   placeholder="Image URLs (comma separated)"
//   value={productImageUrls.join(', ')}
//   onChange={(e) => {
//     const inputValue = e.target.value.trim();
    
//     // Check if it's a single base64 string (don't split it!)
//     if (inputValue.startsWith('data:image/') && inputValue.includes('base64,')) {
//       // It's a base64 string, treat as single image
//       setProductImageUrls([inputValue]);
//     } else {
//       // It's regular URLs, split by comma
//       setProductImageUrls(
//         inputValue
//           .split(',')
//           .map((url) => url.trim())
//           .filter((url) => url)
//       );
//     }
//   }}
// />

//           <button type="submit">Add Product</button>
//         </form>
//       </section>
//     </main>
//   );
// }


'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';

// Recommended: Use a toast library for notifications
// import { toast } from 'react-toastify'; 
// or another library like 'sonner'

// 1. Define types for your data for better type-safety
interface Category {
  id: string;
  name: string;
  image: string;
}

export default function AdminPage() {
  // --- STATE MANAGEMENT ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Category Form State
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  const categoryFileRef = useRef<HTMLInputElement>(null);

  // Product Form State
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '', // will hold categoryId
  });
  const [productImages, setProductImages] = useState<FileList | null>(null);
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const productFileRef = useRef<HTMLInputElement>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // toast.error('Could not load categories.');
        alert('Could not load categories.');
      }
    };
    fetchCategories();
  }, []);

  // --- HELPER FUNCTIONS ---
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error('Image upload failed');
    }
    const data = await res.json();
    return data.url;
  };

  // --- FORM HANDLERS ---
  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName || (!categoryImage && !categoryImageUrl)) {
      // toast.warn('Category name and an image are required.');
      return alert('Category name and an image are required.');
    }

    setIsLoading(true);
    try {
      let finalImageUrl = categoryImageUrl;
      if (categoryImage) {
        finalImageUrl = await uploadImage(categoryImage);
      }

      const res = await fetch('/api/admin/add/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName, image: finalImageUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add category');
      }

      // Success
      // toast.success('Category added!');
      alert('Category added!');
      setCategoryName('');
      setCategoryImage(null);
      setCategoryImageUrl('');
      if (categoryFileRef.current) categoryFileRef.current.value = '';
      // Refetch categories to update the product dropdown
      const newCategories = await fetch('/api/categories').then(res => res.json());
      setCategories(newCategories);

    } catch (err: any) {
      console.error(err);
      // toast.error(err.message || 'An error occurred.');
      alert(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    const { name, description, price, stock, category } = productData;

    if (!name || !description || !price || !stock || !category || (!productImages && productImageUrls.length === 0)) {
      // toast.warn('Please fill out all product fields.');
      return alert('Please fill out all product fields.');
    }

    setIsLoading(true);
    try {
      let uploadedUrls: string[] = [];

      // 2. Upload images in parallel for better performance
      if (productImages) {
        const uploadPromises = Array.from(productImages).map(file => uploadImage(file));
        const newUrls = await Promise.all(uploadPromises);
        uploadedUrls = [...uploadedUrls, ...newUrls];
      }

      // Combine with URLs from input
      uploadedUrls = [...uploadedUrls, ...productImageUrls];

      const res = await fetch('/api/admin/add/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          categoryId: category,
          images: uploadedUrls,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      // Success
      // toast.success('Product added!');
      alert('Product added!');
      setProductData({ name: '', description: '', price: '', stock: '', category: '' });
      setProductImages(null);
      setProductImageUrls([]);
      if (productFileRef.current) productFileRef.current.value = '';

    } catch (err: any) {
      console.error(err);
      // toast.error(err.message || 'An error occurred.');
      alert(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- JSX / RENDER ---
  return (
    <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1>🛍️ Admin Dashboard</h1>

      <section>
        <h2>Add Category</h2>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
          <input type="text" placeholder="Category Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
          <input type="file" accept="image/*" ref={categoryFileRef} onChange={(e) => setCategoryImage(e.target.files?.[0] || null)} />
          <input type="url" placeholder="Or Image URL" value={categoryImageUrl} onChange={(e) => setCategoryImageUrl(e.target.value)} />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </section>

      <hr />

      <section>
        <h2>Add Product</h2>
        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
          <input type="text" placeholder="Product Name" value={productData.name} onChange={(e) => setProductData({ ...productData, name: e.target.value })} required />
          <textarea placeholder="Product Description" value={productData.description} onChange={(e) => setProductData({ ...productData, description: e.target.value })} required />
          <input type="number" placeholder="Price" min="0" step="0.01" value={productData.price} onChange={(e) => setProductData({ ...productData, price: e.target.value })} required />
          <input type="number" placeholder="Stock" min="0" step="1" value={productData.stock} onChange={(e) => setProductData({ ...productData, stock: e.target.value })} required />
          <select value={productData.category} onChange={(e) => setProductData({ ...productData, category: e.target.value })} required>
            <option value="" disabled>Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <label>Upload Images:</label>
          <input type="file" multiple accept="image/*" ref={productFileRef} onChange={(e) => setProductImages(e.target.files)} />
          <label>Or Add Image URLs (comma-separated):</label>
          <input
            type="text"
            placeholder="https://.../img1.png, https://.../img2.png"
            value={productImageUrls.join(', ')}
            onChange={(e) => {
              const urls = e.target.value.split(',').map(url => url.trim()).filter(url => url);
              setProductImageUrls(urls);
            }}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </section>
    </main>
  );
}