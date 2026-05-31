import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap', variable: '--font-playfair' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], display: 'swap', weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--font-cormorant' });
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
    metadataBase: new URL('https://hemasaree.vercel.app/'),
    title: { default: siteTitle, template: '%s | ' + (settings?.title || 'Hema Sarees') },
    description: siteDescription,
    keywords: ['sarees', 'indian fashion', 'ethnic wear', 'silk sarees', 'designer sarees'],
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: siteTitle,
      images: ['/og-image.png'],
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
      <body className={`bg-white text-ink antialiased ${inter.variable} ${playfair.variable} ${cormorant.variable}`}>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': 'https://hemasaree.vercel.app/#organization',
                  name: 'Hema Sarees',
                  url: 'https://hemasaree.vercel.app/',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://hemasaree.vercel.app/logo.png',
                  },
                  sameAs: [
                    'https://instagram.com/hemasarees',
                    'https://facebook.com/hemasarees',
                  ],
                },
                {
                  '@type': 'WebSite',
                  '@id': 'https://hemasaree.vercel.app/#website',
                  url: 'https://hemasaree.vercel.app/',
                  name: 'Hema Sarees',
                  publisher: {
                    '@id': 'https://hemasaree.vercel.app/#organization',
                  },
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}

