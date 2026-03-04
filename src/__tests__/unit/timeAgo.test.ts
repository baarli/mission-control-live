import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { timeAgo, formatDate, formatTimestamp } from '@/utils/timeAgo';

describe('timeAgo', () => {
  beforeEach(() => {
    // Set a fixed date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  describe('relative time formatting', () => {
    it('should return "Akkurat nå" for current time', () => {
      const now = new Date();
      expect(timeAgo(now)).toBe('Akkurat nå');
    });
    
    it('should return minutes ago for recent times', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(timeAgo(fiveMinutesAgo)).toBe('5 minutter siden');
    });
    
    it('should return singular minute for 1 minute ago', () => {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      expect(timeAgo(oneMinuteAgo)).toBe('1 minutt siden');
    });
    
    it('should return hours ago for times within 24 hours', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(timeAgo(threeHoursAgo)).toBe('3 timer siden');
    });
    
    it('should return singular hour for 1 hour ago', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      expect(timeAgo(oneHourAgo)).toBe('1 time siden');
    });
    
    it('should return days ago for times within 7 days', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(timeAgo(threeDaysAgo)).toBe('3 dager siden');
    });
    
    it('should return singular day for 1 day ago', () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(timeAgo(oneDayAgo)).toBe('1 dag siden');
    });
    
    it('should use date-fns for times older than 7 days', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const result = timeAgo(tenDaysAgo);
      // Should return something like "10 dager siden" in Norwegian
      expect(result).toContain('siden');
    });
  });
  
  describe('input types', () => {
    it('should handle Date objects', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      expect(timeAgo(date)).toBe('5 minutter siden');
    });
    
    it('should handle ISO string dates', () => {
      const isoString = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(timeAgo(isoString)).toBe('5 minutter siden');
    });
    
    it('should handle timestamps', () => {
      const timestamp = Date.now() - 5 * 60 * 1000;
      expect(timeAgo(timestamp)).toBe('5 minutter siden');
    });
  });
  
  describe('edge cases', () => {
    it('should handle invalid date strings', () => {
      expect(timeAgo('invalid-date')).toBe('Ugyldig dato');
    });
    
    it('should handle NaN dates', () => {
      expect(timeAgo(new Date(NaN))).toBe('Ugyldig dato');
    });
    
    it('should handle dates in the future', () => {
      const futureDate = new Date(Date.now() + 60 * 1000);
      const result = timeAgo(futureDate);
      // Future dates might show "om" or similar
      expect(typeof result).toBe('string');
    });
    
    it('should handle boundary at 59 minutes', () => {
      const fiftyNineMinutesAgo = new Date(Date.now() - 59 * 60 * 1000);
      expect(timeAgo(fiftyNineMinutesAgo)).toBe('59 minutter siden');
    });
    
    it('should handle boundary at 60 minutes (1 hour)', () => {
      const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
      expect(timeAgo(sixtyMinutesAgo)).toBe('1 time siden');
    });
    
    it('should handle boundary at 23 hours', () => {
      const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000);
      expect(timeAgo(twentyThreeHoursAgo)).toBe('23 timer siden');
    });
    
    it('should handle boundary at 24 hours (1 day)', () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(timeAgo(twentyFourHoursAgo)).toBe('1 dag siden');
    });
    
    it('should handle boundary at 6 days', () => {
      const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      expect(timeAgo(sixDaysAgo)).toBe('6 dager siden');
    });
    
    it('should handle boundary at 7 days', () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const result = timeAgo(sevenDaysAgo);
      // Should use date-fns format
      expect(result).toContain('siden');
    });
  });
});

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('should format date with default format', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    const result = formatDate(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
  
  it('should format date with custom format', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    const result = formatDate(date, 'yyyy-MM-dd');
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
  
  it('should handle ISO string dates', () => {
    const result = formatDate('2024-01-15T12:00:00Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
  
  it('should handle timestamps', () => {
    const result = formatDate(1705320000000);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
  
  it('should return error message for invalid dates', () => {
    expect(formatDate('invalid')).toBe('Ugyldig dato');
  });
  
  it('should return error message for NaN dates', () => {
    expect(formatDate(new Date(NaN))).toBe('Ugyldig dato');
  });
});

describe('formatTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('should format timestamp with date and time', () => {
    const date = new Date('2024-01-15T12:00:00Z');
    const result = formatTimestamp(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    // Should contain both date and time
    expect(result.length).toBeGreaterThan(10);
  });
  
  it('should handle ISO string dates', () => {
    const result = formatTimestamp('2024-01-15T12:00:00Z');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
  
  it('should handle timestamps', () => {
    const result = formatTimestamp(1705320000000);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
  
  it('should return error message for invalid dates', () => {
    expect(formatTimestamp('invalid')).toBe('Ugyldig dato');
  });
  
  it('should return error message for NaN dates', () => {
    expect(formatTimestamp(new Date(NaN))).toBe('Ugyldig dato');
  });
});
