import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 * Asset Management Schema
 * DynamoDB stores: tags, status, logs, and references to RDS asset metadata
 */
const schema = a.schema({
  // Asset additional info stored in DynamoDB
  AssetInfo: a
    .model({
      assetId: a.string().required(), // Reference to RDS asset
      tags: a.string().array(), // Array of tags
      status: a.enum(['active', 'inactive', 'archived']),
      notes: a.string(),
      userId: a.string().required(), // Owner of the asset
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read'])
    ]),

  // Asset activity logs stored in DynamoDB
  AssetLog: a
    .model({
      assetId: a.string().required(),
      action: a.enum(['created', 'updated', 'deleted', 'viewed']),
      timestamp: a.datetime(),
      userId: a.string().required(),
      details: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read'])
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

