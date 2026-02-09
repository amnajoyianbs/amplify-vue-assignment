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

<script setup lang="ts">
// Layout component demonstrating slots
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.header-content h1 {
  margin: 0;
  font-size: 1.5rem;
}

.app-main {
  flex: 1;
  padding: 2.5rem;
  background: #f8f9fa;
  min-height: calc(100vh - 80px);
}

.app-footer {
  background: #f0f2f5;
  padding: 1rem 2rem;
  text-align: center;
  border-top: 1px solid #dcdfe6;
}
</style>
