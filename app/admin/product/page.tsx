


'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}
interface Product {
    id: string;
    name: string;
    description: string;
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
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [newProductImages, setNewProductImages] = useState<FileList | null>(null);
    const [newProductImageUrls, setNewProductImageUrls] = useState<string[]>([]);
    
    // Add Form State
    const [productData, setProductData] = useState({ name: '', description: '', price: '', stock: '', category: '' });
    const [productImages, setProductImages] = useState<FileList | null>(null);
    const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
    const productFileRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [catRes, prodRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/admin/products')
            ]);
            if (!catRes.ok || !prodRes.ok) throw new Error('Failed to fetch data');
            
            const catData: Category[] = await catRes.json();
            const prodData: Product[] = await prodRes.json();
            setCategories(catData);
            setProducts(prodData);
        } catch (err) {
            console.error("Failed to fetch data", err);
            alert("Could not load page data.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => { fetchData(); }, []);
    
    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Image upload failed');
        const data = await res.json();
        return data.url;
    };

    const handleAddProduct = async (e: FormEvent) => {
        e.preventDefault();
        const { name, description, price, stock, category } = productData;
        if (!name || !description || !price || !stock || !category || (!productImages && productImageUrls.length === 0)) {
            return alert('Please fill out all product fields and add at least one image.');
        }

        setIsLoading(true);
        try {
            let finalImageUrls: string[] = [...productImageUrls];
            if (productImages) {
                const uploadPromises = Array.from(productImages).map(uploadImage);
                const uploadedUrls = await Promise.all(uploadPromises);
                finalImageUrls.push(...uploadedUrls);
            }

            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock, 10),
                    categoryId: category,
                    images: finalImageUrls,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to add product');
            }
            
            alert('Product added successfully!');
            setProductData({ name: '', description: '', price: '', stock: '', category: '' });
            setProductImages(null);
            setProductImageUrls([]);
            if (productFileRef.current) productFileRef.current.value = '';
            await fetchData();

        } catch (err: any) {
            alert(err.message || 'An error occurred while adding the product.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct({ ...product });
        setNewProductImages(null);
        setNewProductImageUrls([]);
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        setIsLoading(true);
        try {
            let finalImageUrls = editingProduct.images;
            if ((newProductImages && newProductImages.length > 0) || newProductImageUrls.length > 0) {
                let uploadedUrls: string[] = [];
                if (newProductImages && newProductImages.length > 0) {
                    const uploadPromises = Array.from(newProductImages).map(uploadImage);
                    uploadedUrls = await Promise.all(uploadPromises);
                }
                finalImageUrls = [...newProductImageUrls, ...uploadedUrls];
            }
            
            const { category, ...basePayload } = editingProduct;
            const finalPayload = { ...basePayload, images: finalImageUrls };

            const res = await fetch('/api/admin/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload),
            });

            if (!res.ok) throw new Error('Failed to update product');
            
            alert('Product updated successfully!');
            setIsEditModalOpen(false);
            await fetchData();
        } catch (error) {
            console.error(error);
            alert('Error updating product.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteClick = async (productId: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            const res = await fetch(`/api/admin/products?id=${productId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete product');
            }
            alert('Product deleted successfully!');
            await fetchData();
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <>
            <section className="mb-5">
                <h2>Add New Product</h2>
                 <form onSubmit={handleAddProduct} className="p-4 border rounded bg-light">
                    <div className="row g-3">
                        <div className="col-md-12"><label htmlFor="productName" className="form-label">Product Name</label><input type="text" id="productName" className="form-control" value={productData.name} onChange={(e) => setProductData({ ...productData, name: e.target.value })} required /></div>
                        <div className="col-md-12"><label htmlFor="description" className="form-label">Product Description</label><textarea id="description" className="form-control" rows={3} value={productData.description} onChange={(e) => setProductData({ ...productData, description: e.target.value })} required /></div>
                        <div className="col-md-4"><label htmlFor="price" className="form-label">Price (₹)</label><input type="number" id="price" className="form-control" min="0" step="0.01" value={productData.price} onChange={(e) => setProductData({ ...productData, price: e.target.value })} required /></div>
                        <div className="col-md-4"><label htmlFor="stock" className="form-label">Stock</label><input type="number" id="stock" className="form-control" min="0" step="1" value={productData.stock} onChange={(e) => setProductData({ ...productData, stock: e.target.value })} required /></div>
                        <div className="col-md-4"><label htmlFor="category" className="form-label">Category</label><select id="category" className="form-select" value={productData.category} onChange={(e) => setProductData({ ...productData, category: e.target.value })} required><option value="" disabled>Select Category</option>{categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
                        <div className="col-md-6"><label htmlFor="productFiles" className="form-label">Upload Images</label><input id="productFiles" type="file" multiple className="form-control" accept="image/*" ref={productFileRef} onChange={(e) => setProductImages(e.target.files)} /></div>
                        <div className="col-md-6"><label htmlFor="productUrls" className="form-label">Or Add Image URLs (comma-separated)</label><input type="text" id="productUrls" className="form-control" placeholder="https://.../img1.png, https://.../img2.png" value={productImageUrls.join(', ')} onChange={(e) => setProductImageUrls(e.target.value.split(',').map(url => url.trim()).filter(url => url))} /></div>
                    </div>
                    <button type="submit" className="btn btn-primary mt-4" disabled={isLoading}>{isLoading ? 'Adding Product...' : 'Add Product'}</button>
                </form>
            </section>
            
            <hr />

            <section>
                <h2>Existing Products ({products.length})</h2>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <img 
                                            src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/60'} 
                                            alt={product.name} 
                                            width="60" height="60" 
                                            className="rounded" style={{ objectFit: 'cover' }} 
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>₹{product.price ? product.price.toFixed(2) : '0.00'}</td>
                                    <td>{product.stock}</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditClick(product)}><Pencil size={16} /></button>
                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(product.id)}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {isEditModalOpen && editingProduct && (
                 <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <form onSubmit={handleUpdateProduct}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Edit Product</h5>
                                    <button type="button" className="btn-close" onClick={() => setIsEditModalOpen(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3"><label htmlFor="editName" className="form-label">Product Name</label><input id="editName" type="text" className="form-control" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} /></div>
                                     <div className="mb-3"><label htmlFor="editDesc" className="form-label">Description</label><textarea id="editDesc" className="form-control" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} /></div>
                                    <div className="row">
                                        <div className="col-md-4 mb-3"><label htmlFor="editPrice" className="form-label">Price</label><input id="editPrice" type="number" className="form-control" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })} /></div>
                                        <div className="col-md-4 mb-3"><label htmlFor="editStock" className="form-label">Stock</label><input id="editStock" type="number" className="form-control" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })} /></div>
                                        <div className="col-md-4 mb-3"><label htmlFor="editCategory" className="form-label">Category</label><select id="editCategory" className="form-select" value={editingProduct.categoryId} onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
                                    </div>
                                    <hr />
                                    <div className="mb-3">
                                        <label className="form-label">Current Images</label>
                                        <div>
                                            {editingProduct.images.map((img, index) => (
                                                <img key={index} src={img} alt={`current product image ${index+1}`} className="img-thumbnail me-2" style={{width: '80px', height: '80px', objectFit: 'cover'}}/>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-muted small">Providing new images below will replace all current images.</p>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="editProductImages" className="form-label">Upload New Images</label>
                                            <input type="file" id="editProductImages" className="form-control" multiple onChange={(e) => setNewProductImages(e.target.files)} />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="editProductImageUrls" className="form-label">Or Add New Image URLs</label>
                                            <input type="text" id="editProductImageUrls" className="form-control" placeholder="url1, url2, ..." onChange={(e) => setNewProductImageUrls(e.target.value.split(',').map(url => url.trim()).filter(url => url))} />
                                        </div>
                                    </div>
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
        </>
    );
}

