/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ProductImage} from './ProductImage';
import type {ProductVariantFragment} from 'storefrontapi.generated';

describe('ProductImage', () => {
  const mockImage: ProductVariantFragment['image'] = {
    id: 'image-123',
    url: 'https://example.com/image.jpg',
    altText: 'Test product image',
    width: 800,
    height: 1067,
  };

  describe('Rendering', () => {
    it('renders image when provided', () => {
      render(<ProductImage image={mockImage} />);

      const image = screen.getByTestId('image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('renders with custom alt text', () => {
      render(<ProductImage image={mockImage} />);

      const image = screen.getByTestId('image');
      expect(image).toHaveAttribute('alt', 'Test product image');
    });

    it('uses default alt text when altText is null', () => {
      const imageWithoutAlt: ProductVariantFragment['image'] = {
        ...mockImage,
        altText: null,
      };

      render(<ProductImage image={imageWithoutAlt} />);

      const image = screen.getByTestId('image');
      expect(image).toHaveAttribute('alt', 'Product Image');
    });

    it('renders empty container when image is null', () => {
      const {container} = render(<ProductImage image={null} />);

      const emptyContainer = container.querySelector('.product-image');
      expect(emptyContainer).toBeInTheDocument();
      expect(screen.queryByTestId('image')).not.toBeInTheDocument();
    });

    it('renders empty container when image is undefined', () => {
      const {container} = render(<ProductImage image={undefined} />);

      const emptyContainer = container.querySelector('.product-image');
      expect(emptyContainer).toBeInTheDocument();
      expect(screen.queryByTestId('image')).not.toBeInTheDocument();
    });
  });

  describe('Image properties', () => {
    it('passes correct image url', () => {
      render(<ProductImage image={mockImage} />);

      const image = screen.getByTestId('image');
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('handles missing altText gracefully', () => {
      const imageWithoutAlt: ProductVariantFragment['image'] = {
        id: 'image-123',
        url: 'https://example.com/image.jpg',
        altText: null,
        width: 800,
        height: 1067,
      };

      render(<ProductImage image={imageWithoutAlt} />);

      const image = screen.getByTestId('image');
      expect(image).toHaveAttribute('alt', 'Product Image');
    });
  });

  describe('Container classes', () => {
    it('applies product-image class to container', () => {
      const {container} = render(<ProductImage image={mockImage} />);

      const imageContainer = container.querySelector('.product-image');
      expect(imageContainer).toBeInTheDocument();
    });

    it('applies product-image class even when no image', () => {
      const {container} = render(<ProductImage image={null} />);

      const imageContainer = container.querySelector('.product-image');
      expect(imageContainer).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles image with empty url', () => {
      const imageWithEmptyUrl: ProductVariantFragment['image'] = {
        id: 'image-123',
        url: '',
        altText: 'Test',
        width: 800,
        height: 1067,
      };

      render(<ProductImage image={imageWithEmptyUrl} />);

      const image = screen.getByTestId('image');
      expect(image).toHaveAttribute('src', '');
    });

    it('handles image with special characters in altText', () => {
      const imageWithSpecialChars: ProductVariantFragment['image'] = {
        id: 'image-123',
        url: 'https://example.com/image.jpg',
        altText: 'Product & "Special" <Characters>',
        width: 800,
        height: 1067,
      };

      render(<ProductImage image={imageWithSpecialChars} />);

      const image = screen.getByTestId('image');
      expect(image).toHaveAttribute('alt', 'Product & "Special" <Characters>');
    });

    it('handles image with very long altText', () => {
      const longAltText = 'A'.repeat(200);
      const imageWithLongAlt: ProductVariantFragment['image'] = {
        id: 'image-123',
        url: 'https://example.com/image.jpg',
        altText: longAltText,
        width: 800,
        height: 1067,
      };

      render(<ProductImage image={imageWithLongAlt} />);

      const image = screen.getByTestId('image');
      expect(image).toHaveAttribute('alt', longAltText);
    });
  });

  describe('Different image dimensions', () => {
    it('handles square images', () => {
      const squareImage: ProductVariantFragment['image'] = {
        id: 'image-square',
        url: 'https://example.com/square.jpg',
        altText: 'Square image',
        width: 800,
        height: 800,
      };

      render(<ProductImage image={squareImage} />);

      const image = screen.getByTestId('image');
      expect(image).toBeInTheDocument();
    });

    it('handles wide images', () => {
      const wideImage: ProductVariantFragment['image'] = {
        id: 'image-wide',
        url: 'https://example.com/wide.jpg',
        altText: 'Wide image',
        width: 1600,
        height: 800,
      };

      render(<ProductImage image={wideImage} />);

      const image = screen.getByTestId('image');
      expect(image).toBeInTheDocument();
    });

    it('handles tall images', () => {
      const tallImage: ProductVariantFragment['image'] = {
        id: 'image-tall',
        url: 'https://example.com/tall.jpg',
        altText: 'Tall image',
        width: 600,
        height: 1200,
      };

      render(<ProductImage image={tallImage} />);

      const image = screen.getByTestId('image');
      expect(image).toBeInTheDocument();
    });
  });
});
