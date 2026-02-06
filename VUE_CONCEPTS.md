# Vue 3 Concepts Demonstrated

This document maps each Vue 3 requirement to specific implementations in the codebase.

## 1. Component-Based Architecture

### Implementation
- **Layout Components**: `AppLayout.vue`, `Card.vue`
- **Feature Components**: `AssetForm.vue`, `AssetList.vue`, `AssetFilters.vue`
- **Common Components**: `ConfirmDialog.vue`
- **Views**: `AssetManagement.vue`

### Files
```
src/components/
├── layout/
│   ├── AppLayout.vue      # Main layout wrapper
│   └── Card.vue           # Reusable card component
├── assets/
│   ├── AssetForm.vue      # Form component
│   ├── AssetList.vue      # List display component
│   └── AssetFilters.vue   # Filter component
└── common/
    └── ConfirmDialog.vue  # Modal dialog component
```

## 2. Templates and Directives

### v-if, v-else-if, v-else (Conditional Rendering)
**File**: `src/components/assets/AssetList.vue`
```vue
<!-- Loading state -->
<div v-if="loading" class="loading-container">
  <el-skeleton :rows="3" animated />
</div>

<!-- Empty state -->
<div v-else-if="!assets || assets.length === 0" class="empty-state">
  <el-empty description="No assets found" />
</div>

<!-- Asset grid -->
<div v-else class="asset-grid">
  <!-- Content -->
</div>
```

**File**: `src/components/assets/AssetList.vue` (Image rendering)
```vue
<div v-if="asset.imageUrl" class="asset-image">
  <img :src="asset.imageUrl" :alt="asset.name" />
</div>
<div v-else class="asset-image-placeholder">
  <el-icon :size="48"><Picture /></el-icon>
</div>
```

### v-for (List Rendering)
**File**: `src/components/assets/AssetList.vue`
```vue
<Card
  v-for="asset in assets"
  :key="asset.id"
  :hoverable="true"
  @click="handleAssetClick(asset)"
>
  <!-- Card content -->
</Card>
```

### v-model (Two-Way Data Binding)
**File**: `src/components/assets/AssetForm.vue`
```vue
<!-- Text input -->
<el-input v-model="formData.name" placeholder="Enter asset name" />

<!-- Textarea -->
<el-input v-model="formData.description" type="textarea" />

<!-- Select -->
<el-select v-model="formData.category" placeholder="Select category">
  <el-option label="Electronics" value="electronics" />
</el-select>

<!-- Radio group -->
<el-radio-group v-model="formData.status">
  <el-radio label="active">Active</el-radio>
  <el-radio label="inactive">Inactive</el-radio>
</el-radio-group>
```

**File**: `src/components/assets/AssetFilters.vue`
```vue
<el-input v-model="localFilters.search" placeholder="Search assets..." />
<el-select v-model="localFilters.category" placeholder="All Categories" />
<el-select v-model="localFilters.status" placeholder="All Status" />
```

### Dynamic Attributes (:class, :style, :src, etc.)
**File**: `src/components/layout/Card.vue`
```vue
<div class="card" :class="{ 'card-hoverable': hoverable }">
```

**File**: `src/components/assets/AssetList.vue`
```vue
<el-tag :type="getCategoryType(asset.category)" size="small">
  {{ asset.category }}
</el-tag>
```

## 3. Event Handling

### @click Events
**File**: `src/components/assets/AssetList.vue`
```vue
<Card @click="handleAssetClick(asset)">
  <el-button @click.stop="handleView(asset)">View</el-button>
  <el-button @click.stop="handleDelete(asset)">Delete</el-button>
</Card>
```

**File**: `src/views/AssetManagement.vue`
```vue
<el-button type="primary" @click="showCreateDialog = true">
  Create New Asset
</el-button>
<el-button type="danger" @click="handleSignOut">Sign Out</el-button>
```

### @submit, @input, @change Events
**File**: `src/components/assets/AssetForm.vue`
```vue
<el-form @submit.prevent="handleSubmit">
  <el-input v-model="formData.name" @input="handleInput" />
  <el-select v-model="formData.category" @change="handleFilterChange" />
</el-form>
```

### Custom Events (emit)
**File**: `src/components/assets/AssetForm.vue`
```vue
<script setup lang="ts">
const emit = defineEmits<{
  submit: [data: any];
  cancel: [];
  input: [value: string];
}>();

const handleSubmit = () => {
  emit('submit', { ...formData, tags });
};

const handleCancel = () => {
  emit('cancel');
};
</script>
```

**File**: `src/components/assets/AssetList.vue`
```vue
<script setup lang="ts">
const emit = defineEmits<{
  view: [asset: Asset];
  delete: [asset: Asset];
  create: [];
  click: [asset: Asset];
}>();

const handleView = (asset: Asset) => {
  emit('view', asset);
};
</script>
```

## 4. Forms and Two-Way Data Binding

### Form with Validation
**File**: `src/components/assets/AssetForm.vue`
```vue
<script setup lang="ts">
const formData = reactive({
  name: '',
  description: '',
  category: '',
  status: 'active',
  image: null as File | null,
});

const rules = reactive<FormRules>({
  name: [
    { required: true, message: 'Please enter asset name', trigger: 'blur' },
    { min: 3, max: 50, message: 'Length should be 3 to 50', trigger: 'blur' },
  ],
  description: [
    { required: true, message: 'Please enter description', trigger: 'blur' },
  ],
  category: [
    { required: true, message: 'Please select category', trigger: 'change' },
  ],
});
</script>
```

### File Upload
**File**: `src/components/assets/AssetForm.vue`
```vue
<el-upload
  :auto-upload="false"
  :on-change="handleFileChange"
  :limit="1"
  accept="image/*"
>
  <el-button type="primary">Select Image</el-button>
</el-upload>

<script setup lang="ts">
const handleFileChange = (file: any) => {
  formData.image = file.raw;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file.raw);
};
</script>
```

## 5. State Management (Pinia)

### Store Definition
**File**: `src/stores/assetStore.ts`
```typescript
export const useAssetStore = defineStore('asset', () => {
  // State
  const assets = ref<Asset[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const assetCount = computed(() => assets.value.length);
  const activeAssets = computed(() => 
    assets.value.filter(a => a.category !== 'archived')
  );

  // Actions
  const fetchAssets = async (userId: string) => {
    loading.value = true;
    // ... fetch logic
  };

  return {
    assets,
    loading,
    error,
    assetCount,
    activeAssets,
    fetchAssets,
  };
});
```

### Store Usage
**File**: `src/views/AssetManagement.vue`
```vue
<script setup lang="ts">
import { useAssetStore } from '../stores/assetStore';
import { useAuthStore } from '../stores/authStore';

const assetStore = useAssetStore();
const authStore = useAuthStore();

// Access state
const assets = assetStore.assets;
const loading = assetStore.loading;

// Call actions
await assetStore.fetchAssets(authStore.userId);
</script>
```

## 6. Component Communication

### Props (Parent → Child)
**File**: `src/components/layout/Card.vue`
```vue
<script setup lang="ts">
defineProps<{
  title?: string;
  hoverable?: boolean;
}>();
</script>
```

**File**: `src/components/assets/AssetList.vue`
```vue
<script setup lang="ts">
const props = defineProps<{
  assets: Asset[];
  loading?: boolean;
}>();
</script>
```

**Usage in Parent**:
```vue
<AssetList
  :assets="assetStore.assets"
  :loading="assetStore.loading"
/>
```

### Emits (Child → Parent)
**File**: `src/components/assets/AssetForm.vue`
```vue
<script setup lang="ts">
const emit = defineEmits<{
  submit: [data: any];
  cancel: [];
}>();
</script>
```

**Usage in Parent** (`src/views/AssetManagement.vue`):
```vue
<AssetForm
  @submit="handleSubmitAsset"
  @cancel="handleDialogClose"
/>
```

## 7. Slots (Content Projection)

### Named Slots
**File**: `src/components/layout/AppLayout.vue`
```vue
<template>
  <div class="app-layout">
    <header class="app-header">
      <slot name="header">
        <div class="header-content">
          <h1>Asset Management</h1>
        </div>
      </slot>
    </header>
    
    <main class="app-main">
      <slot></slot>
    </main>
    
    <footer class="app-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

**Usage** (`src/views/AssetManagement.vue`):
```vue
<AppLayout>
  <template #header>
    <div class="header-content">
      <h1>Asset Management System</h1>
      <el-button @click="handleSignOut">Sign Out</el-button>
    </div>
  </template>

  <!-- Default slot content -->
  <div class="asset-management">
    <!-- Main content -->
  </div>
</AppLayout>
```

### Card Component with Slots
**File**: `src/components/layout/Card.vue`
```vue
<template>
  <div class="card">
    <div class="card-header" v-if="$slots.header || title">
      <slot name="header">
        <h3>{{ title }}</h3>
      </slot>
    </div>
    
    <div class="card-body">
      <slot></slot>
    </div>
    
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
```

**Usage** (`src/components/assets/AssetList.vue`):
```vue
<Card :hoverable="true">
  <template #header>
    <div class="asset-header">
      <h4>{{ asset.name }}</h4>
      <el-tag>{{ asset.category }}</el-tag>
    </div>
  </template>

  <div class="asset-content">
    <!-- Body content -->
  </div>

  <template #footer>
    <div class="asset-actions">
      <el-button>View</el-button>
      <el-button>Delete</el-button>
    </div>
  </template>
</Card>
```

## 8. Lifecycle Hooks

### onMounted
**File**: `src/views/AssetManagement.vue`
```vue
<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(async () => {
  if (authStore.userId) {
    await assetStore.fetchAssets(authStore.userId);
  }
});
</script>
```

**File**: `src/App.vue`
```vue
<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(async () => {
  await authStore.checkAuth();
});
</script>
```

## 9. User Prompts and Confirmations

### Headless UI Dialog
**File**: `src/components/common/ConfirmDialog.vue`
```vue
<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog @close="handleClose">
      <DialogPanel>
        <DialogTitle>{{ title }}</DialogTitle>
        <p>{{ message }}</p>
        <button @click="handleConfirm">{{ confirmText }}</button>
        <button @click="handleClose">{{ cancelText }}</button>
      </DialogPanel>
    </Dialog>
  </TransitionRoot>
</template>
```

**Usage** (`src/views/AssetManagement.vue`):
```vue
<ConfirmDialog
  :is-open="showDeleteDialog"
  title="Delete Asset"
  message="Are you sure you want to delete this asset?"
  confirm-text="Delete"
  cancel-text="Cancel"
  @confirm="handleDeleteAsset"
  @close="showDeleteDialog = false"
/>
```

### Element Plus Dialog
**File**: `src/views/AssetManagement.vue`
```vue
<el-dialog
  v-model="showCreateDialog"
  title="Create New Asset"
  width="600px"
  @close="handleDialogClose"
>
  <AssetForm
    @submit="handleSubmitAsset"
    @cancel="handleDialogClose"
  />
</el-dialog>
```

## 10. UI Libraries Integration

### Element Plus Components Used
- `el-form`, `el-form-item` - Forms
- `el-input` - Text inputs
- `el-select`, `el-option` - Dropdowns
- `el-button` - Buttons
- `el-dialog` - Modals
- `el-upload` - File uploads
- `el-tag` - Tags
- `el-skeleton` - Loading states
- `el-empty` - Empty states
- `el-descriptions` - Data display
- `el-icon` - Icons
- `el-radio-group`, `el-radio` - Radio buttons
- `ElMessage` - Toast notifications

### Headless UI Components Used
- `Dialog`, `DialogPanel`, `DialogTitle` - Accessible modals
- `TransitionRoot`, `TransitionChild` - Animations

## Summary

This implementation demonstrates all required Vue 3 concepts:

✅ **Component-based architecture** - Modular, reusable components
✅ **Templates and directives** - v-if, v-else, v-for, v-model
✅ **Conditional rendering** - Loading, empty, and content states
✅ **Event handling** - @click, @submit, @input, custom events
✅ **Forms and two-way binding** - v-model with validation
✅ **State management** - Pinia stores with reactive state
✅ **Component communication** - Props and emits
✅ **Slots** - Named and default slots for layouts
✅ **Lifecycle hooks** - onMounted for data fetching
✅ **User confirmations** - Modal dialogs for critical actions
✅ **Element Plus** - Primary UI framework
✅ **Headless UI** - Accessible modal components
