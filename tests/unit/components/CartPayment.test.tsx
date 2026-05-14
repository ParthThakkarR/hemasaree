import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CartPayment from '../../../app/components/cart/CartPayment';

vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef((props: any, ref: any) => {
        const { initial, animate, exit, transition, ...rest } = props;
        return <div ref={ref} {...rest} />;
      }),
    },
  };
});

describe('CartPayment Component', () => {
  const mockSavedAddress = {
    streetAddress: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    zipCode: '123456',
  };

  const mockNewAddress = {
    streetAddress: '456 New St',
    city: 'New City',
    state: 'New State',
    zipCode: '654321',
  };

  const mockSetStep = vi.fn();

  it('renders saved address correctly when addressMode is saved', () => {
    render(
      <CartPayment 
        addressMode="saved" 
        selectedSavedAddress={mockSavedAddress} 
        newAddr={mockNewAddress} 
        setStep={mockSetStep} 
      />
    );

    expect(screen.getByText('Secure Checkout')).toBeDefined();
    expect(screen.getByText(/123 Test St/)).toBeDefined();
    expect(screen.getByText(/Test City, Test State - 123456/)).toBeDefined();
  });

  it('renders new address correctly when addressMode is new', () => {
    render(
      <CartPayment 
        addressMode="new" 
        selectedSavedAddress={mockSavedAddress} 
        newAddr={mockNewAddress} 
        setStep={mockSetStep} 
      />
    );

    expect(screen.getByText(/456 New St/)).toBeDefined();
    expect(screen.getByText(/New City, New State - 654321/)).toBeDefined();
  });

  it('calls setStep(2) when Edit Address is clicked', () => {
    render(
      <CartPayment 
        addressMode="saved" 
        selectedSavedAddress={mockSavedAddress} 
        newAddr={mockNewAddress} 
        setStep={mockSetStep} 
      />
    );

    const editButton = screen.getByText('Edit Address');
    fireEvent.click(editButton);

    expect(mockSetStep).toHaveBeenCalledWith(2);
  });
});
