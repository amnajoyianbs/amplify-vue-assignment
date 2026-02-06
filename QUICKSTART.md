# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- AWS Account
- Git

## 1. Clone and Install

```bash
# Install dependencies
npm install

# Install Amplify CLI globally (if not already installed)
npm install -g @aws-amplify/cli
```

## 2. Start Amplify Sandbox (Development)

```bash
# This will deploy all backend resources to AWS
npx ampx sandbox
```

Wait for the deployment to complete. This will:
- Create Cognito User Pool for authentication
- Create AppSync API with DynamoDB tables
- Create S3 bucket for image storage
- Deploy Lambda functions
- Generate `amplify_outputs.json`

## 3. Run Development Server

```bash
# In a new terminal
npm run dev
```

Open http://localhost:5173

## 4. Test the Application

### Sign Up
1. Click "Create Account"
2. Enter email and password
3. Verify email (check inbox)

### Sign In
1. Enter credentials
2. You'll see the Asset Management dashboard

### Create Asset
1. Click "Create New Asset"
2. Fill in:
   - Name: "MacBook Pro"
   - Description: "Company laptop"
   - Category: "Electronics"
   - Upload an image
   - Tags: "laptop, apple, work"
   - Status: Active
3. Click "Create"

### View Assets
- Assets appear in a grid
- Click on a card to view details
- Click "View" button for full details

### Delete Asset
1. Click "Delete" button
2. Confirm deletion in the dialog

## Current Implementation Status

### ✅ Fully Working
- **Authentication**: Sign up, sign in, sign out with Cognito
- **DynamoDB**: AssetInfo and AssetLog via AppSync GraphQL
- **S3 Storage**: Image uploads and retrieval
- **Frontend**: All Vue 3 components and features
- **State Management**: Pinia stores
- **Asset Management**: Create, view, delete assets (in-memory)

### ⚠️ Ready for Integration
- **RDS MySQL**: Lambda functions created, needs RDS instance
- **REST API**: Code ready, needs API Gateway setup

### Current Data Storage
For development without RDS setup, assets are stored in-memory via the service layer. This demonstrates all Vue 3 concepts and frontend functionality. The backend Lambda functions are ready and will work once RDS is configured.

### To Enable Full RDS Integration:

1. **Create RDS Instance**:
```bash
# See DEPLOYMENT.md for detailed instructions
```

2. **Update Environment Variables**:
Create `.env` file:
```
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_NAME=assetdb
DB_USER=admin
DB_PASSWORD=your-password
```

3. **Redeploy**:
```bash
npx ampx sandbox
```

## What's Working Now

✅ **Authentication**
- Sign up, sign in, sign out
- Email verification
- Protected routes

✅ **DynamoDB (via AppSync)**
- AssetInfo storage (tags, status, notes)
- AssetLog storage (activity logs)
- GraphQL queries and mutations

✅ **S3 Storage**
- Image uploads
- Secure access control
- Image display

✅ **Frontend**
- All Vue 3 components
- Pinia state management
- Element Plus UI
- Headless UI modals
- Responsive design

⚠️ **Partial: RDS Integration**
- Lambda functions ready
- Needs RDS instance
- Needs VPC configuration

## Project Structure

```
├── amplify/                    # Backend configuration
│   ├── auth/                   # Cognito setup
│   ├── data/                   # DynamoDB schema
│   ├── storage/                # S3 configuration
│   ├── functions/              # Lambda functions
│   └── backend.ts              # Backend definition
│
├── src/
│   ├── components/             # Vue components
│   │   ├── assets/             # Asset-related components
│   │   ├── common/             # Shared components
│   │   └── layout/             # Layout components
│   ├── stores/                 # Pinia stores
│   ├── services/               # API services
│   ├── views/                  # Page views
│   └── main.ts                 # App entry
│
├── IMPLEMENTATION.md           # Implementation details
├── DEPLOYMENT.md               # Production deployment guide
├── VUE_CONCEPTS.md            # Vue 3 concepts reference
└── QUICKSTART.md              # This file
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Type checking
npm run type-check       # Run TypeScript checks

# Amplify
npx ampx sandbox         # Start sandbox environment
npx ampx sandbox delete  # Delete sandbox resources
```

## Troubleshooting

### "Module not found" errors
```bash
npm install
```

### Amplify deployment fails
```bash
# Check AWS credentials
aws sts get-caller-identity

# Ensure you have proper permissions
```

### Can't sign in
- Check email for verification code
- Verify Cognito user pool is created
- Check browser console for errors

### Images not uploading
- Verify S3 bucket is created
- Check Storage configuration in `amplify/storage/resource.ts`
- Check browser console for errors

### No assets showing
- Check if Lambda functions are deployed
- For full functionality, RDS needs to be configured
- Check browser Network tab for API errors

## Next Steps

1. **Complete RDS Setup** - See DEPLOYMENT.md
2. **Add More Features**:
   - Asset editing
   - Search and filtering
   - Pagination
   - Export functionality
3. **Deploy to Production** - See DEPLOYMENT.md
4. **Add Tests** - Unit and E2E tests
5. **Enhance UI** - More animations, better mobile support

## Getting Help

- **Amplify Docs**: https://docs.amplify.aws/
- **Vue 3 Docs**: https://vuejs.org/
- **Element Plus**: https://element-plus.org/
- **Pinia**: https://pinia.vuejs.org/

## Clean Up

To delete all AWS resources:
```bash
npx ampx sandbox delete
```

This will remove:
- Cognito User Pool
- AppSync API
- DynamoDB tables
- S3 bucket
- Lambda functions
- All associated resources
