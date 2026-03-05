import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import SearchPanel from '@/components/Search/SearchPanel';
import type { SearchResult } from '@/types';

const mockSearchResults: SearchResult[] = [
  {
    id: 'result_1',
    title: 'Test Result 1',
    description: 'Description for result 1',
    url: 'https://example.com/1',
    score: 85,
    source: 'brave',
  },
  {
    id: 'result_2',
    title: 'Test Result 2',
    description: 'Description for result 2',
    url: 'https://example.com/2',
    score: 72,
    source: 'brave',
  },
];

describe('SearchPanel', () => {
  const mockOnSearch = vi.fn();
  const mockOnAddSingle = vi.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
    mockOnAddSingle.mockClear();
  });

  describe('rendering', () => {
    it('renders search heading', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.getByText('Søk etter saker')).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.getByPlaceholderText('Søk etter nyheter...')).toBeInTheDocument();
    });

    it('renders search button', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.getByRole('button', { name: 'Søk' })).toBeInTheDocument();
    });

    it('has search section aria-label', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.getByRole('region', { name: 'Søk' })).toBeInTheDocument();
    });

    it('renders category and freshness selects', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.getByDisplayValue('Alle kategorier')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Siste 24t')).toBeInTheDocument();
    });
  });

  describe('search input', () => {
    it('accepts text input', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);

      const input = screen.getByPlaceholderText('Søk etter nyheter...');
      await user.type(input, 'test query');

      expect(input).toHaveValue('test query');
    });
  });

  describe('search functionality', () => {
    it('calls onSearch when search button clicked', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);

      await user.type(screen.getByPlaceholderText('Søk etter nyheter...'), 'test');
      await user.click(screen.getByRole('button', { name: 'Søk' }));

      expect(mockOnSearch).toHaveBeenCalledWith('test', '', 'pd');
    });

    it('calls onSearch when Enter is pressed', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);

      await user.type(screen.getByPlaceholderText('Søk etter nyheter...'), 'test');
      await user.keyboard('{Enter}');

      expect(mockOnSearch).toHaveBeenCalledWith('test', '', 'pd');
    });

    it('does not call onSearch for empty query', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);

      await user.click(screen.getByRole('button', { name: 'Søk' }));

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('does not call onSearch for whitespace-only query', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);

      await user.type(screen.getByPlaceholderText('Søk etter nyheter...'), '   ');
      await user.click(screen.getByRole('button', { name: 'Søk' }));

      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('calls onSearch with selected category', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);

      await user.selectOptions(screen.getByDisplayValue('Alle kategorier'), 'MUSIKK');
      await user.type(screen.getByPlaceholderText('Søk etter nyheter...'), 'test');
      await user.click(screen.getByRole('button', { name: 'Søk' }));

      expect(mockOnSearch).toHaveBeenCalledWith('test', 'MUSIKK', 'pd');
    });
  });

  describe('loading state', () => {
    it('shows loading skeletons when isLoading is true', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} isLoading={true} />);
      // When loading, Button's accessible name changes to 'Laster...' and is disabled
      const button = screen.getByRole('button', { name: 'Laster...' });
      expect(button).toBeDisabled();
    });
  });

  describe('search results', () => {
    it('displays results from results prop', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={mockSearchResults} />);

      expect(screen.getByText('Test Result 1')).toBeInTheDocument();
      expect(screen.getByText('Test Result 2')).toBeInTheDocument();
    });

    it('displays result descriptions', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={mockSearchResults} />);

      expect(screen.getByText('Description for result 1')).toBeInTheDocument();
    });

    it('shows empty state when results is empty', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.getByText('Søk etter nyheter')).toBeInTheDocument();
    });
  });

  describe('add to saksliste', () => {
    it('shows add button when onAddSingle provided', () => {
      render(
        <SearchPanel
          onSearch={mockOnSearch}
          results={mockSearchResults}
          onAddSingle={mockOnAddSingle}
        />
      );

      expect(screen.getByLabelText('Legg til Test Result 1')).toBeInTheDocument();
    });

    it('does not show add button when onAddSingle not provided', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={mockSearchResults} />);

      expect(screen.queryByLabelText('Legg til Test Result 1')).not.toBeInTheDocument();
    });

    it('calls onAddSingle when add button clicked', async () => {
      const user = userEvent.setup();
      render(
        <SearchPanel
          onSearch={mockOnSearch}
          results={mockSearchResults}
          onAddSingle={mockOnAddSingle}
        />
      );

      await user.click(screen.getByLabelText('Legg til Test Result 1'));

      expect(mockOnAddSingle).toHaveBeenCalledWith(mockSearchResults[0]);
    });
  });
});

