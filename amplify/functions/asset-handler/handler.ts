// Simplified Lambda handler for asset operations
// This version works without RDS/Sequelize for demonstration
// For production with RDS, see DEPLOYMENT.md

interface Asset {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage (for demo - use RDS in production)
const assets: Asset[] = [];

export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const { action, data, assetId, userId } = event;

  try {
    switch (action) {
      case 'create':
        const newAsset: Asset = {
          id: crypto.randomUUID(),
          ...data,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        assets.push(newAsset);
        return {
          statusCode: 200,
          body: JSON.stringify(newAsset),
        };

      case 'list':
        const userAssets = assets.filter(a => a.userId === userId);
        return {
          statusCode: 200,
          body: JSON.stringify(userAssets),
        };

      case 'get':
        const asset = assets.find(a => a.id === assetId && a.userId === userId);
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
        const index = assets.findIndex(a => a.id === assetId && a.userId === userId);
        if (index === -1) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Asset not found' }),
          };
        }
        assets[index] = {
          ...assets[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        return {
          statusCode: 200,
          body: JSON.stringify(assets[index]),
        };

      case 'delete':
        const deleteIndex = assets.findIndex(a => a.id === assetId && a.userId === userId);
        if (deleteIndex === -1) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Asset not found' }),
          };
        }
        assets.splice(deleteIndex, 1);
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
