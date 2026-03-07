'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; color: string; ocassion: string;
  price: number; stock: number; categoryId: string; images: string[];
  category?: Category;
}

export default function ManageProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [productData, setProductData] = useState({ name: '', color: '', ocassion: '', price: '', stock: '', category: '' });
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
      const [cats, prods] = await Promise.all([fetch('/api/categories'), fetch('/api/admin/products')]);
      if (!cats.ok || !prods.ok) throw new Error('Failed to load data');
      const categoriesData = await cats.json();
      const productsData = await prods.json();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load data');
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const uploadFiles = async (files: FileList): Promise<string[]> => {
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));
    formData.append('folder', 'products');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    if (!Array.isArray(data.urls)) throw new Error('Upload did not return URLs');
    return data.urls;
  };

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const finalUrls = [...productImageUrls];
      if (productImages && productImages.length > 0) {
        finalUrls.push(...await uploadFiles(productImages));
      }
      const payload = {
        name: productData.name, color: productData.color, ocassion: productData.ocassion,
        price: parseFloat(productData.price), stock: parseInt(productData.stock),
        categoryId: productData.category, images: finalUrls,
      };
      const res = await fetch('/api/admin/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to add product');
      toast.success('Product added!');
      setProductData({ name: '', color: '', ocassion: '', price: '', stock: '', category: '' });
      setProductImages(null); setProductImageUrls([]);
      if (fileRef.current) fileRef.current.value = '';
      fetchData();
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setIsLoading(false); }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to delete'); }
      toast.success('Product deleted!');
      fetchData();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Delete failed'); }
  };

  const handleDeleteImage = (img: string) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, images: editingProduct.images.filter(i => i !== img) });
  };

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsLoading(true);
    try {
      let finalUrls = [...editingProduct.images];
      if (newProductImages && newProductImages.length > 0) {
        finalUrls.push(...await uploadFiles(newProductImages));
      }
      if (newProductImageUrls.length > 0) finalUrls.push(...newProductImageUrls);
      finalUrls = Array.from(new Set(finalUrls));
      const res = await fetch('/api/admin/products', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingProduct, images: finalUrls }),
      });
      if (!res.ok) throw new Error('Failed to update product');
      toast.success('Product updated!');
      setIsEditModalOpen(false); setNewProductImages(null); setNewProductImageUrls([]);
      fetchData();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Update failed'); }
    finally { setIsLoading(false); }
  };

  return (
    <>
      <style jsx>{`
        .admin-header { background: linear-gradient(135deg, #1e293b, #334155); color: white; border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 1.5rem; }
        .prod-card { background: #fff; border-radius: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; overflow: hidden; }
        .prod-img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; }
        .prod-placeholder { width: 50px; height: 50px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 0.7rem; }
        .modal-overlay { background-color: rgba(0,0,0,0.5); }
        .image-delete-btn { border-radius: 50%; width: 22px; height: 22px; padding: 0; line-height: 1; }
        .stock-low { color: #dc2626; font-weight: 700; }
      `}</style>

      <Toaster position="top-right" />

      <div className="container-fluid py-4 px-md-4">
        <div className="admin-header">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Manage Products</h1>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '0.88rem' }}>{products.length} products in catalog</p>
        </div>

        {/* Add Product Form */}
        <div className="prod-card p-4 mb-4">
          <h5 className="mb-3 d-flex align-items-center gap-2"><Plus size={18} /> Add New Product</h5>
          <form onSubmit={handleAddProduct}>
            <div className="row g-3">
              <div className="col-md-6"><input className="form-control" placeholder="Product Name" value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} required /></div>
              <div className="col-md-3"><input className="form-control" placeholder="Color" value={productData.color} onChange={e => setProductData({ ...productData, color: e.target.value })} /></div>
              <div className="col-md-3"><input className="form-control" placeholder="Occasion" value={productData.ocassion} onChange={e => setProductData({ ...productData, ocassion: e.target.value })} /></div>
              <div className="col-md-3"><input type="number" className="form-control" placeholder="Price" value={productData.price} onChange={e => setProductData({ ...productData, price: e.target.value })} required /></div>
              <div className="col-md-3"><input type="number" className="form-control" placeholder="Stock" value={productData.stock} onChange={e => setProductData({ ...productData, stock: e.target.value })} required /></div>
              <div className="col-md-6">
                <select className="form-select" title="Category" value={productData.category} onChange={e => setProductData({ ...productData, category: e.target.value })} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <input ref={fileRef} type="file" multiple accept="image/*" title="Upload images" className="form-control" onChange={e => setProductImages(e.target.files)} />
              </div>
              <div className="col-md-6">
                <input className="form-control" placeholder="Or image URLs (comma-separated)" value={productImageUrls.join(', ')} onChange={e => setProductImageUrls(e.target.value.split(',').map(u => u.trim()).filter(Boolean))} />
              </div>
            </div>
            <button className="btn btn-primary mt-3" style={{ background: '#e76f51', border: 'none', borderRadius: 10 }} disabled={isLoading}>{isLoading ? 'Adding...' : 'Add Product'}</button>
          </form>
        </div>

        {/* Products Table */}
        <div className="prod-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr><th>Image</th><th>Name</th><th>Color</th><th>Occasion</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {isLoading && products.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-5"><div className="spinner-border" style={{ color: '#e76f51' }} /></td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-5 text-muted">No products. Add one above.</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id}>
                      <td>{p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="prod-img" /> : <div className="prod-placeholder">No img</div>}</td>
                      <td className="fw-medium">{p.name}</td>
                      <td>{p.color || '\u2014'}</td>
                      <td>{p.ocassion || '\u2014'}</td>
                      <td>{'\u20B9'}{p.price.toLocaleString()}</td>
                      <td className={p.stock < 5 ? 'stock-low' : ''}>{p.stock}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary" title={`Edit ${p.name}`} style={{ borderRadius: 8 }} onClick={() => { setEditingProduct(p); setIsEditModalOpen(true); }}><Pencil size={15} /></button>
                          <button className="btn btn-sm btn-outline-danger" title={`Delete ${p.name}`} style={{ borderRadius: 8 }} onClick={() => handleDeleteProduct(p.id)}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="modal show d-block modal-overlay">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16 }}>
              <form onSubmit={handleSaveChanges}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Edit {editingProduct.name}</h5>
                  <button type="button" className="btn-close" onClick={() => setIsEditModalOpen(false)} />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6"><label className="form-label">Name</label><input type="text" className="form-control" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} /></div>
                    <div className="col-md-3"><label className="form-label">Color</label><input type="text" className="form-control" value={editingProduct.color} onChange={e => setEditingProduct({ ...editingProduct, color: e.target.value })} /></div>
                    <div className="col-md-3"><label className="form-label">Occasion</label><input type="text" className="form-control" value={editingProduct.ocassion} onChange={e => setEditingProduct({ ...editingProduct, ocassion: e.target.value })} /></div>
                    <div className="col-md-3"><label className="form-label">Price</label><input type="number" className="form-control" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} /></div>
                    <div className="col-md-3"><label className="form-label">Stock</label><input type="number" className="form-control" value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} /></div>
                    <div className="col-md-6"><label className="form-label">Category</label>
                      <select className="form-select" title="Edit category" value={editingProduct.categoryId} onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <hr />
                  <label className="form-label">Images</label>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {editingProduct.images.map((img, i) => (
                      <div key={i} className="position-relative">
                        <img src={img} alt={`Image ${i + 1}`} width={80} height={80} className="rounded border" style={{ objectFit: 'cover' }} />
                        <button type="button" title="Remove image" onClick={() => handleDeleteImage(img)} className="btn btn-danger btn-sm position-absolute top-0 end-0 image-delete-btn">{'\u00D7'}</button>
                      </div>
                    ))}
                  </div>
                  <input type="file" multiple accept="image/*" title="Upload new images" className="form-control mb-2" onChange={e => setNewProductImages(e.target.files)} />
                  <input type="text" className="form-control" placeholder="Add URLs (comma-separated)" onChange={e => setNewProductImageUrls(e.target.value.split(',').map(u => u.trim()).filter(Boolean))} />
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: 10 }} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ background: '#e76f51', border: 'none', borderRadius: 10 }} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
