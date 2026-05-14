import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CartShipping from '../../../app/components/cart/CartShipping';

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

describe('CartShipping Component', () => {
  const mockSavedAddresses = [
    {
      id: 'addr-1',
      label: 'Home',
      streetAddress: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '123456',
    },
  ];

  const defaultProps = {
    savedAddresses: mockSavedAddresses,
    addressMode: 'saved',
    setAddressMode: vi.fn(),
    selectedSavedAddress: mockSavedAddresses[0],
    setSelectedSavedAddress: vi.fn(),
    newAddr: { streetAddress: '', city: '', state: '', zipCode: '' },
    setNewAddr: vi.fn(),
    states: [{ name: 'Test State', isoCode: 'TS' }],
    cities: [{ name: 'Test City' }],
  };

  it('renders saved addresses when mode is saved', () => {
    render(<CartShipping {...defaultProps} />);

    expect(screen.getByText('Delivery Address')).toBeDefined();
    expect(screen.getByText(/123 Test St/)).toBeDefined();
    expect(screen.getByText(/Test City, Test State/)).toBeDefined();
    expect(screen.getByText(/123456/)).toBeDefined();
  });

  it('switches to new address mode when clicked', () => {
    render(<CartShipping {...defaultProps} />);
    
    const newAddressLabel = screen.getByText('Add a new address');
    fireEvent.click(newAddressLabel);

    expect(defaultProps.setAddressMode).toHaveBeenCalledWith('new');
  });

  it('renders new address form when mode is new', () => {
    render(<CartShipping {...defaultProps} addressMode="new" />);

    expect(screen.getByLabelText('Street Address')).toBeDefined();
    expect(screen.getByLabelText('State')).toBeDefined();
    expect(screen.getByLabelText('City')).toBeDefined();
    expect(screen.getByLabelText('PIN Code')).toBeDefined();
  });
});
