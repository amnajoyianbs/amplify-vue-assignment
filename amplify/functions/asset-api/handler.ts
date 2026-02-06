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
    const path = event.path;
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};
    const pathParams = event.pathParameters || {};
    const queryParams = event.queryStringParameters || {};

    // Route handling
    if (method === 'GET' && path === '/assets') {
      // List assets
      const { category, search } = queryParams;
      let filtered = assets.filter(a => a.userId === userId);
      
      if (category) {
        filtered = filtered.filter(a => a.category === category);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(a => 
          a.name.toLowerCase().includes(searchLower) ||
          a.description.toLowerCase().includes(searchLower)
        );
      }

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(filtered),
      };
    }

    if (method === 'GET' && path.startsWith('/assets/')) {
      // Get single asset
      const assetId = pathParams.id;
      const asset = assets.find(a => a.id === assetId && a.userId === userId);

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

      const newAsset: Asset = {
        id: crypto.randomUUID(),
        name,
        description: description || '',
        category,
        imageUrl: imageUrl || '',
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      assets.push(newAsset);

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

      const index = assets.findIndex(a => a.id === assetId && a.userId === userId);

      if (index === -1) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Asset not found' }),
        };
      }

      assets[index] = {
        ...assets[index],
        name: name || assets[index].name,
        description: description !== undefined ? description : assets[index].description,
        category: category || assets[index].category,
        imageUrl: imageUrl !== undefined ? imageUrl : assets[index].imageUrl,
        updatedAt: new Date().toISOString(),
      };

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(assets[index]),
      };
    }

    if (method === 'DELETE' && path.startsWith('/assets/')) {
      // Delete asset
      const assetId = pathParams.id;
      const index = assets.findIndex(a => a.id === assetId && a.userId === userId);

      if (index === -1) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Asset not found' }),
        };
      }

      assets.splice(index, 1);

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
