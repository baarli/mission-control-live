import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';

import { SakItem } from '@/components/Saksliste/SakItem';
import SearchPanel from '@/components/Search/SearchPanel';
import { calculateScore } from '@/services/brave';
import type { SearchResult, Sak } from '@/types';

const mockSearchResults: SearchResult[] = [
  {
    id: 'search_1',
    title: 'Test Video Premiere',
    description: 'An amazing video with exclusive content',
    url: 'https://youtube.com/watch?v=test1',
    entertainmentScore: 90,
    score: 90,
    source: 'brave',
  },
  {
    id: 'search_2',
    title: 'Behind the Scenes',
    description: 'Exclusive behind the scenes footage',
    url: 'https://nrk.no/video/test2',
    entertainmentScore: 75,
    score: 75,
    source: 'brave',
  },
];

// Integration component that combines search and saksliste
const SearchToSaksliste: React.FC = () => {
  const [saker, setSaker] = useState<Sak[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string, _category: string, _freshness: string) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const filtered = mockSearchResults.filter(
      r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    setIsLoading(false);
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
          results={results}
          isLoading={isLoading}
          onAddSingle={handleAddToSaksliste}
        />
      </div>

      <div data-testid="saksliste-section">
        <h2>Saksliste ({saker.length})</h2>
        {saker.map(sak => (
          <SakItem key={sak.id} sak={sak} />
        ))}
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
      await user.type(screen.getByPlaceholderText('Søk etter nyheter...'), 'video');
      await user.click(screen.getByRole('button', { name: 'Søk' }));

      // Results should appear
      await waitFor(
        () => {
          expect(screen.getByText('Test Video Premiere')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it('shows scores for search results', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);

      // 'exclusive' appears in both result descriptions
      await user.type(screen.getByPlaceholderText('Søk etter nyheter...'), 'exclusive');
      await user.click(screen.getByRole('button', { name: 'Søk' }));

      await waitFor(
        () => {
          expect(screen.getByText('Score: 90')).toBeInTheDocument();
          expect(screen.getByText('Score: 75')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe('add to saksliste flow', () => {
    it('adds search result to saksliste', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);

      // Search first
      await user.type(screen.getByPlaceholderText('Søk etter nyheter...'), 'test');
      await user.click(screen.getByRole('button', { name: 'Søk' }));

      // Wait for results
      await waitFor(
        () => {
          expect(screen.getByLabelText('Legg til Test Video Premiere')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Add first result to saksliste
      await user.click(screen.getByLabelText('Legg til Test Video Premiere'));

      // Should appear in saksliste section
      await waitFor(() => {
        const sakslisteSection = screen.getByTestId('saksliste-section');
        expect(screen.getByText('Saksliste (1)')).toBeInTheDocument();
        expect(within(sakslisteSection).getByText('Test Video Premiere')).toBeInTheDocument();
      });
    });

    it('adds multiple results to saksliste', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);

      // Search with 'exclusive' which matches both results
      await user.type(screen.getByPlaceholderText('Søk etter nyheter...'), 'exclusive');
      await user.click(screen.getByRole('button', { name: 'Søk' }));

      // Wait for both results
      await waitFor(
        () => {
          expect(screen.getByLabelText('Legg til Test Video Premiere')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Add both results
      await user.click(screen.getByLabelText('Legg til Test Video Premiere'));
      await user.click(screen.getByLabelText('Legg til Behind the Scenes'));

      // Both should appear in saksliste section
      await waitFor(() => {
        const sakslisteSection = screen.getByTestId('saksliste-section');
        expect(screen.getByText('Saksliste (2)')).toBeInTheDocument();
        expect(within(sakslisteSection).getByText('Test Video Premiere')).toBeInTheDocument();
        expect(within(sakslisteSection).getByText('Behind the Scenes')).toBeInTheDocument();
      });
    });

    it('preserves entertainment score in sak', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);

      // Search and add
      await user.type(screen.getByPlaceholderText('Søk etter nyheter...'), 'test');
      await user.click(screen.getByRole('button', { name: 'Søk' }));

      await waitFor(
        () => {
          expect(screen.getByLabelText('Legg til Test Video Premiere')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      await user.click(screen.getByLabelText('Legg til Test Video Premiere'));

      // Check that entertainment score is preserved in the sak
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
      const score2 = calculateScore('Title', 'Description', 'https://youtube.com/watch?v=test');

      expect(score2).toBeGreaterThan(score1);
    });
  });

  describe('full workflow', () => {
    it('completes full search-to-sak workflow', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);

      // 1. Initial state - empty saksliste
      expect(screen.getByText('Saksliste (0)')).toBeInTheDocument();

      // 2. Search for content
      await user.type(screen.getByPlaceholderText('Søk etter nyheter...'), 'behind');
      await user.click(screen.getByRole('button', { name: 'Søk' }));

      // 3. Results appear
      await waitFor(
        () => {
          expect(screen.getByText('Behind the Scenes')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // 4. Add to saksliste
      await user.click(screen.getByLabelText('Legg til Behind the Scenes'));

      // 5. Verify in saksliste with correct data
      await waitFor(() => {
        const sakslisteSection = screen.getByTestId('saksliste-section');
        expect(screen.getByText('Saksliste (1)')).toBeInTheDocument();
        expect(within(sakslisteSection).getByText('Behind the Scenes')).toBeInTheDocument();

        // Verify sak has correct status
        const sakStatus = screen.getByTestId('sak-status');
        expect(sakStatus).toHaveTextContent('Utkast');
      });
    });

    it('allows adding same search result multiple times', async () => {
      const user = userEvent.setup();
      render(<SearchToSaksliste />);

      // Search
      await user.type(screen.getByPlaceholderText('Søk etter nyheter...'), 'test');
      await user.click(screen.getByRole('button', { name: 'Søk' }));

      await waitFor(
        () => {
          expect(screen.getByLabelText('Legg til Test Video Premiere')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Add same result twice
      await user.click(screen.getByLabelText('Legg til Test Video Premiere'));
      await user.click(screen.getByLabelText('Legg til Test Video Premiere'));

      // Should have two saker
      await waitFor(() => {
        expect(screen.getByText('Saksliste (2)')).toBeInTheDocument();
      });
    });
  });
});

