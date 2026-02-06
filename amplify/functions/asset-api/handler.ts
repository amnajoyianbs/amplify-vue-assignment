import { Sequelize, DataTypes, Model, Op } from 'sequelize';

// Database connection singleton
let sequelize: Sequelize | null = null;

const getSequelize = () => {
  if (!sequelize) {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'assetdb',
      process.env.DB_USER || 'admin',
      process.env.DB_PASSWORD || 'test1234',
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

// Helper to extract user ID from Cognito claims
const getUserId = (event: any): string | null => {
  try {
    const claims = event.requestContext?.authorizer?.claims;
    return claims?.sub || claims?.['cognito:username'] || null;
  } catch {
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
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  const userId = getUserId(event);
  if (!userId) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const db = getSequelize();
    await db.authenticate();
    
    const AssetModel = initAssetModel(db);
    await AssetModel.sync();

    const path = event.path;
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};
    const pathParams = event.pathParameters || {};
    const queryParams = event.queryStringParameters || {};

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
        order: [['createdAt', 'DESC']],
      });

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(assets),
      };
    }

    if (method === 'GET' && path.startsWith('/assets/')) {
      // Get single asset
      const assetId = pathParams.id;
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

    if (method === 'PUT' && path.startsWith('/assets/')) {
      // Update asset
      const assetId = pathParams.id;
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

    if (method === 'DELETE' && path.startsWith('/assets/')) {
      // Delete asset
      const assetId = pathParams.id;
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
