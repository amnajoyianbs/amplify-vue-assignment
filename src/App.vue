<script setup lang="ts">
import { onMounted } from 'vue';
import { Authenticator } from '@aws-amplify/ui-vue';
import '@aws-amplify/ui-vue/styles.css';
import AssetManagement from './views/AssetManagement.vue';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.checkAuth();
});

const handleSignOut = async () => {
  await authStore.signOut();
};
</script>

<template>
  <Authenticator>
    <template v-slot="{ signOut, user }">
      <div class="app-container">
        <!-- Top Navigation Bar -->
        <header class="top-nav">
          <div class="nav-content">
            <div class="nav-left">
              <h1 class="app-title">
                <svg class="app-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                Asset Management System
              </h1>
            </div>
            <div class="nav-right">
              <span class="user-email">{{ authStore.userEmail }}</span>
              <button class="logout-btn" @click="handleSignOut">
                <svg class="logout-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
          <AssetManagement />
        </main>
      </div>
    </template>
  </Authenticator>
</template>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f8f9fa;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.top-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.nav-content {
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  flex: 1;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.app-icon {
  width: 28px;
  height: 28px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-email {
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.9rem;
  font-weight: 500;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-icon {
  width: 18px;
  height: 18px;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.logout-btn:active {
  transform: translateY(0);
}

.main-content {
  flex: 1;
  padding: 2rem;
  width: 100%;
}

@media (max-width: 768px) {
  .nav-content {
    padding: 1rem;
  }

  .app-title {
    font-size: 1.2rem;
  }

  .user-email {
    display: none;
  }

  .main-content {
    padding: 1rem;
  }

  .app-icon {
    width: 24px;
    height: 24px;
  }
}
</style>

