/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Testimonials} from './Testimonials';

// Note: @shopify/hydrogen Image mock uses global mock from test/setup.ts

// Mock icons
vi.mock('~/components/icons', () => ({
  QuoteIcon: ({className}: {className?: string}) => (
    <svg data-testid="quote-icon" className={className} />
  ),
  StarIcon: ({className}: {className?: string}) => (
    <svg data-testid="star-icon" className={className} />
  ),
  VerifiedIcon: ({className}: {className?: string}) => (
    <svg data-testid="verified-icon" className={className} />
  ),
  ChevronLeftIcon: ({className}: {className?: string}) => (
    <svg data-testid="chevron-left" className={className} />
  ),
  ChevronRightIcon: ({className}: {className?: string}) => (
    <svg data-testid="chevron-right" className={className} />
  ),
}));

const mockTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    location: 'New York, NY',
    rating: 5,
    text: 'Absolutely love the quality and style!',
    verified: true,
    avatar: {url: 'https://example.com/sarah.jpg', altText: 'Sarah'},
    product: {title: 'Summer Dress'},
  },
  {
    id: '2',
    name: 'Emily Chen',
    location: 'Los Angeles, CA',
    rating: 4,
    text: 'Great fit and fast shipping.',
    verified: false,
    avatar: null,
    product: null,
  },
  {
    id: '3',
    name: 'Jessica Brown',
    location: 'Chicago, IL',
    rating: 5,
    text: 'Best purchase this year!',
    verified: true,
    avatar: {url: 'https://example.com/jessica.jpg'},
    product: {title: 'Classic Blazer'},
  },
];

/**
 * The carousel renders every testimonial at once and scrolls horizontally, so assertions about a
 * single testimonial must be scoped to its card rather than to the whole document.
 */
function renderTestimonials() {
  const view = render(<Testimonials testimonials={mockTestimonials} />);
  const cards = Array.from(
    view.container.querySelectorAll<HTMLElement>('[data-testimonial-card]'),
  );
  return {...view, cards};
}

describe('Testimonials', () => {
  describe('Rendering', () => {
    it('renders testimonials section', () => {
      render(<Testimonials testimonials={mockTestimonials} />);

      expect(screen.getByText('TESTIMONIALS')).toBeInTheDocument();
      expect(screen.getByText('What Our Clients Say')).toBeInTheDocument();
    });

    it('returns null when no testimonials', () => {
      const {container} = render(<Testimonials testimonials={[]} />);

      expect(container).toBeEmptyDOMElement();
    });

    it('returns null when testimonials is null', () => {
      const {container} = render(<Testimonials testimonials={null as any} />);

      expect(container).toBeEmptyDOMElement();
    });

    it('renders a card for every testimonial', () => {
      const {cards} = renderTestimonials();

      expect(cards).toHaveLength(mockTestimonials.length);
      expect(
        screen.getByText('"Absolutely love the quality and style!"'),
      ).toBeInTheDocument();
      expect(screen.getByText('"Great fit and fast shipping."')).toBeInTheDocument();
      expect(screen.getByText('"Best purchase this year!"')).toBeInTheDocument();
    });

    it('renders a quote icon on every card', () => {
      const {cards} = renderTestimonials();

      for (const card of cards) {
        expect(within(card).getByTestId('quote-icon')).toBeInTheDocument();
      }
    });
  });

  describe('Rating display', () => {
    it('renders five star icons per card', () => {
      const {cards} = renderTestimonials();

      for (const card of cards) {
        expect(within(card).getAllByTestId('star-icon')).toHaveLength(5);
      }
    });

    it('fills every star for a five-star rating', () => {
      const {cards} = renderTestimonials();

      // First testimonial has a 5-star rating.
      for (const star of within(cards[0]).getAllByTestId('star-icon')) {
        expect(star).toHaveClass('text-primary', 'fill-primary');
      }
    });

    it('shows partial rating correctly', () => {
      const {cards} = renderTestimonials();

      // Second testimonial has a 4-star rating: four filled, one empty.
      const stars = within(cards[1]).getAllByTestId('star-icon');
      const filled = stars.filter((star) =>
        star.classList.contains('fill-primary'),
      );

      expect(filled).toHaveLength(4);
      expect(stars[4]).toHaveClass('text-border-default');
    });
  });

  describe('Author information', () => {
    it('renders author name', () => {
      renderTestimonials();

      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    });

    it('renders author location', () => {
      renderTestimonials();

      expect(screen.getByText('New York, NY')).toBeInTheDocument();
    });

    it('renders verified badge when verified', () => {
      const {cards} = renderTestimonials();

      expect(within(cards[0]).getByTestId('verified-icon')).toBeInTheDocument();
    });

    it('does not render verified badge when not verified', () => {
      const {cards} = renderTestimonials();

      expect(
        within(cards[1]).queryByTestId('verified-icon'),
      ).not.toBeInTheDocument();
    });

    it('renders avatar when provided', () => {
      const {cards} = renderTestimonials();

      const avatar = within(cards[0]).getByTestId('image');
      expect(avatar).toHaveAttribute('src', 'https://example.com/sarah.jpg');
      expect(avatar).toHaveAttribute('alt', 'Sarah');
    });

    it('uses author name as alt text when not provided', () => {
      const {cards} = renderTestimonials();

      // Third testimonial has an avatar without altText.
      expect(within(cards[2]).getByTestId('image')).toHaveAttribute(
        'alt',
        'Jessica Brown',
      );
    });

    it('does not render avatar when not provided', () => {
      const {cards} = renderTestimonials();

      expect(within(cards[1]).queryByTestId('image')).not.toBeInTheDocument();
    });

    it('renders product reference when provided', () => {
      const {cards} = renderTestimonials();

      expect(
        within(cards[0]).getByText(/Purchased.*Summer Dress/),
      ).toBeInTheDocument();
    });

    it('does not render product reference when not provided', () => {
      const {cards} = renderTestimonials();

      expect(within(cards[1]).queryByText(/Purchased/)).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    let scrollBy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      scrollBy = vi.fn();
      Element.prototype.scrollBy = scrollBy;
    });

    it('renders navigation buttons', () => {
      renderTestimonials();

      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-left')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
    });

    it('scrolls forward when clicking next', async () => {
      const user = userEvent.setup();
      renderTestimonials();

      await user.click(screen.getByLabelText('Next slide'));

      expect(scrollBy).toHaveBeenCalledTimes(1);
      expect(scrollBy.mock.calls[0][0]).toMatchObject({behavior: 'smooth'});
      expect(scrollBy.mock.calls[0][0].left).toBeGreaterThan(0);
    });

    it('scrolls backward when clicking previous', async () => {
      const user = userEvent.setup();
      renderTestimonials();

      await user.click(screen.getByLabelText('Previous slide'));

      expect(scrollBy).toHaveBeenCalledTimes(1);
      expect(scrollBy.mock.calls[0][0]).toMatchObject({behavior: 'smooth'});
      expect(scrollBy.mock.calls[0][0].left).toBeLessThan(0);
    });

    it('scrolls by opposite amounts in each direction', async () => {
      const user = userEvent.setup();
      renderTestimonials();

      await user.click(screen.getByLabelText('Next slide'));
      await user.click(screen.getByLabelText('Previous slide'));

      expect(scrollBy).toHaveBeenCalledTimes(2);
      expect(scrollBy.mock.calls[1][0].left).toBe(
        -scrollBy.mock.calls[0][0].left,
      );
    });
  });

  describe('Quote display', () => {
    it('wraps quote in quotation marks', () => {
      renderTestimonials();

      expect(
        screen.getByText('"Absolutely love the quality and style!"'),
      ).toBeInTheDocument();
    });

    it('uses blockquote element', () => {
      renderTestimonials();

      const quote = screen.getByText(
        '"Absolutely love the quality and style!"',
      );
      expect(quote.tagName).toBe('BLOCKQUOTE');
    });
  });
});
