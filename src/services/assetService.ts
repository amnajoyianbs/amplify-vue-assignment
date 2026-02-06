import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import type { Asset } from '../stores/assetStore';

const client = generateClient<Schema>();

// Hybrid service: DynamoDB for now, ready for RDS Lambda integration
export const assetService = {
  // List all assets from DynamoDB
  async listAssets(filters?: { category?: string; search?: string }): Promise<Asset[]> {
    try {
      // For now, using in-memory until Lambda is properly configured
      // In production, this would invoke Lambda function
      const stored = localStorage.getItem('assets');
      let assets: Asset[] = stored ? JSON.parse(stored) : [];
      
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
      const stored = localStorage.getItem('assets');
      const assets: Asset[] = stored ? JSON.parse(stored) : [];
      const asset = assets.find(a => a.id === id);
      
      if (!asset) {
        throw new Error('Asset not found');
      }
      
      return asset;
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
      const newAsset: Asset = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl || '',
        userId: data.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Store in localStorage
      const stored = localStorage.getItem('assets');
      const assets: Asset[] = stored ? JSON.parse(stored) : [];
      assets.unshift(newAsset);
      localStorage.setItem('assets', JSON.stringify(assets));
      
      return newAsset;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  },

  // Update asset
  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    try {
      const stored = localStorage.getItem('assets');
      const assets: Asset[] = stored ? JSON.parse(stored) : [];
      const index = assets.findIndex(a => a.id === id);
      
      if (index === -1) {
        throw new Error('Asset not found');
      }
      
      assets[index] = {
        ...assets[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      localStorage.setItem('assets', JSON.stringify(assets));
      return assets[index];
    } catch (error) {
      console.error('Error updating asset:', error);
      throw new Error('Asset not found');
    }
  },

  // Delete asset
  async deleteAsset(id: string): Promise<void> {
    try {
      const stored = localStorage.getItem('assets');
      const assets: Asset[] = stored ? JSON.parse(stored) : [];
      const filtered = assets.filter(a => a.id !== id);
      
      if (filtered.length === assets.length) {
        throw new Error('Asset not found');
      }
      
      localStorage.setItem('assets', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw new Error('Asset not found');
    }
  },
};
