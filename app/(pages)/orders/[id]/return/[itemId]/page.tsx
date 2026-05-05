'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Send, FileImage, MessageSquare, AlertCircle, ChevronLeft, Upload, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

export default function ReturnRequestPage() {
    const router = useRouter();
    const params = useParams();
    
    const orderId = Array.isArray(params.id) ? params.id[0] : params.id as string;
    const itemId = Array.isArray(params.itemId) ? params.itemId[0] : params.itemId as string;

    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError("File is too large. Please upload an image under 2MB.");
                setImage(null);
                setPreview(null);
                return;
            }
            setError(null);
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!reason) {
            setError("Please select a reason for the return.");
            return;
        }
        if (!notes.trim()) {
            setError("Please provide additional comments.");
            return;
        }
        if (!image) {
            setError("Please upload an image of the product.");
            return;
        }
        
        setSubmitting(true);

        const formData = new FormData();
        formData.append('orderItemId', itemId);
        formData.append('reason', reason);
        formData.append('notes', notes);
        formData.append('image', image);

        try {
            await axios.post(`/api/orders/${orderId}/return`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/orders');
            }, 3000);
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Failed to submit return request.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-green-100 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-ink mb-3">Request Submitted!</h2>
                    <p className="text-ink-muted mb-8 leading-relaxed">
                        Your return request for order <span className="font-bold text-ink">#{orderId.slice(-8).toUpperCase()}</span> has been received. 
                        We will review it and get back to you within 24-48 hours.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href="/orders" className="premium-btn py-3.5 bg-brand-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
                            Go to My Orders
                        </Link>
                        <p className="text-xs text-ink-faint">Redirecting in a few seconds...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-muted pt-32 pb-24 px-4 sm:px-6">
            <div className="max-w-2xl mx-auto">
                <Link href="/orders" className="text-brand-800 font-bold flex items-center gap-1 hover:underline mb-6">
                    <ChevronLeft size={16} /> Back to Orders
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-surface-subtle overflow-hidden">
                    <div className="p-8 sm:p-12">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-serif font-bold text-ink mb-2 tracking-tight">Request a Return</h1>
                            <p className="text-ink-muted">We&apos;re sorry your purchase didn&apos;t work out. Please fill out the form below.</p>
                        </div>
                        
                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertCircle size={20} className="shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Reason */}
                            <div>
                                <label htmlFor="reason" className="block text-xs font-black text-ink-faint uppercase tracking-widest mb-3">
                                    Reason for Return <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    id="reason" 
                                    className="w-full bg-surface-muted border-none rounded-xl px-5 py-4 text-ink font-medium focus:ring-2 focus:ring-brand-800/20 transition-all appearance-none cursor-pointer"
                                    value={reason} 
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>-- Select a reason --</option>
                                    <option value="DAMAGED_ITEM">Item was damaged</option>
                                    <option value="WRONG_ITEM">Received wrong item</option>
                                    <option value="NOT_AS_DESCRIBED">Not as described</option>
                                    <option value="CHANGED_MIND">Changed my mind</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label htmlFor="notes" className="block text-xs font-black text-ink-faint uppercase tracking-widest mb-3">
                                    Additional Comments <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-5 text-ink-faint group-focus-within:text-brand-800 transition-colors">
                                        <MessageSquare size={20} />
                                    </div>
                                    <textarea 
                                        id="notes" 
                                        className="w-full bg-surface-muted border-none rounded-2xl pl-14 pr-5 py-4 text-ink font-medium focus:ring-2 focus:ring-brand-800/20 transition-all min-h-[150px] leading-relaxed"
                                        placeholder="Please provide details about the issue..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-xs font-black text-ink-faint uppercase tracking-widest mb-3">
                                    Evidence Photo <span className="text-red-500">*</span>
                                </label>
                                <div className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
                                    image ? 'border-green-200 bg-green-50/30' : 'border-brand-100 hover:border-brand-200 hover:bg-surface-muted'
                                }`}>
                                    <input 
                                        type="file" 
                                        id="image" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleImageChange}
                                        required
                                    />
                                    <div className="text-center">
                                        {preview ? (
                                            <div className="relative w-full max-w-[200px] aspect-square mx-auto rounded-xl overflow-hidden shadow-md">
                                                <Image src={preview} alt="Preview" fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <Upload className="text-white" size={24} />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-800">
                                                    <FileImage size={28} />
                                                </div>
                                                <p className="font-bold text-ink mb-1">Click to upload photo</p>
                                                <p className="text-xs text-ink-faint font-medium">JPG, PNG or WEBP (Max 2MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-[#6B0F1A] text-white py-5 rounded-2xl font-bold text-lg hover:bg-[#5a0c16] hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg" 
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send size={22} className="-rotate-45" />
                                        Submit Return Request
                                    </>
                                )}
                            </button>
                            
                            <p className="text-center text-[10px] text-ink-faint font-medium max-w-sm mx-auto leading-relaxed">
                                By submitting this request, you agree to our 7-day return policy. Items must be returned in their original condition and packaging.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
