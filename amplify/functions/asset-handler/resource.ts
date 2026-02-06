import { defineFunction } from '@aws-amplify/backend';

export const assetHandler = defineFunction({
  name: 'asset-handler',
  entry: './handler.ts',
  environment: {
    DB_HOST: 'amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com',
    DB_NAME: 'assetdb',
    DB_USER: 'admin',
    DB_PASSWORD: 'test1234',
  },
  timeoutSeconds: 30,
});
