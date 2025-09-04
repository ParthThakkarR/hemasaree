

'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  image: string;
}

export default function ManageCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
    const editFileRef = useRef<HTMLInputElement>(null);

    // Add Form State
    const [categoryName, setCategoryName] = useState('');
    const [categoryImage, setCategoryImage] = useState<File | null>(null);
    const [categoryImageUrl, setCategoryImageUrl] = useState('');
    const categoryFileRef = useRef<HTMLInputElement>(null);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data: Category[] = await res.json();
            setCategories(data);
        } catch (err) {
            console.error(err);
            alert('Could not load categories.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchCategories();
    }, []);

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Image upload failed');
        const data = await res.json();
        return data.url;
    };

    const handleAddCategory = async (e: FormEvent) => {
        e.preventDefault();
        if (!categoryName || (!categoryImage && !categoryImageUrl)) {
            return alert('Category name and an image (or URL) are required.');
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
            
            alert('Category added!');
            setCategoryName('');
            setCategoryImage(null);
            setCategoryImageUrl('');
            if (categoryFileRef.current) categoryFileRef.current.value = '';
            await fetchCategories();
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'An error occurred.');
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
            
            alert('Category updated!');
            setIsEditModalOpen(false);
            await fetchCategories();
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteClick = async (categoryId: string) => {
        if (!window.confirm("Are you sure? Deleting a category will also delete all products within it.")) return;
        try {
            const res = await fetch(`/api/admin/categories?id=${categoryId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete category');
            }
            alert('Category deleted successfully!');
            await fetchCategories();
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        }
    };
    
    return (
        <>
            <div className="row g-5">
                <div className="col-md-5">
                    <section>
                        <h2>Add New Category</h2>
                        <form onSubmit={handleAddCategory} className="d-grid gap-3 p-4 border rounded bg-light">
                            <div className="form-group"><label htmlFor="categoryName" className="form-label">Category Name</label><input id="categoryName" type="text" className="form-control" placeholder="e.g., Silk Sarees" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required /></div>
                            <div className="form-group"><label htmlFor="categoryFile" className="form-label">Upload Image</label><input id="categoryFile" type="file" className="form-control" accept="image/*" ref={categoryFileRef} onChange={(e) => setCategoryImage(e.target.files?.[0] || null)} /></div>
                            <div className="text-center my-1 fw-bold">OR</div>
                            <div className="form-group"><label htmlFor="categoryImageUrl" className="form-label">Image URL</label><input id="categoryImageUrl" type="url" className="form-control" placeholder="https://..." value={categoryImageUrl} onChange={(e) => setCategoryImageUrl(e.target.value)} /></div>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Processing...' : 'Add Category'}</button>
                        </form>
                    </section>
                </div>
                <div className="col-md-7">
                    <section>
                        <h2>Existing Categories ({categories.length})</h2>
                        {isLoading && categories.length === 0 ? <p>Loading...</p> : (
                            <ul className="list-group">
                                {categories.map(cat => (
                                    <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3"><img src={cat.image} alt={cat.name} width="50" height="50" className="rounded" style={{objectFit: 'cover'}} /><span>{cat.name}</span></div>
                                        <div>
                                            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(cat)}><Pencil size={16} /></button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(cat.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
            {isEditModalOpen && editingCategory && (
                 <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleUpdateCategory}>
                                <div className="modal-header"><h5 className="modal-title">Edit Category</h5><button type="button" className="btn-close" onClick={() => setIsEditModalOpen(false)}></button></div>
                                <div className="modal-body">
                                    <div className="mb-3"><label htmlFor="editCatName" className="form-label">Category Name</label><input id="editCatName" type="text" className="form-control" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} /></div>
                                    <div className="mb-2"><label className="form-label">Current Image</label><img src={editingCategory.image} alt="Current" className="img-thumbnail" style={{ maxWidth: '100px' }}/></div>
                                    <div className="mb-3"><label htmlFor="editCatImageURL" className="form-label">New Image URL (optional)</label><input id="editCatImageURL" type="url" className="form-control" placeholder="Enter new URL to replace current image" onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })} /></div>
                                    <div className="mb-3"><label htmlFor="editCatImageFile" className="form-label">Or Upload New Image (optional)</label><input id="editCatImageFile" type="file" className="form-control" ref={editFileRef} onChange={(e) => setNewCategoryImage(e.target.files ? e.target.files[0] : null)} /></div>
                                </div>
                                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Close</button><button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</button></div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

