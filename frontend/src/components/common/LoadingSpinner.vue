<template>
  <div v-if="show" class="loading-overlay">
    <div class="text-center">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p v-if="message" class="text-white mt-3">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  message?: string;
}>();
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>
