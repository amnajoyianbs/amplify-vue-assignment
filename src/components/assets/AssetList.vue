<template>
  <div class="asset-list">
    <!-- Loading state with v-if -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- Empty state with v-else-if -->
    <div v-else-if="!assets || assets.length === 0" class="empty-state">
      <el-empty description="No assets found">
        <el-button type="primary" @click="$emit('create')">
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
          <div v-if="asset.imageUrl" class="asset-image">
            <img :src="asset.imageUrl" :alt="asset.name" />
          </div>
          <div v-else class="asset-image-placeholder">
            <el-icon :size="48"><Picture /></el-icon>
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
              @click.stop="handleView(asset)"
            >
              View
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click.stop="handleDelete(asset)"
            >
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
import { Picture } from '@element-plus/icons-vue';
import Card from '../layout/Card.vue';
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
  padding: 3rem;
  text-align: center;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.asset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.asset-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #303133;
}

.asset-content {
  min-height: 200px;
}

.asset-image {
  width: 100%;
  height: 150px;
  margin-bottom: 1rem;
  border-radius: 4px;
  overflow: hidden;
}

.asset-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-image-placeholder {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 1rem;
  color: #909399;
}

.asset-description {
  color: #606266;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.asset-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>
