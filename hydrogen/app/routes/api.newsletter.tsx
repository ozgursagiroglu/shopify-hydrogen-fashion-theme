import type {ActionFunctionArgs} from 'react-router';

/**
 * Newsletter subscription API endpoint
 * Creates a Shopify customer with email marketing consent
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
    const email = formData.get('email');

    // Validate email
    if (!email || typeof email !== 'string') {
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

    // Create customer with marketing consent
    const {customerCreate} = await context.storefront.mutate(
      CUSTOMER_CREATE_MUTATION,
      {
        variables: {
          input: {
            email,
            acceptsMarketing: true,
            // Generate a random password - user can reset if they want a full account
            password: generateRandomPassword(),
          },
        },
      },
    );

    // Check for errors
    if (customerCreate?.customerUserErrors?.length) {
      const error = customerCreate.customerUserErrors[0];

      // Handle "already exists" gracefully - still a success for newsletter
      if (error.code === 'TAKEN' || error.code === 'CUSTOMER_DISABLED') {
        // Update existing customer's marketing preference
        // Note: This requires the customer to be logged in, so we just return success
        return Response.json({
          success: true,
          message: 'already_subscribed',
        });
      }

      return Response.json(
        {success: false, error: error.message},
        {status: 400},
      );
    }

    return Response.json({
      success: true,
      message: 'subscribed',
    });
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
  return Response.json({message: 'Use POST to subscribe'});
}

/**
 * Generate a random password for the customer account
 * The user won't need this unless they want to create a full account
 */
function generateRandomPassword(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        acceptsMarketing
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;
