# Environment Variables Setup Guide

## Overview

This project uses environment variables for configuration. There are two types:

1. **Frontend variables** (Vite) - Must start with `VITE_`
2. **Lambda variables** - Set in `amplify/functions/*/resource.ts`

## Files

### `.env` (Local Development - GITIGNORED)
Your local environment variables. **Never commit this file!**

```bash
# Frontend Variables
VITE_DEV_MODE=true

# RDS Configuration (used by Lambda)
DB_HOST=amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com
DB_NAME=assetdb
DB_USER=admin
DB_PASSWORD=test1234
```

### `.env.example` (Template - COMMITTED)
Template file showing what variables are needed. Safe to commit.

```bash
# Copy this to .env and fill in your values
VITE_DEV_MODE=true
# DB_HOST=your-rds-endpoint
# DB_NAME=assetdb
# etc...
```

## Setup for New Developers

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values:**
   - Get RDS credentials from AWS Console or team lead
   - Update `.env` with actual values

3. **Never commit `.env`:**
   - It's already in `.gitignore`
   - Only commit `.env.example`

## Current Configuration

### Frontend (Vite)
Variables in `.env` starting with `VITE_` are available in the frontend:

```typescript
// Access in code:
const devMode = import.meta.env.VITE_DEV_MODE;
```

### Lambda Functions
RDS credentials are set directly in resource files:

**`amplify/functions/asset-handler/resource.ts`:**
```typescript
export const assetHandler = defineFunction({
  name: 'asset-handler',
  entry: './handler.ts',
  environment: {
    DB_HOST: 'amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com',
    DB_NAME: 'assetdb',
    DB_USER: 'admin',
    DB_PASSWORD: 'test1234',
  },
});
```

## Security Best Practices

### ❌ DON'T:
- Commit `.env` file
- Share credentials in Slack/Email
- Hardcode passwords in code (except in resource.ts for Amplify)
- Use production credentials in development

### ✅ DO:
- Use `.env.example` as template
- Keep `.env` in `.gitignore`
- Use AWS Secrets Manager for production
- Rotate credentials regularly
- Use different credentials for dev/staging/prod

## Production Deployment

For production, use AWS Secrets Manager:

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const getSecret = async () => {
  const client = new SecretsManagerClient({ region: "us-east-1" });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: "rds/asset-db" })
  );
  return JSON.parse(response.SecretString);
};
```

## Troubleshooting

### "Cannot connect to database"
- Check DB_HOST is correct
- Verify DB_USER and DB_PASSWORD
- Ensure RDS security group allows connections

### "Environment variable not found"
- Frontend: Make sure it starts with `VITE_`
- Lambda: Check it's set in `resource.ts`
- Restart dev server after changing `.env`

### "Access denied"
- Verify DB_USER has correct permissions
- Check DB_PASSWORD is correct
- Ensure RDS is publicly accessible (for dev)

## Current RDS Instance

**Endpoint:** `amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com`  
**Database:** `assetdb`  
**User:** `admin`  
**Region:** `us-east-1`

## Testing Connection

Test RDS connection:

```bash
mysql -h amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com \
      -u admin \
      -p \
      assetdb
```

Enter password: `test1234`

## Next Steps

1. ✅ `.env` file created
2. ✅ RDS credentials configured
3. ✅ Lambda functions updated
4. 🔄 Run `npx ampx sandbox` to deploy
5. 🔄 Test asset creation with RDS

## Questions?

- Check `database/RDS_SETUP_GUIDE.md` for RDS setup
- See `QUICKSTART.md` for general setup
- Review `DEPLOYMENT.md` for production deployment
