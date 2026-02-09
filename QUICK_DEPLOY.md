# Quick Deploy Instructions

## What Changed

✅ **Backend Configuration** (`amplify/backend.ts`)
- Added `assetApi` Lambda function
- Created Function URL with IAM authentication
- Configured CORS for frontend access
- Added IAM permissions for authenticated users

✅ **Frontend Service** (`src/services/assetService.ts`)
- Now calls Lambda function via Function URL
- Includes fallback to localStorage for development
- Handles authentication with JWT tokens

✅ **Lambda Handler** (`amplify/functions/asset-api/handler.ts`)
- Updated to support Function URL event format
- Improved user authentication extraction
- Better path parameter handling

## Deploy Now

### 1. Make sure AWS credentials are valid

```bash
aws sts get-caller-identity
```

If expired, refresh your credentials.

### 2. Deploy the backend

```bash
npx ampx sandbox
```

Wait 5-10 minutes for deployment to complete.

### 3. Verify deployment

```bash
cat amplify_outputs.json | grep assetApiUrl
```

You should see a Lambda Function URL.

### 4. Start the frontend

```bash
npm run dev
```

### 5. Test the application

1. Open http://localhost:5173
2. Sign in
3. Click "Create New Asset"
4. Fill in the form and submit
5. The asset should be saved to RDS MySQL database!

## How It Works

```
User clicks "Create Asset"
    ↓
AssetForm.vue emits submit event
    ↓
AssetManagement.vue calls assetStore.createAsset()
    ↓
assetStore.ts calls assetService.createAsset()
    ↓
assetService.ts makes HTTP POST to Lambda Function URL
    ↓
asset-api Lambda function receives request
    ↓
Lambda connects to RDS MySQL
    ↓
Asset saved to database
    ↓
Response returned to frontend
```

## Troubleshooting

**If you see "Asset API URL not configured":**
- The backend hasn't been deployed yet
- Run `npx ampx sandbox` first

**If you see "Unauthorized":**
- Make sure you're signed in
- Check browser DevTools Console for auth errors

**If assets aren't saving:**
- Check browser DevTools Network tab
- Look for failed requests to Lambda
- Check CloudWatch Logs: `aws logs tail /aws/lambda/asset-api --follow`

## Database Connection

The Lambda function connects to your RDS MySQL database using credentials from:
`amplify/functions/asset-api/resource.ts`

Current settings:
- Host: `amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com`
- Database: `assetdb`
- User: `admin`

Make sure your RDS security group allows Lambda function access!

## Next Steps

After successful deployment:
1. Test all CRUD operations (Create, Read, Update, Delete)
2. Check CloudWatch Logs for any errors
3. Monitor Lambda metrics in AWS Console
4. Consider moving database credentials to AWS Secrets Manager for production
