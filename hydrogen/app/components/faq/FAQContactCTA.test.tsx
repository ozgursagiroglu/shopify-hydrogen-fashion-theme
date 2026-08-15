/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {FAQContactCTA} from './FAQContactCTA';

describe('FAQContactCTA', () => {
  it('renders contact prompt heading', () => {
    render(<FAQContactCTA />);

    expect(screen.getByText('Still have questions?')).toBeInTheDocument();
  });

  it('renders contact description', () => {
    render(<FAQContactCTA />);

    expect(
      screen.getByText('Our customer service team is here to help.')
    ).toBeInTheDocument();
  });

  it('renders contact CTA button', () => {
    render(<FAQContactCTA />);

    const button = screen.getByRole('link', {name: 'Contact Us'});
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', expect.stringContaining('/contact'));
  });

  it('applies custom className', () => {
    const {container} = render(<FAQContactCTA className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has correct default styling', () => {
    const {container} = render(<FAQContactCTA />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass(
      'bg-surface-alt',
      'rounded-lg',
      'p-8',
      'text-center'
    );
  });

  it('renders button with primary variant', () => {
    render(<FAQContactCTA />);

    const button = screen.getByRole('link', {name: 'Contact Us'});
    expect(button).toHaveClass('bg-primary', 'text-white');
  });

  it('heading has correct styling', () => {
    render(<FAQContactCTA />);

    const heading = screen.getByText('Still have questions?');
    expect(heading).toHaveClass('font-display', 'text-h4', 'text-primary', 'mb-2');
  });

  it('description has correct styling', () => {
    render(<FAQContactCTA />);

    const description = screen.getByText('Our customer service team is here to help.');
    expect(description).toHaveClass('text-text-secondary', 'mb-6');
  });
});
