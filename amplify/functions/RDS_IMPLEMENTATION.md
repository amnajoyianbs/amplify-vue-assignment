# RDS Implementation Guide

## Current Status

The Lambda functions currently use **in-memory storage** for demonstration purposes. This allows the application to deploy and run without requiring RDS setup.

## Why In-Memory for Now?

1. **Immediate Deployment**: Works without complex AWS RDS setup
2. **Cost-Effective**: No RDS charges during development
3. **Demonstrates Concepts**: All Vue 3 and Amplify concepts are shown
4. **Easy Testing**: Can test all features immediately

## RDS Implementation (When Needed)

### Step 1: Install Dependencies

In both Lambda function directories:

```bash
cd amplify/functions/asset-api
npm install sequelize mysql2

cd amplify/functions/asset-handler
npm install sequelize mysql2
```

### Step 2: Update handler.ts Files

Replace the current in-memory implementation with the Sequelize version:

```typescript
import { Sequelize, DataTypes, Model, Op } from 'sequelize';

// Database connection singleton
let sequelize: Sequelize | null = null;

const getSequelize = () => {
  if (!sequelize) {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'assetdb',
      process.env.DB_USER || '',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );
  }
  return sequelize;
};

// Asset Model
class Asset extends Model {
  declare id: string;
  declare name: string;
  declare description: string;
  declare category: string;
  declare imageUrl: string;
  declare userId: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

const initAssetModel = (sequelize: Sequelize) => {
  Asset.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      userId: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Asset',
      tableName: 'assets',
      timestamps: true,
      indexes: [
        {
          fields: ['userId'],
        },
        {
          fields: ['category'],
        },
      ],
    }
  );
  return Asset;
};

// Then use AssetModel.findAll(), create(), etc.
```

### Step 3: Update package.json

```json
{
  "name": "asset-api",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "sequelize": "^6.37.3",
    "mysql2": "^3.11.0"
  }
}
```

### Step 4: Create RDS Instance

See `DEPLOYMENT.md` for detailed RDS setup instructions.

### Step 5: Configure Environment Variables

Update `resource.ts` files with RDS credentials:

```typescript
export const assetHandler = defineFunction({
  name: 'asset-handler',
  entry: './handler.ts',
  environment: {
    DB_HOST: 'your-rds-endpoint.region.rds.amazonaws.com',
    DB_NAME: 'assetdb',
    DB_USER: 'admin',
    DB_PASSWORD: 'your-secure-password',
  },
  timeoutSeconds: 30,
});
```

### Step 6: Configure VPC Access

If RDS is in a private VPC, add VPC configuration to Lambda:

```typescript
import { defineFunction } from '@aws-amplify/backend';

export const assetHandler = defineFunction({
  name: 'asset-handler',
  entry: './handler.ts',
  environment: {
    // ... DB config
  },
  vpc: {
    vpcId: 'vpc-xxxxx',
    subnetIds: ['subnet-xxxxx', 'subnet-yyyyy'],
    securityGroupIds: ['sg-xxxxx'],
  },
});
```

### Step 7: Deploy

```bash
npx ampx sandbox
```

## Benefits of Current Approach

- ✅ Application works immediately
- ✅ All Vue 3 concepts demonstrated
- ✅ No AWS RDS costs during development
- ✅ Easy to test and iterate
- ✅ Production code ready (just swap implementation)

## When to Switch to RDS

Switch to RDS when you need:
- Persistent data across Lambda invocations
- Production deployment
- Data sharing across multiple Lambda instances
- Database backups and recovery
- Advanced querying and indexing

## Note

The current in-memory implementation is **perfect for demonstration and learning**. It shows all the architectural patterns and Vue 3 concepts without the complexity of RDS setup.
