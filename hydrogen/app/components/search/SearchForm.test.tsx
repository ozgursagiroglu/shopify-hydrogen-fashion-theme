/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {SearchForm} from './SearchForm';

// Mock react-router Form
vi.mock('react-router', () => ({
  Form: ({children, ...props}: any) => <form {...props}>{children}</form>,

  useLocation: vi.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  })),
  useRouteLoaderData: vi.fn(() => ({
    locale: 'en',
  })),
}));

describe('SearchForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders form with children function', () => {
      render(
        <SearchForm action="/search">
          {({inputRef}) => (
            <input
              ref={inputRef}
              type="search"
              name="q"
              placeholder="Search..."
              data-testid="search-input"
            />
          )}
        </SearchForm>,
      );

      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('returns null if children is not a function', () => {
      const {container} = render(
        <SearchForm action="/search">
          {('not a function' as any)}
        </SearchForm>,
      );

      expect(container.firstChild).toBeNull();
    });

    it('passes form props correctly', () => {
      render(
        <SearchForm action="/search" className="custom-class" data-testid="search-form">
          {({inputRef}) => (
            <input ref={inputRef} type="search" name="q" />
          )}
        </SearchForm>,
      );

      const form = screen.getByTestId('search-form');
      expect(form).toHaveAttribute('action', '/search');
      expect(form).toHaveClass('custom-class');
    });
  });

  describe('Input Ref', () => {
    it('provides inputRef to children', () => {
      let capturedRef: React.RefObject<HTMLInputElement> | null = null;

      render(
        <SearchForm action="/search">
          {({inputRef}) => {
            capturedRef = inputRef;
            return <input ref={inputRef} type="search" name="q" />;
          }}
        </SearchForm>,
      );

      expect(capturedRef).toBeTruthy();
      expect(capturedRef?.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('focuses input when Cmd+K is pressed', async () => {
      render(
        <SearchForm action="/search">
          {({inputRef}) => (
            <input
              ref={inputRef}
              type="search"
              name="q"
              data-testid="search-input"
            />
          )}
        </SearchForm>,
      );

      const input = screen.getByTestId('search-input') as HTMLInputElement;

      // Simulate Cmd+K
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
        cancelable: true,
      });

      document.dispatchEvent(event);

      expect(document.activeElement).toBe(input);
    });

    it('blurs input when Escape is pressed', async () => {
      render(
        <SearchForm action="/search">
          {({inputRef}) => (
            <input
              ref={inputRef}
              type="search"
              name="q"
              data-testid="search-input"
            />
          )}
        </SearchForm>,
      );

      const input = screen.getByTestId('search-input') as HTMLInputElement;
      input.focus();
      expect(document.activeElement).toBe(input);

      // Simulate Escape
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      document.dispatchEvent(event);

      expect(document.activeElement).not.toBe(input);
    });

    it('does not focus input for other key combinations', () => {
      render(
        <SearchForm action="/search">
          {({inputRef}) => (
            <input
              ref={inputRef}
              type="search"
              name="q"
              data-testid="search-input"
            />
          )}
        </SearchForm>,
      );

      const input = screen.getByTestId('search-input') as HTMLInputElement;
      const anotherElement = document.createElement('button');
      document.body.appendChild(anotherElement);
      anotherElement.focus();

      // Simulate Cmd+P (should not focus)
      const event = new KeyboardEvent('keydown', {
        key: 'p',
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);

      expect(document.activeElement).not.toBe(input);
      document.body.removeChild(anotherElement);
    });
  });

  describe('Form Submission', () => {
    it('submits form with GET method', () => {
      const {container} = render(
        <SearchForm action="/search">
          {({inputRef}) => (
            <>
              <input
                ref={inputRef}
                type="search"
                name="q"
                defaultValue="test query"
              />
              <button type="submit">Search</button>
            </>
          )}
        </SearchForm>,
      );

      const form = container.querySelector('form');
      expect(form).toHaveAttribute('method', 'get');
    });
  });

  describe('Multiple Instances', () => {
    it('handles multiple search forms independently', () => {
      render(
        <>
          <SearchForm action="/search">
            {({inputRef}) => (
              <input
                ref={inputRef}
                type="search"
                name="q"
                data-testid="search-input-1"
              />
            )}
          </SearchForm>
          <SearchForm action="/search">
            {({inputRef}) => (
              <input
                ref={inputRef}
                type="search"
                name="q"
                data-testid="search-input-2"
              />
            )}
          </SearchForm>
        </>,
      );

      const input1 = screen.getByTestId('search-input-1');
      const input2 = screen.getByTestId('search-input-2');

      expect(input1).toBeInTheDocument();
      expect(input2).toBeInTheDocument();
      expect(input1).not.toBe(input2);
    });
  });
});
