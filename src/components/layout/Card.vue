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
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-hoverable {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.card-hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #303133;
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}
</style>
