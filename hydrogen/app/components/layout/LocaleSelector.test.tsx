/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {LocaleSelector} from './LocaleSelector';

const mockRouteLoaderData = vi.fn();
const mockLocation = {pathname: '/', search: ''};

// Custom mock for react-router with mutable mockRouteLoaderData and mockLocation
vi.mock('react-router', () => ({
  useRouteLoaderData: () => mockRouteLoaderData(),
  useLocation: () => mockLocation,
  Link: ({to, children, className, onClick, role, reloadDocument, ...rest}: {to: string; children: React.ReactNode; className?: string; onClick?: () => void; role?: string; reloadDocument?: boolean; [key: string]: unknown}) => (
    <a href={to} className={className} onClick={onClick} role={role} data-reload-document={reloadDocument} {...rest}>
      {children}
    </a>
  ),
}));

// Mock icons
vi.mock('~/components/icons', () => ({
  GlobeIcon: ({className}: {className?: string}) => (
    <svg data-testid="globe-icon" className={className} />
  ),
  ChevronDownIcon: ({className}: {className?: string}) => (
    <svg data-testid="chevron-icon" className={className} />
  ),
}));

// Mock cn utility
vi.mock('~/lib/cn', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));

// Mock constants
vi.mock('~/lib/constants', () => ({
  API: {
    DEFAULT_COUNTRY: 'US',
    DEFAULT_LANGUAGE: 'EN',
  },
}));

const mockLocalizationData = {
  localization: {
    localization: {
      availableCountries: [
        {
          isoCode: 'US',
          name: 'United States',
          currency: {
            isoCode: 'USD',
            name: 'US Dollar',
            symbol: '$',
          },
          availableLanguages: [
            {isoCode: 'EN', name: 'English'},
            {isoCode: 'ES', name: 'Spanish'},
          ],
        },
        {
          isoCode: 'GB',
          name: 'United Kingdom',
          currency: {
            isoCode: 'GBP',
            name: 'British Pound',
            symbol: '£',
          },
          availableLanguages: [
            {isoCode: 'EN', name: 'English'},
          ],
        },
      ],
    },
  },
};

describe('LocaleSelector', () => {
  beforeEach(() => {
    mockRouteLoaderData.mockReturnValue(mockLocalizationData);
    mockLocation.pathname = '/';
    mockLocation.search = '';
  });

  describe('Rendering', () => {
    it('renders locale selector button', () => {
      render(<LocaleSelector />);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-icon')).toBeInTheDocument();
    });

    it('displays current country name', () => {
      render(<LocaleSelector />);

      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    it('displays current currency', () => {
      render(<LocaleSelector />);

      expect(screen.getByText(/USD/)).toBeInTheDocument();
    });

    it('does not render when no localization data', () => {
      mockRouteLoaderData.mockReturnValue(null);
      const {container} = render(<LocaleSelector />);

      expect(container).toBeEmptyDOMElement();
    });

    it('does not render when no countries available', () => {
      mockRouteLoaderData.mockReturnValue({
        localization: {
          localization: {
            availableCountries: [],
          },
        },
      });
      const {container} = render(<LocaleSelector />);

      expect(container).toBeEmptyDOMElement();
    });

    it('applies custom className', () => {
      const {container} = render(<LocaleSelector className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Dropdown behavior', () => {
    it('opens dropdown on button click', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByText('Select your region')).toBeInTheDocument();
    });

    it('closes dropdown on second button click', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(screen.getByRole('button'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes dropdown on escape key', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('closes dropdown on outside click', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <LocaleSelector />
          <div data-testid="outside">Outside</div>
        </div>,
      );

      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(screen.getByTestId('outside'));
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Country and Language selection', () => {
    it('displays all available countries', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));

      // Use getAllByText since country name appears multiple times (button + dropdown)
      expect(screen.getAllByText('United States').length).toBeGreaterThan(0);
      expect(screen.getAllByText('United Kingdom').length).toBeGreaterThan(0);
    });

    it('displays all available languages for each country', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));

      const englishLinks = screen.getAllByRole('option', {name: 'English'});
      expect(englishLinks.length).toBe(2); // US and GB

      expect(screen.getByRole('option', {name: 'Spanish'})).toBeInTheDocument();
    });

    it('displays currency symbols', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByText(/\$ USD/)).toBeInTheDocument();
      expect(screen.getByText(/£ GBP/)).toBeInTheDocument();
    });

    it('highlights active locale', async () => {
      const user = userEvent.setup();
      mockLocation.pathname = '/en-us/products';

      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));

      const activeOption = screen.getAllByRole('option', {selected: true});
      expect(activeOption.length).toBeGreaterThan(0);
    });

    it('has correct href for locale links', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));

      const spanishLink = screen.getByRole('option', {name: 'Spanish'});
      expect(spanishLink).toHaveAttribute('href', '/es-us');
    });

    it('preserves pathname in locale links', async () => {
      const user = userEvent.setup();
      mockLocation.pathname = '/products';

      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));

      const spanishLink = screen.getByRole('option', {name: 'Spanish'});
      expect(spanishLink).toHaveAttribute('href', '/es-us/products');
    });

    it('removes locale prefix for default locale', async () => {
      const user = userEvent.setup();
      mockLocation.pathname = '/es-us/products';

      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));
      const englishLinks = screen.getAllByRole('option', {name: 'English'});

      // US English (default) should have no locale prefix
      expect(englishLinks[0]).toHaveAttribute('href', '/products');
    });

    it('adds locale prefix for non-default locale', async () => {
      const user = userEvent.setup();
      mockLocation.pathname = '/products';

      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));
      const englishLinks = screen.getAllByRole('option', {name: 'English'});

      // GB English (non-default) should have locale prefix
      expect(englishLinks[1]).toHaveAttribute('href', '/en-gb/products');
    });

    it('closes dropdown after locale selection', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      await user.click(screen.getByRole('option', {name: 'Spanish'}));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('preserves query string in locale links', async () => {
      const user = userEvent.setup();
      mockLocation.pathname = '/products';
      mockLocation.search = '?sort=price';

      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));

      const spanishLink = screen.getByRole('option', {name: 'Spanish'});
      expect(spanishLink).toHaveAttribute('href', '/es-us/products?sort=price');
    });
  });

  describe('Locale display from localization data', () => {
    it('displays locale from localization country data', () => {
      mockRouteLoaderData.mockReturnValue({
        localization: {
          localization: {
            ...mockLocalizationData.localization.localization,
            country: {isoCode: 'GB'},
            language: {isoCode: 'EN'},
          },
        },
      });

      render(<LocaleSelector />);

      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
      expect(screen.getByText(/GBP/)).toBeInTheDocument();
    });

    it('defaults to US when no country data', () => {
      mockRouteLoaderData.mockReturnValue(mockLocalizationData);
      mockLocation.pathname = '/products';

      render(<LocaleSelector />);

      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    it('displays correct currency for locale', () => {
      mockRouteLoaderData.mockReturnValue({
        localization: {
          localization: {
            ...mockLocalizationData.localization.localization,
            country: {isoCode: 'GB'},
            language: {isoCode: 'EN'},
          },
        },
      });

      render(<LocaleSelector />);

      expect(screen.getByText(/GBP/)).toBeInTheDocument();
    });
  });

  describe('Mobile display', () => {
    it('shows abbreviated country code on mobile', () => {
      render(<LocaleSelector />);

      const mobileCode = screen.getByText('US');
      expect(mobileCode).toHaveClass('sm:hidden');
    });

    it('shows full country name on desktop', () => {
      render(<LocaleSelector />);

      const desktopName = screen.getByText('United States');
      expect(desktopName).toHaveClass('hidden', 'sm:inline');
    });
  });

  describe('Accessibility', () => {
    it('has proper aria attributes', () => {
      render(<LocaleSelector />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      expect(button).toHaveAttribute('aria-label', 'Select region and language');
    });

    it('updates aria-expanded when opened', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-selected on active option', async () => {
      const user = userEvent.setup();
      mockLocation.pathname = '/en-us/';

      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));

      const options = screen.getAllByRole('option');
      const selectedOptions = options.filter((opt) => opt.getAttribute('aria-selected') === 'true');
      expect(selectedOptions.length).toBeGreaterThan(0);
    });

    it('active locale link has pointer-events-none', async () => {
      const user = userEvent.setup();
      mockLocation.pathname = '/';

      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));

      const englishLinks = screen.getAllByRole('option', {name: 'English'});
      // US English is active and should have pointer-events-none
      expect(englishLinks[0]).toHaveClass('pointer-events-none');
    });

    it('listbox has aria-label', async () => {
      const user = userEvent.setup();
      render(<LocaleSelector />);

      await user.click(screen.getByRole('button'));

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'Available regions and languages');
    });
  });
});
