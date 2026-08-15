import type {Route} from './+types/api.product.$handle';
import {QUICKVIEW_PRODUCT_QUERY} from '~/graphql/storefront';

export async function loader({params, context}: Route.LoaderArgs) {
  const {handle} = params;

  if (!handle) {
    throw new Response('Product handle is required', {status: 400});
  }

  const {product} = await context.storefront.query(QUICKVIEW_PRODUCT_QUERY, {
    variables: {handle},
  });

  if (!product) {
    throw new Response('Product not found', {status: 404});
  }

  return {product};
}
