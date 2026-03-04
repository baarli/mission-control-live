import { vi } from 'vitest';

import type { SearchResult } from '@/types';

/**
 * Mock search results from Brave API
 */
export const mockSearchResults: SearchResult[] = [
  {
    id: 'brave_1',
    title: 'Test Video - Premiere',
    description: 'Den mest populære videoen akkurat nå. Over 1 million visninger!',
    url: 'https://youtube.com/watch?v=test1',
    thumbnail: 'https://example.com/thumb1.jpg',
    entertainmentScore: 95,
    source: 'brave',
  },
  {
    id: 'brave_2',
    title: 'Behind the Scenes Interview',
    description: 'Eksklusivt intervju og bak kulissene materiale.',
    url: 'https://nrk.no/video/test2',
    entertainmentScore: 78,
    source: 'brave',
  },
  {
    id: 'brave_3',
    title: 'Official Trailer 2024',
    description: 'Den nye traileren er ute nå.',
    url: 'https://tv2.no/video/test3',
    entertainmentScore: 85,
    source: 'brave',
  },
];

/**
 * Mock Brave API search function
 */
export const mockSearchBrave = vi.fn(async (
  query: string,
  _apiKey: string,
  options?: { count?: number }
): Promise<SearchResult[]> => {
  const count = options?.count || 10;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Filter results based on query
  const filtered = mockSearchResults.filter(result =>
    result.title.toLowerCase().includes(query.toLowerCase()) ||
    result.description.toLowerCase().includes(query.toLowerCase())
  );
  
  return filtered.slice(0, count);
});

/**
 * Mock entertainment score calculation
 */
export const mockCalculateEntertainmentScore = vi.fn((
  title: string,
  description: string,
  source?: string
): number => {
  let score = 50;
  
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  
  // High value keywords
  if (titleLower.includes('premiere') || descLower.includes('premiere')) score += 10;
  if (titleLower.includes('exclusive') || descLower.includes('exclusive')) score += 10;
  if (titleLower.includes('viral') || descLower.includes('viral')) score += 15;
  
  // Source bonuses
  if (source?.includes('youtube')) score += 15;
  if (source?.includes('nrk')) score += 10;
  
  return Math.min(100, Math.max(0, score));
});

/**
 * Reset all mock functions
 */
export function resetBraveMocks() {
  vi.clearAllMocks();
}

/**
 * Mock axios for Brave API
 */
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn((error) => error && error.isAxiosError === true),
  },
}));
