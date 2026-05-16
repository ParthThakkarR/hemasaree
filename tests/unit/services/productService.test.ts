import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '@/lib/services/productService';

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildWhereClause', () => {
    it('should build where clause with non-objectId category name', () => {
      const filters = { categoryId: 'sarees' };
      const where = ProductService.buildWhereClause(filters);
      
      expect(where.category.name.equals).toBe('sarees');
      expect(where.category.name.mode).toBe('insensitive');
    });

    it('should build where clause with search filter', () => {
      const filters = { search: 'cotton' };
      const where = ProductService.buildWhereClause(filters);
      
      expect(where.OR).toBeDefined();
      expect(where.OR).toHaveLength(3);
    });

    it('should build where clause with price range', () => {
      const filters = { minPrice: 100, maxPrice: 1000 };
      const where = ProductService.buildWhereClause(filters);
      
      expect(where.price.gte).toBe(100);
      expect(where.price.lte).toBe(1000);
    });

    it('should build where clause with color filter', () => {
      const filters = { color: 'red' };
      const where = ProductService.buildWhereClause(filters);
      
      expect(where.color.contains).toBe('red');
    });

    it('should build where clause with ocassion filter', () => {
      const filters = { ocassion: 'wedding' };
      const where = ProductService.buildWhereClause(filters);
      
      expect(where.ocassion.contains).toBe('wedding');
    });

    it('should build empty where clause', () => {
      const filters = {};
      const where = ProductService.buildWhereClause(filters);
      
      expect(Object.keys(where)).toHaveLength(0);
    });

    it('should build where clause with special characters in search', () => {
      const filters = { search: "O'Reilly & Sons" };
      const where = ProductService.buildWhereClause(filters);
      
      expect(where.OR).toBeDefined();
    });

    it('should build where clause with unicode in search', () => {
      const filters = { search: 'साड़ी' };
      const where = ProductService.buildWhereClause(filters);
      
      expect(where.OR).toBeDefined();
    });

    it('should build where clause with zero price values', () => {
      const filters = { minPrice: 0, maxPrice: 0 };
      const where = ProductService.buildWhereClause(filters);
      
      expect(where.price.gte).toBe(0);
      expect(where.price.lte).toBe(0);
    });
  });
});

describe('ProductService Edge Cases', () => {
  it('should handle very long search string', () => {
    const longSearch = 'a'.repeat(1000);
    const filters = { search: longSearch };
    const where = ProductService.buildWhereClause(filters);
    
    expect(where.OR).toBeDefined();
    expect(where.OR[0].name.contains).toBe(longSearch);
  });

  it('should handle XSS attempt in search', () => {
    const xssAttempt = '<script>alert("xss")</script>';
    const filters = { search: xssAttempt };
    const where = ProductService.buildWhereClause(filters);
    
    // Should treat it as literal text, not execute anything
    expect(where.OR).toBeDefined();
  });

  it('should handle SQL injection attempt in categoryId', () => {
    const sqlInjection = "1'; DROP TABLE products; --";
    const filters = { categoryId: sqlInjection };
    const where = ProductService.buildWhereClause(filters);
    
    // Non-valid ObjectId string should be treated as category name
    expect(where.category).toBeDefined();
    expect(where.category.name.equals).toBe(sqlInjection);
  });

  it('should handle negative price range', () => {
    const filters = { minPrice: -100, maxPrice: -10 };
    const where = ProductService.buildWhereClause(filters);
    
    expect(where.price.gte).toBe(-100);
    expect(where.price.lte).toBe(-10);
  });

  it('should handle empty string search', () => {
    const filters = { search: '' };
    const where = ProductService.buildWhereClause(filters);
    
    // Empty search should not add OR clause
    expect(where.OR).toBeUndefined();
  });

  it('should handle only minPrice', () => {
    const filters = { minPrice: 100 };
    const where = ProductService.buildWhereClause(filters);
    
    expect(where.price.gte).toBe(100);
    expect(where.price.lte).toBeUndefined();
  });

  it('should handle only maxPrice', () => {
    const filters = { maxPrice: 1000 };
    const where = ProductService.buildWhereClause(filters);
    
    expect(where.price.lte).toBe(1000);
    expect(where.price.gte).toBeUndefined();
  });
});

describe('ProductService Security Tests', () => {
  it('should not expose internal structure', () => {
    const filters = { 
      categoryId: 'test',
      search: 'test',
      minPrice: 100,
      maxPrice: 1000,
    };
    const where = ProductService.buildWhereClause(filters);
    
    // Should be a plain object
    expect(typeof where).toBe('object');
    expect(where).not.toBeNull();
  });

  it('should handle prototype pollution attempt gracefully', () => {
    const maliciousFilter = JSON.parse('{"__proto__":{"polluted":true},"categoryId":"test"}');
    const where = ProductService.buildWhereClause(maliciousFilter as any);
    
    // Should not pollute Object.prototype
    expect(({} as any).polluted).toBeUndefined();
  });

  it('should sanitize category name for XSS', () => {
    const xssName = '<img src=x onerror=alert(1)>';
    const filters = { categoryId: xssName };
    const where = ProductService.buildWhereClause(filters);
    
    // Should be treated as literal string
    expect(where.category.name.equals).toBe(xssName);
  });
});