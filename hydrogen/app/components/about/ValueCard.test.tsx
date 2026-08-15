/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {ValueCard} from './ValueCard';
import type {BrandValue} from '~/graphql/storefront/MetaobjectQueries';

describe('ValueCard', () => {
  const mockValue: BrandValue = {
    title: 'Quality Craftsmanship',
    description: 'Every piece is made with attention to detail and care.',
    icon: 'sparkles',
  };

  it('renders title and description', () => {
    render(<ValueCard value={mockValue} />);

    expect(screen.getByText('Quality Craftsmanship')).toBeInTheDocument();
    expect(
      screen.getByText('Every piece is made with attention to detail and care.')
    ).toBeInTheDocument();
  });

  it('renders with sparkles icon', () => {
    render(<ValueCard value={{...mockValue, icon: 'sparkles'}} />);

    const iconContainer = screen.getByText('Quality Craftsmanship')
      .closest('div')
      ?.previousElementSibling;
    expect(iconContainer).toHaveClass(
      'w-12',
      'h-12',
      'rounded-full',
      'bg-primary/5'
    );
  });

  it('renders with clock icon', () => {
    render(
      <ValueCard
        value={{
          title: 'Fast Delivery',
          description: 'Quick shipping worldwide',
          icon: 'clock',
        }}
      />
    );

    expect(screen.getByText('Fast Delivery')).toBeInTheDocument();
  });

  it('renders with leaf icon', () => {
    render(
      <ValueCard
        value={{
          title: 'Sustainable',
          description: 'Eco-friendly materials',
          icon: 'leaf',
        }}
      />
    );

    expect(screen.getByText('Sustainable')).toBeInTheDocument();
  });

  it('renders with heart icon', () => {
    render(
      <ValueCard
        value={{
          title: 'Made with Love',
          description: 'Crafted with passion',
          icon: 'heart',
        }}
      />
    );

    expect(screen.getByText('Made with Love')).toBeInTheDocument();
  });

  it('uses default icon for unknown icon type', () => {
    render(
      <ValueCard
        value={{
          title: 'Test',
          description: 'Test description',
          icon: 'unknown' as any,
        }}
      />
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('has correct structure and styling', () => {
    const {container} = render(<ValueCard value={mockValue} />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex', 'flex-col', 'items-start', 'gap-4');
  });

  it('renders description with correct styling', () => {
    render(<ValueCard value={mockValue} />);

    const description = screen.getByText(
      'Every piece is made with attention to detail and care.'
    );
    expect(description).toHaveClass('text-text-secondary', 'leading-relaxed');
  });

  it('renders title with correct styling', () => {
    render(<ValueCard value={mockValue} />);

    const title = screen.getByText('Quality Craftsmanship');
    expect(title).toHaveClass(
      'font-display',
      'text-xl',
      'md:text-2xl',
      'text-text',
      'mb-2'
    );
  });
});
