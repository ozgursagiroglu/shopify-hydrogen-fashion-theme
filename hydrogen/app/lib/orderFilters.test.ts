import {describe, it, expect} from 'vitest';
import {
  ORDER_FILTER_FIELDS,
  buildOrderSearchQuery,
  parseOrderFilters,
} from './orderFilters';

describe('orderFilters', () => {
  describe('ORDER_FILTER_FIELDS', () => {
    it('exports field name constants', () => {
      expect(ORDER_FILTER_FIELDS.NAME).toBe('name');
      expect(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER).toBe('confirmation_number');
    });
  });

  describe('buildOrderSearchQuery', () => {
    it('builds query with order name', () => {
      const query = buildOrderSearchQuery({name: '1001'});
      expect(query).toBe('name:1001');
    });

    it('builds query with confirmation number', () => {
      const query = buildOrderSearchQuery({confirmationNumber: 'ABC123'});
      expect(query).toBe('confirmation_number:ABC123');
    });

    it('builds query with both name and confirmation number', () => {
      const query = buildOrderSearchQuery({
        name: '1001',
        confirmationNumber: 'ABC123',
      });
      expect(query).toBe('name:1001 AND confirmation_number:ABC123');
    });

    it('removes # prefix from order name', () => {
      const query = buildOrderSearchQuery({name: '#1001'});
      expect(query).toBe('name:1001');
    });

    it('trims whitespace from values', () => {
      const query = buildOrderSearchQuery({
        name: '  1001  ',
        confirmationNumber: '  ABC123  ',
      });
      expect(query).toBe('name:1001 AND confirmation_number:ABC123');
    });

    it('returns undefined when no filters provided', () => {
      const query = buildOrderSearchQuery({});
      expect(query).toBeUndefined();
    });

    it('sanitizes input to prevent injection', () => {
      const query = buildOrderSearchQuery({
        name: '1001; DROP TABLE orders;',
      });
      expect(query).toBe('name:1001DROPTABLEorders');
    });

    it('allows alphanumeric, underscore, and dash', () => {
      const query = buildOrderSearchQuery({
        name: 'Order_123-456',
      });
      expect(query).toBe('name:Order_123-456');
    });

    it('removes special characters', () => {
      const query = buildOrderSearchQuery({
        name: 'Order@123!456$',
      });
      expect(query).toBe('name:Order123456');
    });

    it('returns undefined when sanitized value is empty', () => {
      const query = buildOrderSearchQuery({
        name: '####',
      });
      expect(query).toBeUndefined();
    });

    it('handles empty string values', () => {
      const query = buildOrderSearchQuery({
        name: '',
        confirmationNumber: '',
      });
      expect(query).toBeUndefined();
    });

    it('handles only whitespace values', () => {
      const query = buildOrderSearchQuery({
        name: '   ',
        confirmationNumber: '   ',
      });
      expect(query).toBeUndefined();
    });

    it('builds query when only name is valid', () => {
      const query = buildOrderSearchQuery({
        name: '1001',
        confirmationNumber: '   ',
      });
      expect(query).toBe('name:1001');
    });

    it('builds query when only confirmation number is valid', () => {
      const query = buildOrderSearchQuery({
        name: '   ',
        confirmationNumber: 'ABC123',
      });
      expect(query).toBe('confirmation_number:ABC123');
    });
  });

  describe('parseOrderFilters', () => {
    it('parses order name from search params', () => {
      const searchParams = new URLSearchParams({name: '1001'});
      const filters = parseOrderFilters(searchParams);

      expect(filters.name).toBe('1001');
      expect(filters.confirmationNumber).toBeUndefined();
    });

    it('parses confirmation number from search params', () => {
      const searchParams = new URLSearchParams({confirmation_number: 'ABC123'});
      const filters = parseOrderFilters(searchParams);

      expect(filters.confirmationNumber).toBe('ABC123');
      expect(filters.name).toBeUndefined();
    });

    it('parses both filters', () => {
      const searchParams = new URLSearchParams({
        name: '1001',
        confirmation_number: 'ABC123',
      });
      const filters = parseOrderFilters(searchParams);

      expect(filters.name).toBe('1001');
      expect(filters.confirmationNumber).toBe('ABC123');
    });

    it('returns empty object when no filters in params', () => {
      const searchParams = new URLSearchParams();
      const filters = parseOrderFilters(searchParams);

      expect(filters).toEqual({});
    });

    it('handles empty search params', () => {
      const searchParams = new URLSearchParams();
      const filters = parseOrderFilters(searchParams);

      expect(filters).toEqual({});
    });

    it('ignores other unrelated params', () => {
      const searchParams = new URLSearchParams({
        name: '1001',
        page: '2',
        sort: 'date',
      });
      const filters = parseOrderFilters(searchParams);

      expect(filters).toEqual({name: '1001'});
      expect((filters as any).page).toBeUndefined();
      expect((filters as any).sort).toBeUndefined();
    });

    it('preserves # in name from URL', () => {
      const searchParams = new URLSearchParams({name: '#1001'});
      const filters = parseOrderFilters(searchParams);

      expect(filters.name).toBe('#1001');
    });

    it('handles URL-encoded values', () => {
      const searchParams = new URLSearchParams('name=%231001&confirmation_number=ABC%20123');
      const filters = parseOrderFilters(searchParams);

      expect(filters.name).toBe('#1001');
      expect(filters.confirmationNumber).toBe('ABC 123');
    });
  });

  describe('Integration: parse and build', () => {
    it('round-trips simple name filter', () => {
      const searchParams = new URLSearchParams({name: '1001'});
      const filters = parseOrderFilters(searchParams);
      const query = buildOrderSearchQuery(filters);

      expect(query).toBe('name:1001');
    });

    it('round-trips with # removal', () => {
      const searchParams = new URLSearchParams({name: '#1001'});
      const filters = parseOrderFilters(searchParams);
      const query = buildOrderSearchQuery(filters);

      expect(query).toBe('name:1001');
    });

    it('round-trips both filters', () => {
      const searchParams = new URLSearchParams({
        name: '1001',
        confirmation_number: 'ABC123',
      });
      const filters = parseOrderFilters(searchParams);
      const query = buildOrderSearchQuery(filters);

      expect(query).toBe('name:1001 AND confirmation_number:ABC123');
    });
  });
});
