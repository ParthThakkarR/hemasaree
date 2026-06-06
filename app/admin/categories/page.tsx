'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@contexts/auth-context';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  image: string;
}

export default function ManageCategoriesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

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

    useEffect(() => {
        if (!authLoading && (!user || !user.isAdmin)) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data: Category[] = await res.json();
            setCategories(data);
        } catch (err) {
            console.error(err);
            toast.error('Could not load categories.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchCategories();
    }, []);

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('files', file);
        formData.append('folder', 'categories');

        let lastError = '';
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 60000);

                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal,
                });
                clearTimeout(timeout);

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({ error: 'Image upload failed' }));
                    lastError = errData.error || 'Image upload failed';
                    if (res.status === 413) throw new Error(lastError);
                    continue;
                }

                const data = await res.json();
                if (!data.urls || !Array.isArray(data.urls) || data.urls.length === 0) {
                    throw new Error('No image URL returned from upload');
                }
                return data.urls[0];
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    lastError = 'Upload timed out. Please check your connection and try a smaller image.';
                } else if (err.message) {
                    lastError = err.message;
                }
                if (attempt === 0) continue;
            }
        }
        throw new Error(lastError || 'Image upload failed after retrying. Please try again.');
    };

    const handleAddCategory = async (e: FormEvent) => {
        e.preventDefault();
        if (!categoryName || (!categoryImage && !categoryImageUrl)) {
            return toast.error('Category name and an image (or URL) are required.');
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
            
            toast.success('Category added!');
            setCategoryName('');
            setCategoryImage(null);
            setCategoryImageUrl('');
            if (categoryFileRef.current) categoryFileRef.current.value = '';
            await fetchCategories();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'An error occurred.');
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
            
            toast.success('Category updated!');
            setIsEditModalOpen(false);
            await fetchCategories();
        } catch (error: any) {
            console.error(error);
            toast.error(`Error: ${error.message}`);
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
            toast.success('Category deleted successfully!');
            await fetchCategories();
        } catch (error: any) {
            console.error(error);
            toast.error(`Error: ${error.message}`);
        }
    };
    
    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-serif font-bold text-[#1A0A12] mb-8">Manage Categories</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Category Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-[#FBF5EC] p-6">
                        <h2 className="text-xl font-bold text-[#1A0A12] mb-6">Add New Category</h2>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label htmlFor="categoryName" className="block text-sm font-medium text-[#1A0A12] mb-1">Category Name</label>
                                <input id="categoryName" type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" placeholder="e.g., Silk Sarees" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                            </div>
                            <div>
                                <label htmlFor="categoryFile" className="block text-sm font-medium text-[#1A0A12] mb-1">Upload Image</label>
                                <input id="categoryFile" type="file" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" accept="image/*" ref={categoryFileRef} onChange={(e) => setCategoryImage(e.target.files?.[0] || null)} />
                            </div>
                            <div className="text-center text-xs font-bold text-gray-400 uppercase">OR</div>
                            <div>
                                <label htmlFor="categoryImageUrl" className="block text-sm font-medium text-[#1A0A12] mb-1">Image URL</label>
                                <input id="categoryImageUrl" type="url" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" placeholder="https://..." value={categoryImageUrl} onChange={(e) => setCategoryImageUrl(e.target.value)} />
                            </div>
                            <button type="submit" className="w-full bg-[#6B0F1A] hover:bg-[#5a0c16] text-white px-4 py-3 rounded-xl font-semibold transition-colors flex justify-center items-center gap-2" disabled={isLoading}>
                                {isLoading ? 'Processing...' : <><Plus size={18} /> Add Category</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Categories List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-[#FBF5EC] overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-[#1A0A12]">Existing Categories</h2>
                            <span className="bg-[#FBF5EC] text-[#6B0F1A] px-3 py-1 rounded-full text-sm font-semibold">{categories.length} Total</span>
                        </div>
                        {isLoading && categories.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">Loading...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#1A0A12] text-white">
                                            <th className="p-4 font-semibold">Image</th>
                                            <th className="p-4 font-semibold">Name</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {categories.map(cat => (
                                            <tr key={cat.id} className="hover:bg-[#FBF5EC] transition-colors">
                                                <td className="p-4">
                                                    <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-lg object-cover" />
                                                </td>
                                                <td className="p-4 font-medium text-[#1A0A12]">{cat.name}</td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex" onClick={() => handleEditClick(cat)}>
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex" onClick={() => handleDeleteClick(cat.id)}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {categories.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-gray-500">No categories found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[#1A0A12]">Edit Category</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleUpdateCategory}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label htmlFor="editCatName" className="block text-sm font-medium text-[#1A0A12] mb-1">Category Name</label>
                                    <input id="editCatName" type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#1A0A12] mb-2">Current Image</label>
                                    <img src={editingCategory.image} alt="Current" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                                </div>
                                <div>
                                    <label htmlFor="editCatImageURL" className="block text-sm font-medium text-[#1A0A12] mb-1">New Image URL (optional)</label>
                                    <input id="editCatImageURL" type="url" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" placeholder="Enter new URL to replace current image" onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })} />
                                </div>
                                <div>
                                    <label htmlFor="editCatImageFile" className="block text-sm font-medium text-[#1A0A12] mb-1">Or Upload New Image (optional)</label>
                                    <input id="editCatImageFile" type="file" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" ref={editFileRef} onChange={(e) => setNewCategoryImage(e.target.files ? e.target.files[0] : null)} />
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                                <button type="button" className="px-5 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-xl transition-colors" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="bg-[#6B0F1A] hover:bg-[#5a0c16] text-white px-5 py-2 rounded-xl font-semibold transition-colors" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


