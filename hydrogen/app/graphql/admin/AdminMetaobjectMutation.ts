// NOTE: https://shopify.dev/docs/api/admin/latest/mutations/metaobjectCreate
export const ADMIN_METAOBJECT_MUTATION = `#graphql
mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject {
      id
      handle
      type
      fields {
        key
        value
      }
    }
    userErrors {
      field
      message
    }
  }
}
` as const;
