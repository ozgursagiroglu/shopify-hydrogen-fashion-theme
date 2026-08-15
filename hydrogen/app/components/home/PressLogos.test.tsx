/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {PressLogos} from './PressLogos';

const mockFeatures = [
  {
    id: '1',
    name: 'Vogue',
    logoImage: {url: 'https://example.com/vogue.png'},
    logoText: null,
    isFeatured: false,
    quote: null,
  },
  {
    id: '2',
    name: 'Elle',
    logoImage: null,
    logoText: 'ELLE',
    isFeatured: true,
    quote: 'The best fashion collection of the year',
  },
  {
    id: '3',
    name: 'Harper\'s Bazaar',
    logoImage: {url: 'https://example.com/harpers.png'},
    logoText: null,
    isFeatured: false,
    quote: null,
  },
];

describe('PressLogos', () => {
  describe('Rendering', () => {
    it('renders header text', () => {
      render(<PressLogos features={mockFeatures} />);

      expect(screen.getByText('AS FEATURED IN')).toBeInTheDocument();
    });

    it('renders all press features', () => {
      render(<PressLogos features={mockFeatures} />);

      const logos = screen.getAllByRole('img');
      expect(logos.length).toBe(2); // Only features with logoImage
    });

    it('returns null when no features', () => {
      const {container} = render(<PressLogos features={[]} />);

      expect(container).toBeEmptyDOMElement();
    });

    it('returns null when features is null', () => {
      const {container} = render(<PressLogos features={null as any} />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Logo images', () => {
    it('renders logo images', () => {
      render(<PressLogos features={mockFeatures} />);

      const vogueImage = screen.getByAltText('Vogue');
      expect(vogueImage).toBeInTheDocument();
      expect(vogueImage).toHaveAttribute('src', 'https://example.com/vogue.png');
    });

    it('renders logo text when no image', () => {
      render(<PressLogos features={mockFeatures} />);

      expect(screen.getByText('ELLE')).toBeInTheDocument();
    });

    it('falls back to name when no logo image or text', () => {
      const featuresWithoutLogo = [
        {
          id: '4',
          name: 'Fashion Weekly',
          logoImage: null,
          logoText: null,
          isFeatured: false,
          quote: null,
        },
      ];

      render(<PressLogos features={featuresWithoutLogo} />);

      expect(screen.getByText('Fashion Weekly')).toBeInTheDocument();
    });
  });

  describe('Featured quote', () => {
    it('renders featured quote when available', () => {
      render(<PressLogos features={mockFeatures} />);

      expect(screen.getByText('"The best fashion collection of the year"')).toBeInTheDocument();
    });

    it('renders quote attribution', () => {
      render(<PressLogos features={mockFeatures} />);

      expect(screen.getByText('— Elle')).toBeInTheDocument();
    });

    it('uses first feature as featured when none marked', () => {
      const featuresWithoutFeatured = mockFeatures.map(f => ({...f, isFeatured: false}));

      render(<PressLogos features={featuresWithoutFeatured} />);

      // First feature (Vogue) should be used but it has no quote, so quote section shouldn't render
      expect(screen.queryByRole('blockquote')).not.toBeInTheDocument();
    });

    it('does not render quote section when featured has no quote', () => {
      const featuresWithoutQuote = [
        {
          id: '1',
          name: 'Vogue',
          logoImage: {url: 'https://example.com/vogue.png'},
          logoText: null,
          isFeatured: true,
          quote: null,
        },
      ];

      render(<PressLogos features={featuresWithoutQuote} />);

      expect(screen.queryByRole('blockquote')).not.toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('renders in a grid', () => {
      const {container} = render(<PressLogos features={mockFeatures} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('displays correct number of items', () => {
      const {container} = render(<PressLogos features={mockFeatures} />);

      // Should have 3 containers (one for each feature)
      const containers = container.querySelectorAll('.group.flex.flex-col.items-center.text-center');
      expect(containers.length).toBe(3);
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for images', () => {
      render(<PressLogos features={mockFeatures} />);

      expect(screen.getByAltText('Vogue')).toBeInTheDocument();
      expect(screen.getByAltText('Harper\'s Bazaar')).toBeInTheDocument();
    });

    it('uses blockquote for quote', () => {
      render(<PressLogos features={mockFeatures} />);

      const quote = screen.getByText(/"The best fashion collection of the year"/);
      expect(quote.tagName).toBe('BLOCKQUOTE');
    });

    it('uses cite for attribution', () => {
      render(<PressLogos features={mockFeatures} />);

      const cite = screen.getByText('— Elle');
      expect(cite.tagName).toBe('CITE');
    });
  });

  describe('Styling', () => {
    it('applies grayscale to logos', () => {
      render(<PressLogos features={mockFeatures} />);

      const vogueImage = screen.getByAltText('Vogue');
      expect(vogueImage).toHaveClass('grayscale');
    });

    it('has hover effects', () => {
      render(<PressLogos features={mockFeatures} />);

      const vogueImage = screen.getByAltText('Vogue');
      expect(vogueImage).toHaveClass('group-hover:grayscale-0');
    });
  });
});
