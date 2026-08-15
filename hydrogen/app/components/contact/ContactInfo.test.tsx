/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {ContactInfo} from './ContactInfo';
import type {ContactInfoData} from './ContactInfo';

describe('ContactInfo', () => {
  const defaultData: ContactInfoData = {
    email: 'hello@elan-fashion.com',
    phone: '+1 (555) 123-4567',
    hours: 'Mon-Fri: 9AM - 6PM EST',
    address: '123 Fashion Avenue, New York, NY 10001',
  };

  describe('with default i18n translations', () => {
    it('renders email information', () => {
      render(<ContactInfo data={defaultData} />);
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('hello@elan-fashion.com')).toBeInTheDocument();
    });

    it('renders phone information', () => {
      render(<ContactInfo data={defaultData} />);
      expect(screen.getByText('Phone')).toBeInTheDocument();
      expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
    });

    it('renders business hours', () => {
      render(<ContactInfo data={defaultData} />);
      expect(screen.getByText('Hours')).toBeInTheDocument();
      expect(screen.getByText('Mon-Fri: 9AM - 6PM EST')).toBeInTheDocument();
    });

    it('renders address', () => {
      render(<ContactInfo data={defaultData} />);
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('123 Fashion Avenue, New York, NY 10001')).toBeInTheDocument();
    });

    it('renders email as a mailto link', () => {
      render(<ContactInfo data={defaultData} />);
      const emailLink = screen.getByRole('link', {name: /hello@elan-fashion.com/i});
      expect(emailLink).toHaveAttribute('href', 'mailto:hello@elan-fashion.com');
    });

    it('renders phone as a tel link', () => {
      render(<ContactInfo data={defaultData} />);
      const phoneLink = screen.getByRole('link', {name: /\+1 \(555\) 123-4567/i});
      // The tel href removes spaces but keeps parentheses
      expect(phoneLink).toHaveAttribute('href', 'tel:+1(555)123-4567');
    });
  });

  describe('with data prop (from metaobject)', () => {
    const mockData: ContactInfoData = {
      title: 'Get in Touch',
      email: 'support@test-store.com',
      phone: '+44 20 7123 4567',
      hours: 'Mon-Sat: 10AM - 8PM GMT',
      address: '456 Oxford Street, London, UK',
      addressUrl: 'https://maps.google.com/test',
    };

    it('renders email from data prop', () => {
      render(<ContactInfo data={mockData} />);
      expect(screen.getByText('support@test-store.com')).toBeInTheDocument();
    });

    it('renders phone from data prop', () => {
      render(<ContactInfo data={mockData} />);
      expect(screen.getByText('+44 20 7123 4567')).toBeInTheDocument();
    });

    it('renders hours from data prop', () => {
      render(<ContactInfo data={mockData} />);
      expect(screen.getByText('Mon-Sat: 10AM - 8PM GMT')).toBeInTheDocument();
    });

    it('renders address from data prop with link', () => {
      render(<ContactInfo data={mockData} />);
      expect(screen.getByText('456 Oxford Street, London, UK')).toBeInTheDocument();
      const addressLink = screen.getByRole('link', {name: /456 Oxford Street/i});
      expect(addressLink).toHaveAttribute('href', 'https://maps.google.com/test');
    });

    it('renders custom title from data prop', () => {
      render(<ContactInfo data={mockData} />);
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('only renders email when other fields are empty', () => {
      const minimalData: ContactInfoData = {
        email: 'minimal@test.com',
      };
      render(<ContactInfo data={minimalData} />);
      expect(screen.getByText('minimal@test.com')).toBeInTheDocument();
      // Only email icon should be present
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBe(1);
    });
  });

  it('applies custom className', () => {
    const {container} = render(<ContactInfo data={defaultData} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders icons for each contact method', () => {
    render(<ContactInfo data={defaultData} />);
    // Check that SVG icons are rendered
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThanOrEqual(4); // At least 4 icons
  });
});
