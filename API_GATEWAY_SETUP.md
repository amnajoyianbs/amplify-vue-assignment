# API Gateway Integration with Cognito Authorization

## Overview

This implementation uses AWS API Gateway REST API with Cognito User Pools authorizer to secure the Lambda function endpoints.

## Architecture

```
Frontend (Vue.js)
  ↓ Cognito ID Token (JWT)
  ↓ Authorization: Bearer <token>
API Gateway
  ↓ Validates JWT with Cognito
  ↓ Extracts user claims
  ↓ Passes to Lambda with authorizer context
Lambda Function (asset-api)
  ↓ Gets user ID from event.requestContext.authorizer.claims
  ↓ Queries RDS with user-specific filters
MySQL RDS
```

## Changes Made

### 1. Backend Configuration (`amplify/backend.ts`)

**Removed:**
- Lambda Function URL implementation
- IAM-based authentication

**Added:**
- API Gateway REST API with CORS configuration
- Cognito User Pools Authorizer
- Lambda Integration (proxy mode)
- API Routes:
  - `GET /assets` - List all assets
  - `POST /assets` - Create new asset
  - `GET /assets/{id}` - Get single asset
  - `PUT /assets/{id}` - Update asset
  - `DELETE /assets/{id}` - Delete asset

### 2. Lambda Handler (`amplify/functions/asset-api/handler.ts`)

**Updated:**
- `getUserId()` function now prioritizes API Gateway authorizer context
- Falls back to manual JWT verification if needed
- Supports both API Gateway and Function URL formats

### 3. Authorization Flow

**API Gateway handles:**
- JWT signature validation
- Token expiration check
- Issuer verification
- Audience validation

**Lambda receives:**
- Pre-validated user claims in `event.requestContext.authorizer.claims`
- User ID extracted from `claims.sub`

## Deployment Steps

### 1. Install Dependencies (if not already done)
```bash
cd amplify/functions/asset-api
npm install
cd ../../..
```

### 2. Deploy Backend
```bash
npx ampx sandbox
```

### 3. Verify Deployment

After deployment, check `amplify_outputs.json`:
```json
{
  "custom": {
    "assetApiUrl": "https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/"
  }
}
```

### 4. Test API

**Get Auth Token:**
```javascript
// In browser console after login
const session = await fetchAuthSession();
const token = session.tokens?.idToken?.toString();
console.log(token);
```

**Test Request:**
```bash
curl -X GET "https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/assets" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Benefits of API Gateway

✅ **Built-in Cognito Authorization** - No manual JWT verification needed  
✅ **Automatic Token Validation** - Signature, expiration, issuer checked by AWS  
✅ **Request Throttling** - Protect against DDoS  
✅ **API Keys & Usage Plans** - Control access and rate limits  
✅ **CloudWatch Integration** - Better monitoring and logging  
✅ **Custom Domain Support** - Use your own domain  
✅ **Request/Response Transformation** - Modify data before/after Lambda  
✅ **Caching** - Improve performance for GET requests  

## API Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | /assets | List all user's assets | Yes |
| POST | /assets | Create new asset | Yes |
| GET | /assets/{id} | Get single asset | Yes |
| PUT | /assets/{id} | Update asset | Yes |
| DELETE | /assets/{id} | Delete asset | Yes |

## Security Features

1. **Cognito Authorization**: All endpoints require valid Cognito JWT token
2. **User Isolation**: Users can only access their own assets (userId filter in queries)
3. **CORS Protection**: Configured to allow specific headers and methods
4. **HTTPS Only**: API Gateway enforces HTTPS
5. **Token Expiration**: Tokens expire after 1 hour (Cognito default)

## Troubleshooting

### 401 Unauthorized
- Check if user is logged in
- Verify token is being sent in Authorization header
- Check token hasn't expired (default 1 hour)

### 403 Forbidden
- Verify Cognito User Pool ID matches in authorizer
- Check user pool client ID is correct
- Ensure token is from the correct user pool

### 500 Internal Server Error
- Check Lambda CloudWatch logs
- Verify database connection
- Check environment variables are set

## Frontend Integration

The frontend (`src/services/assetService.ts`) already sends the correct Authorization header:

```typescript
const session = await fetchAuthSession();
const token = session.tokens?.idToken?.toString();

fetch(apiUrl, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

No changes needed in frontend code - it will automatically use the new API Gateway URL from `amplify_outputs.json`.

## Monitoring

**CloudWatch Logs:**
- API Gateway: `/aws/apigateway/AssetManagementApi`
- Lambda: `/aws/lambda/amplify-...-asset-api-...`

**Metrics to Watch:**
- API Gateway: Request count, latency, 4xx/5xx errors
- Lambda: Invocations, duration, errors, throttles
- Cognito: Sign-ins, token generation

## Cost Optimization

- API Gateway: ~$3.50 per million requests
- Lambda: Free tier 1M requests/month
- Consider caching GET requests to reduce Lambda invocations
- Use CloudWatch Logs Insights for debugging instead of verbose logging
