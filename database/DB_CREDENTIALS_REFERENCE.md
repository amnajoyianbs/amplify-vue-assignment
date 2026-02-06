# Database Credentials Reference

## RDS MySQL Connection Details

```
Host: amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com
Database: assetdb
User: admin
Password: test1234
Port: 3306 (default MySQL)
Region: us-east-1
```

## Where Credentials Are Used

### 1. Lambda Function: asset-handler

**Resource File:** `amplify/functions/asset-handler/resource.ts`
```typescript
environment: {
  DB_HOST: 'amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com',
  DB_NAME: 'assetdb',
  DB_USER: 'admin',
  DB_PASSWORD: 'test1234',
}
```

**Handler File:** `amplify/functions/asset-handler/handler.ts`
```typescript
sequelize = new Sequelize(
  process.env.DB_NAME || 'assetdb',
  process.env.DB_USER || '',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);
```

### 2. Lambda Function: asset-api

**Resource File:** `amplify/functions/asset-api/resource.ts`
```typescript
environment: {
  DB_HOST: 'amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com',
  DB_NAME: 'assetdb',
  DB_USER: 'admin',
  DB_PASSWORD: 'test1234',
}
```

**Handler File:** `amplify/functions/asset-api/handler.ts`
```typescript
sequelize = new Sequelize(
  process.env.DB_NAME || 'assetdb',
  process.env.DB_USER || '',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);
```

### 3. Local Development

**File:** `.env.development`
```bash
DB_HOST=amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com
DB_NAME=assetdb
DB_USER=admin
DB_PASSWORD=test1234
```

## Connection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Flow                         │
└─────────────────────────────────────────────────────────────┘

1. User creates asset in Vue frontend
   ↓
2. Frontend calls assetService
   ↓
3. Service stores in localStorage (current implementation)
   OR
   Service invokes Lambda function (when configured)
   ↓
4. Lambda function (asset-handler or asset-api)
   ↓
5. Sequelize connects to RDS MySQL using environment variables
   ↓
6. Data saved to 'assets' table in 'assetdb' database
   ↓
7. Response returned to frontend
```

## Testing Connection

### From Command Line
```bash
mysql -h amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com \
      -u admin \
      -p \
      assetdb
```
Enter password: `test1234`

### From Lambda Function
The connection is tested automatically when Lambda executes:
```typescript
const db = getSequelize();
await db.authenticate(); // Tests connection
```

## Security Notes

⚠️ **Current Setup (Development)**
- Credentials are hardcoded in resource.ts files
- Suitable for development/testing only
- RDS is publicly accessible

✅ **Production Recommendations**
1. Use AWS Secrets Manager for credentials
2. Place RDS in private subnet
3. Use VPC for Lambda-RDS communication
4. Rotate credentials regularly
5. Enable encryption at rest and in transit

## Troubleshooting

### Connection Timeout
```
Error: connect ETIMEDOUT
```
**Solution:**
- Check RDS security group allows port 3306
- Verify RDS is publicly accessible (for dev)
- Check Lambda VPC configuration (if using VPC)

### Authentication Failed
```
Error: Access denied for user 'admin'@'...'
```
**Solution:**
- Verify DB_USER is 'admin'
- Check DB_PASSWORD is 'test1234'
- Ensure user has permissions on 'assetdb'

### Database Not Found
```
Error: Unknown database 'assetdb'
```
**Solution:**
- Run `database/create_tables.sql` script
- Verify database was created during RDS setup

### Table Not Found
```
Error: Table 'assetdb.assets' doesn't exist
```
**Solution:**
- Sequelize will auto-create table on first run
- Or manually run: `source database/create_tables.sql`

## Verification Checklist

- [x] RDS instance created and running
- [x] Database 'assetdb' exists
- [x] Table 'assets' created
- [x] Security group allows MySQL (3306)
- [x] Credentials set in asset-handler/resource.ts
- [x] Credentials set in asset-api/resource.ts
- [x] Sequelize installed in both Lambda functions
- [x] Environment variables configured
- [x] Connection tested successfully

## Quick Reference Commands

```bash
# Test RDS connection
mysql -h amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com -u admin -p assetdb

# View all assets
SELECT * FROM assets ORDER BY createdAt DESC;

# Count assets by user
SELECT userId, COUNT(*) as count FROM assets GROUP BY userId;

# View recent assets
SELECT id, name, category, createdAt FROM assets ORDER BY createdAt DESC LIMIT 10;

# Check table structure
DESCRIBE assets;

# View indexes
SHOW INDEX FROM assets;
```

## Data Architecture

**Primary Data (RDS MySQL)**
- Asset ID (UUID)
- Name
- Description
- Category
- Image URL (S3 reference)
- User ID
- Timestamps

**Metadata (DynamoDB)**
- Tags
- Status
- Notes
- Activity logs

**Binary Data (S3)**
- Asset images

This hybrid approach optimizes for different data types and access patterns.
