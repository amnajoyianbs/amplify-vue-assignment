import { defineFunction } from '@aws-amplify/backend';

export const assetApi = defineFunction({
  name: 'asset-api',
  entry: './handler.ts',
  environment: {
    DB_HOST: process.env.DB_HOST || '',
    DB_NAME: process.env.DB_NAME || 'assetdb',
    DB_USER: process.env.DB_USER || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
  },
  timeoutSeconds: 30,
});
