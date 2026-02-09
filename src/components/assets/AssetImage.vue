<template>
  <div v-if="s3Key" class="asset-image-wrapper">
    <img v-if="imageUrl" :src="imageUrl" :alt="alt" />
    <div v-else class="image-loading">
      <el-icon class="is-loading"><Loading /></el-icon>
    </div>
  </div>
  <div v-else class="asset-image-placeholder">
    <el-icon :size="48"><Picture /></el-icon>
  </div>
</template>

<script setup lang="ts">
import { Loading, Picture } from '@element-plus/icons-vue';
import { useAssetImage } from '../../composables/useAssetImage';

const props = defineProps<{
  s3Key?: string;
  alt?: string;
}>();

const { imageUrl } = useAssetImage(props.s3Key);
</script>

<style scoped>
.asset-image-wrapper {
  width: 100%;
  height: 100%;
}

.asset-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.asset-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf0 100%);
  color: #a0a0a0;
}
</style>
