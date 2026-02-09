<template>
  <div class="asset-management">
    <!-- Stats Section -->
    <div class="stats-section">
      <Card title="Total Assets">
        <div class="stat-value">{{ assetStore.assetCount }}</div>
      </Card>
      <Card title="Active Assets">
        <div class="stat-value stat-active">{{ assetStore.activeAssets.length }}</div>
      </Card>
      <Card title="Inactive Assets">
        <div class="stat-value stat-inactive">{{ assetStore.inactiveAssets.length }}</div>
      </Card>
    </div>

    <!-- Actions Bar -->
    <div class="actions-bar">
      <div class="actions-left">
        <h2 class="section-title">Your Assets</h2>
      </div>
      <el-button type="primary" size="large" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        Create New Asset
      </el-button>
    </div>

    <!-- Asset List -->
    <AssetList
      :assets="assetStore.assets"
      :loading="assetStore.loading"
      @view="handleViewAsset"
      @delete="handleDeleteConfirm"
      @create="showCreateDialog = true"
    />

      <!-- Create/Edit Dialog -->
      <el-dialog
        v-model="showCreateDialog"
        :title="editingAsset ? 'Edit Asset' : 'Create New Asset'"
        width="600px"
        @close="handleDialogClose"
      >
        <AssetForm
          ref="assetFormRef"
          :initial-data="editingAsset"
          :loading="assetStore.loading"
          :submit-text="editingAsset ? 'Update' : 'Create'"
          @submit="handleSubmitAsset"
          @cancel="handleDialogClose"
        />
      </el-dialog>

      <!-- Delete Confirmation Dialog -->
      <el-dialog
        v-model="showDeleteDialog"
        title="Delete Asset Confirmation"
        width="500px"
      >
        <div v-if="assetToDelete" class="delete-confirmation">
          <div class="warning-banner">
            <div class="warning-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div class="warning-content">
              <h3>Are you sure you want to delete "{{ assetToDelete.name }}"?</h3>
              <p>This action cannot be undone. All data associated with this asset will be permanently removed.</p>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showDeleteDialog = false" size="large">
              Cancel
            </el-button>
            <el-button type="danger" @click="handleDeleteAsset" size="large" :loading="assetStore.loading">
              <el-icon><Delete /></el-icon>
              Confirm Delete
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- View Asset Dialog -->
      <el-dialog
        v-model="showViewDialog"
        title="Asset Details"
        width="700px"
      >
        <div v-if="selectedAsset" class="asset-details">
          <div v-if="selectedAsset.imageUrl" class="detail-image">
            <AssetImage :s3Key="selectedAsset.imageUrl" :alt="selectedAsset.name" />
          </div>
          
          <el-skeleton v-if="loadingAssetInfo" :rows="4" animated />
          
          <el-descriptions v-else :column="2" border>
            <el-descriptions-item label="Name">
              {{ selectedAsset.name }}
            </el-descriptions-item>
            <el-descriptions-item label="Category">
              <el-tag>{{ selectedAsset.category }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Description" :span="2">
              {{ selectedAsset.description }}
            </el-descriptions-item>
            <el-descriptions-item label="Status" v-if="selectedAssetInfo">
              <el-tag :type="getStatusType(selectedAssetInfo.status)">
                {{ selectedAssetInfo.status || 'active' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item 
              label="Tags" 
              :span="selectedAssetInfo ? 1 : 2"
            >
              <div v-if="selectedAssetInfo && selectedAssetInfo.tags && selectedAssetInfo.tags.length > 0" class="tags-container">
                <el-tag
                  v-for="tag in selectedAssetInfo.tags"
                  :key="tag"
                  size="small"
                  class="tag-item"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <span v-else class="no-tags">No tags</span>
            </el-descriptions-item>
            <el-descriptions-item label="Created" :span="selectedAssetInfo && selectedAssetInfo.tags && selectedAssetInfo.tags.length > 0 ? 2 : 1">
              {{ formatDate(selectedAsset.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="Updated" :span="selectedAssetInfo ? 1 : 1">
              {{ formatDate(selectedAsset.updatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import Card from '../components/layout/Card.vue';
import AssetList from '../components/assets/AssetList.vue';
import AssetForm from '../components/assets/AssetForm.vue';
import AssetImage from '../components/assets/AssetImage.vue';
import ConfirmDialog from '../components/common/ConfirmDialog.vue';
import { useAssetStore } from '../stores/assetStore';
import { useAuthStore } from '../stores/authStore';
import type { Asset } from '../stores/assetStore';

// Stores
const assetStore = useAssetStore();
const authStore = useAuthStore();

// State
const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const showViewDialog = ref(false);
const editingAsset = ref<Asset | null>(null);
const selectedAsset = ref<Asset | null>(null);
const assetToDelete = ref<Asset | null>(null);
const selectedAssetInfo = ref<any>(null);
const loadingAssetInfo = ref(false);
const assetFormRef = ref<any>(null);

// Lifecycle - onMounted hook
onMounted(async () => {
  if (authStore.userId) {
    await assetStore.fetchAssets();
  }
});

// Event Handlers
const handleSubmitAsset = async (data: any) => {
  try {
    let imageUrl = '';

    // Step 1: Upload image to S3 first if provided
    if (data.image) {
      // Generate a temporary ID for the S3 path
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      imageUrl = await assetStore.uploadAssetImage(data.image, tempId);
      ElMessage.info('Image uploaded successfully');
    }

    // Step 2: Create asset in RDS via API Gateway Lambda with image URL
    const assetData = {
      name: data.name,
      description: data.description,
      category: data.category,
      imageUrl: imageUrl,
      userId: authStore.userId!,
    };

    const newAsset = await assetStore.createAsset(assetData);

    // Step 3: Create asset info in DynamoDB
    if (newAsset) {
      await assetStore.createAssetInfo({
        assetId: newAsset.id,
        tags: data.tags || [],
        status: data.status || 'active',
        userId: authStore.userId!,
      });

      // Step 4: Log the action
      await assetStore.createAssetLog({
        assetId: newAsset.id,
        action: 'created',
        userId: authStore.userId!,
        details: `Created asset: ${newAsset.name}`,
      });
      
      // Step 5: Refresh asset info to update counts
      await assetStore.fetchAllAssetInfo();
    }

    ElMessage.success('Asset created successfully!');
    showCreateDialog.value = false;
    editingAsset.value = null;
    
    // Reset form after successful creation
    if (assetFormRef.value) {
      assetFormRef.value.resetForm();
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Failed to create asset');
  }
};

const handleViewAsset = async (asset: Asset) => {
  selectedAsset.value = asset;
  selectedAssetInfo.value = null;
  showViewDialog.value = true;
  
  // Fetch asset info (tags, status) from DynamoDB
  loadingAssetInfo.value = true;
  try {
    const assetInfo = await assetStore.getAssetInfo(asset.id);
    selectedAssetInfo.value = assetInfo;
  } catch (error) {
    console.error('Error fetching asset info:', error);
    selectedAssetInfo.value = null;
  } finally {
    loadingAssetInfo.value = false;
  }
  
  // Log view action
  assetStore.createAssetLog({
    assetId: asset.id,
    action: 'viewed',
    userId: authStore.userId!,
  });
};

const handleDeleteConfirm = (asset: Asset) => {
  assetToDelete.value = asset;
  showDeleteDialog.value = true;
};

const handleDeleteAsset = async () => {
  if (!assetToDelete.value) return;

  try {
    await assetStore.deleteAsset(assetToDelete.value.id);
    
    // Log deletion
    await assetStore.createAssetLog({
      assetId: assetToDelete.value.id,
      action: 'deleted',
      userId: authStore.userId!,
      details: `Deleted asset: ${assetToDelete.value.name}`,
    });

    ElMessage.success('Asset deleted successfully!');
    showDeleteDialog.value = false;
    assetToDelete.value = null;
  } catch (error: any) {
    ElMessage.error(error.message || 'Failed to delete asset');
  }
};

const handleDialogClose = () => {
  showCreateDialog.value = false;
  editingAsset.value = null;
  
  // Reset form when dialog closes
  if (assetFormRef.value) {
    assetFormRef.value.resetForm();
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusType = (status: string) => {
  const types: Record<string, any> = {
    active: 'success',
    inactive: 'warning',
    archived: 'info',
  };
  return types[status] || 'success';
};
</script>

<style scoped>
.asset-management {
  width: 100%;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2.5rem;
  max-width: 1200px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  padding: 1rem 0;
}

.stat-active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-inactive {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.actions-bar {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.actions-left {
  flex: 1;
  min-width: 200px;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 1.25rem;
  }
}

.asset-details {
  padding: 0.5rem 0;
}

.detail-image {
  width: 100%;
  max-height: 350px;
  margin-bottom: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  margin: 0;
}

.no-tags {
  color: #999;
  font-style: italic;
  font-size: 0.9rem;
}

.delete-confirmation {
  padding: 0.5rem 0;
}

.warning-banner {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 8px;
  align-items: flex-start;
}

.warning-icon {
  flex-shrink: 0;
}

.warning-icon svg {
  width: 48px;
  height: 48px;
  color: #ef4444;
}

.warning-content h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #dc2626;
  line-height: 1.4;
}

.warning-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #991b1b;
  line-height: 1.6;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .warning-banner {
    flex-direction: column;
    text-align: center;
  }

  .warning-icon {
    display: flex;
    justify-content: center;
  }

  .dialog-footer {
    flex-direction: column-reverse;
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}
</style>
