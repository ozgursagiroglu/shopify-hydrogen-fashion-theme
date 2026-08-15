/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {SearchFormPredictive, SEARCH_ENDPOINT} from './SearchFormPredictive';

// Mock dependencies
const mockNavigate = vi.fn();
const mockFetcherSubmit = vi.fn();
const mockAsideClose = vi.fn();

const mockFetcher = {
  submit: mockFetcherSubmit,
  state: 'idle' as const,
  data: null,
  Form: ({children, onSubmit, ...props}: any) => (
    <form onSubmit={onSubmit} {...props}>{children}</form>
  ),
};

// Override useFetcher and useNavigate for custom behavior
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useFetcher: () => mockFetcher,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('~/components/layout/Aside', () => ({
  useAside: () => ({
    close: mockAsideClose,
  }),
}));

describe('SearchFormPredictive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders form with children function', () => {
      render(
        <SearchFormPredictive>
          {({inputRef}) => (
            <input
              ref={inputRef}
              type="search"
              name="q"
              placeholder="Search..."
              data-testid="search-input"
            />
          )}
        </SearchFormPredictive>,
      );

      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('returns null if children is not a function', () => {
      const {container} = render(
        <SearchFormPredictive>
          {null}
        </SearchFormPredictive>,
      );

      expect(container.firstChild).toBeNull();
    });

    it('applies className prop', () => {
      const {container} = render(
        <SearchFormPredictive className="custom-class" data-testid="predictive-form">
          {({inputRef}) => (
            <input ref={inputRef} type="search" name="q" />
          )}
        </SearchFormPredictive>,
      );

      const form = container.querySelector('form');
      expect(form).toHaveClass('custom-class');
    });

    it('passes additional props to form', () => {
      render(
        <SearchFormPredictive data-testid="predictive-form">
          {({inputRef}) => (
            <input ref={inputRef} type="search" name="q" />
          )}
        </SearchFormPredictive>,
      );

      expect(screen.getByTestId('predictive-form')).toBeInTheDocument();
    });
  });

  describe('Children Function Arguments', () => {
    it('provides inputRef to children', () => {
      let capturedInputRef: any = null;

      render(
        <SearchFormPredictive>
          {({inputRef}) => {
            capturedInputRef = inputRef;
            return <input ref={inputRef} type="search" name="q" />;
          }}
        </SearchFormPredictive>,
      );

      expect(capturedInputRef).toBeTruthy();
      expect(capturedInputRef.current).toBeInstanceOf(HTMLInputElement);
    });

    it('provides fetcher to children', () => {
      let capturedFetcher: any = null;

      render(
        <SearchFormPredictive>
          {({fetcher}) => {
            capturedFetcher = fetcher;
            return <input type="search" name="q" />;
          }}
        </SearchFormPredictive>,
      );

      expect(capturedFetcher).toBe(mockFetcher);
    });

    it('provides fetchResults function to children', () => {
      let capturedFetchResults: any = null;

      render(
        <SearchFormPredictive>
          {({fetchResults}) => {
            capturedFetchResults = fetchResults;
            return <input type="search" name="q" />;
          }}
        </SearchFormPredictive>,
      );

      expect(typeof capturedFetchResults).toBe('function');
    });

    it('provides goToSearch function to children', () => {
      let capturedGoToSearch: any = null;

      render(
        <SearchFormPredictive>
          {({goToSearch}) => {
            capturedGoToSearch = goToSearch;
            return <input type="search" name="q" />;
          }}
        </SearchFormPredictive>,
      );

      expect(typeof capturedGoToSearch).toBe('function');
    });
  });

  describe('fetchResults', () => {
    it('submits fetcher with search query', async () => {
      const user = userEvent.setup();

      render(
        <SearchFormPredictive>
          {({inputRef, fetchResults}) => (
            <input
              ref={inputRef}
              type="search"
              name="q"
              onChange={fetchResults}
              data-testid="search-input"
            />
          )}
        </SearchFormPredictive>,
      );

      const input = screen.getByTestId('search-input');
      await user.type(input, 'test query');

      await waitFor(() => {
        expect(mockFetcherSubmit).toHaveBeenCalled();
      });

      // Check the last call includes the query
      const lastCall = mockFetcherSubmit.mock.calls[mockFetcherSubmit.mock.calls.length - 1];
      expect(lastCall[0]).toEqual({q: 'test query', limit: 5, predictive: true});
      expect(lastCall[1]).toEqual({method: 'GET', action: SEARCH_ENDPOINT});
    });

    it('submits with empty query when input is empty', async () => {
      render(
        <SearchFormPredictive>
          {({fetchResults}) => {
            // Trigger onChange manually with empty value
            const event = {target: {value: ''}} as React.ChangeEvent<HTMLInputElement>;
            fetchResults(event);
            return <input type="search" />;
          }}
        </SearchFormPredictive>,
      );

      await waitFor(() => {
        expect(mockFetcherSubmit).toHaveBeenCalledWith(
          {q: '', limit: 5, predictive: true},
          {method: 'GET', action: SEARCH_ENDPOINT},
        );
      });
    });
  });

  describe('goToSearch', () => {
    it('navigates to search endpoint with query', () => {
      render(
        <SearchFormPredictive>
          {({inputRef, goToSearch}) => (
            <>
              <input
                ref={inputRef}
                type="search"
                name="q"
                defaultValue="test query"
                data-testid="search-input"
              />
              <button onClick={goToSearch} data-testid="search-button">
                Go
              </button>
            </>
          )}
        </SearchFormPredictive>,
      );

      const button = screen.getByTestId('search-button');
      button.click();

      expect(mockNavigate).toHaveBeenCalledWith('/search?q=test query');
      expect(mockAsideClose).toHaveBeenCalled();
    });

    it('navigates to search endpoint without query when input is empty', () => {
      render(
        <SearchFormPredictive>
          {({inputRef, goToSearch}) => (
            <>
              <input
                ref={inputRef}
                type="search"
                name="q"
                data-testid="search-input"
              />
              <button onClick={goToSearch} data-testid="search-button">
                Go
              </button>
            </>
          )}
        </SearchFormPredictive>,
      );

      const button = screen.getByTestId('search-button');
      button.click();

      expect(mockNavigate).toHaveBeenCalledWith('/search');
      expect(mockAsideClose).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('handles form submit', async () => {
      const {container} = render(
        <SearchFormPredictive data-testid="predictive-form">
          {({inputRef}) => (
            <>
              <input
                ref={inputRef}
                type="search"
                name="q"
                defaultValue="test"
                data-testid="search-input"
              />
              <button type="submit">Submit</button>
            </>
          )}
        </SearchFormPredictive>,
      );

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('renders with input that can be focused', async () => {
      render(
        <SearchFormPredictive>
          {({inputRef}) => (
            <>
              <input
                ref={inputRef}
                type="search"
                name="q"
                defaultValue="test"
                data-testid="search-input"
              />
              <button type="submit">Submit</button>
            </>
          )}
        </SearchFormPredictive>,
      );

      const input = screen.getByTestId('search-input') as HTMLInputElement;
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Input Type Attribute', () => {
    it('sets input type to search on mount', async () => {
      render(
        <SearchFormPredictive>
          {({inputRef}) => (
            <input
              ref={inputRef}
              type="text"
              name="q"
              data-testid="search-input"
            />
          )}
        </SearchFormPredictive>,
      );

      const input = screen.getByTestId('search-input');

      await waitFor(() => {
        expect(input).toHaveAttribute('type', 'search');
      });
    });
  });

  describe('SEARCH_ENDPOINT constant', () => {
    it('exports correct search endpoint', () => {
      expect(SEARCH_ENDPOINT).toBe('/search');
    });
  });
});
