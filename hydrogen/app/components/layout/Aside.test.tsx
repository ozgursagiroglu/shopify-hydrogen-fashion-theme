/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen, waitFor, renderHook} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Unmock Aside for this test file
vi.unmock('~/components/layout/Aside');

import {Aside, useAside} from './Aside';

// Mock icons
vi.mock('~/components/icons', () => ({
  CloseIcon: ({className}: {className?: string}) => (
    <svg data-testid="close-icon" className={className} />
  ),
}));

// Mock cn utility
vi.mock('~/lib/cn', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

// Test component that uses useAside hook
function TestComponent() {
  const {type, open, close} = useAside();
  return (
    <div>
      <div data-testid="active-type">{type}</div>
      <button onClick={() => open('cart')} data-testid="open-cart">
        Open Cart
      </button>
      <button onClick={() => open('search')} data-testid="open-search">
        Open Search
      </button>
      <button onClick={() => open('mobile')} data-testid="open-mobile">
        Open Mobile
      </button>
      <button onClick={close} data-testid="close-btn">
        Close
      </button>
    </div>
  );
}

describe('Aside', () => {
  describe('Provider', () => {
    it('provides context to children', () => {
      render(
        <Aside.Provider>
          <TestComponent />
        </Aside.Provider>,
      );

      expect(screen.getByTestId('active-type')).toHaveTextContent('closed');
    });

    it('throws error when useAside is used without provider', () => {
      expect(() => {
        renderHook(() => useAside());
      }).toThrow('useAside must be used within an AsideProvider');
    });

    it('allows opening different aside types', async () => {
      const user = userEvent.setup();
      render(
        <Aside.Provider>
          <TestComponent />
        </Aside.Provider>,
      );

      await user.click(screen.getByTestId('open-cart'));
      expect(screen.getByTestId('active-type')).toHaveTextContent('cart');

      await user.click(screen.getByTestId('open-search'));
      expect(screen.getByTestId('active-type')).toHaveTextContent('search');

      await user.click(screen.getByTestId('open-mobile'));
      expect(screen.getByTestId('active-type')).toHaveTextContent('mobile');
    });

    it('allows closing aside', async () => {
      const user = userEvent.setup();
      render(
        <Aside.Provider>
          <TestComponent />
        </Aside.Provider>,
      );

      await user.click(screen.getByTestId('open-cart'));
      expect(screen.getByTestId('active-type')).toHaveTextContent('cart');

      await user.click(screen.getByTestId('close-btn'));
      expect(screen.getByTestId('active-type')).toHaveTextContent('closed');
    });
  });

  describe('Component', () => {
    it('renders with correct heading', () => {
      render(
        <Aside.Provider>
          <Aside type="cart" heading="Shopping Cart">
            <div>Cart content</div>
          </Aside>
        </Aside.Provider>,
      );

      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    });

    it('renders children', () => {
      render(
        <Aside.Provider>
          <Aside type="cart" heading="Cart">
            <div>Cart content</div>
          </Aside>
        </Aside.Provider>,
      );

      expect(screen.getByText('Cart content')).toBeInTheDocument();
    });

    it('is visible when type matches', async () => {
      const user = userEvent.setup();
      render(
        <Aside.Provider>
          <TestComponent />
          <Aside type="cart" heading="Cart">
            <div>Cart content</div>
          </Aside>
        </Aside.Provider>,
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('invisible');

      await user.click(screen.getByTestId('open-cart'));
      expect(dialog).toHaveClass('visible');
    });

    it('is hidden when type does not match', async () => {
      const user = userEvent.setup();
      render(
        <Aside.Provider>
          <TestComponent />
          <Aside type="cart" heading="Cart">
            <div>Cart content</div>
          </Aside>
        </Aside.Provider>,
      );

      await user.click(screen.getByTestId('open-search'));
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('invisible');
    });

    it('closes when overlay is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Aside.Provider>
          <TestComponent />
          <Aside type="cart" heading="Cart">
            <div>Cart content</div>
          </Aside>
        </Aside.Provider>,
      );

      await user.click(screen.getByTestId('open-cart'));
      expect(screen.getByTestId('active-type')).toHaveTextContent('cart');

      const closeElements = screen.getAllByLabelText('Close');
      // First close element is the overlay
      await user.click(closeElements[0]);
      expect(screen.getByTestId('active-type')).toHaveTextContent('closed');
    });

    it('closes when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <Aside.Provider>
          <TestComponent />
          <Aside type="cart" heading="Cart">
            <div>Cart content</div>
          </Aside>
        </Aside.Provider>,
      );

      await user.click(screen.getByTestId('open-cart'));
      expect(screen.getByTestId('active-type')).toHaveTextContent('cart');

      const closeButtons = screen.getAllByLabelText('Close');
      await user.click(closeButtons[1]); // Second close button is the header button
      expect(screen.getByTestId('active-type')).toHaveTextContent('closed');
    });

    it('closes on Escape key press', async () => {
      const user = userEvent.setup();
      render(
        <Aside.Provider>
          <TestComponent />
          <Aside type="cart" heading="Cart">
            <div>Cart content</div>
          </Aside>
        </Aside.Provider>,
      );

      await user.click(screen.getByTestId('open-cart'));
      expect(screen.getByTestId('active-type')).toHaveTextContent('cart');

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.getByTestId('active-type')).toHaveTextContent('closed');
      });
    });

    it('renders mobile menu on the left', () => {
      render(
        <Aside.Provider>
          <TestComponent />
          <Aside type="mobile" heading="Menu">
            <div>Menu content</div>
          </Aside>
        </Aside.Provider>,
      );

      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('start-0');
    });

    it('renders other asides on the right', () => {
      render(
        <Aside.Provider>
          <TestComponent />
          <Aside type="cart" heading="Cart">
            <div>Cart content</div>
          </Aside>
        </Aside.Provider>,
      );

      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass('end-0');
    });

    it('has correct aria attributes', () => {
      render(
        <Aside.Provider>
          <Aside type="cart" heading="Cart">
            <div>Cart content</div>
          </Aside>
        </Aside.Provider>,
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal');
    });

    it('renders close icon', () => {
      render(
        <Aside.Provider>
          <Aside type="cart" heading="Cart">
            <div>Cart content</div>
          </Aside>
        </Aside.Provider>,
      );

      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });
  });
});
