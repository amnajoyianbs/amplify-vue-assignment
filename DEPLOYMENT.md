# Deployment Guide

## Prerequisites
- AWS Account
- Node.js 18+ installed
- AWS CLI configured
- Amplify CLI installed: `npm install -g @aws-amplify/cli`

## Step 1: Set Up RDS MySQL Database

### Option A: Using AWS Console
1. Go to AWS RDS Console
2. Create a new MySQL database:
   - Engine: MySQL 8.0
   - Template: Free tier (for testing) or Production
   - DB instance identifier: `asset-management-db`
   - Master username: `admin`
   - Master password: (create a secure password)
   - VPC: Default or create new
   - Public access: No (for production)
   - Database name: `assetdb`

3. Note down:
   - Endpoint
   - Port (default: 3306)
   - Username
   - Password

### Option B: Using AWS CLI
```bash
aws rds create-db-instance \
  --db-instance-identifier asset-management-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20 \
  --db-name assetdb \
  --vpc-security-group-ids sg-xxxxx \
  --publicly-accessible
```

## Step 2: Configure Environment Variables

Create `.env` file in project root:
```bash
cp .env.example .env
```

Update with your values:
```
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_NAME=assetdb
DB_USER=admin
DB_PASSWORD=your-secure-password
```

## Step 3: Deploy Amplify Backend

### Initialize Amplify Sandbox (Development)
```bash
npx ampx sandbox
```

This will:
- Deploy Auth (Cognito)
- Deploy Data (AppSync + DynamoDB)
- Deploy Storage (S3)
- Deploy Lambda functions
- Generate `amplify_outputs.json`

### Deploy to Production
```bash
npx ampx pipeline-deploy --branch main
```

## Step 4: Configure Lambda VPC Access (for RDS)

If your RDS is in a private VPC, configure Lambda to access it:

1. Go to AWS Lambda Console
2. Find your `asset-handler` and `asset-api` functions
3. Configuration → VPC:
   - Select the same VPC as RDS
   - Select private subnets
   - Select security group that allows MySQL access

4. Update RDS security group:
   - Add inbound rule: MySQL/Aurora (3306) from Lambda security group

## Step 5: Set Up API Gateway (Optional REST API)

### Using AWS Console
1. Go to API Gateway Console
2. Create REST API
3. Create resource: `/assets`
4. Create methods:
   - GET /assets → Lambda: asset-api
   - POST /assets → Lambda: asset-api
   - GET /assets/{id} → Lambda: asset-api
   - PUT /assets/{id} → Lambda: asset-api
   - DELETE /assets/{id} → Lambda: asset-api

5. Enable CORS
6. Deploy API to stage (e.g., `prod`)
7. Note the Invoke URL

### Update Frontend
Add API endpoint to `.env`:
```
VITE_API_ENDPOINT=https://your-api-id.execute-api.region.amazonaws.com/prod
```

## Step 6: Initialize Database Schema

Run this once to create the assets table:

```bash
# Connect to RDS
mysql -h your-rds-endpoint.region.rds.amazonaws.com -u admin -p assetdb

# Create table
CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  imageUrl VARCHAR(500),
  userId VARCHAR(100) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_category (category)
);
```

Or let Sequelize auto-create it (already configured in Lambda).

## Step 7: Deploy Frontend

### Option A: Amplify Hosting
```bash
# Connect your Git repository
amplify add hosting

# Deploy
amplify publish
```

### Option B: Manual Build
```bash
# Build
npm run build

# Deploy dist/ folder to:
# - S3 + CloudFront
# - Vercel
# - Netlify
# - etc.
```

## Step 8: Test the Application

1. Open the deployed URL
2. Sign up with email
3. Verify email (check inbox)
4. Sign in
5. Create an asset
6. Upload an image
7. View, edit, delete assets

## Monitoring & Debugging

### CloudWatch Logs
- Lambda logs: `/aws/lambda/asset-handler`
- Lambda logs: `/aws/lambda/asset-api`
- AppSync logs: Check AppSync console

### Common Issues

**Lambda can't connect to RDS:**
- Check VPC configuration
- Verify security groups
- Ensure Lambda has VPC execution role

**CORS errors:**
- Verify API Gateway CORS settings
- Check Lambda response headers

**Authentication errors:**
- Verify Cognito user pool configuration
- Check `amplify_outputs.json` is up to date

**Image upload fails:**
- Check S3 bucket permissions
- Verify Storage configuration in Amplify

## Security Checklist

- [ ] RDS is in private subnet
- [ ] RDS security group restricts access
- [ ] Environment variables are secure
- [ ] S3 bucket has proper access policies
- [ ] Cognito password policy is strong
- [ ] API Gateway has throttling enabled
- [ ] CloudWatch logs are enabled
- [ ] Backup strategy for RDS
- [ ] SSL/TLS enabled (HTTPS only)

## Cost Optimization

**Free Tier Eligible:**
- Cognito: 50,000 MAUs
- Lambda: 1M requests/month
- S3: 5GB storage
- RDS: db.t3.micro 750 hours/month
- DynamoDB: 25GB storage

**Production Recommendations:**
- Use RDS reserved instances
- Enable S3 lifecycle policies
- Set up CloudWatch alarms
- Use DynamoDB on-demand pricing
- Enable Lambda provisioned concurrency for high traffic

## Cleanup

To delete all resources:
```bash
# Delete Amplify resources
npx ampx sandbox delete

# Delete RDS (via console or CLI)
aws rds delete-db-instance \
  --db-instance-identifier asset-management-db \
  --skip-final-snapshot
```
