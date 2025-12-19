<template>
  <div class="main-wrapper">
    <Sidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />
    
    <div class="main-content">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      
      <div class="content-area">
        <div class="container-fluid">
          <div class="text-center p-5">
            <i class="bi bi-gear text-muted" style="font-size: 5rem;"></i>
            <h2 class="mt-4">Configuración</h2>
            <p class="text-muted">Módulo en construcción - Próximamente</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';

const sidebarOpen = ref(false);
</script>