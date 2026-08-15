/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@test/utils/render';
import {StoreCard} from './StoreCard';
import type {StoreLocation} from '~/graphql/storefront/MetaobjectQueries';

describe('StoreCard', () => {
  const mockImage = {
    url: 'https://example.com/store.jpg',
    altText: 'Store exterior',
  };

  const mockStore: StoreLocation = {
    name: 'New York Flagship',
    addressLine1: '123 Fifth Avenue',
    addressLine2: 'Suite 200',
    city: 'New York',
    postalCode: '10011',
    country: 'United States',
    latitude: 40.7413,
    longitude: -73.9896,
    phone: '+1 212-555-0123',
    email: 'newyork@example.com',
    hours: 'Mon-Fri: 10am-8pm\nSat-Sun: 11am-6pm',
    image: mockImage,
    features: ['Free WiFi', 'Personal Styling', 'Gift Wrapping'],
  };

  it('renders store name', () => {
    render(<StoreCard store={mockStore} />);

    expect(screen.getByText('New York Flagship')).toBeInTheDocument();
  });

  it('renders full address', () => {
    render(<StoreCard store={mockStore} />);

    expect(screen.getByText(/123 Fifth Avenue/)).toBeInTheDocument();
    expect(screen.getByText(/Suite 200/)).toBeInTheDocument();
    expect(screen.getAllByText(/New York/)).toHaveLength(2); // Name + Address
    expect(screen.getByText(/, 10011/)).toBeInTheDocument();
    expect(screen.getByText(/United States/)).toBeInTheDocument();
  });

  it('renders address without addressLine2', () => {
    const storeWithoutLine2 = {...mockStore, addressLine2: null};
    render(<StoreCard store={storeWithoutLine2} />);

    expect(screen.getByText(/123 Fifth Avenue/)).toBeInTheDocument();
    expect(screen.queryByText(/Suite 200/)).not.toBeInTheDocument();
  });

  it('renders address without postal code', () => {
    const storeWithoutPostalCode = {...mockStore, postalCode: null};
    render(<StoreCard store={storeWithoutPostalCode} />);

    expect(screen.getAllByText(/New York/)).toHaveLength(2); // Name + Address
    expect(screen.queryByText(/, 10011/)).not.toBeInTheDocument();
  });

  it('renders phone number with tel link', () => {
    render(<StoreCard store={mockStore} />);

    const phoneLink = screen.getByRole('link', {name: '+1 212-555-0123'});
    expect(phoneLink).toHaveAttribute('href', 'tel:+1 212-555-0123');
  });

  it('does not render phone section when phone is null', () => {
    const storeWithoutPhone = {...mockStore, phone: null};
    render(<StoreCard store={storeWithoutPhone} />);

    expect(screen.queryByText('Phone')).not.toBeInTheDocument();
  });

  it('renders email with mailto link', () => {
    render(<StoreCard store={mockStore} />);

    const emailLink = screen.getByRole('link', {name: 'newyork@example.com'});
    expect(emailLink).toHaveAttribute('href', 'mailto:newyork@example.com');
  });

  it('does not render email section when email is null', () => {
    const storeWithoutEmail = {...mockStore, email: null};
    render(<StoreCard store={storeWithoutEmail} />);

    expect(screen.queryByText('Email')).not.toBeInTheDocument();
  });

  it('renders opening hours', () => {
    render(<StoreCard store={mockStore} />);

    expect(screen.getByText(/Mon-Fri: 10am-8pm/)).toBeInTheDocument();
    expect(screen.getByText(/Sat-Sun: 11am-6pm/)).toBeInTheDocument();
  });

  it('does not render hours section when hours is null', () => {
    const storeWithoutHours = {...mockStore, hours: null};
    render(<StoreCard store={storeWithoutHours} />);

    expect(screen.queryByText('Opening Hours')).not.toBeInTheDocument();
  });

  it('renders store features', () => {
    render(<StoreCard store={mockStore} />);

    expect(screen.getByText('Free WiFi')).toBeInTheDocument();
    expect(screen.getByText('Personal Styling')).toBeInTheDocument();
    expect(screen.getByText('Gift Wrapping')).toBeInTheDocument();
  });

  it('does not render features section when features array is empty', () => {
    const storeWithoutFeatures = {...mockStore, features: []};
    render(<StoreCard store={storeWithoutFeatures} />);

    expect(screen.queryByText('Features')).not.toBeInTheDocument();
  });

  it('renders store image', () => {
    render(<StoreCard store={mockStore} />);

    const image = screen.getByAltText('Store exterior');
    expect(image).toBeInTheDocument();
  });

  it('uses store name as alt text when image altText is missing', () => {
    const storeWithoutAltText = {
      ...mockStore,
      image: {url: mockImage.url, altText: null},
    };
    render(<StoreCard store={storeWithoutAltText} />);

    const image = screen.getByAltText('New York Flagship');
    expect(image).toBeInTheDocument();
  });

  it('does not render image when image is null', () => {
    const storeWithoutImage = {...mockStore, image: null};
    render(<StoreCard store={storeWithoutImage} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders get directions button with coordinates', () => {
    render(<StoreCard store={mockStore} />);

    const button = screen.getByRole('link', {name: 'Get Directions'});
    expect(button).toHaveAttribute(
      'href',
      'https://www.google.com/maps?q=40.7413,-73.9896'
    );
    expect(button).toHaveAttribute('target', '_blank');
    expect(button).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders get directions button with address search when no coordinates', () => {
    const storeWithoutCoords = {
      ...mockStore,
      latitude: null,
      longitude: null,
    };
    render(<StoreCard store={storeWithoutCoords} />);

    const button = screen.getByRole('link', {name: 'Get Directions'});
    const expectedUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      '123 Fifth Avenue, Suite 200, New York, 10011, United States'
    )}`;
    expect(button).toHaveAttribute('href', expectedUrl);
  });

  it('renders get directions button with partial coordinates', () => {
    const storeWithPartialCoords = {
      ...mockStore,
      latitude: 40.7413,
      longitude: null,
    };
    render(<StoreCard store={storeWithPartialCoords} />);

    const button = screen.getByRole('link', {name: 'Get Directions'});
    expect(button).toHaveAttribute(
      'href',
      expect.stringContaining('maps/search')
    );
  });

  it('has correct card structure', () => {
    const {container} = render(<StoreCard store={mockStore} />);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass(
      'bg-surface',
      'rounded-lg',
      'overflow-hidden',
      'border',
      'border-border'
    );
  });

  it('renders all sections together', () => {
    render(<StoreCard store={mockStore} />);

    expect(screen.getByText('New York Flagship')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Opening Hours')).toBeInTheDocument();
    expect(screen.getByText('Available Services')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Get Directions'})).toBeInTheDocument();
  });

  it('formats address without optional fields', () => {
    const minimalStore: StoreLocation = {
      name: 'Minimal Store',
      addressLine1: '456 Main St',
      addressLine2: null,
      city: 'Boston',
      postalCode: null,
      country: 'USA',
      latitude: null,
      longitude: null,
      phone: null,
      email: null,
      hours: null,
      image: null,
      features: [],
    };
    render(<StoreCard store={minimalStore} />);

    expect(screen.getByText('Minimal Store')).toBeInTheDocument();
    expect(screen.getByText(/456 Main St/)).toBeInTheDocument();
    expect(screen.getByText(/Boston/)).toBeInTheDocument();
    expect(screen.getByText(/USA/)).toBeInTheDocument();
  });
});
