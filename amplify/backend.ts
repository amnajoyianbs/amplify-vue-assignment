import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { assetHandler } from './functions/asset-handler/resource';

defineBackend({
  auth,
  data,
  storage,
  assetHandler,
});
