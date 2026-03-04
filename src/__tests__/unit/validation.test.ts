import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
  isNotEmpty,
  isInRange,
  isValidUrl,
  isValidUUID,
  sanitizeSearchQuery,
} from '@/utils/validation';

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
    expect(isValidEmail('user123@test.io')).toBe(true);
  });
  
  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('test@.com')).toBe(false);
    expect(isValidEmail('test..test@example.com')).toBe(false);
  });
  
  it('should return false for empty or null values', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
  });
  
  it('should handle emails with whitespace', () => {
    expect(isValidEmail('  test@example.com  ')).toBe(true);
    expect(isValidEmail('test@example.com ')).toBe(true);
  });
});

describe('isValidPassword', () => {
  it('should return true for valid passwords', () => {
    expect(isValidPassword('Password123')).toBe(true);
    expect(isValidPassword('MySecureP4ss')).toBe(true);
    expect(isValidPassword('C0mplexP@ss')).toBe(true);
  });
  
  it('should return false for passwords without uppercase', () => {
    expect(isValidPassword('password123')).toBe(false);
    expect(isValidPassword('lowercase1')).toBe(false);
  });
  
  it('should return false for passwords without lowercase', () => {
    expect(isValidPassword('PASSWORD123')).toBe(false);
    expect(isValidPassword('UPPERCASE1')).toBe(false);
  });
  
  it('should return false for passwords without numbers', () => {
    expect(isValidPassword('PasswordOnly')).toBe(false);
    expect(isValidPassword('NoNumbersHere')).toBe(false);
  });
  
  it('should return false for passwords shorter than 8 characters', () => {
    expect(isValidPassword('Pass1')).toBe(false);
    expect(isValidPassword('Short7')).toBe(false);
    expect(isValidPassword('Abc123')).toBe(false);
  });
  
  it('should return false for empty or null values', () => {
    expect(isValidPassword('')).toBe(false);
    expect(isValidPassword(null as unknown as string)).toBe(false);
    expect(isValidPassword(undefined as unknown as string)).toBe(false);
  });
  
  it('should handle exactly 8 characters', () => {
    expect(isValidPassword('Pass1234')).toBe(true);
  });
});

describe('isValidPhoneNumber', () => {
  it('should return true for valid Norwegian phone numbers', () => {
    expect(isValidPhoneNumber('98765432')).toBe(true);
    expect(isValidPhoneNumber('41234567')).toBe(true);
    expect(isValidPhoneNumber('90012345')).toBe(true);
  });
  
  it('should return true for phone numbers with +47 prefix', () => {
    expect(isValidPhoneNumber('+4798765432')).toBe(true);
    expect(isValidPhoneNumber('+4741234567')).toBe(true);
  });
  
  it('should return true for phone numbers with 0047 prefix', () => {
    expect(isValidPhoneNumber('004798765432')).toBe(true);
    expect(isValidPhoneNumber('004741234567')).toBe(true);
  });
  
  it('should return true for phone numbers with spaces', () => {
    expect(isValidPhoneNumber('987 65 432')).toBe(true);
    expect(isValidPhoneNumber('41 23 45 67')).toBe(true);
  });
  
  it('should return true for phone numbers with dashes', () => {
    expect(isValidPhoneNumber('987-65-432')).toBe(true);
    expect(isValidPhoneNumber('41-23-45-67')).toBe(true);
  });
  
  it('should return false for invalid phone numbers', () => {
    expect(isValidPhoneNumber('1234567')).toBe(false); // Too short
    expect(isValidPhoneNumber('123456789')).toBe(false); // Too long
    expect(isValidPhoneNumber('abcdefghij')).toBe(false); // Not digits
    expect(isValidPhoneNumber('12345678')).toBe(false); // Invalid format
  });
  
  it('should return false for empty or null values', () => {
    expect(isValidPhoneNumber('')).toBe(false);
    expect(isValidPhoneNumber(null as unknown as string)).toBe(false);
    expect(isValidPhoneNumber(undefined as unknown as string)).toBe(false);
  });
});

describe('isNotEmpty', () => {
  it('should return true for non-empty strings', () => {
    expect(isNotEmpty('hello')).toBe(true);
    expect(isNotEmpty('a')).toBe(true);
    expect(isNotEmpty(' hello ')).toBe(true);
  });
  
  it('should return false for empty strings', () => {
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty('   ')).toBe(false);
    expect(isNotEmpty('\t\n')).toBe(false);
  });
  
  it('should return false for null or undefined', () => {
    expect(isNotEmpty(null)).toBe(false);
    expect(isNotEmpty(undefined)).toBe(false);
  });
});

describe('isInRange', () => {
  it('should return true for values within range', () => {
    expect(isInRange(5, 0, 10)).toBe(true);
    expect(isInRange(0, 0, 10)).toBe(true);
    expect(isInRange(10, 0, 10)).toBe(true);
    expect(isInRange(50, 0, 100)).toBe(true);
  });
  
  it('should return false for values outside range', () => {
    expect(isInRange(-1, 0, 10)).toBe(false);
    expect(isInRange(11, 0, 10)).toBe(false);
    expect(isInRange(100, 0, 50)).toBe(false);
  });
  
  it('should return false for non-numeric values', () => {
    expect(isInRange(NaN, 0, 10)).toBe(false);
    expect(isInRange(Infinity, 0, 10)).toBe(false);
    expect(isInRange(-Infinity, 0, 10)).toBe(false);
  });
  
  it('should handle negative ranges', () => {
    expect(isInRange(-5, -10, 0)).toBe(true);
    expect(isInRange(-15, -10, 0)).toBe(false);
  });
  
  it('should handle decimal values', () => {
    expect(isInRange(5.5, 0, 10)).toBe(true);
    expect(isInRange(0.1, 0, 1)).toBe(true);
  });
});

describe('isValidUrl', () => {
  it('should return true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('https://sub.domain.co.uk/path')).toBe(true);
    expect(isValidUrl('ftp://files.example.com')).toBe(true);
  });
  
  it('should return false for invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('example')).toBe(false);
    expect(isValidUrl('://missing-protocol.com')).toBe(false);
  });
  
  it('should return false for empty or null values', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl(null as unknown as string)).toBe(false);
    expect(isValidUrl(undefined as unknown as string)).toBe(false);
  });
  
  it('should handle URLs with query parameters', () => {
    expect(isValidUrl('https://example.com?foo=bar')).toBe(true);
    expect(isValidUrl('https://example.com?foo=bar&baz=qux')).toBe(true);
  });
  
  it('should handle URLs with fragments', () => {
    expect(isValidUrl('https://example.com#section')).toBe(true);
  });
});

describe('isValidUUID', () => {
  it('should return true for valid UUID v4', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    expect(isValidUUID('6ba7b811-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });
  
  it('should return false for invalid UUIDs', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false); // Too short
    expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000g')).toBe(false); // Invalid char
    expect(isValidUUID('550e8400-e29b-31d4-a716-446655440000')).toBe(false); // Wrong version
  });
  
  it('should return false for empty or null values', () => {
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID(null as unknown as string)).toBe(false);
    expect(isValidUUID(undefined as unknown as string)).toBe(false);
  });
  
  it('should handle uppercase UUIDs', () => {
    expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });
});

describe('sanitizeSearchQuery', () => {
  it('should trim whitespace', () => {
    expect(sanitizeSearchQuery('  hello  ')).toBe('hello');
  });
  
  it('should remove HTML tags', () => {
    expect(sanitizeSearchQuery('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    expect(sanitizeSearchQuery('<div>content</div>')).toBe('divcontent/div');
  });
  
  it('should limit length to 200 characters', () => {
    const longQuery = 'a'.repeat(300);
    expect(sanitizeSearchQuery(longQuery).length).toBe(200);
  });
  
  it('should handle empty or null values', () => {
    expect(sanitizeSearchQuery('')).toBe('');
    expect(sanitizeSearchQuery(null as unknown as string)).toBe('');
    expect(sanitizeSearchQuery(undefined as unknown as string)).toBe('');
  });
  
  it('should preserve valid search characters', () => {
    expect(sanitizeSearchQuery('hello world')).toBe('hello world');
    expect(sanitizeSearchQuery('search-term_123')).toBe('search-term_123');
    expect(sanitizeSearchQuery('café résumé')).toBe('café résumé');
  });
  
  it('should handle Norwegian characters', () => {
    expect(sanitizeSearchQuery('søk etter æøå')).toBe('søk etter æøå');
  });
  
  it('should handle special characters', () => {
    expect(sanitizeSearchQuery('test@example.com')).toBe('test@example.com');
    expect(sanitizeSearchQuery('price: $100')).toBe('price: $100');
  });
});
