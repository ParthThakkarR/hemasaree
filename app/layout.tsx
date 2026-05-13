import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { AuthProvider } from '@contexts/auth-context';
import { CartProvider } from '@contexts/cart-context';
import { WishlistProvider } from '@contexts/wishlist-context';
import Navbar from '@components/navbar';
import Footer from '@components/footer';
import MobileNav from '@components/mobile-nav';
import { Toaster } from 'react-hot-toast';
import { getServerSession } from 'next-auth';
import { authOptions } from '@lib/auth';

export const metadata: Metadata = {
  title: { default: 'Hema Sarees — Elegant Indian Sarees', template: '%s | Hema Sarees' },
  description: 'Discover handpicked collections of exquisite sarees, woven with love and tradition. Free delivery on orders above ₹999.',
  keywords: ['sarees', 'indian fashion', 'ethnic wear', 'silk sarees', 'designer sarees'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Hema Sarees',
  },
};

export const viewport: Viewport = {
  themeColor: '#ec4899',
};

import GlobalErrorBoundary from '@components/global-error-boundary';

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className="bg-white text-ink antialiased">
        <GlobalErrorBoundary>
          <AuthProvider session={session}>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                <main className="pb-mobile-nav lg:pb-0">
                  {children}
                </main>
                <Footer />
                <MobileNav />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      borderRadius: '12px',
                      border: '1px solid #fbcfe8',
                    },
                    success: { iconTheme: { primary: '#ec4899', secondary: '#fff' } },
                  }}
                />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}

