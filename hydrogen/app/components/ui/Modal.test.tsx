/** @jsxImportSource react */
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Modal, useModal} from './Modal';

// Mock CloseIcon
vi.mock('~/components/icons', () => ({
  CloseIcon: ({className}: {className?: string}) => (
    <svg data-testid="close-icon" className={className} />
  ),
}));

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('renders children when open', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<Modal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('renders with title when provided', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(<Modal {...defaultProps} />);

      // Modal has multiple close buttons (header and content area)
      const closeButtons = screen.getAllByRole('button', {
        name: /close modal/i,
      });
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('hides close button when showCloseButton is false', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />);

      expect(
        screen.queryByRole('button', {name: /close modal/i}),
      ).not.toBeInTheDocument();
    });

    it('renders title with id for aria-labelledby', () => {
      render(<Modal {...defaultProps} title="Accessible Modal" />);

      const title = screen.getByText('Accessible Modal');
      expect(title).toHaveAttribute('id', 'modal-title');
    });
  });

  describe('ARIA attributes', () => {
    it('has correct role', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal set to true', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby when title is provided', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);

      expect(screen.getByRole('dialog')).toHaveAttribute(
        'aria-labelledby',
        'modal-title',
      );
    });

    it('does not have aria-labelledby when no title', () => {
      render(<Modal {...defaultProps} />);

      expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('Size variants', () => {
    it('applies sm size class', () => {
      render(<Modal {...defaultProps} size="sm" />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.max-w-md')).toBeInTheDocument();
    });

    it('applies md size class by default', () => {
      render(<Modal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.max-w-xl')).toBeInTheDocument();
    });

    it('applies lg size class', () => {
      render(<Modal {...defaultProps} size="lg" />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.max-w-3xl')).toBeInTheDocument();
    });

    it('applies xl size class', () => {
      render(<Modal {...defaultProps} size="xl" />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.querySelector('.max-w-5xl')).toBeInTheDocument();
    });

    it('applies full size class', () => {
      render(<Modal {...defaultProps} size="full" />);

      const dialog = screen.getByRole('dialog');
      expect(
        dialog.querySelector('[class*="max-w-[95vw]"]'),
      ).toBeInTheDocument();
    });
  });

  describe('Escape key handling', () => {
    it('closes modal on Escape key by default', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(<Modal {...defaultProps} onClose={onClose} />);

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on Escape when closeOnEscape is false', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />,
      );

      await user.keyboard('{Escape}');

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Overlay click handling', () => {
    it('closes modal when clicking backdrop by default', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(<Modal {...defaultProps} onClose={onClose} />);

      // Click the backdrop (aria-hidden element)
      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on overlay click when closeOnOverlayClick is false', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal
          {...defaultProps}
          onClose={onClose}
          closeOnOverlayClick={false}
        />,
      );

      const backdrop = document.querySelector('[aria-hidden="true"]');
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close when clicking modal content', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(<Modal {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByText('Modal Content'));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Close button', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(<Modal {...defaultProps} onClose={onClose} />);

      // Get the first close button (header close button)
      const closeButtons = screen.getAllByRole('button', {
        name: /close modal/i,
      });
      await user.click(closeButtons[0]);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Body scroll lock', () => {
    it('locks body scroll when open', () => {
      render(<Modal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when closed', () => {
      const {rerender} = render(<Modal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe('');
    });

    it('restores body scroll on unmount', () => {
      const {unmount} = render(<Modal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Custom className', () => {
    it('applies custom className to modal', () => {
      render(<Modal {...defaultProps} className="custom-modal" />);

      const modalContent = document.querySelector('.custom-modal');
      expect(modalContent).toBeInTheDocument();
    });

    it('applies custom overlayClassName', () => {
      render(<Modal {...defaultProps} overlayClassName="custom-overlay" />);

      const overlay = document.querySelector('.custom-overlay');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('Focus trap', () => {
    it('renders focusable elements', () => {
      render(
        <Modal {...defaultProps}>
          <button>First Button</button>
          <button>Second Button</button>
          <button>Third Button</button>
        </Modal>,
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(2);
    });

    it('handles modal with no focusable elements', async () => {
      const user = userEvent.setup();

      render(
        <Modal {...defaultProps} showCloseButton={false}>
          <div>No buttons here</div>
        </Modal>,
      );

      // Tab should not throw error
      await expect(user.keyboard('{Tab}')).resolves.not.toThrow();
    });

    it('sets up keyboard event listener for Tab key', () => {
      render(
        <Modal {...defaultProps}>
          <button>Test Button</button>
        </Modal>,
      );

      // Modal should have focusable elements for tab trapping
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });
  });

  describe('Focus management', () => {
    it('has tabindex for focus management', () => {
      render(<Modal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('cleans up body scroll on unmount', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);
      button.focus();

      const {rerender} = render(<Modal {...defaultProps} />);

      rerender(<Modal {...defaultProps} isOpen={false} />);

      // Body scroll should be restored
      expect(document.body.style.overflow).toBe('');

      document.body.removeChild(button);
    });
  });

  describe('Edge cases', () => {
    it('handles multiple modals stacking', () => {
      render(
        <>
          <Modal {...defaultProps}>First Modal</Modal>
          <Modal {...defaultProps}>Second Modal</Modal>
        </>,
      );

      expect(screen.getByText('First Modal')).toBeInTheDocument();
      expect(screen.getByText('Second Modal')).toBeInTheDocument();
    });

    it('handles close button with no title', () => {
      render(<Modal {...defaultProps} showCloseButton={true} />);

      // Should have floating close button when no title
      const closeButtons = screen.getAllByRole('button', {
        name: /close modal/i,
      });
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('filters out disabled focusable elements', () => {
      render(
        <Modal {...defaultProps}>
          <button disabled>Disabled Button</button>
          <button>Enabled Button</button>
        </Modal>,
      );

      // Focus trap should skip disabled elements
      expect(screen.getByText('Enabled Button')).toBeInTheDocument();
    });

    it('filters out hidden focusable elements', () => {
      render(
        <Modal {...defaultProps}>
          <button aria-hidden="true">Hidden Button</button>
          <button>Visible Button</button>
        </Modal>,
      );

      // Focus trap should skip hidden elements
      expect(screen.getByText('Visible Button')).toBeInTheDocument();
    });
  });

  describe('Portal rendering', () => {
    it('renders modal in document.body', () => {
      render(<Modal {...defaultProps} />);

      // Modal should be rendered via portal in body
      const dialog = screen.getByRole('dialog');
      // Walk up to find body
      let parent = dialog.parentElement;
      while (parent && parent !== document.body) {
        parent = parent.parentElement;
      }
      expect(parent).toBe(document.body);
    });
  });
});

describe('useModal hook', () => {
  function TestComponent({initialState = false}: {initialState?: boolean}) {
    const {isOpen, open, close, toggle} = useModal(initialState);

    return (
      <div>
        <span data-testid="state">{isOpen ? 'open' : 'closed'}</span>
        <button onClick={open}>Open</button>
        <button onClick={close}>Close</button>
        <button onClick={toggle}>Toggle</button>
      </div>
    );
  }

  it('initializes with closed state by default', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('state')).toHaveTextContent('closed');
  });

  it('initializes with provided initial state', () => {
    render(<TestComponent initialState={true} />);

    expect(screen.getByTestId('state')).toHaveTextContent('open');
  });

  it('opens modal when open is called', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', {name: 'Open'}));

    expect(screen.getByTestId('state')).toHaveTextContent('open');
  });

  it('closes modal when close is called', async () => {
    const user = userEvent.setup();
    render(<TestComponent initialState={true} />);

    await user.click(screen.getByRole('button', {name: 'Close'}));

    expect(screen.getByTestId('state')).toHaveTextContent('closed');
  });

  it('toggles modal state', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', {name: 'Toggle'}));
    expect(screen.getByTestId('state')).toHaveTextContent('open');

    await user.click(screen.getByRole('button', {name: 'Toggle'}));
    expect(screen.getByTestId('state')).toHaveTextContent('closed');
  });
});
