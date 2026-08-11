import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Serif_Devanagari, Literata } from 'next/font/google';
import '@/app/globals.css';

// UI / Functional — invisible utility layer
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Display / Headlines — Noto Serif Devanagari bridges Sanskrit heritage & modern web
// display: 'optional' → never blocks render; Latin subset loads first
const notoSerif = Noto_Serif_Devanagari({
  subsets: ['latin', 'devanagari'],
  display: 'optional',
  variable: '--font-noto-serif',
  weight: ['400', '700'],
});

// Body / Story — designed for long-form reading; literary warmth
const literata = Literata({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-literata',
  axes: ['opsz'],
});
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

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://hemasaree.vercel.app';
const SITE_URL = rawSiteUrl.startsWith('http') ? rawSiteUrl : `https://${rawSiteUrl}`;

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
      'hema sarees', 'buy sarees india', 'handloom sarees online', 'premium sarees',
    ],
    alternates: {
      canonical: '/',
      languages: {
        'en-IN': '/',
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: siteTitle,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: siteTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
      images: [{ url: '/og-image.png', alt: siteTitle }],
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
    verification: {
      google: 'google36f65c0d266c18bf',
    },
  };
}


export const viewport: Viewport = {
  themeColor: '#8B2635', // kumkum
};

import GlobalErrorBoundary from '@components/global-error-boundary';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const settings = await getSiteSettings();
  const siteUrl = SITE_URL;

  return (
    <html lang="en">
      <body className={`bg-chandan text-kajal antialiased ${inter.variable} ${notoSerif.variable} ${literata.variable}`}>
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
                      fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
                      fontSize: '14px',
                      borderRadius: '12px',
                      border: '1px solid #EDE0D0',
                      background: '#FDF8F3',  // chandan
                      color: '#1A1614',        // kajal
                    },
                    success: { iconTheme: { primary: '#2D5A3D', secondary: '#fff' } }, // neem
                    error: { iconTheme: { primary: '#8B2635', secondary: '#fff' } },   // kumkum
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
                    url: `${siteUrl}/og-image.png`,
                    width: 1200,
                    height: 630,
                  },
                  description: settings?.description || 'Premium Indian saree ecommerce store offering authentic silk, bridal, designer, and handloom sarees.',
                  sameAs: [
                    'https://instagram.com/hemasaree',
                    'https://facebook.com/hemasaree',
                  ],
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: '+91-9876543210',
                    contactType: 'customer service',
                    availableLanguage: ['English', 'Hindi', 'Gujarati'],
                  },
                  areaServed: {
                    '@type': 'Country',
                    name: 'India',
                  },
                  knowsAbout: [
                    'Silk Sarees', 'Banarasi Sarees', 'Kanjivaram Sarees',
                    'Bridal Sarees', 'Wedding Sarees', 'Designer Sarees',
                    'Cotton Sarees', 'Festive Sarees', 'Handloom Sarees',
                    'Indian Ethnic Wear', 'Traditional Sarees',
                  ],
                  hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: 'Hema Sarees Collection',
                    itemListElement: [
                      { '@type': 'OfferCatalog', name: 'Bridal Sarees', url: `${siteUrl}/products?category=Bridal` },
                      { '@type': 'OfferCatalog', name: 'Silk Sarees', url: `${siteUrl}/products?category=Silk` },
                      { '@type': 'OfferCatalog', name: 'Festive Sarees', url: `${siteUrl}/products?category=Festive` },
                      { '@type': 'OfferCatalog', name: 'Cotton Sarees', url: `${siteUrl}/products?category=Cotton` },
                      { '@type': 'OfferCatalog', name: 'Party Wear Sarees', url: `${siteUrl}/products?category=Party+Wear` },
                    ],
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': `${siteUrl}/#website`,
                  url: siteUrl,
                  name: settings?.title || 'Hema Sarees',
                  description: settings?.description || 'Premium Indian saree ecommerce store.',
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

