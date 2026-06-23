import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Cart | Hema Sarees',
  description: 'Review your cart and complete your order at Hema Sarees. Secure checkout with UPI, cards, and cash on delivery.',
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
