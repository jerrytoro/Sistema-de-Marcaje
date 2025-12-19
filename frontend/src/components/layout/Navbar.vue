<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
    <div class="container-fluid">
      <!-- Toggle sidebar (móvil) -->
      <button class="btn btn-link d-lg-none" type="button" @click="$emit('toggle-sidebar')">
        <i class="bi bi-list fs-4"></i>
      </button>

      <!-- Título de página actual -->
      <span class="navbar-brand mb-0 h1 ms-2 d-lg-none">
        {{ pageTitle }}
      </span>

      <!-- Navegación derecha -->
      <div class="ms-auto d-flex align-items-center gap-3">
        <!-- Notificaciones -->
        <!-- <div class="dropdown">
          <button class="btn btn-link text-dark position-relative" type="button" data-bs-toggle="dropdown">
            <i class="bi bi-bell fs-5"></i>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              0
            </span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <h6 class="dropdown-header">Notificaciones</h6>
            </li>
            <li>
              <hr class="dropdown-divider" />
            </li>
            <li class="text-center text-muted p-3">
              <small>No hay notificaciones</small>
            </li>
          </ul>
        </div> -->

        <!-- Usuario -->
        <div class="dropdown" ref="dropdownRef">
          <button class="btn btn-link text-dark d-flex align-items-center gap-2 text-decoration-none" type="button"
            @click="toggleDropdown">
            <div class="d-none d-md-block text-end">
              <div class="fw-semibold">{{ authStore.userName }}</div>
              <small class="text-muted">{{ authStore.userRole }}</small>
            </div>
            <div class="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
              style="width: 40px; height: 40px;">
              <i class="bi bi-person-fill"></i>
            </div>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" :class="{ show: isDropdownOpen }" @click="closeDropdown">
            <li>
              <router-link to="/perfil" class="dropdown-item">
                <i class="bi bi-person me-2"></i>
                Mi Perfil
              </router-link>
            </li>
            <li>
              <hr class="dropdown-divider" />
            </li>
            <li>
              <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                <i class="bi bi-box-arrow-right me-2"></i>
                Cerrar Sesión
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

defineEmits(['toggle-sidebar']);
///////////////////////

import { onMounted } from "vue";
import { onUnmounted } from "vue";
import { ref } from 'vue';
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement>();

const toggleDropdown = (event: Event) => {
  event.preventDefault();
  isDropdownOpen.value = !isDropdownOpen.value;
};
const closeDropdown = () => {
  isDropdownOpen.value = false;
};
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
};
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
///////////////////////////

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const pageTitle = computed(() => {
  return route.meta.title || 'Dashboard';
});

const handleLogout = () => {
  if (confirm('¿Está seguro que desea cerrar sesión?')) {
    authStore.logout();
    router.push('/login');
  }
};
</script>

<style scoped>
.navbar {
  z-index: 1000;
  height: 60px;
}

.avatar {
  width: 40px;
  height: 40px;
}

.dropdown-menu {
  min-width: 200px;
}
</style>
