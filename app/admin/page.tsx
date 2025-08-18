'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImageUrl, setCategoryImageUrl] = useState('');

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '', // will hold categoryId now
  });
  const [productImages, setProductImages] = useState<FileList | null>(null);
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);

  // Fetch all categories from API
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Upload image file and get back URL
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.url;
  };

  // Handle category add
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName || (!categoryImage && !categoryImageUrl))
      return alert('Category name and at least one image is required');

    let finalImageUrl = '';

    if (categoryImage) {
      finalImageUrl = await uploadImage(categoryImage);
    } else if (categoryImageUrl) {
      finalImageUrl = categoryImageUrl;
    }

    const res = await fetch('/api/admin/add/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: categoryName,
        image: finalImageUrl,
      }),
    });

    if (res.ok) {
      setCategoryName('');
      setCategoryImage(null);
      setCategoryImageUrl('');
      fetchCategories();
      alert('Category added!');
    } else {
      alert('Error adding category');
    }
  };

  // Handle product add
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, price, stock, category } = productData;

    if (
      !name ||
      !description ||
      !price ||
      !stock ||
      !category ||
      (!productImages && productImageUrls.length === 0)
    ) {
      return alert('All product fields are required');
    }

    let uploadedUrls: string[] = [];

    // Upload product images
    if (productImages) {
      for (const file of Array.from(productImages)) {
        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }
    }

    // Append URLs from input
    uploadedUrls = [...uploadedUrls, ...productImageUrls];

    const res = await fetch('/api/admin/add/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: category, // Send categoryId (not category name)
        images: uploadedUrls,
      }),
    });

    if (res.ok) {
      setProductData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
      });
      setProductImages(null);
      setProductImageUrls([]);
      alert('Product added!');
    } else {
      alert('Error adding product');
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>🛍️ Admin Dashboard</h1>

      {/* Add Category */}
      <section>
        <h2>Add Category</h2>
        <form onSubmit={handleAddCategory}>
          <input
            type="text"
            placeholder="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
          <input
            type="file"
            onChange={(e) => setCategoryImage(e.target.files?.[0] || null)}
          />
          <input
            type="url"
            placeholder="Image URL"
            value={categoryImageUrl}
            onChange={(e) => setCategoryImageUrl(e.target.value)}
          />
          <button type="submit">Add Category</button>
        </form>
      </section>

      <hr />

      {/* Add Product */}
      <section>
        <h2>Add Product</h2>
        <form onSubmit={handleAddProduct}>
          <input
            type="text"
            placeholder="Product Name"
            value={productData.name}
            onChange={(e) =>
              setProductData({ ...productData, name: e.target.value })
            }
          />
          <textarea
            placeholder="Product Description"
            value={productData.description}
            onChange={(e) =>
              setProductData({ ...productData, description: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Price"
            value={productData.price}
            onChange={(e) =>
              setProductData({ ...productData, price: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Stock"
            value={productData.stock}
            onChange={(e) =>
              setProductData({ ...productData, stock: e.target.value })
            }
          />

          <select
            value={productData.category}
            onChange={(e) =>
              setProductData({ ...productData, category: e.target.value })
            }
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            multiple
            onChange={(e) => setProductImages(e.target.files)}
          />

          // Fixed version of the image URL input handling
<input
  type="text"
  placeholder="Image URLs (comma separated)"
  value={productImageUrls.join(', ')}
  onChange={(e) => {
    const inputValue = e.target.value.trim();
    
    // Check if it's a single base64 string (don't split it!)
    if (inputValue.startsWith('data:image/') && inputValue.includes('base64,')) {
      // It's a base64 string, treat as single image
      setProductImageUrls([inputValue]);
    } else {
      // It's regular URLs, split by comma
      setProductImageUrls(
        inputValue
          .split(',')
          .map((url) => url.trim())
          .filter((url) => url)
      );
    }
  }}
/>

          <button type="submit">Add Product</button>
        </form>
      </section>
    </main>
  );
}
