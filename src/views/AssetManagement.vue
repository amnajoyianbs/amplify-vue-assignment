<template>
  <AppLayout>
    <template #header>
      <div class="header-content">
        <h1>Asset Management System</h1>
        <div class="header-actions">
          <span class="user-info">{{ authStore.userEmail }}</span>
          <el-button type="danger" @click="handleSignOut">Sign Out</el-button>
        </div>
      </div>
    </template>

    <div class="asset-management">
      <!-- Stats Section -->
      <div class="stats-section">
        <Card title="Total Assets">
          <div class="stat-value">{{ assetStore.assetCount }}</div>
        </Card>
        <Card title="Active Assets">
          <div class="stat-value">{{ assetStore.activeAssets.length }}</div>
        </Card>
      </div>

      <!-- Actions Bar -->
      <div class="actions-bar">
        <el-button type="primary" @click="showCreateDialog = true">
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
          :initial-data="editingAsset"
          :loading="assetStore.loading"
          :submit-text="editingAsset ? 'Update' : 'Create'"
          @submit="handleSubmitAsset"
          @cancel="handleDialogClose"
        />
      </el-dialog>

      <!-- Delete Confirmation -->
      <ConfirmDialog
        :is-open="showDeleteDialog"
        title="Delete Asset"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        confirm-text="Delete"
        cancel-text="Cancel"
        @confirm="handleDeleteAsset"
        @close="showDeleteDialog = false"
      />

      <!-- View Asset Dialog -->
      <el-dialog
        v-model="showViewDialog"
        title="Asset Details"
        width="700px"
      >
        <div v-if="selectedAsset" class="asset-details">
          <div v-if="selectedAsset.imageUrl" class="detail-image">
            <img :src="selectedAsset.imageUrl" :alt="selectedAsset.name" />
          </div>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="Name">
              {{ selectedAsset.name }}
            </el-descriptions-item>
            <el-descriptions-item label="Category">
              <el-tag>{{ selectedAsset.category }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="Description" :span="2">
              {{ selectedAsset.description }}
            </el-descriptions-item>
            <el-descriptions-item label="Created">
              {{ formatDate(selectedAsset.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="Updated">
              {{ formatDate(selectedAsset.updatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-dialog>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import AppLayout from '../components/layout/AppLayout.vue';
import Card from '../components/layout/Card.vue';
import AssetList from '../components/assets/AssetList.vue';
import AssetForm from '../components/assets/AssetForm.vue';
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

// Lifecycle - onMounted hook
onMounted(async () => {
  if (authStore.userId) {
    await assetStore.fetchAssets(authStore.userId);
  }
});

// Event Handlers
const handleSubmitAsset = async (data: any) => {
  try {
    // Step 1: Create asset in DynamoDB (without image URL first)
    const assetData = {
      name: data.name,
      description: data.description,
      category: data.category,
      imageUrl: '',
      userId: authStore.userId!,
    };

    const newAsset = await assetStore.createAsset(assetData);

    // Step 2: Upload image if provided and update asset with S3 URL
    if (data.image && newAsset) {
      const imageUrl = await assetStore.uploadAssetImage(data.image, newAsset.id);
      
      // Update the asset in DynamoDB with the S3 URL
      await assetStore.updateAsset(newAsset.id, { imageUrl });
      newAsset.imageUrl = imageUrl;
    }

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
    }

    ElMessage.success('Asset created successfully!');
    showCreateDialog.value = false;
    editingAsset.value = null;
  } catch (error: any) {
    ElMessage.error(error.message || 'Failed to create asset');
  }
};

const handleViewAsset = (asset: Asset) => {
  selectedAsset.value = asset;
  showViewDialog.value = true;
  
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
};

const handleSignOut = async () => {
  await authStore.signOut();
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
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  color: white;
  font-size: 0.9rem;
}

.asset-management {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #409eff;
  text-align: center;
  padding: 1rem 0;
}

.actions-bar {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.asset-details {
  padding: 1rem 0;
}

.detail-image {
  width: 100%;
  max-height: 300px;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
