import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'assetImages',
  access: (allow) => ({
    'assets/*': [
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
  })
});
