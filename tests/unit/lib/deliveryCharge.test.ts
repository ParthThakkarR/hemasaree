// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateDeliveryCharge, DELIVERY_CHARGE_CONFIG } from '@/lib/services/orderService';

describe('calculateDeliveryCharge - Extended', () => {
  it('returns gujarat charge for Gujarat', () => {
    expect(calculateDeliveryCharge('Gujarat')).toBe(DELIVERY_CHARGE_CONFIG.gujarat);
  });

  it('returns gujarat charge for gujarat lowercase', () => {
    expect(calculateDeliveryCharge('gujarat')).toBe(DELIVERY_CHARGE_CONFIG.gujarat);
  });

  it('returns gujarat charge for GUJARAT uppercase', () => {
    expect(calculateDeliveryCharge('GUJARAT')).toBe(DELIVERY_CHARGE_CONFIG.gujarat);
  });

  it('returns gujarat charge for Gujarat with spaces', () => {
    expect(calculateDeliveryCharge('  Gujarat  ')).toBe(DELIVERY_CHARGE_CONFIG.gujarat);
  });

  it('returns gujarat charge for Gujarat with tabs', () => {
    expect(calculateDeliveryCharge('\tGujarat\t')).toBe(DELIVERY_CHARGE_CONFIG.gujarat);
  });

  it('returns gujarat charge for Gujarat with newlines', () => {
    expect(calculateDeliveryCharge('\nGujarat\n')).toBe(DELIVERY_CHARGE_CONFIG.gujarat);
  });

  it('returns default for Maharashtra', () => {
    expect(calculateDeliveryCharge('Maharashtra')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Karnataka', () => {
    expect(calculateDeliveryCharge('Karnataka')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Tamil Nadu', () => {
    expect(calculateDeliveryCharge('Tamil Nadu')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Delhi', () => {
    expect(calculateDeliveryCharge('Delhi')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Rajasthan', () => {
    expect(calculateDeliveryCharge('Rajasthan')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Uttar Pradesh', () => {
    expect(calculateDeliveryCharge('Uttar Pradesh')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for West Bengal', () => {
    expect(calculateDeliveryCharge('West Bengal')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Kerala', () => {
    expect(calculateDeliveryCharge('Kerala')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Punjab', () => {
    expect(calculateDeliveryCharge('Punjab')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Haryana', () => {
    expect(calculateDeliveryCharge('Haryana')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Madhya Pradesh', () => {
    expect(calculateDeliveryCharge('Madhya Pradesh')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Bihar', () => {
    expect(calculateDeliveryCharge('Bihar')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Odisha', () => {
    expect(calculateDeliveryCharge('Odisha')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Assam', () => {
    expect(calculateDeliveryCharge('Assam')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Jharkhand', () => {
    expect(calculateDeliveryCharge('Jharkhand')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Chhattisgarh', () => {
    expect(calculateDeliveryCharge('Chhattisgarh')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Uttarakhand', () => {
    expect(calculateDeliveryCharge('Uttarakhand')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Himachal Pradesh', () => {
    expect(calculateDeliveryCharge('Himachal Pradesh')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Jammu and Kashmir', () => {
    expect(calculateDeliveryCharge('Jammu and Kashmir')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for Goa', () => {
    expect(calculateDeliveryCharge('Goa')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for empty string', () => {
    expect(calculateDeliveryCharge('')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for whitespace only', () => {
    expect(calculateDeliveryCharge('   ')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for tabs only', () => {
    expect(calculateDeliveryCharge('\t\t')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for newlines only', () => {
    expect(calculateDeliveryCharge('\n\n')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for null', () => {
    expect(calculateDeliveryCharge(null as any)).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for undefined', () => {
    expect(calculateDeliveryCharge(undefined as any)).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('throws for number', () => {
    expect(() => calculateDeliveryCharge(123 as any)).toThrow();
  });

  it('throws for boolean', () => {
    expect(() => calculateDeliveryCharge(true as any)).toThrow();
  });

  it('throws for object', () => {
    expect(() => calculateDeliveryCharge({} as any)).toThrow();
  });

  it('throws for array', () => {
    expect(() => calculateDeliveryCharge([] as any)).toThrow();
  });

  it('returns default for unicode', () => {
    expect(calculateDeliveryCharge('गुजरात' as any)).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for mixed case gujarat', () => {
    expect(calculateDeliveryCharge('GuJaRaT')).toBe(DELIVERY_CHARGE_CONFIG.gujarat);
  });

  it('returns default for similar but not exact match', () => {
    expect(calculateDeliveryCharge('Gujarat Pradesh')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for gujarat with extra chars', () => {
    expect(calculateDeliveryCharge('Gujarat123')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('returns default for partial match', () => {
    expect(calculateDeliveryCharge('Guj')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('gujarat charge is 80', () => {
    expect(DELIVERY_CHARGE_CONFIG.gujarat).toBe(80);
  });

  it('default charge is 150', () => {
    expect(DELIVERY_CHARGE_CONFIG.default).toBe(150);
  });

  it('gujarat is cheaper than default', () => {
    expect(DELIVERY_CHARGE_CONFIG.gujarat).toBeLessThan(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles very long state name', () => {
    expect(calculateDeliveryCharge('A'.repeat(1000))).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with emojis', () => {
    expect(calculateDeliveryCharge('🏠 Gujarat 🏠')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with unicode spaces', () => {
    expect(calculateDeliveryCharge('Gujarat\u00A0')).toBe(DELIVERY_CHARGE_CONFIG.gujarat);
  });

  it('handles state name with zero-width chars', () => {
    expect(calculateDeliveryCharge('Gujarat\u200B')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with RTL chars', () => {
    expect(calculateDeliveryCharge('\u200FGujarat\u200F')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with combining chars', () => {
    expect(calculateDeliveryCharge('Gujarat\u0301')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with control chars', () => {
    expect(calculateDeliveryCharge('Gujarat\u0000')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with HTML entities', () => {
    expect(calculateDeliveryCharge('Gujarat&lt;')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with SQL injection', () => {
    expect(calculateDeliveryCharge("'; DROP TABLE orders; --")).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with XSS', () => {
    expect(calculateDeliveryCharge('<script>alert(1)</script>')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with path traversal', () => {
    expect(calculateDeliveryCharge('../../../etc/passwd')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with URL', () => {
    expect(calculateDeliveryCharge('https://example.com')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with email', () => {
    expect(calculateDeliveryCharge('test@example.com')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with phone number', () => {
    expect(calculateDeliveryCharge('+911234567890')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with IP address', () => {
    expect(calculateDeliveryCharge('192.168.1.1')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with JSON', () => {
    expect(calculateDeliveryCharge('{"state":"Gujarat"}')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with base64', () => {
    expect(calculateDeliveryCharge('R3VqYXJhdA==')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });

  it('handles state name with hex', () => {
    expect(calculateDeliveryCharge('0x47756a61726174')).toBe(DELIVERY_CHARGE_CONFIG.default);
  });
});
