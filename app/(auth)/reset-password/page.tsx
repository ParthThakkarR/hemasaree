// File: app/(auth)/reset-password/page.tsx

import React, { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm'; // Import the component you just renamed

// A simple loading UI
const LoadingFallback = () => (
  <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 font-sans">
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-800">Loading...</h1>
    </div>
  </div>
);

export default function ResetPasswordPage() {
  return (
    // This Suspense boundary is the key
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}