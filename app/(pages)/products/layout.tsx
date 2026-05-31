import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Sarees — Silk, Bridal, Festive & More | Hema Sarees',
  description: 'Browse our complete collection of handpicked Indian sarees. Filter by category, color, fabric, and occasion. Free delivery on orders above ₹999.',
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Shop All Sarees | Hema Sarees',
    description: 'Browse our complete collection of handpicked Indian sarees.',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
