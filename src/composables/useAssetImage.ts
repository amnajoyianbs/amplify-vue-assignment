import { ref, watch } from 'vue';
import { getUrl } from 'aws-amplify/storage';

export function useAssetImage(s3Key: string | undefined) {
  const imageUrl = ref<string>('');
  const loading = ref(false);

  const loadImage = async () => {
    if (!s3Key) {
      imageUrl.value = '';
      return;
    }

    loading.value = true;
    try {
      const urlResult = await getUrl({ path: s3Key });
      imageUrl.value = urlResult.url.toString();
    } catch (error) {
      console.error('Error loading image:', error);
      imageUrl.value = '';
    } finally {
      loading.value = false;
    }
  };

  // Load image when s3Key changes
  watch(() => s3Key, loadImage, { immediate: true });

  return {
    imageUrl,
    loading,
    refresh: loadImage,
  };
}
