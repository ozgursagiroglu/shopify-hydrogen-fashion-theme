import type {ActionFunctionArgs} from 'react-router';
import {
  CUSTOMER_PURCHASED_PRODUCTS_QUERY,
  extractPurchasedVariantIds,
} from '~/graphql/customer-account/CustomerPurchasedProductsQuery';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {VARIANTS_TO_PRODUCTS_QUERY} from '~/graphql/storefront';

/**
 * Product Reviews API endpoint
 * Validates and processes review submissions
 * Only allows verified purchasers to submit reviews
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

    const productId = formData.get('productId');

    // 1. Check authentication
    const {customerAccount, storefront} = context;
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return Response.json(
        {
          success: false,
          error: 'Only verified purchasers can review this product',
        },
        {status: 401},
      );
    }

    // 2. Verify purchase - check if customer purchased this product
    try {
      // Get variant IDs from customer's orders
      const {data} = await customerAccount.query(
        CUSTOMER_PURCHASED_PRODUCTS_QUERY,
      );
      const purchasedVariantIds = extractPurchasedVariantIds(data);

      if (purchasedVariantIds.size === 0) {
        return Response.json(
          {success: false, error: 'Purchase this product to leave a review'},
          {status: 403},
        );
      }

      // Map variant IDs to product IDs
      const variantIdsArray = Array.from(purchasedVariantIds);
      const {nodes} = await storefront.query(VARIANTS_TO_PRODUCTS_QUERY, {
        variables: {ids: variantIdsArray},
      });

      const purchasedProductIds = new Set<string>();
      nodes?.forEach((node: any) => {
        if (node?.product?.id) {
          purchasedProductIds.add(node.product.id);
        }
      });

      // Check if this specific product was purchased
      if (!purchasedProductIds.has(productId as string)) {
        return Response.json(
          {success: false, error: 'Purchase this product to leave a review'},
          {status: 403},
        );
      }
    } catch (error) {
      // Error logging removed for production - implement proper logging service if needed
      return Response.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Unable to verify purchase',
        },
        {status: 500},
      );
    }

    // 3. Get customer ID for duplicate check
    let customerId: string;
    try {
      const {data: customerData} = await customerAccount.query(
        CUSTOMER_DETAILS_QUERY,
      );
      customerId = customerData.customer.id;
    } catch (error) {
      // Error logging removed for production - implement proper logging service if needed
      return Response.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Unable to retrieve customer details',
        },
        {status: 500},
      );
    }

    // 4. Check for existing review from this customer
    try {
      const existingReviewQuery = `#graphql
        query CheckExistingReview($type: String!, $first: Int!) {
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

      const {metaobjects} = await storefront.query(existingReviewQuery, {
        variables: {
          type: 'customer_review',
          first: 250,
        },
      });

      // Check if this customer has already reviewed this product
      const existingReview = metaobjects?.nodes?.find((node: any) => {
        const fields = node.fields;
        const reviewProductId = fields.find(
          (f: any) => f.key === 'product',
        )?.value;
        const reviewCustomerId = fields.find(
          (f: any) => f.key === 'customer_id',
        )?.value;

        return reviewProductId === productId && reviewCustomerId === customerId;
      });

      if (existingReview) {
        return Response.json(
          {success: false, error: 'You have already reviewed this product'},
          {status: 409},
        );
      }
    } catch (error) {
      return Response.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Unable to check for existing review',
        },
        {status: 500},
      );
    }

    const rating = formData.get('rating');
    const title = formData.get('title');
    const review = formData.get('review');
    const name = formData.get('name');
    const email = formData.get('email');

    // Validate required fields
    if (!productId || typeof productId !== 'string') {
      return Response.json(
        {success: false, error: 'Product ID is required'},
        {status: 400},
      );
    }

    const ratingNum = parseInt(rating as string, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return Response.json(
        {success: false, error: 'Rating must be between 1 and 5'},
        {status: 400},
      );
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return Response.json(
        {success: false, error: 'Review title is required'},
        {status: 400},
      );
    }

    if (!review || typeof review !== 'string' || !review.trim()) {
      return Response.json(
        {success: false, error: 'Review content is required'},
        {status: 400},
      );
    }

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

    // Create metaobject via Admin API
    const {admin} = context;

    if (!admin) {
      // Admin API not configured - implement proper logging service if needed
      return Response.json(
        {success: false, error: 'Review system not configured'},
        {status: 500},
      );
    }

    try {
      // Create customer_review metaobject
      const metaobject = await admin.createMetaobject('customer_review', {
        product: productId.trim(),
        rating: ratingNum,
        title: title.trim(),
        content: review.trim(),
        author_name: name.trim(),
        author_email: email.trim(),
        verified: true, // Verified purchase
        customer_id: customerId,
        status: 'approved', // Auto-approve verified purchases
        created_at: new Date().toISOString().split('T')[0], // Date format: YYYY-MM-DD
      });

      return Response.json({
        success: true,
        message: 'Review submitted successfully',
        reviewId: metaobject.id,
      });
    } catch (error) {
      // Error logging removed for production - implement proper logging service if needed
      return Response.json(
        {
          success: false,
          error:
            error instanceof Error ? error.message : 'Failed to submit review',
        },
        {status: 500},
      );
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
  return Response.json({message: 'Use POST to submit a review'});
}
