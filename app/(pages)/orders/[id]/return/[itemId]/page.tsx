// "use client";

// import { useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { Send, FileImage, MessageSquare, AlertCircle } from "lucide-react";
// import axios from "axios";

// export default function ReturnRequestPage() {
//   const router = useRouter();
//   const params = useParams();

//   // IDs from URL
//   const orderId = Array.isArray(params.id) ? params.id[0] : (params.id as string);
//   const itemId = Array.isArray(params.itemId) ? params.itemId[0] : (params.itemId as string);

//   // Form state
//   const [reason, setReason] = useState("");
//   const [notes, setNotes] = useState("");
//   const [image, setImage] = useState<File | null>(null);
//   const [preview, setPreview] = useState<string | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Handle image upload + preview
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 2 * 1024 * 1024) {
//         setError("File is too large. Please upload an image under 2MB.");
//         return;
//       }
//       setError(null);
//       setImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle form submit
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!orderId || !itemId) {
//       setError("Missing order or item ID. Please try again.");
//       return;
//     }

//     if (!reason) {
//       setError("Please select a reason for the return.");
//       return;
//     }

//     setSubmitting(true);
//     setError(null);

//     const formData = new FormData();
//     formData.append("orderItemId", itemId);
//     formData.append("reason", reason);
//     if (notes) formData.append("notes", notes);
//     if (image) formData.append("image", image);

//     try {
//       await axios.put(`/api/returns/${orderId}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       alert("Return request submitted successfully!");
//       router.push("/my-orders"); // redirect after submit
//     } catch (err: any) {
//       const errorMessage = err.response?.data?.error || "Failed to submit return request.";
//       setError(errorMessage);
//       console.error(err);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="container my-5" style={{ maxWidth: "600px" }}>
//       <div className="card shadow-sm border-0">
//         <div className="card-body p-4 p-md-5">
//           <h1 className="card-title text-center h3 mb-4">Request a Return</h1>
//           <p className="text-muted text-center mb-4">
//             Please provide details about your return request.
//           </p>

//           {error && (
//             <div className="alert alert-danger d-flex align-items-center">
//               <AlertCircle size={20} className="me-2" />
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             {/* Reason */}
//             <div className="mb-3">
//               <label htmlFor="reason" className="form-label fw-semibold">
//                 Reason for Return <span className="text-danger">*</span>
//               </label>
//               <select
//                 id="reason"
//                 className="form-select"
//                 value={reason}
//                 onChange={(e) => setReason(e.target.value)}
//                 required
//               >
//                 <option value="" disabled>
//                   -- Select a reason --
//                 </option>
//                 <option value="DAMAGED_ITEM">Item was damaged</option>
//                 <option value="WRONG_ITEM">Received wrong item</option>
//                 <option value="NOT_AS_DESCRIBED">Not as described</option>
//                 <option value="CHANGED_MIND">Changed my mind</option>
//                 <option value="OTHER">Other</option>
//               </select>
//             </div>

//             {/* Notes */}
//             <div className="mb-3">
//               <label htmlFor="notes" className="form-label fw-semibold">
//                 Additional Comments (Optional)
//               </label>
//               <div className="input-group">
//                 <span className="input-group-text">
//                   <MessageSquare size={18} />
//                 </span>
//                 <textarea
//                   id="notes"
//                   className="form-control"
//                   rows={3}
//                   placeholder="e.g., 'The color was different than the photo' or 'The corner of the saree was torn.'"
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                 ></textarea>
//               </div>
//             </div>

//             {/* Image */}
//             <div className="mb-4">
//               <label htmlFor="image" className="form-label fw-semibold">
//                 Upload Image (Optional)
//               </label>
//               <div className="input-group">
//                 <span className="input-group-text">
//                   <FileImage size={18} />
//                 </span>
//                 <input
//                   type="file"
//                   id="image"
//                   className="form-control"
//                   accept="image/png, image/jpeg, image/webp"
//                   onChange={handleImageChange}
//                 />
//               </div>
//               {preview && (
//                 <img
//                   src={preview}
//                   alt="Preview"
//                   className="img-thumbnail mt-3"
//                   style={{ maxHeight: "150px" }}
//                 />
//               )}
//             </div>

//             {/* Submit */}
//             <div className="d-grid">
//               <button
//                 type="submit"
//                 className="btn btn-primary btn-lg d-flex align-items-center justify-content-center"
//                 disabled={submitting}
//               >
//                 {submitting ? (
//                   <>
//                     <span
//                       className="spinner-border spinner-border-sm me-2"
//                       role="status"
//                       aria-hidden="true"
//                     ></span>
//                     Submitting...
//                   </>
//                 ) : (
//                   <>
//                     <Send size={18} className="me-2" />
//                     Submit Return Request
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Send, FileImage, MessageSquare, AlertCircle } from 'lucide-react';
import axios from 'axios';

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
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError("File is too large. Please upload an image under 2MB.");
                setImage(null); // Clear the invalid file
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
        setError(null); // Reset error on new submission

        // --- ADDED: More robust validation ---
        if (!reason) {
            setError("Please select a reason for the return.");
            return;
        }
        if (!notes.trim()) {
            setError("Please provide additional comments.");
            return;
        }
        if (!image) {
            setError("Please upload an image.");
            return;
        }
        if (!orderId || !itemId) {
            setError("Could not identify the item to return. Please go back and try again.");
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
            alert('Return request submitted successfully!');
            router.push('/orders');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || "Failed to submit return request.";
            setError(errorMessage);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container my-5" style={{ maxWidth: '600px' }}>
            <div className="card shadow-sm border-0">
                <div className="card-body p-4 p-md-5">
                    <h1 className="card-title text-center h3 mb-4">Request a Return</h1>
                    <p className="text-muted text-center mb-4">Please provide details about your return request.</p>
                    
                    {error && (
                        <div className="alert alert-danger d-flex align-items-center">
                            <AlertCircle size={20} className="me-2"/>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="reason" className="form-label fw-semibold">Reason for Return <span className="text-danger">*</span></label>
                            <select 
                                id="reason" 
                                className="form-select" 
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

                        <div className="mb-3">
                            {/* ADDED: Asterisk to the label */}
                            <label htmlFor="notes" className="form-label fw-semibold">Additional Comments <span className="text-danger">*</span></label>
                            <div className="input-group">
                                <span className="input-group-text"><MessageSquare size={18}/></span>
                                <textarea 
                                    id="notes" 
                                    className="form-control" 
                                    rows={3}
                                    placeholder="e.g., 'The color was different than the photo' or 'The corner of the saree was torn.'"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    required // ADDED: required attribute
                                ></textarea>
                            </div>
                        </div>

                        <div className="mb-4">
                            {/* ADDED: Asterisk to the label */}
                            <label htmlFor="image" className="form-label fw-semibold">Upload Image <span className="text-danger">*</span></label>
                             <div className="input-group">
                                <span className="input-group-text"><FileImage size={18}/></span>
                                <input 
                                    type="file" 
                                    id="image" 
                                    className="form-control" 
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleImageChange}
                                    required // ADDED: required attribute
                                />
                            </div>
                            {preview && <img src={preview} alt="Preview" className="img-thumbnail mt-3" style={{ maxHeight: '150px' }} />}
                        </div>

                        <div className="d-grid">
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-lg d-flex align-items-center justify-content-center" 
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} className="me-2" />
                                        Submit Return Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}