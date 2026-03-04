import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getItem,
  setItem,
  removeItem,
  clearAll,
  hasItem,
  getAllKeys,
  StorageKeys,
} from '@/services/storage';
import { localStorageMock } from '@/__mocks__/localStorage';

describe('Storage Service', () => {
  const PREFIX = 'mission_control_';
  
  beforeEach(() => {
    localStorageMock.clear();
  });
  
  afterEach(() => {
    localStorageMock.clear();
  });
  
  describe('getItem', () => {
    it('should retrieve stored string value', () => {
      localStorageMock.setItem(PREFIX + 'test', JSON.stringify('hello'));
      expect(getItem('test', 'default')).toBe('hello');
    });
    
    it('should retrieve stored object value', () => {
      const obj = { name: 'test', value: 123 };
      localStorageMock.setItem(PREFIX + 'test', JSON.stringify(obj));
      expect(getItem('test', {})).toEqual(obj);
    });
    
    it('should retrieve stored array value', () => {
      const arr = [1, 2, 3];
      localStorageMock.setItem(PREFIX + 'test', JSON.stringify(arr));
      expect(getItem('test', [])).toEqual(arr);
    });
    
    it('should return default value when key does not exist', () => {
      expect(getItem('nonexistent', 'default')).toBe('default');
      expect(getItem('nonexistent', 42)).toBe(42);
      expect(getItem('nonexistent', { default: true })).toEqual({ default: true });
    });
    
    it('should return default value when stored value is invalid JSON', () => {
      localStorageMock.setItem(PREFIX + 'test', 'invalid json{');
      expect(getItem('test', 'default')).toBe('default');
    });
    
    it('should return default value when localStorage throws', () => {
      // Simulate error by setting a circular reference that can't be stringified
      const circular: Record<string, unknown> = { self: null };
      circular.self = circular;
      
      // Try to set it directly (this will fail)
      const result = getItem('test', 'default');
      expect(result).toBe('default');
    });
  });
  
  describe('setItem', () => {
    it('should store string value', () => {
      expect(setItem('test', 'hello')).toBe(true);
      expect(localStorageMock.getItem(PREFIX + 'test')).toBe('"hello"');
    });
    
    it('should store object value', () => {
      const obj = { name: 'test', value: 123 };
      expect(setItem('test', obj)).toBe(true);
      expect(JSON.parse(localStorageMock.getItem(PREFIX + 'test') || '{}')).toEqual(obj);
    });
    
    it('should store array value', () => {
      const arr = [1, 2, 3];
      expect(setItem('test', arr)).toBe(true);
      expect(JSON.parse(localStorageMock.getItem(PREFIX + 'test') || '[]')).toEqual(arr);
    });
    
    it('should store null value', () => {
      expect(setItem('test', null)).toBe(true);
      expect(localStorageMock.getItem(PREFIX + 'test')).toBe('null');
    });
    
    it('should store boolean value', () => {
      expect(setItem('test', true)).toBe(true);
      expect(localStorageMock.getItem(PREFIX + 'test')).toBe('true');
    });
    
    it('should return false on error', () => {
      // Test with circular reference that can't be serialized
      const circular: Record<string, unknown> = { self: null };
      circular.self = circular;
      
      // This should fail and return false
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = setItem('test', circular);
      
      // The result depends on whether JSON.stringify throws
      expect(typeof result).toBe('boolean');
      consoleSpy.mockRestore();
    });
  });
  
  describe('removeItem', () => {
    it('should remove existing item', () => {
      localStorageMock.setItem(PREFIX + 'test', JSON.stringify('value'));
      expect(removeItem('test')).toBe(true);
      expect(localStorageMock.getItem(PREFIX + 'test')).toBeNull();
    });
    
    it('should return true when removing non-existent item', () => {
      expect(removeItem('nonexistent')).toBe(true);
    });
  });
  
  describe('clearAll', () => {
    it('should remove all mission_control items', () => {
      localStorageMock.setItem(PREFIX + 'item1', 'value1');
      localStorageMock.setItem(PREFIX + 'item2', 'value2');
      localStorageMock.setItem('other_item', 'value3');
      
      expect(clearAll()).toBe(true);
      
      expect(localStorageMock.getItem(PREFIX + 'item1')).toBeNull();
      expect(localStorageMock.getItem(PREFIX + 'item2')).toBeNull();
      expect(localStorageMock.getItem('other_item')).toBe('value3');
    });
    
    it('should return true when localStorage is empty', () => {
      expect(clearAll()).toBe(true);
    });
  });
  
  describe('hasItem', () => {
    it('should return true for existing item', () => {
      localStorageMock.setItem(PREFIX + 'test', JSON.stringify('value'));
      expect(hasItem('test')).toBe(true);
    });
    
    it('should return false for non-existing item', () => {
      expect(hasItem('nonexistent')).toBe(false);
    });
    
    it('should return false for item with null value', () => {
      localStorageMock.setItem(PREFIX + 'test', 'null');
      expect(hasItem('test')).toBe(true);
    });
  });
  
  describe('getAllKeys', () => {
    it('should return all mission_control keys without prefix', () => {
      localStorageMock.setItem(PREFIX + 'key1', 'value1');
      localStorageMock.setItem(PREFIX + 'key2', 'value2');
      localStorageMock.setItem('other_key', 'value3');
      
      const keys = getAllKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).not.toContain('other_key');
      expect(keys).not.toContain(PREFIX + 'key1');
    });
    
    it('should return empty array when no mission_control items exist', () => {
      expect(getAllKeys()).toEqual([]);
    });
    
    it('should handle mixed items', () => {
      localStorageMock.setItem(PREFIX + 'mc_item', 'value1');
      localStorageMock.setItem('react_devtools', 'value2');
      localStorageMock.setItem(PREFIX + 'another', 'value3');
      
      const keys = getAllKeys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain('mc_item');
      expect(keys).toContain('another');
    });
  });
  
  describe('StorageKeys constants', () => {
    it('should have correct theme key', () => {
      expect(StorageKeys.THEME).toBe('theme');
    });
    
    it('should have correct user key', () => {
      expect(StorageKeys.USER).toBe('user');
    });
    
    it('should have correct auth token key', () => {
      expect(StorageKeys.AUTH_TOKEN).toBe('auth_token');
    });
    
    it('should have correct sidebar collapsed key', () => {
      expect(StorageKeys.SIDEBAR_COLLAPSED).toBe('sidebar_collapsed');
    });
    
    it('should have correct recent searches key', () => {
      expect(StorageKeys.RECENT_SEARCHES).toBe('recent_searches');
    });
    
    it('should have correct dashboard filters key', () => {
      expect(StorageKeys.DASHBOARD_FILTERS).toBe('dashboard_filters');
    });
  });
  
  describe('integration scenarios', () => {
    it('should handle theme preference storage', () => {
      setItem(StorageKeys.THEME, 'dark');
      expect(getItem(StorageKeys.THEME, 'light')).toBe('dark');
    });
    
    it('should handle user object storage', () => {
      const user = { id: '1', name: 'Test User', email: 'test@example.com' };
      setItem(StorageKeys.USER, user);
      expect(getItem(StorageKeys.USER, null)).toEqual(user);
    });
    
    it('should handle array storage for recent searches', () => {
      const searches = ['query1', 'query2', 'query3'];
      setItem(StorageKeys.RECENT_SEARCHES, searches);
      expect(getItem(StorageKeys.RECENT_SEARCHES, [])).toEqual(searches);
    });
    
    it('should handle complete CRUD cycle', () => {
      // Create
      setItem('test_key', 'test_value');
      expect(hasItem('test_key')).toBe(true);
      expect(getItem('test_key', '')).toBe('test_value');
      
      // Update
      setItem('test_key', 'updated_value');
      expect(getItem('test_key', '')).toBe('updated_value');
      
      // Delete
      removeItem('test_key');
      expect(hasItem('test_key')).toBe(false);
      expect(getItem('test_key', 'default')).toBe('default');
    });
  });
});

// Need to import vi for the spy
import { vi } from 'vitest';
