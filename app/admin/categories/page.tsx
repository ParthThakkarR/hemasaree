'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Pencil, Trash2, Plus, ImageIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image: string;
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; msg: string } | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  const categoryFileRef = useRef<HTMLInputElement>(null);

  const showFeedback = (type: 'success' | 'danger', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data: Category[] = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      showFeedback('danger', 'Could not load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('folder', 'categories');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.urls?.[0] || data.url;
  };

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName || (!categoryImage && !categoryImageUrl)) {
      showFeedback('danger', 'Category name and an image (or URL) are required.');
      return;
    }
    setIsLoading(true);
    try {
      let finalImageUrl = categoryImageUrl;
      if (categoryImage) {
        finalImageUrl = await uploadImage(categoryImage);
      }
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName, image: finalImageUrl }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add category');
      }
      showFeedback('success', 'Category added successfully!');
      setCategoryName('');
      setCategoryImage(null);
      setCategoryImageUrl('');
      if (categoryFileRef.current) categoryFileRef.current.value = '';
      await fetchCategories();
    } catch (err: any) {
      showFeedback('danger', err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory({ ...category });
    setNewCategoryImage(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsLoading(true);
    let finalImageUrl = editingCategory.image;
    try {
      if (newCategoryImage) {
        finalImageUrl = await uploadImage(newCategoryImage);
      }
      const updatedData = { ...editingCategory, image: finalImageUrl };
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update category');
      }
      showFeedback('success', 'Category updated!');
      setIsEditModalOpen(false);
      await fetchCategories();
    } catch (error: any) {
      showFeedback('danger', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${categoryId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }
      showFeedback('success', 'Category deleted!');
      await fetchCategories();
    } catch (error: any) {
      showFeedback('danger', error.message);
    }
  };

  return (
    <>
      <style jsx>{`
        .admin-header { background: linear-gradient(135deg, #1e293b, #334155); color: white; border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 1.5rem; }
        .cat-card { background: #fff; border-radius: 14px; padding: 1.25rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
        .cat-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-radius: 10px; transition: background 0.15s; }
        .cat-item:hover { background: #fdf6f0; }
        .cat-item + .cat-item { border-top: 1px solid #f1f5f9; }
        .cat-img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; border: 1px solid #e2e8f0; }
        .cat-placeholder { width: 48px; height: 48px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
      `}</style>

      <div className="container-fluid py-4 px-md-4">
        <div className="admin-header">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Manage Categories</h1>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '0.88rem' }}>Add, edit, or remove product categories</p>
        </div>

        {feedback && <div className={`alert alert-${feedback.type} alert-dismissible`}>{feedback.msg}<button type="button" className="btn-close" onClick={() => setFeedback(null)} /></div>}

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="cat-card">
              <h5 className="mb-3 d-flex align-items-center gap-2"><Plus size={18} /> Add New Category</h5>
              <form onSubmit={handleAddCategory}>
                <div className="mb-3">
                  <label htmlFor="categoryName" className="form-label">Category Name</label>
                  <input id="categoryName" type="text" className="form-control" placeholder="e.g., Silk Sarees" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="categoryFile" className="form-label">Upload Image</label>
                  <input id="categoryFile" type="file" className="form-control" accept="image/*" ref={categoryFileRef} onChange={(e) => setCategoryImage(e.target.files?.[0] || null)} />
                </div>
                <div className="text-center text-muted my-2" style={{ fontSize: '0.85rem' }}>or provide URL</div>
                <div className="mb-3">
                  <label htmlFor="categoryImageUrl" className="form-label">Image URL</label>
                  <input id="categoryImageUrl" type="url" className="form-control" placeholder="https://..." value={categoryImageUrl} onChange={(e) => setCategoryImageUrl(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary w-100" style={{ background: '#e76f51', border: 'none', borderRadius: 10 }} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Add Category'}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="cat-card">
              <h5 className="mb-3">Categories ({categories.length})</h5>
              {isLoading && categories.length === 0 ? (
                <div className="text-center py-4"><div className="spinner-border spinner-border-sm" style={{ color: '#e76f51' }} /></div>
              ) : categories.length === 0 ? (
                <p className="text-muted text-center py-4">No categories yet. Add one to get started.</p>
              ) : (
                <div>
                  {categories.map(cat => (
                    <div key={cat.id} className="cat-item">
                      <div className="d-flex align-items-center gap-3">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="cat-img" />
                        ) : (
                          <div className="cat-placeholder"><ImageIcon size={20} /></div>
                        )}
                        <span className="fw-medium">{cat.name}</span>
                      </div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 8 }} onClick={() => handleEditClick(cat)} title="Edit"><Pencil size={15} /></button>
                        <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 8 }} onClick={() => handleDeleteClick(cat.id)} title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingCategory && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 16 }}>
              <form onSubmit={handleUpdateCategory}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Edit Category</h5>
                  <button type="button" className="btn-close" onClick={() => setIsEditModalOpen(false)} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editCatName" className="form-label">Category Name</label>
                    <input id="editCatName" type="text" className="form-control" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
                  </div>
                  {editingCategory.image && (
                    <div className="mb-3">
                      <label className="form-label">Current Image</label>
                      <div><img src={editingCategory.image} alt="Current" className="rounded" style={{ maxWidth: 100, border: '1px solid #e2e8f0' }} /></div>
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="editCatImageURL" className="form-label">New Image URL (optional)</label>
                    <input id="editCatImageURL" type="url" className="form-control" placeholder="Enter new URL" onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editCatImageFile" className="form-label">Or Upload New Image</label>
                    <input id="editCatImageFile" type="file" className="form-control" accept="image/*" ref={editFileRef} onChange={(e) => setNewCategoryImage(e.target.files?.[0] || null)} />
                  </div>
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
