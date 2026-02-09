<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="120px"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="Name" prop="name">
      <el-input
        v-model="formData.name"
        placeholder="Enter asset name"
        @input="handleInput"
      />
    </el-form-item>

    <el-form-item label="Description" prop="description">
      <el-input
        v-model="formData.description"
        type="textarea"
        :rows="3"
        placeholder="Enter asset description"
      />
    </el-form-item>

    <el-form-item label="Category" prop="category">
      <el-select
        v-model="formData.category"
        placeholder="Select category"
        style="width: 100%"
      >
        <el-option label="Electronics" value="electronics" />
        <el-option label="Furniture" value="furniture" />
        <el-option label="Vehicles" value="vehicles" />
        <el-option label="Equipment" value="equipment" />
        <el-option label="Other" value="other" />
      </el-select>
    </el-form-item>

    <el-form-item label="Image" prop="image">
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept="image/*"
      >
        <el-button type="primary">Select Image</el-button>
        <template #tip>
          <div class="el-upload__tip">
            jpg/png files with a size less than 5MB
          </div>
        </template>
      </el-upload>
      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="Preview" />
      </div>
    </el-form-item>

    <el-form-item label="Tags">
      <el-input
        v-model="tagsInput"
        placeholder="Enter tags separated by commas"
      />
    </el-form-item>

    <el-form-item label="Status">
      <el-radio-group v-model="formData.status">
        <el-radio label="active">Active</el-radio>
        <el-radio label="inactive">Inactive</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        {{ submitText }}
      </el-button>
      <el-button @click="handleCancel">Cancel</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import type { FormInstance, FormRules, UploadInstance } from 'element-plus';

// Props
const props = defineProps<{
  initialData?: any;
  loading?: boolean;
  submitText?: string;
}>();

// Emits - demonstrating custom events
const emit = defineEmits<{
  submit: [data: any];
  cancel: [];
  input: [value: string];
}>();

// Form ref
const formRef = ref<FormInstance>();
const uploadRef = ref<UploadInstance>();

// Form data with v-model
const formData = reactive({
  name: props.initialData?.name || '',
  description: props.initialData?.description || '',
  category: props.initialData?.category || '',
  status: props.initialData?.status || 'active',
  image: null as File | null,
});

const tagsInput = ref('');
const imagePreview = ref('');

// Validation rules
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

// Reset form
const resetForm = () => {
  formData.name = '';
  formData.description = '';
  formData.category = '';
  formData.status = 'active';
  formData.image = null;
  tagsInput.value = '';
  imagePreview.value = '';
  formRef.value?.resetFields();
  
  // Clear upload component
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// Watch for initialData changes (when dialog opens/closes)
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.name = newVal.name || '';
    formData.description = newVal.description || '';
    formData.category = newVal.category || '';
    formData.status = newVal.status || 'active';
  } else {
    resetForm();
  }
});

// Event handlers
const handleInput = (value: string) => {
  emit('input', value);
};

const handleFileChange = (file: any) => {
  formData.image = file.raw;
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file.raw);
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid) => {
    if (valid) {
      const tags = tagsInput.value
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      emit('submit', {
        ...formData,
        tags,
      });
    }
  });
};

const handleCancel = () => {
  emit('cancel');
};

// Expose reset method for parent component
defineExpose({
  resetForm,
});
</script>

<style scoped>
.image-preview {
  margin-top: 1rem;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 7px;
}
</style>
