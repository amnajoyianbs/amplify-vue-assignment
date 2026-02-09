# Lambda Function Deployment Guide

This guide walks you through deploying the Lambda functions and connecting them to your frontend.

## Prerequisites

1. ✅ AWS credentials configured
2. ✅ RDS MySQL database running
3. ✅ Node.js and npm installed
4. ✅ All dependencies installed (`npm install`)

## Step 1: Deploy Backend with Lambda Functions

The backend configuration has been updated to include the `asset-api` Lambda function with a Function URL.

### Deploy to Sandbox (Development)

```bash
npx ampx sandbox
```

This will:
- Deploy the `asset-api` Lambda function
- Create a Function URL for the Lambda
- Configure IAM permissions for authenticated users
- Output the Function URL in `amplify_outputs.json`

### Deploy to Production

```bash
npx ampx pipeline-deploy --branch main --app-id <your-app-id>
```

## Step 2: Verify Deployment

After deployment completes, check the `amplify_outputs.json` file:

```bash
cat amplify_outputs.json | grep assetApiUrl
```

You should see something like:
```json
{
  "custom": {
    "assetApiUrl": "https://xxxxxx.lambda-url.us-east-1.on.aws/"
  }
}
```

## Step 3: Test Lambda Function

### Test from AWS Console

1. Go to AWS Lambda Console
2. Find the `asset-api` function
3. Go to Configuration → Function URL
4. Copy the Function URL
5. Test with curl:

```bash
# Get your ID token
# (You'll need to sign in to your app first and extract the token from browser DevTools)

curl -X GET "https://your-function-url.lambda-url.us-east-1.on.aws/assets" \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```

### Test from Frontend

1. Start your development server:
```bash
npm run dev
```

2. Sign in to the application
3. Try creating an asset
4. Check browser DevTools Console for any errors
5. Check Network tab to see the Lambda function calls

## Step 4: Verify Database Connection

The Lambda function will automatically:
- Connect to your RDS MySQL database
- Create the `assets` table if it doesn't exist
- Handle all CRUD operations

Check CloudWatch Logs for any database connection errors:

```bash
# View logs
aws logs tail /aws/lambda/asset-api --follow
```

## Architecture Overview

```
Frontend (Vue.js)
    ↓
assetService.ts (calls Lambda via Function URL)
    ↓
asset-api Lambda Function
    ↓
RDS MySQL Database
```

## Fallback Behavior

The `assetService.ts` includes fallback to localStorage if:
- Lambda function URL is not configured
- Lambda function returns an error
- Network request fails

This allows development to continue even if the backend isn't deployed yet.

## Troubleshooting

### Error: "Asset API URL not configured"

**Solution**: Deploy the backend first with `npx ampx sandbox`

### Error: "Unauthorized - No user ID found"

**Solution**: Make sure you're signed in. The Lambda function requires authentication.

### Error: "Cannot connect to database"

**Solution**: 
1. Check RDS security group allows Lambda function access
2. Verify database credentials in `amplify/functions/asset-api/resource.ts`
3. Check CloudWatch Logs for detailed error messages

### Error: CORS issues

**Solution**: The Lambda function includes CORS headers. If you still see CORS errors:
1. Check browser DevTools Console for the exact error
2. Verify the Function URL CORS configuration in `amplify/backend.ts`

## Environment Variables

Database credentials are configured in `amplify/functions/asset-api/resource.ts`:

```typescript
environment: {
  DB_HOST: 'your-db-host.rds.amazonaws.com',
  DB_NAME: 'assetdb',
  DB_USER: 'admin',
  DB_PASSWORD: 'your-password',
}
```

**Security Note**: For production, use AWS Secrets Manager instead of hardcoded credentials.

## Next Steps

1. Deploy the backend: `npx ampx sandbox`
2. Wait for deployment to complete (5-10 minutes)
3. Verify `amplify_outputs.json` has the `assetApiUrl`
4. Test the application
5. Check CloudWatch Logs if there are any issues

## Monitoring

View Lambda function logs in real-time:

```bash
aws logs tail /aws/lambda/asset-api --follow --format short
```

View Lambda metrics in AWS Console:
- Invocations
- Duration
- Error count
- Throttles
