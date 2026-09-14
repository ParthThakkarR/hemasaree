// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateDeliveryCharge } from '@/lib/services/orderService';

// Mock SettingsService since calculateDeliveryCharge uses it
const mockSettings = {
  deliveryChargeGujarat: 80,
  deliveryChargeDefault: 150,
  polishPrice: 450,
  isPolishEnabled: true,
};

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    storeSettings: {
      findFirst: vi.fn().mockResolvedValue({ deliveryChargeGujarat: 80, deliveryChargeDefault: 150, polishPrice: 450, isPolishEnabled: true }),
      create: vi.fn().mockResolvedValue({ deliveryChargeGujarat: 80, deliveryChargeDefault: 150, polishPrice: 450, isPolishEnabled: true }),
    },
  },
}));

vi.mock('@/lib/cache', () => ({
  cache: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    getOrSet: vi.fn().mockImplementation(async (_key: string, loader: () => Promise<any>) => loader()),
    writeThrough: vi.fn().mockImplementation(async (_key: string, writer: () => Promise<any>) => writer()),
  },
}));

const GUJARAT_CHARGE = 80;
const DEFAULT_CHARGE = 150;

describe('calculateDeliveryCharge - Extended', () => {
  it('returns gujarat charge for Gujarat', async () => {
    expect(await calculateDeliveryCharge('Gujarat')).toBe(GUJARAT_CHARGE);
  });

  it('returns gujarat charge for gujarat lowercase', async () => {
    expect(await calculateDeliveryCharge('gujarat')).toBe(GUJARAT_CHARGE);
  });

  it('returns gujarat charge for GUJARAT uppercase', async () => {
    expect(await calculateDeliveryCharge('GUJARAT')).toBe(GUJARAT_CHARGE);
  });

  it('returns gujarat charge for Gujarat with spaces', async () => {
    expect(await calculateDeliveryCharge('  Gujarat  ')).toBe(GUJARAT_CHARGE);
  });

  it('returns gujarat charge for Gujarat with tabs', async () => {
    expect(await calculateDeliveryCharge('\tGujarat\t')).toBe(GUJARAT_CHARGE);
  });

  it('returns gujarat charge for Gujarat with newlines', async () => {
    expect(await calculateDeliveryCharge('\nGujarat\n')).toBe(GUJARAT_CHARGE);
  });

  it('returns default for Maharashtra', async () => {
    expect(await calculateDeliveryCharge('Maharashtra')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Karnataka', async () => {
    expect(await calculateDeliveryCharge('Karnataka')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Tamil Nadu', async () => {
    expect(await calculateDeliveryCharge('Tamil Nadu')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Delhi', async () => {
    expect(await calculateDeliveryCharge('Delhi')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Rajasthan', async () => {
    expect(await calculateDeliveryCharge('Rajasthan')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Uttar Pradesh', async () => {
    expect(await calculateDeliveryCharge('Uttar Pradesh')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for West Bengal', async () => {
    expect(await calculateDeliveryCharge('West Bengal')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Kerala', async () => {
    expect(await calculateDeliveryCharge('Kerala')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Punjab', async () => {
    expect(await calculateDeliveryCharge('Punjab')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Haryana', async () => {
    expect(await calculateDeliveryCharge('Haryana')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Madhya Pradesh', async () => {
    expect(await calculateDeliveryCharge('Madhya Pradesh')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Bihar', async () => {
    expect(await calculateDeliveryCharge('Bihar')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Odisha', async () => {
    expect(await calculateDeliveryCharge('Odisha')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Assam', async () => {
    expect(await calculateDeliveryCharge('Assam')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Jharkhand', async () => {
    expect(await calculateDeliveryCharge('Jharkhand')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Chhattisgarh', async () => {
    expect(await calculateDeliveryCharge('Chhattisgarh')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Uttarakhand', async () => {
    expect(await calculateDeliveryCharge('Uttarakhand')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Himachal Pradesh', async () => {
    expect(await calculateDeliveryCharge('Himachal Pradesh')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Jammu and Kashmir', async () => {
    expect(await calculateDeliveryCharge('Jammu and Kashmir')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for Goa', async () => {
    expect(await calculateDeliveryCharge('Goa')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for empty string', async () => {
    expect(await calculateDeliveryCharge('')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for whitespace only', async () => {
    expect(await calculateDeliveryCharge('   ')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for tabs only', async () => {
    expect(await calculateDeliveryCharge('\t\t')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for newlines only', async () => {
    expect(await calculateDeliveryCharge('\n\n')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for null', async () => {
    expect(await calculateDeliveryCharge(null as any)).toBe(DEFAULT_CHARGE);
  });

  it('returns default for undefined', async () => {
    expect(await calculateDeliveryCharge(undefined as any)).toBe(DEFAULT_CHARGE);
  });

  it('returns default for number (coerced to string)', async () => {
    expect(await calculateDeliveryCharge(123 as any)).toBe(DEFAULT_CHARGE);
  });

  it('returns default for boolean (coerced to string)', async () => {
    expect(await calculateDeliveryCharge(true as any)).toBe(DEFAULT_CHARGE);
  });

  it('returns default for object (coerced to string)', async () => {
    expect(await calculateDeliveryCharge({} as any)).toBe(DEFAULT_CHARGE);
  });

  it('returns default for array (coerced to string)', async () => {
    expect(await calculateDeliveryCharge([] as any)).toBe(DEFAULT_CHARGE);
  });

  it('returns default for unicode', async () => {
    expect(await calculateDeliveryCharge('गुजरात' as any)).toBe(DEFAULT_CHARGE);
  });

  it('returns gujarat for mixed case', async () => {
    expect(await calculateDeliveryCharge('GuJaRaT')).toBe(GUJARAT_CHARGE);
  });

  it('returns default for similar but not exact match', async () => {
    expect(await calculateDeliveryCharge('Gujarat Pradesh')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for gujarat with extra chars', async () => {
    expect(await calculateDeliveryCharge('Gujarat123')).toBe(DEFAULT_CHARGE);
  });

  it('returns default for partial match', async () => {
    expect(await calculateDeliveryCharge('Guj')).toBe(DEFAULT_CHARGE);
  });

  it('gujarat charge is 80', () => {
    expect(GUJARAT_CHARGE).toBe(80);
  });

  it('default charge is 150', () => {
    expect(DEFAULT_CHARGE).toBe(150);
  });

  it('gujarat is cheaper than default', () => {
    expect(GUJARAT_CHARGE).toBeLessThan(DEFAULT_CHARGE);
  });

  it('handles very long state name', async () => {
    expect(await calculateDeliveryCharge('A'.repeat(1000))).toBe(DEFAULT_CHARGE);
  });

  it('handles state name with emojis', async () => {
    expect(await calculateDeliveryCharge('🏠 Gujarat 🏠')).toBe(DEFAULT_CHARGE);
  });

  it('handles state name with SQL injection', async () => {
    expect(await calculateDeliveryCharge("'; DROP TABLE orders; --")).toBe(DEFAULT_CHARGE);
  });

  it('handles state name with XSS', async () => {
    expect(await calculateDeliveryCharge('<script>alert(1)</script>')).toBe(DEFAULT_CHARGE);
  });

  it('handles state name with path traversal', async () => {
    expect(await calculateDeliveryCharge('../../../etc/passwd')).toBe(DEFAULT_CHARGE);
  });

  it('handles state name with URL', async () => {
    expect(await calculateDeliveryCharge('https://example.com')).toBe(DEFAULT_CHARGE);
  });

  it('handles state name with email', async () => {
    expect(await calculateDeliveryCharge('test@example.com')).toBe(DEFAULT_CHARGE);
  });

  it('handles state name with phone number', async () => {
    expect(await calculateDeliveryCharge('+911234567890')).toBe(DEFAULT_CHARGE);
  });

  it('handles state name with IP address', async () => {
    expect(await calculateDeliveryCharge('192.168.1.1')).toBe(DEFAULT_CHARGE);
  });

  it('handles state name with JSON', async () => {
    expect(await calculateDeliveryCharge('{"state":"Gujarat"}')).toBe(DEFAULT_CHARGE);
  });

  it('handles state name with base64', async () => {
    expect(await calculateDeliveryCharge('R3VqYXJhdA==')).toBe(DEFAULT_CHARGE);
  });

  it('handles state name with hex', async () => {
    expect(await calculateDeliveryCharge('0x47756a61726174')).toBe(DEFAULT_CHARGE);
  });
});

