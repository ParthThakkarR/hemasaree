'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Pencil } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Category { id: string; name: string; }
interface Product {
  id: string;
  name: string;
  color: string;
  ocassion: string;
  price: number;
  stock: number;
  categoryId: string;
  images: string[];
  category?: Category;
}

export default function ManageProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [productData, setProductData] = useState({
    name: '', color: '', ocassion: '', price: '', stock: '', category: ''
  });
  const [productImages, setProductImages] = useState<FileList | null>(null);
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductImages, setNewProductImages] = useState<FileList | null>(null);
  const [newProductImageUrls, setNewProductImageUrls] = useState<string[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        fetch('/api/categories'), fetch('/api/admin/products')
      ]);
      if (!cats.ok || !prods.ok) {
        throw new Error('Failed to load products or categories');
      }

      const categoriesData = await cats.json();
      const productsData = await prods.json();

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load data');
    }
    finally { setIsLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const finalUrls = [...productImageUrls];
      if (productImages && productImages.length > 0) {
        const formData = new FormData();
        Array.from(productImages).forEach(f => formData.append('files', f));
        formData.append('folder', 'products');
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload product images');
        if (!Array.isArray(data.urls)) throw new Error('Upload response did not contain file URLs');
        finalUrls.push(...data.urls);
      }
      const payload = {
        
        name: productData.name,
        color: productData.color,
        ocassion: productData.ocassion,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        categoryId: productData.category,
        images: finalUrls,
      };
      const res = await fetch('/api/admin/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to add product');
      toast.success('Product added');
      setProductData({ name: '', color: '', ocassion: '', price: '', stock: '', category: '' });
      setProductImages(null);
      setProductImageUrls([]);
      if (fileRef.current) fileRef.current.value = '';
      fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to add product'); }
    finally { setIsLoading(false); }
  };

  const handleDeleteImage = (img: string) => {
    if (!editingProduct) return;
    const updated = editingProduct.images.filter(i => i !== img);
    setEditingProduct({ ...editingProduct, images: updated });
  };

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsLoading(true);
    try {
      let finalUrls = [...editingProduct.images];
      if (newProductImages && newProductImages.length > 0) {
        const formData = new FormData();
        Array.from(newProductImages).forEach(f => formData.append('files', f));
        formData.append('folder', 'products');
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload replacement images');
        if (!Array.isArray(data.urls)) throw new Error('Upload response did not contain file URLs');
        finalUrls.push(...data.urls);
      }
      if (newProductImageUrls.length > 0) finalUrls.push(...newProductImageUrls);
      finalUrls = Array.from(new Set(finalUrls));
      const payload = { ...editingProduct, images: finalUrls };
      const res = await fetch('/api/admin/products', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update product');
      toast.success('Product updated');
      setIsEditModalOpen(false);
      setNewProductImages(null);
      setNewProductImageUrls([]);
      fetchData();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to update product'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="container py-4">
      <style jsx>{`
        .modal-overlay {
          background-color: rgba(0, 0, 0, 0.5);
        }

        .image-delete-btn {
          border-radius: 50%;
          width: 22px;
          height: 22px;
          padding: 0;
          line-height: 1;
        }
      `}</style>
      <Toaster position="top-right" />
      <h2 className="mb-4">Manage Products</h2>

      {/* Add Form */}
      <form onSubmit={handleAddProduct} className="p-3 bg-light border rounded mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <input className="form-control" placeholder="Name"
              value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} />
          </div>
          <div className="col-md-3">
            <input className="form-control" placeholder="Color"
              value={productData.color} onChange={e => setProductData({ ...productData, color: e.target.value })} />
          </div>
          <div className="col-md-3">
            <input className="form-control" placeholder="Ocassion"
              value={productData.ocassion} onChange={e => setProductData({ ...productData, ocassion: e.target.value })} />
          </div>
          <div className="col-md-3">
            <input type="number" className="form-control" placeholder="Price ₹"
              value={productData.price} onChange={e => setProductData({ ...productData, price: e.target.value })} />
          </div>
          <div className="col-md-3">
            <input type="number" className="form-control" placeholder="Stock"
              value={productData.stock} onChange={e => setProductData({ ...productData, stock: e.target.value })} />
          </div>
          <div className="col-md-6">
            <select className="form-select" title="Product category" aria-label="Product category" value={productData.category}
              onChange={e => setProductData({ ...productData, category: e.target.value })}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <input ref={fileRef} type="file" multiple accept="image/*" title="Upload product images" aria-label="Upload product images" className="form-control"
              onChange={e => setProductImages(e.target.files)} />
          </div>
          <div className="col-md-6">
            <input className="form-control" placeholder="Or image URLs"
              value={productImageUrls.join(', ')}
              onChange={e => setProductImageUrls(e.target.value.split(',').map(u => u.trim()).filter(Boolean))} />
          </div>
        </div>
        <button className="btn btn-primary mt-3" disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Product'}</button>
      </form>

      {/* Table */}
      <table className="table align-middle">
        <thead><tr><th>Image</th><th>Name</th><th>Color</th><th>Ocassion</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td><img src={p.images?.[0] || 'https://placehold.co/60x60'} alt={p.name} width={60} height={60} className="rounded" /></td>
              <td>{p.name}</td><td>{p.color}</td><td>{p.ocassion}</td><td>₹{p.price}</td><td>{p.stock}</td>
              <td><button type="button" title={`Edit ${p.name}`} aria-label={`Edit ${p.name}`} onClick={() => { setEditingProduct(p); setIsEditModalOpen(true); }} className="btn btn-sm btn-outline-primary"><Pencil size={16} /></button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="modal show d-block modal-overlay">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSaveChanges}>
                <div className="modal-header">
                  <h5>Edit {editingProduct.name}</h5>
                  <button type="button" title="Close edit dialog" aria-label="Close edit dialog" className="btn-close" onClick={() => setIsEditModalOpen(false)}></button>
                </div>
                <div className="modal-body">
  <div className="row g-3">
    <div className="col-md-6">
      <label className="form-label">Name</label>
      <input
        type="text"
        className="form-control"
        title="Product name"
        aria-label="Product name"
        value={editingProduct.name}
        onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
      />
    </div>
    <div className="col-md-3">
      <label className="form-label">Color</label>
      <input
        type="text"
        className="form-control"
        title="Product color"
        aria-label="Product color"
        value={editingProduct.color}
        onChange={e => setEditingProduct({ ...editingProduct, color: e.target.value })}
      />
    </div>
    <div className="col-md-3">
      <label className="form-label">Ocassion</label>
      <input
        type="text"
        className="form-control"
        title="Product occasion"
        aria-label="Product occasion"
        value={editingProduct.ocassion}
        onChange={e => setEditingProduct({ ...editingProduct, ocassion: e.target.value })}
      />
    </div>

    <div className="col-md-3">
      <label className="form-label">Price ₹</label>
      <input
        type="number"
        className="form-control"
        title="Product price"
        aria-label="Product price"
        value={editingProduct.price}
        onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
      />
    </div>

    <div className="col-md-3">
      <label className="form-label">Stock</label>
      <input
        type="number"
        className="form-control"
        title="Product stock"
        aria-label="Product stock"
        value={editingProduct.stock}
        onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
      />
    </div>

    <div className="col-md-6">
      <label className="form-label">Category</label>
      <select
        className="form-select"
        title="Edit product category"
        aria-label="Edit product category"
        value={editingProduct.categoryId}
        onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
      >
        <option value="">Select Category</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  </div>

  <hr />

  <label className="form-label">Images</label>
  <div className="d-flex flex-wrap gap-2 mb-3">
    {editingProduct.images.map((img, i) => (
      <div key={i} className="position-relative">
        <img src={img} alt={`${editingProduct.name} image ${i + 1}`} width={80} height={80} className="rounded border" />
        <button
          type="button"
          title="Remove image"
          aria-label="Remove image"
          onClick={() => handleDeleteImage(img)}
          className="btn btn-danger btn-sm position-absolute top-0 end-0 image-delete-btn"
        >×</button>
      </div>
    ))}
  </div>

  <input
    type="file"
    multiple
    accept="image/*"
    title="Upload replacement product images"
    aria-label="Upload replacement product images"
    className="form-control mb-2"
    onChange={e => setNewProductImages(e.target.files)}
  />
  <input
    type="text"
    className="form-control"
    placeholder="Add image URLs (comma-separated)"
    title="Additional image URLs"
    aria-label="Additional image URLs"
    onChange={e => setNewProductImageUrls(e.target.value.split(',').map(u => u.trim()).filter(Boolean))}
  />
</div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Close</button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
