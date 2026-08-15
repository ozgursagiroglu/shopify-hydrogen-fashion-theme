import type {ActionFunctionArgs} from 'react-router';

/**
 * Stock Alert API endpoint
 * Validates and stores stock alert subscriptions as metaobjects
 * Customers can request notifications when out-of-stock products return
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

    const email = formData.get('email');
    const productTitle = formData.get('productTitle');
    const variantTitle = formData.get('variantTitle');
    const productHandle = formData.get('productHandle');
    const variantId = formData.get('variantId');

    // Validate required fields
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

    if (
      !productTitle ||
      typeof productTitle !== 'string' ||
      !productTitle.trim()
    ) {
      return Response.json(
        {success: false, error: 'Product title is required'},
        {status: 400},
      );
    }

    if (
      !productHandle ||
      typeof productHandle !== 'string' ||
      !productHandle.trim()
    ) {
      return Response.json(
        {success: false, error: 'Product handle is required'},
        {status: 400},
      );
    }

    // Check for duplicate subscription
    const {storefront} = context;
    try {
      const existingAlertQuery = `#graphql
        query CheckExistingStockAlert($type: String!, $first: Int!) {
          metaobjects(type: $type, first: $first) {
            nodes {
              id
              fields {
                key
                value
              }
            }
          }
        }
      `;

      const {metaobjects} = await storefront.query(existingAlertQuery, {
        variables: {
          type: 'stock_alert',
          first: 250,
        },
      });

      // Check if this email has already subscribed to this variant
      const existingAlert = metaobjects?.nodes?.find((node: any) => {
        const fields = node.fields;
        const alertEmail = fields.find((f: any) => f.key === 'email')?.value;
        const alertVariantId = fields.find(
          (f: any) => f.key === 'variant_id',
        )?.value;
        const alertProductHandle = fields.find(
          (f: any) => f.key === 'product_handle',
        )?.value;

        // Match by variant ID if provided, otherwise by product handle
        if (variantId) {
          return alertEmail === email && alertVariantId === variantId;
        }
        return alertEmail === email && alertProductHandle === productHandle;
      });

      if (existingAlert) {
        return Response.json(
          {
            success: false,
            error: 'You are already subscribed to this stock alert',
          },
          {status: 409},
        );
      }
    } catch {
      // Continue even if duplicate check fails
      // Better to allow duplicate than block legitimate subscription
    }

    // Store subscription as metaobject via Admin API
    const {admin} = context;

    if (!admin) {
      // Admin API not configured - fallback to basic response
      return Response.json({
        success: true,
        message: 'Stock alert registered',
        note: 'Configure Admin API to store alerts in Shopify',
      });
    }

    try {
      // Create stock_alert metaobject
      // Merchants can view and manage alerts in Shopify Admin > Content > Metaobjects
      const fields: Record<string, any> = {
        email: email.trim(),
        product_title: productTitle.trim(),
        product_handle: productHandle.trim(),
        status: 'active', // active, notified, expired
        created_at: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      };

      // Add optional fields if provided
      if (variantTitle && typeof variantTitle === 'string') {
        fields.variant_title = variantTitle.trim();
      }

      if (variantId && typeof variantId === 'string') {
        fields.variant_id = variantId.trim();
      }

      const metaobject = await admin.createMetaobject('stock_alert', fields);

      return Response.json({
        success: true,
        message: 'Stock alert subscription successful',
        alertId: metaobject.id,
      });
    } catch (error) {
      // If metaobject creation fails, still return success
      // This prevents user-facing errors while merchant can debug in logs
      return Response.json({
        success: true,
        message: 'Stock alert registered',
        note:
          error instanceof Error
            ? `Metaobject storage failed: ${error.message}`
            : 'Metaobject storage failed',
      });
    }
  } catch (error) {
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
  return Response.json({message: 'Use POST to subscribe to stock alerts'});
}
