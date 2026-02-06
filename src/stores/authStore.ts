import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getCurrentUser, signOut as amplifySignOut } from 'aws-amplify/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);

  const userId = computed(() => user.value?.userId || null);
  const userEmail = computed(() => user.value?.signInDetails?.loginId || null);

  const checkAuth = async () => {
    loading.value = true;
    try {
      const currentUser = await getCurrentUser();
      user.value = currentUser;
      isAuthenticated.value = true;
    } catch (error) {
      user.value = null;
      isAuthenticated.value = false;
    } finally {
      loading.value = false;
    }
  };

  const signOut = async () => {
    try {
      await amplifySignOut();
      user.value = null;
      isAuthenticated.value = false;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    userId,
    userEmail,
    checkAuth,
    signOut,
  };
});
