# RDS MySQL Setup Guide

## Prerequisites
- AWS Account
- AWS CLI configured
- MySQL client installed

## Step 1: Create RDS MySQL Instance

### Option A: Using AWS Console

1. Go to AWS RDS Console: https://console.aws.amazon.com/rds/
2. Click "Create database"
3. Choose settings:
   - **Engine**: MySQL 8.0
   - **Templates**: Free tier (for testing) or Production
   - **DB instance identifier**: `asset-management-db`
   - **Master username**: `admin`
   - **Master password**: Create a secure password (save it!)
   - **DB instance class**: db.t3.micro (free tier) or larger
   - **Storage**: 20 GB
   - **VPC**: Default or create new
   - **Public access**: Yes (for testing) / No (for production)
   - **Database name**: `assetdb`

4. Click "Create database"
5. Wait 5-10 minutes for creation
6. Note the **Endpoint** (e.g., `asset-management-db.xxxxx.us-east-1.rds.amazonaws.com`)

### Option B: Using AWS CLI

```bash
aws rds create-db-instance \
  --db-instance-identifier asset-management-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0 \
  --master-username admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --db-name assetdb \
  --publicly-accessible \
  --backup-retention-period 7
```

## Step 2: Configure Security Group

1. Go to RDS instance details
2. Click on the VPC security group
3. Add inbound rule:
   - **Type**: MySQL/Aurora
   - **Port**: 3306
   - **Source**: 
     - For testing: `0.0.0.0/0` (anywhere)
     - For production: Your Lambda security group or specific IPs

## Step 3: Connect and Create Table

### Connect to RDS

```bash
mysql -h asset-management-db.xxxxx.us-east-1.rds.amazonaws.com \
      -u admin \
      -p \
      assetdb
```

Enter your password when prompted.

### Run Table Creation Script

```sql
-- Copy and paste from database/create_tables.sql
-- Or run directly:
source database/create_tables.sql
```

### Verify Table Creation

```sql
SHOW TABLES;
DESCRIBE assets;
SELECT COUNT(*) FROM assets;
```

## Step 4: Update Lambda Environment Variables

Update `amplify/functions/asset-handler/resource.ts`:

```typescript
import { defineFunction } from '@aws-amplify/backend';

export const assetHandler = defineFunction({
  name: 'asset-handler',
  entry: './handler.ts',
  environment: {
    DB_HOST: 'asset-management-db.xxxxx.us-east-1.rds.amazonaws.com',
    DB_NAME: 'assetdb',
    DB_USER: 'admin',
    DB_PASSWORD: 'your-secure-password', // Better: use AWS Secrets Manager
  },
  timeoutSeconds: 30,
});
```

## Step 5: Configure Lambda VPC Access (Production)

For production, Lambda needs to be in the same VPC as RDS:

1. **Create Lambda Security Group**:
   ```bash
   aws ec2 create-security-group \
     --group-name lambda-rds-access \
     --description "Allow Lambda to access RDS" \
     --vpc-id vpc-xxxxx
   ```

2. **Update RDS Security Group**:
   - Add inbound rule allowing MySQL (3306) from Lambda security group

3. **Update Lambda Configuration**:
   ```typescript
   export const assetHandler = defineFunction({
     name: 'asset-handler',
     entry: './handler.ts',
     environment: {
       DB_HOST: 'asset-management-db.xxxxx.rds.amazonaws.com',
       DB_NAME: 'assetdb',
       DB_USER: 'admin',
       DB_PASSWORD: process.env.DB_PASSWORD || '',
     },
     vpc: {
       vpcId: 'vpc-xxxxx',
       subnetIds: ['subnet-xxxxx', 'subnet-yyyyy'],
       securityGroupIds: ['sg-lambda-rds-access'],
     },
   });
   ```

## Step 6: Install Lambda Dependencies

```bash
cd amplify/functions/asset-handler
npm install
```

## Step 7: Deploy

```bash
npx ampx sandbox
```

## Step 8: Test the Connection

Create a test asset through the UI and verify it's saved in RDS:

```sql
mysql -h your-rds-endpoint -u admin -p assetdb

SELECT * FROM assets ORDER BY createdAt DESC LIMIT 5;
```

## Troubleshooting

### Connection Timeout
- Check security group allows port 3306
- Verify Lambda is in correct VPC (if using VPC)
- Check RDS is publicly accessible (for testing)

### Authentication Failed
- Verify username and password
- Check DB_USER and DB_PASSWORD environment variables

### Table Not Found
- Run the create_tables.sql script
- Verify you're connected to the correct database

### Lambda Can't Connect
- Check VPC configuration
- Verify security groups
- Ensure Lambda has internet access (NAT Gateway for private subnets)

## Security Best Practices

1. **Use AWS Secrets Manager** for database credentials:
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

2. **Use Private Subnets** for RDS in production

3. **Enable Encryption** at rest and in transit

4. **Regular Backups**: Enable automated backups

5. **Monitoring**: Set up CloudWatch alarms for:
   - High CPU usage
   - Low storage space
   - Connection errors

## Cost Optimization

- Use db.t3.micro for development (free tier eligible)
- Enable auto-scaling for storage
- Use reserved instances for production
- Set up automated snapshots
- Delete unused instances

## Data Architecture

**RDS MySQL** (Primary Data):
- Asset name, description, category
- Image URL (S3 reference)
- User ID
- Timestamps

**DynamoDB** (Metadata):
- Tags, status, notes (AssetInfo)
- Activity logs (AssetLog)

**S3** (Binary Data):
- Asset images

This hybrid approach optimizes for:
- Relational queries (RDS)
- Fast key-value lookups (DynamoDB)
- Large file storage (S3)
