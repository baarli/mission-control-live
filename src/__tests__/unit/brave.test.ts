import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import {
  calculateEntertainmentScore,
  searchBrave,
  mockSearchBrave,
} from '@/services/brave';
import type { SearchResult } from '@/types';

// Mock axios
vi.mock('axios');

describe('calculateEntertainmentScore', () => {
  it('should return base score of 50 for empty inputs', () => {
    const score = calculateEntertainmentScore('', '');
    expect(score).toBe(50);
  });
  
  describe('high value keywords', () => {
    it('should boost score for premiere keyword', () => {
      const score = calculateEntertainmentScore('Movie Premiere', 'Description');
      expect(score).toBeGreaterThan(50);
    });
    
    it('should boost score for exclusive keyword', () => {
      const score = calculateEntertainmentScore('Exclusive Interview', 'Description');
      expect(score).toBeGreaterThan(50);
    });
    
    it('should boost score for trending keyword', () => {
      const score = calculateEntertainmentScore('Trending Now', 'Description');
      expect(score).toBeGreaterThan(50);
    });
    
    it('should boost score for hit keyword', () => {
      const score = calculateEntertainmentScore('Summer Hit', 'Description');
      expect(score).toBeGreaterThan(50);
    });
    
    it('should boost score for beste keyword', () => {
      const score = calculateEntertainmentScore('Beste Valg', 'Description');
      expect(score).toBeGreaterThan(50);
    });
    
    it('should accumulate multiple high value keywords', () => {
      const score1 = calculateEntertainmentScore('Premiere', '');
      const score2 = calculateEntertainmentScore('Premiere Exclusive', '');
      expect(score2).toBeGreaterThan(score1);
    });
  });
  
  describe('medium value keywords', () => {
    it('should boost score for intervju keyword', () => {
      const score = calculateEntertainmentScore('Intervju med artist', 'Description');
      expect(score).toBeGreaterThan(50);
    });
    
    it('should boost score for behind the scenes keyword', () => {
      const score = calculateEntertainmentScore('Behind the Scenes', 'Description');
      expect(score).toBeGreaterThan(50);
    });
    
    it('should boost score for trailer keyword', () => {
      const score = calculateEntertainmentScore('Official Trailer', 'Description');
      expect(score).toBeGreaterThan(50);
    });
  });
  
  describe('source bonuses', () => {
    it('should boost score for youtube source', () => {
      const score1 = calculateEntertainmentScore('Title', 'Description');
      const score2 = calculateEntertainmentScore('Title', 'Description', 'https://youtube.com/video');
      expect(score2).toBeGreaterThan(score1);
    });
    
    it('should boost score for spotify source', () => {
      const score1 = calculateEntertainmentScore('Title', 'Description');
      const score2 = calculateEntertainmentScore('Title', 'Description', 'https://spotify.com/track');
      expect(score2).toBeGreaterThan(score1);
    });
    
    it('should boost score for nrk source', () => {
      const score1 = calculateEntertainmentScore('Title', 'Description');
      const score2 = calculateEntertainmentScore('Title', 'Description', 'https://nrk.no/video');
      expect(score2).toBeGreaterThan(score1);
    });
    
    it('should boost score for tv2 source', () => {
      const score1 = calculateEntertainmentScore('Title', 'Description');
      const score2 = calculateEntertainmentScore('Title', 'Description', 'https://tv2.no/video');
      expect(score2).toBeGreaterThan(score1);
    });
  });
  
  describe('description length factor', () => {
    it('should boost score for long descriptions', () => {
      const shortDesc = 'Short';
      const longDesc = 'A'.repeat(250);
      
      const score1 = calculateEntertainmentScore('Title', shortDesc);
      const score2 = calculateEntertainmentScore('Title', longDesc);
      
      expect(score2).toBeGreaterThan(score1);
    });
    
    it('should not boost score for descriptions under 200 chars', () => {
      const desc1 = 'A'.repeat(199);
      const desc2 = 'A'.repeat(200);
      
      const score1 = calculateEntertainmentScore('Title', desc1);
      const score2 = calculateEntertainmentScore('Title', desc2);
      
      expect(score2).toBeGreaterThan(score1);
    });
  });
  
  describe('score boundaries', () => {
    it('should not exceed 100', () => {
      const score = calculateEntertainmentScore(
        'Premiere Exclusive Trending Hit Top Viral Popular',
        'A'.repeat(300),
        'https://youtube.com/video'
      );
      expect(score).toBeLessThanOrEqual(100);
    });
    
    it('should not go below 0', () => {
      // Even with no bonuses, base is 50
      const score = calculateEntertainmentScore('', '');
      expect(score).toBeGreaterThanOrEqual(0);
    });
    
    it('should return 50 for neutral content', () => {
      const score = calculateEntertainmentScore('Normal Title', 'Normal description here');
      expect(score).toBe(50);
    });
  });
  
  describe('case insensitivity', () => {
    it('should match keywords regardless of case', () => {
      const score1 = calculateEntertainmentScore('PREMIERE', '');
      const score2 = calculateEntertainmentScore('premiere', '');
      const score3 = calculateEntertainmentScore('Premiere', '');
      
      expect(score1).toBe(score2);
      expect(score2).toBe(score3);
    });
  });
});

describe('searchBrave', () => {
  const mockApiKey = 'test_api_key';
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should return search results on successful API call', async () => {
    const mockResponse = {
      data: {
        results: [
          {
            title: 'Test Result',
            description: 'Test description',
            url: 'https://example.com',
            thumbnail: { src: 'https://example.com/thumb.jpg' },
          },
        ],
      },
    };
    
    vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);
    
    const results = await searchBrave('test query', mockApiKey);
    
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      title: 'Test Result',
      description: 'Test description',
      url: 'https://example.com',
      source: 'brave',
    });
  });
  
  it('should use web search type by default', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { web: { results: [] } } });
    
    await searchBrave('test', mockApiKey);
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/web/search'),
      expect.any(Object)
    );
  });
  
  it('should support news search type', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { results: [] } });
    
    await searchBrave('test', mockApiKey, { searchType: 'news' });
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/news/search'),
      expect.any(Object)
    );
  });
  
  it('should support videos search type', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { results: [] } });
    
    await searchBrave('test', mockApiKey, { searchType: 'videos' });
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/videos/search'),
      expect.any(Object)
    );
  });
  
  it('should pass count parameter', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { results: [] } });
    
    await searchBrave('test', mockApiKey, { count: 5 });
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ count: 5 }),
      })
    );
  });
  
  it('should pass offset parameter', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { results: [] } });
    
    await searchBrave('test', mockApiKey, { offset: 10 });
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ offset: 10 }),
      })
    );
  });
  
  it('should include API key in headers', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { results: [] } });
    
    await searchBrave('test', mockApiKey);
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Subscription-Token': mockApiKey,
        }),
      })
    );
  });
  
  it('should calculate entertainment score for each result', async () => {
    const mockResponse = {
      data: {
        results: [
          { title: 'Premiere Video', description: 'Exclusive content', url: 'https://youtube.com/1' },
          { title: 'Normal Video', description: 'Regular content', url: 'https://example.com/2' },
        ],
      },
    };
    
    vi.mocked(axios.get).mockResolvedValueOnce(mockResponse);
    
    const results = await searchBrave('test', mockApiKey);
    
    expect(results[0].entertainmentScore).toBeGreaterThan(results[1].entertainmentScore);
  });
  
  it('should handle API errors', async () => {
    const errorResponse = {
      response: {
        status: 401,
        data: { message: 'Invalid API key' },
      },
      isAxiosError: true,
    };
    
    vi.mocked(axios.get).mockRejectedValueOnce(errorResponse);
    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    
    await expect(searchBrave('test', mockApiKey)).rejects.toThrow('Invalid API key');
  });
  
  it('should handle network errors', async () => {
    const networkError = new Error('Network Error');
    vi.mocked(axios.get).mockRejectedValueOnce(networkError);
    vi.mocked(axios.isAxiosError).mockReturnValue(false);
    
    await expect(searchBrave('test', mockApiKey)).rejects.toThrow('Unknown error');
  });
  
  it('should handle empty results', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: { results: [] } });
    
    const results = await searchBrave('test', mockApiKey);
    
    expect(results).toEqual([]);
  });
  
  it('should handle results without web wrapper', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ 
      data: { web: { results: [] } } 
    });
    
    const results = await searchBrave('test', mockApiKey);
    
    expect(results).toEqual([]);
  });
});

describe('mockSearchBrave', () => {
  it('should return mock results', () => {
    const results = mockSearchBrave('test query');
    
    expect(results).toHaveLength(3);
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('title');
    expect(results[0]).toHaveProperty('description');
    expect(results[0]).toHaveProperty('url');
    expect(results[0]).toHaveProperty('entertainmentScore');
    expect(results[0]).toHaveProperty('source', 'brave');
  });
  
  it('should include query in result titles', () => {
    const results = mockSearchBrave('my search');
    
    results.forEach(result => {
      expect(result.title).toContain('my search');
    });
  });
  
  it('should have varying entertainment scores', () => {
    const results = mockSearchBrave('test');
    
    const scores = results.map(r => r.entertainmentScore);
    const uniqueScores = new Set(scores);
    
    expect(uniqueScores.size).toBeGreaterThan(1);
  });
  
  it('should have different URLs', () => {
    const results = mockSearchBrave('test');
    
    const urls = results.map(r => r.url);
    const uniqueUrls = new Set(urls);
    
    expect(uniqueUrls.size).toBe(results.length);
  });
});
