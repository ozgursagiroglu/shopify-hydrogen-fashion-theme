/** @jsxImportSource react */
import {describe, it, expect} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@test/utils/render';
import {ContactForm} from './ContactForm';
import {createMemoryRouter, RouterProvider} from 'react-router';

// Wrap component with router for useFetcher
function renderContactForm() {
  const routes = [
    {
      path: '/',
      element: <ContactForm />,
    },
    {
      path: '/api/contact',
      action: async () => ({success: true}),
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries: ['/'],
  });

  return render(<RouterProvider router={router} />);
}

describe('ContactForm', () => {
  it('renders all form fields', () => {
    renderContactForm();

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderContactForm();
    expect(screen.getByRole('button', {name: /send message/i})).toBeInTheDocument();
  });

  it('renders subject options', () => {
    renderContactForm();
    const select = screen.getByLabelText(/subject/i);

    expect(select).toBeInTheDocument();
    // Check that options exist
    expect(screen.getByText('General Inquiry')).toBeInTheDocument();
    expect(screen.getByText('Order Support')).toBeInTheDocument();
    expect(screen.getByText('Returns & Exchanges')).toBeInTheDocument();
  });

  describe('validation', () => {
    it('shows error when name is empty on submit', async () => {
      renderContactForm();

      const form = document.querySelector('form')!;
      const emailInput = screen.getByLabelText(/email/i);
      const subjectSelect = screen.getByLabelText(/subject/i);
      const messageInput = screen.getByLabelText(/message/i);

      fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
      fireEvent.change(subjectSelect, {target: {value: 'general'}});
      fireEvent.change(messageInput, {target: {value: 'Test message'}});
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Please enter your name')).toBeInTheDocument();
      });
    });

    it('shows error when email is invalid', async () => {
      renderContactForm();

      const form = document.querySelector('form')!;
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const subjectSelect = screen.getByLabelText(/subject/i);
      const messageInput = screen.getByLabelText(/message/i);

      fireEvent.change(nameInput, {target: {value: 'John Doe'}});
      fireEvent.change(emailInput, {target: {value: 'invalid-email'}});
      fireEvent.change(subjectSelect, {target: {value: 'general'}});
      fireEvent.change(messageInput, {target: {value: 'Test message'}});
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('shows error when subject is empty', async () => {
      renderContactForm();

      const form = document.querySelector('form')!;
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);

      fireEvent.change(nameInput, {target: {value: 'John Doe'}});
      fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
      fireEvent.change(messageInput, {target: {value: 'Test message'}});
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Please select a subject')).toBeInTheDocument();
      });
    });

    it('shows error when message is empty', async () => {
      renderContactForm();

      const form = document.querySelector('form')!;
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const subjectSelect = screen.getByLabelText(/subject/i);

      fireEvent.change(nameInput, {target: {value: 'John Doe'}});
      fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
      fireEvent.change(subjectSelect, {target: {value: 'general'}});
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Please enter your message')).toBeInTheDocument();
      });
    });
  });

  it('contains honeypot field for spam prevention', () => {
    renderContactForm();
    const honeypot = document.querySelector('input[name="website"]');
    expect(honeypot).toBeInTheDocument();
    expect(honeypot).toHaveClass('hidden');
  });

  it('applies custom className', () => {
    const routes = [
      {
        path: '/',
        element: <ContactForm className="custom-class" />,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
    });

    const {container} = render(<RouterProvider router={router} />);
    expect(container.querySelector('form')).toHaveClass('custom-class');
  });
});
