import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Hema Sarees',
  description: 'Get in touch with Hema Sarees. We are here to help you with your saree shopping experience.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
