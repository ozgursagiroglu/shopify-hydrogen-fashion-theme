/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent} from '@test/utils/render';
import {FAQList} from './FAQList';
import type {FAQCategory} from '~/graphql/storefront';

const mockCategories: FAQCategory[] = [
  {
    key: 'shipping',
    name: 'Shipping & Delivery',
    items: [
      {
        id: 'faq-1',
        question: 'What are your shipping options?',
        answer: 'We offer standard and express shipping.',
        category: 'shipping',
        order: 1,
      },
      {
        id: 'faq-2',
        question: 'Do you ship internationally?',
        answer: 'Yes, we ship worldwide.',
        category: 'shipping',
        order: 2,
      },
    ],
  },
  {
    key: 'returns',
    name: 'Returns & Exchanges',
    items: [
      {
        id: 'faq-3',
        question: 'What is your return policy?',
        answer: 'We accept returns within 30 days.',
        category: 'returns',
        order: 1,
      },
    ],
  },
];

describe('FAQList', () => {
  it('renders category headings', () => {
    render(<FAQList categories={mockCategories} searchTerm="" />);

    expect(screen.getByText('Shipping & Delivery')).toBeInTheDocument();
    expect(screen.getByText('Returns & Exchanges')).toBeInTheDocument();
  });

  it('renders FAQ questions', () => {
    render(<FAQList categories={mockCategories} searchTerm="" />);

    expect(screen.getByText('What are your shipping options?')).toBeInTheDocument();
    expect(screen.getByText('Do you ship internationally?')).toBeInTheDocument();
    expect(screen.getByText('What is your return policy?')).toBeInTheDocument();
  });

  it('expands answer when question is clicked', () => {
    render(<FAQList categories={mockCategories} searchTerm="" />);

    const question = screen.getByText('What are your shipping options?');
    fireEvent.click(question);

    expect(screen.getByText('We offer standard and express shipping.')).toBeVisible();
  });

  describe('search filtering', () => {
    it('filters questions by search term', () => {
      // Using "ship" to match both "shipping" and "ship"
      render(<FAQList categories={mockCategories} searchTerm="ship" />);

      expect(screen.getByText('What are your shipping options?')).toBeInTheDocument();
      expect(screen.getByText('Do you ship internationally?')).toBeInTheDocument();
      expect(screen.queryByText('What is your return policy?')).not.toBeInTheDocument();
    });

    it('shows no results message when no matches', () => {
      render(<FAQList categories={mockCategories} searchTerm="nonexistent" />);

      expect(screen.getByText('No questions found matching your search')).toBeInTheDocument();
    });

    it('searches in both questions and answers', () => {
      render(<FAQList categories={mockCategories} searchTerm="worldwide" />);

      // Should find the FAQ that has "worldwide" in the answer
      expect(screen.getByText('Do you ship internationally?')).toBeInTheDocument();
    });

    it('is case-insensitive', () => {
      render(<FAQList categories={mockCategories} searchTerm="SHIPPING" />);

      expect(screen.getByText('What are your shipping options?')).toBeInTheDocument();
    });
  });

  it('renders empty state when no categories', () => {
    render(<FAQList categories={[]} searchTerm="" />);
    expect(screen.getByText('No questions found matching your search')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const {container} = render(
      <FAQList categories={mockCategories} searchTerm="" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
