import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CartItems from '../../../app/components/cart/CartItems';

// Mock the framer-motion library so tests don't fail due to animations
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe('CartItems Component', () => {
  const mockCart = {
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Banarasi Silk Saree',
        productImage: '/test-img.jpg',
        price: 5000,
        quantity: 2,
        withPolish: true,
      },
    ],
  };

  const mockHandleQuantity = vi.fn();
  const mockHandleRemove = vi.fn();
  const mockGetImageSrc = vi.fn((src) => src);

  it('renders cart items correctly', () => {
    render(
      <CartItems 
        cart={mockCart} 
        isLoading={false} 
        handleQuantity={mockHandleQuantity} 
        handleRemove={mockHandleRemove} 
        getImageSrc={mockGetImageSrc} 
      />
    );

    expect(screen.getByText('Banarasi Silk Saree')).toBeDefined();
    expect(screen.getByText('₹5,000')).toBeDefined();
    expect(screen.getByText('Includes Polish')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined(); // Quantity
  });

  it('calls handleQuantity when + or - buttons are clicked', () => {
    render(
      <CartItems 
        cart={mockCart} 
        isLoading={false} 
        handleQuantity={mockHandleQuantity} 
        handleRemove={mockHandleRemove} 
        getImageSrc={mockGetImageSrc} 
      />
    );

    const minusButton = screen.getByText('-');
    const plusButton = screen.getByText('+');

    fireEvent.click(plusButton);
    expect(mockHandleQuantity).toHaveBeenCalledWith('item-1', 3);

    fireEvent.click(minusButton);
    expect(mockHandleQuantity).toHaveBeenCalledWith('item-1', 1);
  });

  it('disables buttons when isLoading is true', () => {
    render(
      <CartItems 
        cart={mockCart} 
        isLoading={true} 
        handleQuantity={mockHandleQuantity} 
        handleRemove={mockHandleRemove} 
        getImageSrc={mockGetImageSrc} 
      />
    );

    const minusButton = screen.getByText('-') as HTMLButtonElement;
    const plusButton = screen.getByText('+') as HTMLButtonElement;
    const removeButton = screen.getByRole('button', { name: /Remove/i }) as HTMLButtonElement;

    expect(minusButton.disabled).toBe(true);
    expect(plusButton.disabled).toBe(true);
    expect(removeButton.disabled).toBe(true);
  });

  it('calls handleRemove when remove button is clicked', () => {
    render(
      <CartItems 
        cart={mockCart} 
        isLoading={false} 
        handleQuantity={mockHandleQuantity} 
        handleRemove={mockHandleRemove} 
        getImageSrc={mockGetImageSrc} 
      />
    );

    const removeButton = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(removeButton);

    expect(mockHandleRemove).toHaveBeenCalledWith('item-1');
  });
});
