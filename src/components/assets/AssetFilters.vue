<template>
  <Card title="Filters">
    <div class="filters-container">
      <!-- Search input with v-model -->
      <el-input
        v-model="localFilters.search"
        placeholder="Search assets..."
        clearable
        @input="handleFilterChange"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <!-- Category filter -->
      <el-select
        v-model="localFilters.category"
        placeholder="All Categories"
        clearable
        @change="handleFilterChange"
      >
        <el-option label="All Categories" value="" />
        <el-option label="Electronics" value="electronics" />
        <el-option label="Furniture" value="furniture" />
        <el-option label="Vehicles" value="vehicles" />
        <el-option label="Equipment" value="equipment" />
        <el-option label="Other" value="other" />
      </el-select>

      <!-- Status filter -->
      <el-select
        v-model="localFilters.status"
        placeholder="All Status"
        clearable
        @change="handleFilterChange"
      >
        <el-option label="All Status" value="" />
        <el-option label="Active" value="active" />
        <el-option label="Inactive" value="inactive" />
        <el-option label="Archived" value="archived" />
      </el-select>

      <!-- Reset button -->
      <el-button @click="handleReset">Reset Filters</el-button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import Card from '../layout/Card.vue';

// Props
const props = defineProps<{
  filters: {
    search: string;
    category: string;
    status: string;
  };
}>();

// Emits
const emit = defineEmits<{
  update: [filters: typeof props.filters];
}>();

// Local state
const localFilters = reactive({ ...props.filters });

// Watch for external changes
watch(
  () => props.filters,
  (newFilters) => {
    Object.assign(localFilters, newFilters);
  },
  { deep: true }
);

// Handlers
const handleFilterChange = () => {
  emit('update', { ...localFilters });
};

const handleReset = () => {
  localFilters.search = '';
  localFilters.category = '';
  localFilters.status = '';
  handleFilterChange();
};
</script>

<style scoped>
.filters-container {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
}

@media (max-width: 768px) {
  .filters-container {
    grid-template-columns: 1fr;
  }
}
</style>
