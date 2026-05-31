import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Hema Sarees',
  description: 'Privacy Policy and data handling practices for Hema Sarees.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
