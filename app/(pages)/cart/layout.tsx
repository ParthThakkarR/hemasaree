import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Shopping Bag | Hema Sarees',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
