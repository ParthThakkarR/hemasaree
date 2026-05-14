import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProductSkeleton from '@components/ui/product-skeleton';

describe('ProductSkeleton Component', () => {
  it('renders standard skeleton correctly', () => {
    const { container } = render(<ProductSkeleton />);
    expect(container).toBeDefined();
    // Just ensure it renders without crashing
    expect(container.firstChild).toBeDefined();
  });

  const arraySizes = [1, 2, 5, 10];
  arraySizes.forEach((size) => {
    it(`renders a grid of ${size} skeletons correctly without crashing`, () => {
      const { container } = render(
        <div className="grid">
          {Array.from({ length: size }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      );
      expect(container.firstChild).toBeDefined();
    });
  });
});
