<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(async () => {
  // Cargar usuario desde localStorage al iniciar la app
  await authStore.loadUserFromStorage();
});
</script>

<style>
/* Los estilos globales están en main.css */
</style>