<template>
  <div
    v-if="show"
    class="alert alert-dismissible fade show"
    :class="alertClass"
    role="alert"
  >
    <i :class="iconClass" class="me-2"></i>
    {{ message }}
    <button type="button" class="btn-close" @click="$emit('close')"></button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}>();

defineEmits(['close']);

const alertClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'alert-success';
    case 'error':
      return 'alert-danger';
    case 'warning':
      return 'alert-warning';
    case 'info':
      return 'alert-info';
    default:
      return 'alert-info';
  }
});

const iconClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bi bi-check-circle-fill';
    case 'error':
      return 'bi bi-exclamation-triangle-fill';
    case 'warning':
      return 'bi bi-exclamation-circle-fill';
    case 'info':
      return 'bi bi-info-circle-fill';
    default:
      return 'bi bi-info-circle-fill';
  }
});
</script>
