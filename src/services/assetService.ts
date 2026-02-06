import type { Asset } from '../stores/assetStore';

// Mock service for development without RDS
// In production, this would call Lambda functions or API Gateway

export const assetService = {
  // In-memory storage for development
  assets: [] as Asset[],

  // List all assets
  async listAssets(filters?: { category?: string; search?: string }): Promise<Asset[]> {
    let filtered = [...this.assets];
    
    if (filters?.category) {
      filtered = filtered.filter(a => a.category === filters.category);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(search) ||
        a.description.toLowerCase().includes(search)
      );
    }
    
    return Promise.resolve(filtered);
  },

  // Get single asset
  async getAsset(id: string): Promise<Asset> {
    const asset = this.assets.find(a => a.id === id);
    if (!asset) {
      throw new Error('Asset not found');
    }
    return Promise.resolve(asset);
  },

  // Create asset
  async createAsset(data: {
    name: string;
    description: string;
    category: string;
    imageUrl?: string;
    userId: string;
  }): Promise<Asset> {
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
    
    this.assets.unshift(newAsset);
    return Promise.resolve(newAsset);
  },

  // Update asset
  async updateAsset(id: string, data: Partial<Asset>): Promise<Asset> {
    const index = this.assets.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Asset not found');
    }
    
    this.assets[index] = {
      ...this.assets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return Promise.resolve(this.assets[index]);
  },

  // Delete asset
  async deleteAsset(id: string): Promise<void> {
    const index = this.assets.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Asset not found');
    }
    
    this.assets.splice(index, 1);
    return Promise.resolve();
  },
};
