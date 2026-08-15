/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {ProductGallery, type GalleryMedia} from './ProductGallery';

// Mock icons
vi.mock('~/components/icons', () => ({
  ChevronLeftIcon: () => <svg data-testid="chevron-left" />,
  ChevronRightIcon: () => <svg data-testid="chevron-right" />,
  PlayIcon: () => <svg data-testid="play-icon" />,
}));

describe('ProductGallery', () => {
  const mockImages: GalleryMedia[] = [
    {
      __typename: 'MediaImage',
      id: 'image-1',
      image: {
        id: 'img-1',
        url: 'https://example.com/image1.jpg',
        altText: 'Image 1',
        width: 800,
        height: 1067,
      },
    },
    {
      __typename: 'MediaImage',
      id: 'image-2',
      image: {
        id: 'img-2',
        url: 'https://example.com/image2.jpg',
        altText: 'Image 2',
        width: 800,
        height: 1067,
      },
    },
    {
      __typename: 'MediaImage',
      id: 'image-3',
      image: {
        id: 'img-3',
        url: 'https://example.com/image3.jpg',
        altText: 'Image 3',
        width: 800,
        height: 1067,
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders main image', () => {
      render(<ProductGallery media={mockImages} productTitle="Test Product" />);

      const images = screen.getAllByTestId('image');
      expect(images.length).toBeGreaterThan(0);
    });

    it('renders thumbnails when multiple images', () => {
      render(<ProductGallery media={mockImages} productTitle="Test Product" />);

      const prevButton = screen.getByLabelText(/previous media/i);
      const nextButton = screen.getByLabelText(/next media/i);
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it('does not render navigation for single image', () => {
      render(<ProductGallery media={[mockImages[0]]} productTitle="Test Product" />);

      expect(screen.queryByLabelText(/previous media/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/next media/i)).not.toBeInTheDocument();
    });

    it('renders counter when multiple images', () => {
      render(<ProductGallery media={mockImages} productTitle="Test Product" />);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('renders empty state when no media', () => {
      render(<ProductGallery media={[]} productTitle="Test Product" />);

      expect(screen.getByText('No media available')).toBeInTheDocument();
    });

    it('applies correct styling to empty state', () => {
      const {container} = render(<ProductGallery media={[]} productTitle="Test Product" />);

      const emptyState = container.querySelector('.aspect-product.bg-surface-alt');
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to next image when next button clicked', async () => {
      const user = userEvent.setup();
      render(<ProductGallery media={mockImages} productTitle="Test Product" />);

      const nextButton = screen.getByLabelText(/next media/i);
      await user.click(nextButton);

      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('navigates to previous image when prev button clicked', async () => {
      const user = userEvent.setup();
      render(<ProductGallery media={mockImages} productTitle="Test Product" />);

      const prevButton = screen.getByLabelText(/previous media/i);
      await user.click(prevButton);

      // Should wrap to last image
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });

    it('wraps to first image from last image', async () => {
      const user = userEvent.setup();
      render(<ProductGallery media={mockImages} productTitle="Test Product" />);

      const nextButton = screen.getByLabelText(/next media/i);
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('allows clicking thumbnails to select image', async () => {
      const user = userEvent.setup();
      render(<ProductGallery media={mockImages} productTitle="Test Product" />);

      const thumbnails = screen.getAllByRole('button', {name: /View Test Product/i});
      await user.click(thumbnails[2]);

      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });
  });

  describe('Thumbnail selection', () => {
    it('applies active border to selected thumbnail', async () => {
      userEvent.setup();
      const {container} = render(
        <ProductGallery media={mockImages} productTitle="Test Product" />
      );

      const activeBorder = container.querySelector('.border-primary');
      expect(activeBorder).toBeInTheDocument();
    });

    it('applies aria-current to selected thumbnail', () => {
      render(<ProductGallery media={mockImages} productTitle="Test Product" />);

      // The component sets aria-current="true" (string value)
      const thumbnails = screen.getAllByRole('button', {name: /View Test Product/i});
      const selectedThumbnail = thumbnails.find(btn => btn.getAttribute('aria-current') === 'true');
      expect(selectedThumbnail).toBeInTheDocument();
    });
  });

  describe('Video support', () => {
    it('renders video element for VIDEO type', () => {
      const videoMedia: GalleryMedia[] = [
        {
          __typename: 'Video',
          id: 'video-1',
          sources: [{url: 'https://example.com/video.mp4'}],
          previewImage: {
            url: 'https://example.com/preview.jpg',
            altText: 'Video preview',
          },
        },
      ];

      const {container} = render(
        <ProductGallery media={videoMedia} productTitle="Test Product" />
      );

      const video = container.querySelector('video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', 'https://example.com/video.mp4');
    });

    it('renders iframe for EXTERNAL_VIDEO type', () => {
      const externalVideoMedia: GalleryMedia[] = [
        {
          __typename: 'ExternalVideo',
          id: 'video-external',
          embedUrl: 'https://www.youtube.com/embed/abc123',
          previewImage: {
            url: 'https://example.com/preview.jpg',
            altText: 'Video preview',
          },
        },
      ];

      const {container} = render(
        <ProductGallery media={externalVideoMedia} productTitle="Test Product" />
      );

      const iframe = container.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/abc123');
    });

    it('shows play icon on video thumbnails', () => {
      const mixedMedia: GalleryMedia[] = [
        mockImages[0],
        {
          __typename: 'Video',
          id: 'video-1',
          sources: [{url: 'https://example.com/video.mp4'}],
          previewImage: {
            url: 'https://example.com/preview.jpg',
            altText: 'Video preview',
          },
        },
      ];

      render(<ProductGallery media={mixedMedia} productTitle="Test Product" />);

      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    });
  });

  describe('Legacy images support', () => {
    it('supports images array prop', () => {
      const legacyImages = [
        {
          id: 'img-1',
          url: 'https://example.com/image1.jpg',
          altText: 'Image 1',
          width: 800,
          height: 1067,
        },
        {
          id: 'img-2',
          url: 'https://example.com/image2.jpg',
          altText: 'Image 2',
          width: 800,
          height: 1067,
        },
      ];

      // Don't pass media to use legacy images support
      render(<ProductGallery images={legacyImages} media={undefined as any} productTitle="Test Product" />);

      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      const {container} = render(
        <ProductGallery media={mockImages} productTitle="Test Product" className="custom-class" />
      );

      const root = container.querySelector('.custom-class');
      expect(root).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for navigation buttons', () => {
      render(<ProductGallery media={mockImages} productTitle="Test Product" />);

      expect(screen.getByLabelText('Previous media')).toBeInTheDocument();
      expect(screen.getByLabelText('Next media')).toBeInTheDocument();
    });

    it('has accessible labels for thumbnails', () => {
      render(<ProductGallery media={mockImages} productTitle="Test Product" />);

      expect(screen.getByLabelText(/View Test Product image 1/i)).toBeInTheDocument();
    });

    it('indicates current thumbnail with aria-current', () => {
      render(<ProductGallery media={mockImages} productTitle="Test Product" />);

      // The component sets aria-current="true" (string value)
      const thumbnails = screen.getAllByRole('button', {name: /View Test Product/i});
      const currentThumbnail = thumbnails.find(btn => btn.getAttribute('aria-current') === 'true');
      expect(currentThumbnail).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('applies flex layout classes', () => {
      const {container} = render(
        <ProductGallery media={mockImages} productTitle="Test Product" />
      );

      const layout = container.querySelector('.flex.flex-col-reverse.md\\:flex-row');
      expect(layout).toBeInTheDocument();
    });

    it('applies aspect ratio to main image', () => {
      const {container} = render(
        <ProductGallery media={mockImages} productTitle="Test Product" />
      );

      const aspectRatio = container.querySelector('.aspect-product');
      expect(aspectRatio).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles media without alt text', () => {
      const mediaWithoutAlt: GalleryMedia[] = [
        {
          __typename: 'MediaImage',
          id: 'image-1',
          image: {
            id: 'img-1',
            url: 'https://example.com/image1.jpg',
            altText: null,
            width: 800,
            height: 1067,
          },
        },
      ];

      render(<ProductGallery media={mediaWithoutAlt} productTitle="Test Product" />);

      const image = screen.getByTestId('image');
      expect(image).toHaveAttribute('alt', 'Test Product');
    });

    it('handles undefined media type', () => {
      const mediaWithoutType: GalleryMedia[] = [
        {
          id: 'image-1',
          image: {
            id: 'img-1',
            url: 'https://example.com/image1.jpg',
            altText: 'Image 1',
            width: 800,
            height: 1067,
          },
        },
      ];

      render(<ProductGallery media={mediaWithoutType} productTitle="Test Product" />);

      expect(screen.getByTestId('image')).toBeInTheDocument();
    });

    it('handles unsupported media types', () => {
      const unsupportedMedia: GalleryMedia[] = [
        {
          __typename: 'MODEL_3D' as any,
          id: 'model-1',
        },
      ];

      render(<ProductGallery media={unsupportedMedia} productTitle="Test Product" />);

      expect(screen.getByText('Unsupported media type')).toBeInTheDocument();
    });
  });

  describe('Thumbnail visibility', () => {
    it('hides thumbnails for single image', () => {
      const {container} = render(
        <ProductGallery media={[mockImages[0]]} productTitle="Test Product" />
      );

      const thumbnails = container.querySelectorAll('button[aria-label*="View"]');
      expect(thumbnails.length).toBe(0);
    });

    it('shows thumbnails for multiple images', () => {
      const {container} = render(
        <ProductGallery media={mockImages} productTitle="Test Product" />
      );

      const thumbnails = container.querySelectorAll('button[aria-label*="View"]');
      expect(thumbnails.length).toBe(mockImages.length);
    });
  });
});
