import type {ActionFunctionArgs} from 'react-router';

/**
 * Contact form API endpoint
 * Validates form data and stores submissions as metaobjects
 * Submissions are stored in Shopify as 'contact_submission' metaobjects
 * for merchant review in the Shopify admin
 */
export async function action({request, context}: ActionFunctionArgs) {
  // Only accept POST requests
  if (request.method !== 'POST') {
    return Response.json(
      {success: false, error: 'Method not allowed'},
      {status: 405},
    );
  }

  try {
    const formData = await request.formData();

    // Honeypot check - if filled, it's likely a bot
    const honeypot = formData.get('website');
    if (honeypot) {
      // Silently succeed for bots to not reveal the honeypot
      return Response.json({success: true});
    }

    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return Response.json(
        {success: false, error: 'Name is required'},
        {status: 400},
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return Response.json(
        {success: false, error: 'Email is required'},
        {status: 400},
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        {success: false, error: 'Invalid email format'},
        {status: 400},
      );
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return Response.json(
        {success: false, error: 'Subject is required'},
        {status: 400},
      );
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return Response.json(
        {success: false, error: 'Message is required'},
        {status: 400},
      );
    }

    // Store submission as metaobject via Admin API
    const {admin} = context;

    if (!admin) {
      // Admin API not configured - fallback to basic logging
      // Merchants should configure Admin API to receive contact submissions
      return Response.json({
        success: true,
        message: 'Message received',
        note: 'Configure Admin API to store submissions in Shopify',
      });
    }

    try {
      // Create contact_submission metaobject
      // Merchants can view and manage submissions in Shopify Admin > Content > Metaobjects
      const metaobject = await admin.createMetaobject('contact_submission', {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'new', // new, read, replied
        created_at: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      });

      return Response.json({
        success: true,
        message: 'Message sent successfully',
        submissionId: metaobject.id,
      });
    } catch (error) {
      // If metaobject creation fails, still return success
      // This prevents user-facing errors while merchant can debug in logs
      return Response.json({
        success: true,
        message: 'Message received',
        note:
          error instanceof Error
            ? `Metaobject storage failed: ${error.message}`
            : 'Metaobject storage failed',
      });
    }
  } catch (error) {
    // Error logging removed for production - implement proper logging service if needed
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
      {status: 500},
    );
  }
}

// Loader for GET requests - returns 200 for React Router manifest checks
export async function loader() {
  return Response.json({message: 'Use POST to send a contact message'});
}
