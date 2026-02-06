import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import type { Asset } from '../stores/assetStore';

const client = generateClient<Schema>();

// Service using DynamoDB for persistent storage
export const assetService = {
  // List all assets
  async listAssets(filters?: { category?: string; search?: string }): Promise<Asset[]> {
    try {
      const result = await client.models.Asset.list();
      let assets = result.data.map(item => ({
        id: item.id,
        name: item.name || '',
        description: item.description || '',
        category: item.category || '',
        imageUrl: item.imageUrl || '',
        userId: item.userId || '',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));
      
      if (filters?.category) {
        assets = assets.filter(a => a.category === filters.category);
      }
      
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        assets = assets.filter(a => 
          a.name.toLowerCase().includes(search) ||
          a.description.toLowerCase().includes(search)
        );
      }
      
      return assets;
    } catch (error) {
      console.error('Error listing assets:', error);
      return [];
    }
  },

  // Get single asset
  async getAsset(id: string): Promise<Asset> {
    try {
      const result = await client.models.Asset.get({ id });
      if (!result.data) {
        throw new Error('Asset not found');
      }
      
      return {
        id: result.data.id,
        name: result.data.name || '',
        description: result.data.description || '',
        category: result.data.category || '',
        imageUrl: result.data.imageUrl || '',
        userId: result.data.userId || '',
        createdAt: result.data.createdAt || new Date().toISOString(),
        updatedAt: result.data.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting asset:', error);
      throw new Error('Asset not found');
    }
  },

  // Create asset
  async createAsset(data: {
    name: string;
    description: string;
    category: string;
    imageUrl?: string;
    userId: string;
  }): Promise<Asset> {
    try {
      const result = await client.models.Asset.create({
        name: data.name,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl || '',
        userId: data.userId,
      });
      
      if (!result.data) {
        throw new Error('Failed to create asset');
      }
      
      return {
        id: result.data.id,
        name: result.data.name || '',
        description: result.data.description || '',
        category: result.data.category || '',
        imageUrl: result.data.imageUrl || '',
        userId: result.data.userId || '',
        createdAt: result.data.createdAt || new Date().toISOString(),
        updatedAt: result.data.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  },

  // Update asset
  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    try {
      const result = await client.models.Asset.update({
        id,
        ...data,
      });
      
      if (!result.data) {
        throw new Error('Asset not found');
      }
      
      return {
        id: result.data.id,
        name: result.data.name || '',
        description: result.data.description || '',
        category: result.data.category || '',
        imageUrl: result.data.imageUrl || '',
        userId: result.data.userId || '',
        createdAt: result.data.createdAt || new Date().toISOString(),
        updatedAt: result.data.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating asset:', error);
      throw new Error('Asset not found');
    }
  },

  // Delete asset
  async deleteAsset(id: string): Promise<void> {
    try {
      await client.models.Asset.delete({ id });
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw new Error('Asset not found');
    }
  },
};
