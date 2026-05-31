import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Hema Sarees',
  description: 'Terms and Conditions of service for Hema Sarees.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
