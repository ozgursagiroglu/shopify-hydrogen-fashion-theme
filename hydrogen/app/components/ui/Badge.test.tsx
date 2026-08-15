/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Badge} from './Badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(<Badge variant="new">NEW</Badge>);

      expect(screen.getByText('NEW')).toBeInTheDocument();
    });

    it('renders as a span element', () => {
      render(<Badge variant="new">NEW</Badge>);

      const badge = screen.getByText('NEW');
      expect(badge.tagName).toBe('SPAN');
    });
  });

  describe('Variant styles', () => {
    it('applies new variant styles', () => {
      render(<Badge variant="new">NEW</Badge>);

      const badge = screen.getByText('NEW');
      expect(badge.className).toContain('bg-primary');
      expect(badge.className).toContain('text-white');
    });

    it('applies sale variant styles', () => {
      render(<Badge variant="sale">SALE</Badge>);

      const badge = screen.getByText('SALE');
      expect(badge.className).toContain('bg-error');
      expect(badge.className).toContain('text-white');
    });

    it('applies limited variant styles', () => {
      render(<Badge variant="limited">LIMITED</Badge>);

      const badge = screen.getByText('LIMITED');
      expect(badge.className).toContain('bg-primary');
      expect(badge.className).toContain('text-white');
    });

    it('applies soldout variant styles', () => {
      render(<Badge variant="soldout">SOLD OUT</Badge>);

      const badge = screen.getByText('SOLD OUT');
      expect(badge.className).toContain('bg-text-muted');
      expect(badge.className).toContain('text-white');
    });
  });

  describe('Base styles', () => {
    it('applies uppercase styling', () => {
      render(<Badge variant="new">new arrival</Badge>);

      const badge = screen.getByText('new arrival');
      expect(badge.className).toContain('uppercase');
    });

    it('applies text-xs size', () => {
      render(<Badge variant="new">NEW</Badge>);

      const badge = screen.getByText('NEW');
      expect(badge.className).toContain('text-xs');
    });

    it('applies font-medium weight', () => {
      render(<Badge variant="new">NEW</Badge>);

      const badge = screen.getByText('NEW');
      expect(badge.className).toContain('font-medium');
    });

    it('applies tracking-wider letter spacing', () => {
      render(<Badge variant="new">NEW</Badge>);

      const badge = screen.getByText('NEW');
      expect(badge.className).toContain('tracking-wider');
    });

    it('applies rounded corners', () => {
      render(<Badge variant="new">NEW</Badge>);

      const badge = screen.getByText('NEW');
      expect(badge.className).toContain('rounded');
    });

    it('applies flex centering', () => {
      render(<Badge variant="new">NEW</Badge>);

      const badge = screen.getByText('NEW');
      expect(badge.className).toContain('inline-flex');
      expect(badge.className).toContain('items-center');
      expect(badge.className).toContain('justify-center');
    });

    it('applies padding', () => {
      render(<Badge variant="new">NEW</Badge>);

      const badge = screen.getByText('NEW');
      expect(badge.className).toContain('px-2');
      expect(badge.className).toContain('py-1');
    });
  });

  describe('Custom className', () => {
    it('merges custom className with default classes', () => {
      render(
        <Badge variant="new" className="custom-badge">
          NEW
        </Badge>,
      );

      const badge = screen.getByText('NEW');
      expect(badge.className).toContain('custom-badge');
      expect(badge.className).toContain('bg-primary');
    });

    it('allows overriding styles with custom className', () => {
      render(
        <Badge variant="new" className="bg-blue-500">
          NEW
        </Badge>,
      );

      const badge = screen.getByText('NEW');
      expect(badge.className).toContain('bg-blue-500');
    });
  });

  describe('Different content', () => {
    it('renders text content', () => {
      render(<Badge variant="sale">-20%</Badge>);

      expect(screen.getByText('-20%')).toBeInTheDocument();
    });

    it('renders complex children', () => {
      render(
        <Badge variant="new">
          <span data-testid="icon">★</span> NEW
        </Badge>,
      );

      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('★')).toBeInTheDocument();
    });
  });
});
