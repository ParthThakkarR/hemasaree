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
import NextTopLoader from 'nextjs-toploader';
import { SiteSettingsProvider } from '@contexts/site-settings-context';
import { getSiteSettings } from '@/sanity/lib/queries';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  const siteTitle = settings?.title || 'Hema Sarees — Elegant Indian Sarees';
  const siteDescription = settings?.description || 'Discover handpicked collections of exquisite sarees, woven with love and tradition. Free delivery on orders above ₹999.';

  return {
    title: { default: siteTitle, template: '%s | ' + (settings?.title || 'Hema Sarees') },
    description: siteDescription,
    keywords: ['sarees', 'indian fashion', 'ethnic wear', 'silk sarees', 'designer sarees'],
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: siteTitle,
    },
  };
}


export const viewport: Viewport = {
  themeColor: '#5E2A35',
};

import GlobalErrorBoundary from '@components/global-error-boundary';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const settings = await getSiteSettings();
  return (
    <html lang="en">
      <body className="bg-white text-ink antialiased">
        <NextTopLoader color="#D4AF37" showSpinner={false} height={3} />
        <GlobalErrorBoundary>
          <SiteSettingsProvider settings={settings}>
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
                      border: '1px solid #EDE6D6',
                      background: '#FFFDF7',
                      color: '#2A1F1F',
                    },
                    success: { iconTheme: { primary: '#1B3A2D', secondary: '#fff' } },
                  }}
                />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </SiteSettingsProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}

