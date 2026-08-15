/** @jsxImportSource react */
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Accordion,
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './Accordion';

// Mock PlusIcon
vi.mock('~/components/icons', () => ({
  PlusIcon: ({className, strokeWidth}: {className?: string; strokeWidth?: number}) => (
    <svg data-testid="plus-icon" className={className} data-stroke-width={strokeWidth} />
  ),
}));

describe('AccordionRoot', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      expect(screen.getByText('Section 1')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(
        <AccordionRoot className="custom-class">
          <div>Test</div>
        </AccordionRoot>,
      );

      const root = container.querySelector('.custom-class');
      expect(root).toBeInTheDocument();
    });

    it('applies divide-y styles', () => {
      const {container} = render(
        <AccordionRoot>
          <div>Test</div>
        </AccordionRoot>,
      );

      const root = container.querySelector('.divide-y');
      expect(root).toBeInTheDocument();
    });
  });

  describe('Default Open State', () => {
    it('opens items specified in defaultOpen', () => {
      render(
        <AccordionRoot defaultOpen={['item-1']}>
          <AccordionItem id="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const trigger = screen.getByRole('button', {name: /section 1/i});
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('keeps items closed when not in defaultOpen', () => {
      render(
        <AccordionRoot defaultOpen={[]}>
          <AccordionItem id="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const trigger = screen.getByRole('button', {name: /section 1/i});
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens multiple items when defaultOpen has multiple ids', () => {
      render(
        <AccordionRoot defaultOpen={['item-1', 'item-2']} allowMultiple>
          <AccordionItem id="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem id="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const trigger1 = screen.getByRole('button', {name: /section 1/i});
      const trigger2 = screen.getByRole('button', {name: /section 2/i});
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Allow Multiple', () => {
    it('closes previous item when opening another by default', async () => {
      const user = userEvent.setup();

      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem id="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const trigger1 = screen.getByRole('button', {name: /section 1/i});
      const trigger2 = screen.getByRole('button', {name: /section 2/i});

      await user.click(trigger1);
      expect(trigger1).toHaveAttribute('aria-expanded', 'true');

      await user.click(trigger2);
      expect(trigger1).toHaveAttribute('aria-expanded', 'false');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });

    it('allows multiple items open when allowMultiple is true', async () => {
      const user = userEvent.setup();

      render(
        <AccordionRoot allowMultiple>
          <AccordionItem id="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem id="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const trigger1 = screen.getByRole('button', {name: /section 1/i});
      const trigger2 = screen.getByRole('button', {name: /section 2/i});

      await user.click(trigger1);
      await user.click(trigger2);

      expect(trigger1).toHaveAttribute('aria-expanded', 'true');
      expect(trigger2).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Error Handling', () => {
    it('throws error when Accordion components used outside AccordionRoot', () => {
      // Suppress console errors for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(
          <AccordionItem id="item-1">
            <div>Test</div>
          </AccordionItem>,
        );
      }).toThrow('Accordion components must be used within an AccordionRoot');

      spy.mockRestore();
    });
  });
});

describe('AccordionItem', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      expect(screen.getByText('Trigger')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(
        <AccordionRoot>
          <AccordionItem id="item-1" className="custom-item">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const item = container.querySelector('.custom-item');
      expect(item).toBeInTheDocument();
    });

    it('sets data-state to closed by default', () => {
      const {container} = render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const item = container.querySelector('[data-state="closed"]');
      expect(item).toBeInTheDocument();
    });

    it('sets data-state to open when item is open', () => {
      const {container} = render(
        <AccordionRoot defaultOpen={['item-1']}>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const item = container.querySelector('[data-state="open"]');
      expect(item).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('throws error when AccordionTrigger used outside AccordionItem', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(
          <AccordionRoot>
            <AccordionTrigger>Trigger</AccordionTrigger>
          </AccordionRoot>,
        );
      }).toThrow('AccordionTrigger/Content must be used within an AccordionItem');

      spy.mockRestore();
    });
  });
});

describe('AccordionTrigger', () => {
  describe('Rendering', () => {
    it('renders as a button', () => {
      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Click me</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const button = screen.getByRole('button', {name: /click me/i});
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe('BUTTON');
    });

    it('renders children text', () => {
      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Section Header</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      expect(screen.getByText('Section Header')).toBeInTheDocument();
    });

    it('renders PlusIcon', () => {
      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger className="custom-trigger">Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-trigger');
    });
  });

  describe('ARIA Attributes', () => {
    it('has aria-expanded false when closed', () => {
      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-expanded true when open', () => {
      render(
        <AccordionRoot defaultOpen={['item-1']}>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-controls pointing to content', () => {
      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-controls', 'accordion-content-item-1');
    });
  });

  describe('Interactions', () => {
    it('toggles accordion when clicked', async () => {
      const user = userEvent.setup();

      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('rotates icon when open', async () => {
      const user = userEvent.setup();

      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const icon = screen.getByTestId('plus-icon');
      let iconClasses = icon.getAttribute('class') || '';
      expect(iconClasses).not.toContain('rotate-45');

      await user.click(screen.getByRole('button'));
      iconClasses = icon.getAttribute('class') || '';
      expect(iconClasses).toContain('rotate-45');
    });
  });

  describe('Focus Styles', () => {
    it('has focus-visible ring styles', () => {
      render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('focus:outline-none');
      expect(button.className).toContain('focus-visible:ring-2');
    });
  });
});

describe('AccordionContent', () => {
  describe('Rendering', () => {
    it('renders children content', () => {
      render(
        <AccordionRoot defaultOpen={['item-1']}>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>This is the content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      expect(screen.getByText('This is the content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const {container} = render(
        <AccordionRoot defaultOpen={['item-1']}>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent className="custom-content">Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const content = container.querySelector('.custom-content');
      expect(content).toBeInTheDocument();
    });

    it('has correct id for aria-controls', () => {
      render(
        <AccordionRoot defaultOpen={['item-1']}>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const content = document.getElementById('accordion-content-item-1');
      expect(content).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('has role region', () => {
      render(
        <AccordionRoot defaultOpen={['item-1']}>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const content = screen.getByRole('region');
      expect(content).toBeInTheDocument();
    });

    it('has aria-labelledby pointing to trigger', () => {
      render(
        <AccordionRoot defaultOpen={['item-1']}>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const content = screen.getByRole('region');
      expect(content).toHaveAttribute('aria-labelledby', 'accordion-trigger-item-1');
    });
  });

  describe('Visibility States', () => {
    it('applies grid-rows-[0fr] and opacity-0 when closed', () => {
      const {container} = render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const content = container.querySelector('[id="accordion-content-item-1"]');
      expect(content?.className).toContain('grid-rows-[0fr]');
      expect(content?.className).toContain('opacity-0');
    });

    it('applies grid-rows-[1fr] and opacity-100 when open', () => {
      const {container} = render(
        <AccordionRoot defaultOpen={['item-1']}>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const content = container.querySelector('[id="accordion-content-item-1"]');
      expect(content?.className).toContain('grid-rows-[1fr]');
      expect(content?.className).toContain('opacity-100');
    });
  });

  describe('Animation', () => {
    it('has transition styles', () => {
      const {container} = render(
        <AccordionRoot>
          <AccordionItem id="item-1">
            <AccordionTrigger>Trigger</AccordionTrigger>
            <AccordionContent>Content</AccordionContent>
          </AccordionItem>
        </AccordionRoot>,
      );

      const content = container.querySelector('[id="accordion-content-item-1"]');
      expect(content?.className).toContain('transition-all');
      expect(content?.className).toContain('duration-300');
    });
  });
});

describe('Accordion Compound Component', () => {
  it('exposes all subcomponents', () => {
    expect(Accordion.Root).toBeDefined();
    expect(Accordion.Item).toBeDefined();
    expect(Accordion.Trigger).toBeDefined();
    expect(Accordion.Content).toBeDefined();
  });

  it('works with compound component API', () => {
    render(
      <Accordion.Root>
        <Accordion.Item id="item-1">
          <Accordion.Trigger>Question 1</Accordion.Trigger>
          <Accordion.Content>Answer 1</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 1')).toBeInTheDocument();
  });
});

describe('Keyboard Navigation', () => {
  it('navigates to next item with ArrowDown', async () => {
    const user = userEvent.setup();

    render(
      <AccordionRoot>
        <AccordionItem id="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem id="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
        <AccordionItem id="item-3">
          <AccordionTrigger>Section 3</AccordionTrigger>
          <AccordionContent>Content 3</AccordionContent>
        </AccordionItem>
      </AccordionRoot>,
    );

    const trigger1 = screen.getByRole('button', {name: /section 1/i});
    const trigger2 = screen.getByRole('button', {name: /section 2/i});

    trigger1.focus();
    expect(trigger1).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(trigger2).toHaveFocus();
  });

  it('navigates to previous item with ArrowUp', async () => {
    const user = userEvent.setup();

    render(
      <AccordionRoot>
        <AccordionItem id="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem id="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </AccordionRoot>,
    );

    const trigger1 = screen.getByRole('button', {name: /section 1/i});
    const trigger2 = screen.getByRole('button', {name: /section 2/i});

    trigger2.focus();
    expect(trigger2).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(trigger1).toHaveFocus();
  });

  it('wraps around to first item when pressing ArrowDown on last item', async () => {
    const user = userEvent.setup();

    render(
      <AccordionRoot>
        <AccordionItem id="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem id="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </AccordionRoot>,
    );

    const trigger1 = screen.getByRole('button', {name: /section 1/i});
    const trigger2 = screen.getByRole('button', {name: /section 2/i});

    trigger2.focus();
    await user.keyboard('{ArrowDown}');
    expect(trigger1).toHaveFocus();
  });

  it('wraps around to last item when pressing ArrowUp on first item', async () => {
    const user = userEvent.setup();

    render(
      <AccordionRoot>
        <AccordionItem id="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem id="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </AccordionRoot>,
    );

    const trigger1 = screen.getByRole('button', {name: /section 1/i});
    const trigger2 = screen.getByRole('button', {name: /section 2/i});

    trigger1.focus();
    await user.keyboard('{ArrowUp}');
    expect(trigger2).toHaveFocus();
  });

  it('focuses first item with Home key', async () => {
    const user = userEvent.setup();

    render(
      <AccordionRoot>
        <AccordionItem id="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem id="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
        <AccordionItem id="item-3">
          <AccordionTrigger>Section 3</AccordionTrigger>
          <AccordionContent>Content 3</AccordionContent>
        </AccordionItem>
      </AccordionRoot>,
    );

    const trigger1 = screen.getByRole('button', {name: /section 1/i});
    const trigger3 = screen.getByRole('button', {name: /section 3/i});

    trigger3.focus();
    await user.keyboard('{Home}');
    expect(trigger1).toHaveFocus();
  });

  it('focuses last item with End key', async () => {
    const user = userEvent.setup();

    render(
      <AccordionRoot>
        <AccordionItem id="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem id="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
        <AccordionItem id="item-3">
          <AccordionTrigger>Section 3</AccordionTrigger>
          <AccordionContent>Content 3</AccordionContent>
        </AccordionItem>
      </AccordionRoot>,
    );

    const trigger1 = screen.getByRole('button', {name: /section 1/i});
    const trigger3 = screen.getByRole('button', {name: /section 3/i});

    trigger1.focus();
    await user.keyboard('{End}');
    expect(trigger3).toHaveFocus();
  });

  it('does not interfere with other key presses', async () => {
    const user = userEvent.setup();

    render(
      <AccordionRoot>
        <AccordionItem id="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem id="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </AccordionRoot>,
    );

    const trigger1 = screen.getByRole('button', {name: /section 1/i});

    trigger1.focus();

    // Pressing other keys should not change focus
    await user.keyboard('{A}');
    expect(trigger1).toHaveFocus();

    await user.keyboard('{Tab}');
    // Tab will move focus to next focusable element (which is trigger2 in this test)
  });

  it('has proper ID on trigger for aria-labelledby', () => {
    render(
      <AccordionRoot>
        <AccordionItem id="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </AccordionRoot>,
    );

    const trigger = screen.getByRole('button', {name: /section 1/i});
    expect(trigger).toHaveAttribute('id', 'accordion-trigger-item-1');
  });
});
