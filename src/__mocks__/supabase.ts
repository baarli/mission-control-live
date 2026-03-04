import { vi } from 'vitest';
import type { User, Sak } from '@/types';

/**
 * Mock Supabase client
 */
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
      order: vi.fn(() => ({
        limit: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
};

/**
 * Mock Supabase module
 */
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

/**
 * Mock user data
 */
export const mockUser: User = {
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00Z',
};

/**
 * Mock sak data
 */
export const mockSak: Sak = {
  id: 'sak_123',
  tenant_id: 'tenant_1',
  title: 'Test Sak',
  description: 'This is a test sak for testing purposes',
  status: 'pending',
  priority: 'high',
  category: 'TALK',
  tags: ['test', 'mock'],
  assignee: mockUser.id,
  created_by: mockUser.id,
  show_date: '2024-01-15',
  order_index: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  entertainmentScore: 75,
};

/**
 * Array of mock saker
 */
export const mockSaker: Sak[] = [
  mockSak,
  {
    ...mockSak,
    id: 'sak_456',
    title: 'Another Test Sak',
    status: 'approved',
    priority: 'medium',
  },
  {
    ...mockSak,
    id: 'sak_789',
    title: 'Draft Sak',
    status: 'draft',
    priority: 'low',
  },
];

/**
 * Reset all mock functions
 */
export function resetSupabaseMocks() {
  vi.clearAllMocks();
}
