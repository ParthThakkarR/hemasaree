'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Pencil, Trash2, Plus, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Category { id: string; name: string; }
interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  description?: string;
  categoryId: string;
  category?: { name: string };
  color: string;
  ocassion: string;
}

export default function ManageProductsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Add Form State
  const [productData, setProductData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    color: '',
    ocassion: '',
  });
  const [productImages, setProductImages] = useState<FileList | null>(null);
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit Form New Images
  const [newProductImages, setNewProductImages] = useState<FileList | null>(null);
  const [newProductImageUrls, setNewProductImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/products?limit=1000'),
        fetch('/api/admin/categories')
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      setProducts(pData.products || []);
      setCategories(cData || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const uploadImages = async (files: FileList): Promise<string[]> => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('folder', 'products');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.urls;
  };

  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let finalImages = [...productImageUrls];
      if (productImages && productImages.length > 0) {
        const uploaded = await uploadImages(productImages);
        finalImages = [...finalImages, ...uploaded];
      }

      if (finalImages.length === 0) throw new Error('At least one image is required');

      const payload = {
        ...productData,
        price: Number(productData.price),
        stock: Number(productData.stock),
        images: finalImages,
        categoryId: productData.category
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to add product');
      
      toast.success('Product added successfully');
      setProductData({ name: '', price: '', stock: '', category: '', description: '', color: '', ocassion: '' });
      setProductImageUrls([]);
      setProductImages(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchData();
    } catch (err: any) { toast.error(err.message); }
    finally { setIsLoading(false); }
  };

  const handleDeleteImage = (url: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      images: editingProduct.images.filter(i => i !== url)
    });
  };

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsLoading(true);
    try {
      let finalImages = [...editingProduct.images];
      
      // Upload new files if any
      if (newProductImages && newProductImages.length > 0) {
        const uploaded = await uploadImages(newProductImages);
        finalImages = [...finalImages, ...uploaded];
      }

      // Add new URLs if any
      if (newProductImageUrls.length > 0) {
        finalImages = [...finalImages, ...newProductImageUrls];
      }

      const payload = {
        ...editingProduct,
        images: finalImages
      };

      const res = await fetch('/api/admin/products', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update product');
      toast.success('Product updated');
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) { toast.error(err.message); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1A0A12]">Manage Products</h1>
      </div>

      {/* Add Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#FBF5EC] p-6 mb-8">
        <h2 className="text-xl font-bold text-[#1A0A12] mb-6 flex items-center gap-2"><Plus size={20} className="text-[#6B0F1A]"/> Add New Product</h2>
        <form onSubmit={handleAddProduct}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" placeholder="Exquisite Banarasi Silk Saree" value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" placeholder="Crimson Red" value={productData.color} onChange={e => setProductData({ ...productData, color: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
              <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" placeholder="Bridal" value={productData.ocassion} onChange={e => setProductData({ ...productData, ocassion: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" placeholder="4999" value={productData.price} onChange={e => setProductData({ ...productData, price: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" placeholder="15" value={productData.stock} onChange={e => setProductData({ ...productData, stock: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A] bg-white" value={productData.category} onChange={e => setProductData({ ...productData, category: e.target.value })} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2"><UploadCloud size={16}/> Upload Images</label>
              <input ref={fileRef} type="file" multiple accept="image/*" className="w-full px-4 py-2 border border-gray-200 rounded-xl file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FBF5EC] file:text-[#6B0F1A] hover:file:bg-[#f3ead9]" onChange={e => setProductImages(e.target.files)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Or Image URLs</label>
              <input className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" placeholder="https://image1.jpg, https://image2.jpg" value={productImageUrls.join(', ')} onChange={e => setProductImageUrls(e.target.value.split(',').map(u => u.trim()).filter(Boolean))} />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
             <button className="bg-[#6B0F1A] hover:bg-[#5a0c16] text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-sm" disabled={isLoading}>{isLoading ? 'Adding...' : 'Save Product'}</button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#FBF5EC] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
           <h2 className="text-xl font-bold text-[#1A0A12]">Product Inventory</h2>
           <span className="bg-[#FBF5EC] text-[#6B0F1A] px-3 py-1 rounded-full text-sm font-semibold">{products.length} Items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A0A12] text-white">
                <th className="p-4 font-semibold whitespace-nowrap">Image</th>
                <th className="p-4 font-semibold whitespace-nowrap">Name</th>
                <th className="p-4 font-semibold whitespace-nowrap">Color</th>
                <th className="p-4 font-semibold whitespace-nowrap">Occasion</th>
                <th className="p-4 font-semibold whitespace-nowrap">Price</th>
                <th className="p-4 font-semibold whitespace-nowrap">Stock</th>
                <th className="p-4 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-[#FBF5EC] transition-colors">
                  <td className="p-4">
                    <img src={p.images?.[0] || 'https://placehold.co/60x60'} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                  </td>
                  <td className="p-4 font-medium text-[#1A0A12]">{p.name}</td>
                  <td className="p-4 text-gray-600 capitalize">{p.color}</td>
                  <td className="p-4 text-gray-600 capitalize">{p.ocassion}</td>
                  <td className="p-4 font-semibold text-[#6B0F1A]">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${p.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                       {p.stock} in stock
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => { setEditingProduct(p); setIsEditModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex">
                      <Pencil size={18} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                      onClick={async () => {
                        if (!window.confirm('Are you sure you want to delete this product?')) return;
                        try {
                          setIsLoading(true);
                          const res = await fetch(`/api/admin/products?id=${p.id}`, { method: 'DELETE' });
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok) {
                            toast.error(data.error || data.message || 'Failed to delete product');
                            return;
                          }
                          toast.success(data.message || 'Product deleted successfully');
                          fetchData();
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to delete product');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                 <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">No products found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#1A0A12]">Edit {editingProduct.name}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSaveChanges}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" value={editingProduct.color} onChange={e => setEditingProduct({ ...editingProduct, color: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" value={editingProduct.ocassion} onChange={e => setEditingProduct({ ...editingProduct, ocassion: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A] bg-white" value={editingProduct.categoryId} onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })} required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-4"></div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Manage Images</label>
                   <div className="flex flex-wrap gap-3 mb-4">
                     {editingProduct.images.map((img, i) => (
                       <div key={i} className="relative group">
                         <img src={img} className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                         <button type="button" onClick={() => handleDeleteImage(img)} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Upload Additional Images</label>
                     <input type="file" multiple accept="image/*" className="w-full px-4 py-2 border border-gray-200 rounded-xl file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FBF5EC] file:text-[#6B0F1A] hover:file:bg-[#f3ead9]" onChange={e => setNewProductImages(e.target.files)} />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Or Add Image URLs</label>
                     <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6B0F1A]" placeholder="Comma-separated URLs" onChange={e => setNewProductImageUrls(e.target.value.split(',').map(u => u.trim()).filter(Boolean))} />
                  </div>
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

