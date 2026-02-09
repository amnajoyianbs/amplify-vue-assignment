<template>
  <div class="asset-list">
    <!-- Loading state with v-if -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- Empty state with v-else-if -->
    <div v-else-if="!assets || assets.length === 0" class="empty-state">
      <el-empty description="No assets found" :image-size="120">
        <template #description>
          <p class="empty-description">Get started by creating your first asset</p>
        </template>
        <el-button type="primary" size="large" @click="$emit('create')">
          <el-icon><Plus /></el-icon>
          Create First Asset
        </el-button>
      </el-empty>
    </div>

    <!-- Asset grid with v-else -->
    <div v-else class="asset-grid">
      <Card
        v-for="asset in assets"
        :key="asset.id"
        :hoverable="true"
        @click="handleAssetClick(asset)"
      >
        <template #header>
          <div class="asset-header">
            <h4>{{ asset.name }}</h4>
            <el-tag :type="getCategoryType(asset.category)" size="small">
              {{ asset.category }}
            </el-tag>
          </div>
        </template>

        <div class="asset-content">
          <!-- Conditional image rendering -->
          <div class="asset-image">
            <AssetImage :s3Key="asset.imageUrl" :alt="asset.name" />
          </div>

          <p class="asset-description">
            {{ truncateText(asset.description, 100) }}
          </p>
        </div>

        <template #footer>
          <div class="asset-actions">
            <el-button
              type="primary"
              size="small"
              plain
              @click.stop="handleView(asset)"
            >
              <el-icon><View /></el-icon>
              View Details
            </el-button>
            <el-button
              type="danger"
              size="small"
              plain
              @click.stop="handleDelete(asset)"
            >
              <el-icon><Delete /></el-icon>
              Delete
            </el-button>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Picture, View, Delete, Plus } from '@element-plus/icons-vue';
import Card from '../layout/Card.vue';
import AssetImage from './AssetImage.vue';
import type { Asset } from '../../stores/assetStore';

// Props
const props = defineProps<{
  assets: Asset[];
  loading?: boolean;
}>();

// Emits
const emit = defineEmits<{
  view: [asset: Asset];
  delete: [asset: Asset];
  create: [];
  click: [asset: Asset];
}>();

// Methods
const handleAssetClick = (asset: Asset) => {
  emit('click', asset);
};

const handleView = (asset: Asset) => {
  emit('view', asset);
};

const handleDelete = (asset: Asset) => {
  emit('delete', asset);
};

const getCategoryType = (category: string) => {
  const types: Record<string, any> = {
    electronics: 'primary',
    furniture: 'success',
    vehicles: 'warning',
    equipment: 'info',
    other: 'default',
  };
  return types[category] || 'default';
};

const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength
    ? text.substring(0, maxLength) + '...'
    : text;
};
</script>

<style scoped>
.asset-list {
  width: 100%;
}

.loading-container {
  padding: 2rem;
}

.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.empty-description {
  color: #666;
  font-size: 0.95rem;
  margin-top: 0.5rem;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

@media (min-width: 1400px) {
  .asset-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) and (max-width: 1399px) {
  .asset-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .asset-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .asset-grid {
    grid-template-columns: 1fr;
  }
}

.asset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.asset-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.asset-content {
  min-height: 200px;
}

.asset-image {
  width: 100%;
  height: 180px;
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.asset-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
  min-height: 60px;
}

.asset-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.asset-actions .el-button {
  flex: 1;
  max-width: 140px;
}
</style>
