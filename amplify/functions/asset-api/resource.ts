import { defineFunction } from '@aws-amplify/backend';

export const assetApi = defineFunction({
  name: 'asset-api',
  entry: './handler.ts',
  environment: {
    DB_HOST: 'amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com',
    DB_NAME: 'assetdb',
    DB_USER: 'admin',
    DB_PASSWORD: 'test1234',
    USER_POOL_ID: 'us-east-1_URfsY6AKr',
    USER_POOL_CLIENT_ID: '7e3fks6jjanolr1nvhbrr4eap4',
  },
  timeoutSeconds: 30,
  bundling: {
    externalModules: ['aws-jwt-verify', 'pg'],
  },
});
