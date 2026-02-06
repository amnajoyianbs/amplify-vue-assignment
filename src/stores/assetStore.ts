import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { assetService } from '../services/assetService';

const client = generateClient<Schema>();

export interface Asset {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetInfo {
  id?: string;
  assetId: string;
  tags?: string[];
  status?: 'active' | 'inactive' | 'archived';
  notes?: string;
  userId: string;
}

export const useAssetStore = defineStore('asset', () => {
  // State
  const assets = ref<Asset[]>([]);
  const currentAsset = ref<Asset | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const assetCount = computed(() => assets.value.length);
  const activeAssets = computed(() => 
    assets.value.filter(a => a.category !== 'archived')
  );

  // Actions
  const fetchAssets = async (userId: string, filters?: { category?: string; search?: string }) => {
    loading.value = true;
    error.value = null;
    try {
      // Call REST API via Lambda
      const data = await assetService.listAssets(filters);
      assets.value = data;
    } catch (e: any) {
      error.value = e.message;
      console.error('Error fetching assets:', e);
    } finally {
      loading.value = false;
    }
  };

  const getAsset = async (assetId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const asset = await assetService.getAsset(assetId);
      currentAsset.value = asset;
      return asset;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createAsset = async (assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true;
    error.value = null;
    try {
      // Call service to create asset (in-memory for now, RDS integration ready)
      const newAsset = await assetService.createAsset({
        name: assetData.name,
        description: assetData.description,
        category: assetData.category,
        imageUrl: assetData.imageUrl,
        userId: assetData.userId,
      });
      
      assets.value.unshift(newAsset);
      return newAsset;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateAsset = async (assetId: string, updates: Partial<Asset>) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedAsset = await assetService.updateAsset(assetId, updates);
      const index = assets.value.findIndex(a => a.id === assetId);
      if (index !== -1) {
        assets.value[index] = updatedAsset;
      }
      return updatedAsset;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const uploadAssetImage = async (file: File, assetId: string) => {
    try {
      const key = `assets/${assetId}/${file.name}`;
      const result = await uploadData({
        path: key,
        data: file,
      }).result;
      
      const urlResult = await getUrl({ path: key });
      return urlResult.url.toString();
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const deleteAsset = async (assetId: string) => {
    loading.value = true;
    error.value = null;
    try {
      await assetService.deleteAsset(assetId);
      assets.value = assets.value.filter(a => a.id !== assetId);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // DynamoDB operations via AppSync
  const createAssetInfo = async (info: Omit<AssetInfo, 'id'>) => {
    try {
      const result = await client.models.AssetInfo.create(info);
      return result.data;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const getAssetInfo = async (assetId: string) => {
    try {
      const result = await client.models.AssetInfo.list({
        filter: { assetId: { eq: assetId } }
      });
      return result.data[0];
    } catch (e: any) {
      console.error('Error fetching asset info:', e);
      return null;
    }
  };

  const updateAssetInfo = async (id: string, updates: Partial<AssetInfo>) => {
    try {
      const result = await client.models.AssetInfo.update({
        id,
        ...updates,
      });
      return result.data;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const createAssetLog = async (logData: {
    assetId: string;
    action: 'created' | 'updated' | 'deleted' | 'viewed';
    userId: string;
    details?: string;
  }) => {
    try {
      await client.models.AssetLog.create({
        ...logData,
        timestamp: new Date().toISOString(),
      });
    } catch (e: any) {
      console.error('Error creating log:', e);
    }
  };

  const getAssetLogs = async (assetId: string) => {
    try {
      const result = await client.models.AssetLog.list({
        filter: { assetId: { eq: assetId } }
      });
      return result.data;
    } catch (e: any) {
      console.error('Error fetching logs:', e);
      return [];
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    assets,
    currentAsset,
    loading,
    error,
    // Computed
    assetCount,
    activeAssets,
    // Actions
    fetchAssets,
    getAsset,
    createAsset,
    updateAsset,
    uploadAssetImage,
    deleteAsset,
    createAssetInfo,
    getAssetInfo,
    updateAssetInfo,
    createAssetLog,
    getAssetLogs,
    clearError,
  };
});
