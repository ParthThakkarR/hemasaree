import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductCard from '@components/ui/product-card';

// Mock the dependencies
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />
}));

vi.mock('next/link', () => ({
  default: ({ children, href, className }: any) => <a href={href} className={className}>{children}</a>
}));

vi.mock('@contexts/cart-context', () => ({
  useCart: () => ({ addToCart: vi.fn(), isLoading: false })
}));

vi.mock('@contexts/wishlist-context', () => ({
  useWishlist: () => ({ 
    isInWishlist: vi.fn(() => false),
    toggleWishlist: vi.fn()
  })
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() })
}));

vi.mock('@contexts/auth-context', () => ({
  useAuth: vi.fn(() => ({ user: null, isAuthenticated: false })),
  AuthProvider: ({ children }: any) => <>{children}</>
}));

// Also mock the actual file path just in case alias doesn't work in vitest
vi.mock('../../app/contexts/auth-context', () => ({
  useAuth: vi.fn(() => ({ user: null, isAuthenticated: false })),
  AuthProvider: ({ children }: any) => <>{children}</>
}));

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 'prod-1',
    name: 'Test Saree',
    price: 1599,
    category: { name: 'Bridal' },
    images: ['test-image.jpg']
  };

  const edgeCaseProducts = [
    { ...mockProduct, id: 'prod-1', price: 0 },
    { ...mockProduct, id: 'prod-2', price: 9999999 },
    { ...mockProduct, id: 'prod-3', name: 'A'.repeat(200) },
    { ...mockProduct, id: 'prod-4', name: '' },
    { ...mockProduct, id: 'prod-5', category: null },
    { ...mockProduct, id: 'prod-6', images: [] },
    { ...mockProduct, id: 'prod-7', images: ['img1.jpg', 'img2.jpg', 'img3.jpg'] },
    { ...mockProduct, id: 'prod-8', price: -500 }, // Corrupted data
    { ...mockProduct, id: 'prod-9', name: '<script>alert(1)</script>' },
    { ...mockProduct, id: 'prod-10', name: 'Very Long Name '.repeat(10) },
  ];

  it('renders standard product correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Test Saree')).toBeDefined();
    expect(screen.getByText('Bridal')).toBeDefined();
    expect(screen.getByText('₹1,599')).toBeDefined();
  });

  edgeCaseProducts.forEach((prod, index) => {
    it(`renders edge case product ${index} without crashing`, () => {
      const { container } = render(<ProductCard product={prod} />);
      expect(container).toBeDefined();
    });
  });

  describe('Component Props Evaluation', () => {
    const priorities = [true, false];
    priorities.forEach((priority) => {
      it(`renders with priority=${priority}`, () => {
        const { container } = render(<ProductCard product={mockProduct} priority={priority} />);
        expect(container).toBeDefined();
      });
    });
  });
});
