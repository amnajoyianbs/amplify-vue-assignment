# JWT Authentication Setup for Lambda Functions

## Changes Made

### 1. Lambda Function URL Configuration (`amplify/backend.ts`)
- Changed auth type from `AWS_IAM` to `NONE` 
- Added Cognito User Pool ID and Client ID as environment variables to the Lambda
- Function URL now accepts all requests but Lambda validates JWT internally

### 2. Lambda Handler (`amplify/functions/asset-api/handler.ts`)
- Added `aws-jwt-verify` library for JWT validation
- Created `verifyAndGetUserId()` function that:
  - Extracts Bearer token from Authorization header
  - Verifies token signature against Cognito public keys
  - Validates token expiration and claims
  - Returns user ID (sub) from verified token
- Returns 401 Unauthorized if token is invalid or missing

### 3. Lambda Dependencies (`amplify/functions/asset-api/package.json`)
- Created package.json with required dependencies:
  - `sequelize` for database ORM
  - `mysql2` for MySQL connection
  - `aws-jwt-verify` for JWT validation

## Deployment Steps

1. Install Lambda dependencies:
```bash
cd amplify/functions/asset-api
npm install
cd ../../..
```

2. Deploy the updated backend:
```bash
npx ampx sandbox
```

## How It Works

1. **Frontend** (`src/services/assetService.ts`):
   - Gets JWT token from Cognito via `fetchAuthSession()`
   - Sends token in `Authorization: Bearer <token>` header

2. **Lambda Function URL**:
   - Accepts all requests (no IAM signature required)
   - CORS configured to allow requests from any origin

3. **Lambda Handler**:
   - Extracts JWT from Authorization header
   - Verifies token with Cognito using public keys
   - Validates signature, expiration, and issuer
   - Extracts user ID from verified token
   - Uses user ID for database queries (row-level security)

## Security Benefits

- JWT tokens are cryptographically verified
- Tokens expire automatically (typically 1 hour)
- User can only access their own assets (userId filter)
- No need for complex IAM signature on frontend
- Simpler CORS configuration

## Testing

After deployment, test with:
```bash
# Get the function URL from amplify_outputs.json
# Make a request with a valid JWT token
curl -X GET "https://your-function-url/assets" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
