<template>
  <div class="card" :class="{ 'card-hoverable': hoverable }">
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

<script setup lang="ts">
// Card component with slots for flexible content
defineProps<{
  title?: string;
  hoverable?: boolean;
}>();
</script>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  overflow: hidden;
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.card-hoverable {
  cursor: pointer;
}

.card-hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-color: #667eea;
}

.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
}

.card-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1a1a1a;
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
  background: #fafbfc;
}
</style>
