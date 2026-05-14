import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CartOrderSummary from '../../../app/components/cart/CartOrderSummary';

describe('CartOrderSummary Component', () => {
  const mockCart = {
    items: [{ id: '1' }, { id: '2' }],
  };

  const defaultProps = {
    cart: mockCart,
    step: 1,
    setStep: vi.fn(),
    subtotal: 10000,
    deliveryCharge: 150,
    total: 10150,
    isPlacingOrder: false,
    validateAddressAndProceed: vi.fn(),
    placeOrder: vi.fn(),
  };

  it('renders order summary correctly for step 1', () => {
    render(<CartOrderSummary {...defaultProps} />);

    expect(screen.getByText('Order Summary')).toBeDefined();
    expect(screen.getByText('Subtotal (2 items)')).toBeDefined();
    expect(screen.getAllByText('₹10,000').length).toBeGreaterThan(0);
    expect(screen.getByText('Calculated at checkout')).toBeDefined();
    expect(screen.getByRole('button', { name: /Proceed to Checkout/i })).toBeDefined();
  });

  it('renders order summary correctly for step 2', () => {
    render(<CartOrderSummary {...defaultProps} step={2} />);

    expect(screen.getByText('₹150')).toBeDefined();
    expect(screen.getByText('₹10,150')).toBeDefined(); // Total
    expect(screen.getByRole('button', { name: /Continue/i })).toBeDefined();
  });

  it('renders order summary correctly for step 3', () => {
    render(<CartOrderSummary {...defaultProps} step={3} />);

    expect(screen.getByRole('button', { name: /Place Order Now/i })).toBeDefined();
  });

  it('calls setStep(2) when Proceed to Checkout is clicked in step 1', () => {
    render(<CartOrderSummary {...defaultProps} />);
    const btn = screen.getByRole('button', { name: /Proceed to Checkout/i });
    fireEvent.click(btn);
    expect(defaultProps.setStep).toHaveBeenCalledWith(2);
  });

  it('calls validateAddressAndProceed when Continue is clicked in step 2', () => {
    render(<CartOrderSummary {...defaultProps} step={2} />);
    const btn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(btn);
    expect(defaultProps.validateAddressAndProceed).toHaveBeenCalled();
  });

  it('calls placeOrder when Place Order Now is clicked in step 3', () => {
    render(<CartOrderSummary {...defaultProps} step={3} />);
    const btn = screen.getByRole('button', { name: /Place Order Now/i });
    fireEvent.click(btn);
    expect(defaultProps.placeOrder).toHaveBeenCalled();
  });

  it('disables Place Order Now button when isPlacingOrder is true', () => {
    render(<CartOrderSummary {...defaultProps} step={3} isPlacingOrder={true} />);
    const btn = screen.getByRole('button', { name: /Processing/i }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
