<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="handleClose" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-2xl transition-all"
            >
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                  <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <DialogTitle
                    as="h3"
                    class="text-lg font-semibold leading-6 text-gray-900 mb-2"
                  >
                    {{ title }}
                  </DialogTitle>
                  <div class="mt-3">
                    <p class="text-sm text-gray-600 leading-relaxed">
                      {{ message }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="handleClose"
                >
                  {{ cancelText }}
                </button>
                <button
                  type="button"
                  class="btn btn-danger"
                  @click="handleConfirm"
                >
                  {{ confirmText }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';

// Props
defineProps<{
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}>();

// Emits
const emit = defineEmits<{
  confirm: [];
  close: [];
}>();

const handleConfirm = () => {
  emit('confirm');
};

const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
  border-color: #d1d5db;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.btn-danger:hover {
  background-color: #dc2626;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}
</style>
