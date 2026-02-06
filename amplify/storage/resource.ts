import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'assetImages',
  access: (allow) => ({
    'assets/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.authenticated.to(['read'])
    ],
  })
});
