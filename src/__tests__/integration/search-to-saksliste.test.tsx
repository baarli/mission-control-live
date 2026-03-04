import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchPanel from '@/components/Search/SearchPanel';
import { SakItem } from '@/components/Saksliste/SakItem';
import type { SearchResult, Sak } from '@/types';
import { calculateScore } from '@/services/brave';
import React, { useState } from 'react';

const mockSearchResults: SearchResult[] = [
  {
    id: 'search_1',
    title: 'Test Video Premiere',
    description: 'An amazing video with exclusive content',
    url: 'https://youtube.com/watch?v=test1',
    thumbnail: 'https://example.com/thumb1.jpg',
    entertainmentScore: 90,
    source: 'brave',
  },
  {
    id: 'search_2',
    title: 'Behind the Scenes',
    description: 'Exclusive behind the scenes footage',
    url: 'https://nrk.no/video/test2',
    entertainmentScore: 75,
    source: 'brave',
  },
];

// Integration component that combines search and saksliste
const SearchToSaksliste: React.FC = () => {
  const [saker, setSaker] = useState<Sak[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = async (query: string): Promise<SearchResult[]> => {
    setHasSearched(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockSearchResults.filter(r => 
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.description.toLowerCase().includes(query.toLowerCase())
    );
  };
  
  const handleAddToSaksliste = (result: SearchResult) => {
    const newSak: Sak = {
      id: `sak_${Date.now()}`,
      tenant_id: 'tenant_1',
      title: result.title,
      description: result.description,
      status: 'draft',
      priority: 'medium',
      category: 'TALK',
      tags: ['from-search'],
      created_by: 'user_1',
      show_date: new Date().toISOString(),
      order_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      entertainmentScore: result.entertainmentScore,
    };
    setSaker(prev => [...prev, newSak]);
  };
  
  return (
    <div>
      <div data-testid="search-section">
        <SearchPanel 
          onSearch={handleSearch}
          results={[]}
          onAddSingle={handleAddToSaksliste}
        />
      </div>
      
      <div data-testid="saksliste-section">
        <h2>Saksliste ({saker.length})</h2>
        {saker.map(sak => (
          <SakItem key={sak.id} sak={sak} />
        ))}
        {hasSearched && saker.length === 0 && (
          <p data-testid="empty-saksliste">Ingen saker lagt til ennå</p>
        )}
      </div>
    </div>
  );
};

describe('Search to Saksliste Integration', () => {
  describe('search flow', () => {
    it('searches and displays results', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);
      
      // Search for content
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'video');
      await user.click(screen.getByTestId('search-button'));
      
      // Results should appear
      await waitFor(() => {
        expect(screen.getByText('Test Video Premiere')).toBeInTheDocument();
      });
    });
    
    it('shows entertainment scores for search results', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('score-search_1')).toHaveTextContent('90/100');
        expect(screen.getByTestId('score-search_2')).toHaveTextContent('75/100');
      });
    });
  });
  
  describe('add to saksliste flow', () => {
    it('adds search result to saksliste', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);
      
      // Search first
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      // Wait for results
      await waitFor(() => {
        expect(screen.getByTestId('add-btn-search_1')).toBeInTheDocument();
      });
      
      // Add first result to saksliste
      await user.click(screen.getByTestId('add-btn-search_1'));
      
      // Should appear in saksliste
      await waitFor(() => {
        expect(screen.getByText('Saksliste (1)')).toBeInTheDocument();
        expect(screen.getByText('Test Video Premiere')).toBeInTheDocument();
      });
    });
    
    it('adds multiple results to saksliste', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);
      
      // Search
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      // Wait for results
      await waitFor(() => {
        expect(screen.getByTestId('add-btn-search_1')).toBeInTheDocument();
      });
      
      // Add both results
      await user.click(screen.getByTestId('add-btn-search_1'));
      await user.click(screen.getByTestId('add-btn-search_2'));
      
      // Both should appear in saksliste
      await waitFor(() => {
        expect(screen.getByText('Saksliste (2)')).toBeInTheDocument();
        expect(screen.getByText('Test Video Premiere')).toBeInTheDocument();
        expect(screen.getByText('Behind the Scenes')).toBeInTheDocument();
      });
    });
    
    it('preserves entertainment score in sak', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);
      
      // Search and add
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('add-btn-search_1')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('add-btn-search_1'));
      
      // Check that entertainment score is preserved
      await waitFor(() => {
        const score = screen.getByTestId('entertainment-score');
        expect(score).toHaveTextContent('90/100');
      });
    });
  });
  
  describe('entertainment score calculation', () => {
    it('calculates score based on title keywords', () => {
      const score1 = calculateScore('Normal Title', '');
      const score2 = calculateScore('Premiere Video', '');
      
      expect(score2).toBeGreaterThan(score1);
    });
    
    it('calculates score based on description keywords', () => {
      const score1 = calculateScore('Title', 'Normal description');
      const score2 = calculateScore('Title', 'Exclusive behind the scenes content');
      
      expect(score2).toBeGreaterThan(score1);
    });
    
    it('calculates score based on source', () => {
      const score1 = calculateScore('Title', 'Description');
      const score2 = calculateScore('Title', 'Description youtube');
      
      expect(score2).toBeGreaterThan(score1);
    });
  });
  
  describe('full workflow', () => {
    it('completes full search-to-sak workflow', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);
      
      // 1. Initial state - empty saksliste message
      expect(screen.getByTestId('empty-saksliste')).toBeInTheDocument();
      
      // 2. Search for content
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'behind');
      await user.click(screen.getByTestId('search-button'));
      
      // 3. Results appear with entertainment scores
      await waitFor(() => {
        expect(screen.getByText('Behind the Scenes')).toBeInTheDocument();
        expect(screen.getByText('Underholdningsverdi: 75/100')).toBeInTheDocument();
      });
      
      // 4. Add to saksliste
      await user.click(screen.getByTestId('add-btn-search_2'));
      
      // 5. Verify in saksliste with correct data
      await waitFor(() => {
        expect(screen.getByText('Saksliste (1)')).toBeInTheDocument();
        expect(screen.getByText('Behind the Scenes')).toBeInTheDocument();
        expect(screen.getByText('Exclusive behind the scenes footage')).toBeInTheDocument();
        
        // Verify sak has correct status and properties
        const sakStatus = screen.getByTestId('sak-status');
        expect(sakStatus).toHaveTextContent('Utkast');
      });
    });
    
    it('allows adding same search result multiple times', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);
      
      // Search
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('add-btn-search_1')).toBeInTheDocument();
      });
      
      // Add same result twice
      await user.click(screen.getByTestId('add-btn-search_1'));
      await user.click(screen.getByTestId('add-btn-search_1'));
      
      // Should have two saker
      await waitFor(() => {
        expect(screen.getByText('Saksliste (2)')).toBeInTheDocument();
      });
    });
  });
});
