import type { Asset } from '../stores/assetStore';
import { fetchAuthSession } from 'aws-amplify/auth';

// Get the Lambda function URL from outputs
const getApiUrl = async () => {
  try {
    const outputs: any = await import('../../amplify_outputs.json');
    return outputs.default?.custom?.assetApiUrl || outputs.custom?.assetApiUrl || '';
  } catch {
    return '';
  }
};

// Helper to make authenticated requests to Lambda
async function callLambdaApi(path: string, options: RequestInit = {}) {
  const apiUrl = await getApiUrl();
  
  if (!apiUrl) {
    throw new Error('Asset API URL not configured. Please deploy the backend first.');
  }

  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error('No authentication token available. Please sign in.');
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API Error: ${response.status}`);
  }

  return response.json();
}

// Asset service - all operations go through API Gateway/Lambda/RDS
export const assetService = {
  // List all assets from RDS via Lambda
  async listAssets(filters?: { category?: string; search?: string }): Promise<Asset[]> {
    const queryParams = new URLSearchParams();
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.search) queryParams.append('search', filters.search);
    
    const query = queryParams.toString();
    const path = query ? `/assets?${query}` : '/assets';
    
    return await callLambdaApi(path, { method: 'GET' });
  },

  // Get single asset
  async getAsset(id: string): Promise<Asset> {
    return await callLambdaApi(`/assets/${id}`, { method: 'GET' });
  },

  // Create asset
  async createAsset(data: {
    name: string;
    description: string;
    category: string;
    imageUrl?: string;
    userId: string;
  }): Promise<Asset> {
    return await callLambdaApi('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update asset
  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    return await callLambdaApi(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete asset
  async deleteAsset(id: string): Promise<void> {
    await callLambdaApi(`/assets/${id}`, { method: 'DELETE' });
  },
};
