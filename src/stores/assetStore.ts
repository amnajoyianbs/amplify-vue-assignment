import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { assetService } from '../services/assetService';

const client = generateClient<Schema>();

export interface Asset {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string; // S3 key/path, not presigned URL
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
  const assetInfoMap = ref<Map<string, AssetInfo>>(new Map());
  const currentAsset = ref<Asset | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const assetCount = computed(() => assets.value.length);
  const activeAssets = computed(() => {
    return assets.value.filter(asset => {
      const info = assetInfoMap.value.get(asset.id);
      return !info || info.status === 'active';
    });
  });
  const inactiveAssets = computed(() => {
    return assets.value.filter(asset => {
      const info = assetInfoMap.value.get(asset.id);
      return info && info.status === 'inactive';
    });
  });

  // Actions
  const fetchAssets = async (filters?: { category?: string; search?: string }) => {
    loading.value = true;
    error.value = null;
    try {
      // Call REST API via Lambda
      const data = await assetService.listAssets(filters);
      assets.value = data;
      
      // Fetch asset info for all assets to get status
      await fetchAllAssetInfo();
    } catch (e: any) {
      error.value = e.message;
      console.error('Error fetching assets:', e);
    } finally {
      loading.value = false;
    }
  };

  const fetchAllAssetInfo = async () => {
    try {
      // Fetch all asset info from DynamoDB
      const result = await client.models.AssetInfo.list();
      
      // Create a map of assetId -> AssetInfo
      assetInfoMap.value.clear();
      result.data.forEach((info: any) => {
        if (info.assetId) {
          assetInfoMap.value.set(info.assetId, info);
        }
      });
    } catch (e: any) {
      console.error('Error fetching asset info:', e);
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
      // Call service to create asset via API Gateway/Lambda/RDS
      const newAsset = await assetService.createAsset({
        name: assetData.name,
        description: assetData.description,
        category: assetData.category,
        imageUrl: assetData.imageUrl,
        userId: assetData.userId,
      });
      
      // Add to end of array to match ASC order (oldest first)
      assets.value.push(newAsset);
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
      await uploadData({
        path: key,
        data: file,
      }).result;
      
      // Return the S3 key/path instead of presigned URL
      // The key will be stored in DB and presigned URLs generated on-demand
      return key;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  // Generate presigned URL from S3 key
  const getImageUrl = async (s3Key: string) => {
    try {
      if (!s3Key) return '';
      const urlResult = await getUrl({ path: s3Key });
      return urlResult.url.toString();
    } catch (e: any) {
      console.error('Error generating image URL:', e);
      return '';
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
    inactiveAssets,
    // Actions
    fetchAssets,
    fetchAllAssetInfo,
    getAsset,
    createAsset,
    updateAsset,
    uploadAssetImage,
    getImageUrl,
    deleteAsset,
    createAssetInfo,
    getAssetInfo,
    updateAssetInfo,
    createAssetLog,
    getAssetLogs,
    clearError,
  };
});
