import { Sequelize, DataTypes, Model, Op } from 'sequelize';

// Database connection
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
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Asset',
      tableName: 'assets',
      timestamps: true,
    }
  );
  return Asset;
};

export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const { action, data, assetId, userId } = event;

  try {
    const db = getSequelize();
    await db.authenticate();
    
    const AssetModel = initAssetModel(db);
    await AssetModel.sync();

    switch (action) {
      case 'create':
        const newAsset = await AssetModel.create({
          ...data,
          userId,
        });
        return {
          statusCode: 200,
          body: JSON.stringify(newAsset),
        };

      case 'list':
        const assets = await AssetModel.findAll({
          where: { userId },
          order: [['createdAt', 'DESC']],
        });
        return {
          statusCode: 200,
          body: JSON.stringify(assets),
        };

      case 'get':
        const asset = await AssetModel.findOne({
          where: { id: assetId, userId },
        });
        if (!asset) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Asset not found' }),
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify(asset),
        };

      case 'update':
        const [updated] = await AssetModel.update(data, {
          where: { id: assetId, userId },
        });
        if (updated === 0) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Asset not found' }),
          };
        }
        const updatedAsset = await AssetModel.findByPk(assetId);
        return {
          statusCode: 200,
          body: JSON.stringify(updatedAsset),
        };

      case 'delete':
        const deleted = await AssetModel.destroy({
          where: { id: assetId, userId },
        });
        if (deleted === 0) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Asset not found' }),
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Asset deleted successfully' }),
        };

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error: any) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
