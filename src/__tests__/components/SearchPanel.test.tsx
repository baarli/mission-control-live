import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchPanel from '@/components/Search/SearchPanel';
import type { SearchResult } from '@/types';

const mockSearchResults: SearchResult[] = [
  {
    id: 'result_1',
    title: 'Test Result 1',
    description: 'Description for result 1',
    url: 'https://example.com/1',
    thumbnail: 'https://example.com/thumb1.jpg',
    entertainmentScore: 85,
    source: 'brave',
  },
  {
    id: 'result_2',
    title: 'Test Result 2',
    description: 'Description for result 2',
    url: 'https://example.com/2',
    entertainmentScore: 72,
    source: 'brave',
  },
];

describe('SearchPanel', () => {
  const mockOnSearch = vi.fn();
  const mockOnAddToSaksliste = vi.fn();
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    mockOnSearch.mockClear();
    mockOnAddToSaksliste.mockClear();
    mockOnClose.mockClear();
  });
  
  describe('rendering', () => {
    it('renders search heading', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.getByText('Søk etter innhold')).toBeInTheDocument();
    });
    
    it('renders search input', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.getByPlaceholderText('Søk etter innhold...')).toBeInTheDocument();
    });
    
    it('renders search button', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.getByTestId('search-button')).toBeInTheDocument();
    });
    
    it('renders close button when onClose provided', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.getByLabelText('Lukk søk')).toBeInTheDocument();
    });
    
    it('does not render close button when onClose not provided', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.queryByLabelText('Lukk søk')).not.toBeInTheDocument();
    });
  });
  
  describe('search input', () => {
    it('accepts text input', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      const input = screen.getByPlaceholderText('Søk etter innhold...');
      await user.type(input, 'test query');
      
      expect(input).toHaveValue('test query');
    });
    
    it('has search aria-label', () => {
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      expect(screen.getByLabelText('Søk')).toBeInTheDocument();
    });
    
    it('clears error when user types', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      // Trigger error
      await user.click(screen.getByTestId('search-button'));
      expect(await screen.findByRole('alert')).toBeInTheDocument();
      
      // Type to clear
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'a');
      
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });
  
  describe('search functionality', () => {
    it('calls onSearch when search button clicked', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockResolvedValue(mockSearchResults);
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test');
      });
    });
    
    it('calls onSearch when Enter is pressed', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockResolvedValue(mockSearchResults);
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('test');
      });
    });
    
    it('shows error for empty query', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.click(screen.getByTestId('search-button'));
      
      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('Vennligst skriv inn et søkeord');
    });
    
    it('shows error for whitespace-only query', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), '   ');
      await user.click(screen.getByTestId('search-button'));
      
      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('Vennligst skriv inn et søkeord');
    });
    
    it('sanitizes search query', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockResolvedValue([]);
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), '<script>alert("xss")</script>');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        // Should strip HTML tags
        expect(mockOnSearch).toHaveBeenCalledWith(expect.not.stringContaining('<'));
      });
    });
    
    it('shows loading state during search', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      expect(screen.getByTestId('search-button')).toHaveAttribute('aria-busy', 'true');
    });
  });
  
  describe('search results', () => {
    it('displays search results', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockResolvedValue(mockSearchResults);
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Test Result 1')).toBeInTheDocument();
        expect(screen.getByText('Test Result 2')).toBeInTheDocument();
      });
    });
    
    it('displays entertainment score for each result', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockResolvedValue(mockSearchResults);
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('score-result_1')).toHaveTextContent('85/100');
        expect(screen.getByTestId('score-result_2')).toHaveTextContent('72/100');
      });
    });
    
    it('displays thumbnails when available', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockResolvedValue(mockSearchResults);
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        const img = screen.getByAltText('');
        expect(img).toHaveAttribute('src', 'https://example.com/thumb1.jpg');
      });
    });
    
    it('shows no results message when search returns empty', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockResolvedValue([]);
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByText('Ingen resultater funnet')).toBeInTheDocument();
      });
    });
    
    it('shows error message when search fails', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockRejectedValue(new Error('Search failed'));
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Search failed');
      });
    });
  });
  
  describe('add to saksliste', () => {
    it('shows add button when onAddToSaksliste provided', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockResolvedValue(mockSearchResults);
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} onAddSingle={mockOnAddToSaksliste} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('add-btn-result_1')).toBeInTheDocument();
      });
    });
    
    it('does not show add button when onAddToSaksliste not provided', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockResolvedValue(mockSearchResults);
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('add-btn-result_1')).not.toBeInTheDocument();
      });
    });
    
    it('calls onAddToSaksliste when add button clicked', async () => {
      const user = userEvent.setup();
      mockOnSearch.mockResolvedValue(mockSearchResults);
      
      render(<SearchPanel onSearch={mockOnSearch} results={[]} onAddSingle={mockOnAddToSaksliste} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'test');
      await user.click(screen.getByTestId('search-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId('add-btn-result_1')).toBeInTheDocument();
      });
      
      await user.click(screen.getByTestId('add-btn-result_1'));
      
      expect(mockOnAddToSaksliste).toHaveBeenCalledWith(mockSearchResults[0]);
    });
  });
  
  describe('close functionality', () => {
    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.click(screen.getByLabelText('Lukk søk'));
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('debounced search', () => {
    it('triggers search after typing 3+ characters with delay', async () => {
      vi.useFakeTimers();
      mockOnSearch.mockResolvedValue([]);
      
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'abc');
      
      // Should not have called yet
      expect(mockOnSearch).not.toHaveBeenCalled();
      
      // Fast-forward past debounce
      vi.advanceTimersByTime(600);
      
      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('abc');
      });
      
      vi.useRealTimers();
    });
    
    it('does not trigger debounced search for less than 3 characters', async () => {
      vi.useFakeTimers();
      mockOnSearch.mockResolvedValue([]);
      
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.type(screen.getByPlaceholderText('Søk etter innhold...'), 'ab');
      vi.advanceTimersByTime(600);
      
      expect(mockOnSearch).not.toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });
  
  describe('accessibility', () => {
    it('input has aria-invalid on error', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.click(screen.getByTestId('search-button'));
      
      const input = screen.getByPlaceholderText('Søk etter innhold...');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
    
    it('error is associated with input via aria-describedby', async () => {
      const user = userEvent.setup();
      render(<SearchPanel onSearch={mockOnSearch} results={[]} />);
      
      await user.click(screen.getByTestId('search-button'));
      
      const input = screen.getByPlaceholderText('Søk etter innhold...');
      const errorId = input.getAttribute('aria-describedby');
      expect(screen.getByRole('alert')).toHaveAttribute('id', errorId);
    });
  });
});
