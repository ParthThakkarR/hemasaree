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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://hemasaree.vercel.app';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  const siteTitle = settings?.title || 'Hema Sarees — Elegant Indian Sarees';
  const siteDescription = settings?.description || 'Discover premium silk, bridal, designer, cotton and festive sarees crafted for every occasion.';

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: siteTitle, template: '%s | ' + (settings?.title || 'Hema Sarees') },
    description: siteDescription,
    keywords: [
      'sarees online', 'buy sarees online', 'silk sarees', 'banarasi sarees',
      'kanjivaram sarees', 'wedding sarees', 'bridal sarees', 'designer sarees',
      'cotton sarees', 'party wear sarees', 'traditional sarees', 'saree shop india',
      'indian sarees', 'festive sarees', 'sarees for women', 'handloom sarees',
    ],
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: siteTitle,
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
      images: ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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
  const siteUrl = SITE_URL;

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
                  '@id': `${siteUrl}/#organization`,
                  name: settings?.title || 'Hema Sarees',
                  url: siteUrl,
                  logo: {
                    '@type': 'ImageObject',
                    url: `${siteUrl}/logo.png`,
                  },
                  description: settings?.description || 'Premium Indian saree ecommerce store offering authentic silk, bridal, designer, and handloom sarees.',
                  sameAs: [
                    'https://instagram.com/hemasaree',
                    'https://facebook.com/hemasaree'
                  ],
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: '+91-9876543210',
                    contactType: 'customer service'
                  }
                },
                {
                  '@type': 'WebSite',
                  '@id': `${siteUrl}/#website`,
                  url: siteUrl,
                  name: settings?.title || 'Hema Sarees',
                  publisher: {
                    '@id': `${siteUrl}/#organization`,
                  },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: `${siteUrl}/products?search={search_term_string}`,
                    },
                    'query-input': 'required name=search_term_string',
                  },
                  inLanguage: 'en-IN',
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}

