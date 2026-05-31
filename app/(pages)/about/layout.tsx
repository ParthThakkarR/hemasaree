import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Hema Sarees',
  description: 'Learn about the heritage and story behind Hema Sarees. Discover our passion for traditional Indian craftsmanship and premium silk sarees.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
