// @ts-nocheck
import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Initialize JWT verifier for Cognito
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID || '',
  tokenUse: 'id',
  clientId: process.env.USER_POOL_CLIENT_ID || '',
});

// Database connection singleton
let sequelize: Sequelize | null = null;

const getSequelize = () => {
  if (!sequelize) {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'assetdb',
      process.env.DB_USER || 'admin',
      process.env.DB_PASSWORD || 'test1234',
      {
        host: 'amna-asset-management-db.c2xw4omkuu11.us-east-1.rds.amazonaws.com',
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

// Helper to extract user ID from API Gateway authorizer context or JWT
const getUserId = async (event: any): Promise<string | null> => {
  try {
    // First, try to get user ID from API Gateway Cognito authorizer context
    const claims = event.requestContext?.authorizer?.claims;
    if (claims) {
      return claims.sub || claims['cognito:username'] || null;
    }
    
    // Fallback: Verify JWT manually (for Function URL or testing)
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No Bearer token found in Authorization header');
      return null;
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token with Cognito
    const payload = await verifier.verify(token);
    
    // Extract user ID from verified token
    return payload.sub || payload['cognito:username'] || null;
  } catch (error) {
    console.error('User ID extraction failed:', error);
    return null;
  }
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle OPTIONS for CORS
  const method = event.requestContext?.http?.method || event.httpMethod;
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  const userId = await getUserId(event);
  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized - Invalid or missing authentication' }),
    };
  }

  try {
    const db = getSequelize();
    await db.authenticate();
    
    const AssetModel = initAssetModel(db);
    await AssetModel.sync();

    // Support both Function URL and API Gateway event formats
    const path = event.requestContext?.http?.path || event.path || event.rawPath || '';
    const body = event.body ? JSON.parse(event.body) : {};
    const pathParams = event.pathParameters || {};
    const queryParams = event.queryStringParameters || {};

    // Extract asset ID from path if present
    const assetIdMatch = path.match(/\/assets\/([^/]+)/);
    const assetId = assetIdMatch ? assetIdMatch[1] : pathParams.id;

    // Route handling
    if (method === 'GET' && path === '/assets') {
      // List assets
      const { category, search } = queryParams;
      const where: any = { userId };
      
      if (category) {
        where.category = category;
      }
      
      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }

      const assets = await AssetModel.findAll({
        where,
        order: [['createdAt', 'ASC']],
      });

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(assets),
      };
    }

    if (method === 'GET' && path.startsWith('/assets/') && assetId) {
      // Get single asset
      const asset = await AssetModel.findOne({
        where: { id: assetId, userId },
      });

      if (!asset) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Asset not found' }),
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(asset),
      };
    }

    if (method === 'POST' && path === '/assets') {
      // Create asset
      const { name, description, category, imageUrl } = body;

      if (!name || !category) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Name and category are required' }),
        };
      }

      const newAsset = await AssetModel.create({
        name,
        description,
        category,
        imageUrl,
        userId,
      });

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify(newAsset),
      };
    }

    if (method === 'PUT' && path.startsWith('/assets/') && assetId) {
      // Update asset
      const { name, description, category, imageUrl } = body;

      const [updated] = await AssetModel.update(
        { name, description, category, imageUrl },
        { where: { id: assetId, userId } }
      );

      if (updated === 0) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Asset not found' }),
        };
      }

      const updatedAsset = await AssetModel.findByPk(assetId);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(updatedAsset),
      };
    }

    if (method === 'DELETE' && path.startsWith('/assets/') && assetId) {
      // Delete asset
      const deleted = await AssetModel.destroy({
        where: { id: assetId, userId },
      });

      if (deleted === 0) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Asset not found' }),
        };
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Asset deleted successfully' }),
      };
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Route not found' }),
    };
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
