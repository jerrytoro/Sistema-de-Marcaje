<template>
  <div class="sidebar" :class="{ show: isOpen }">
    <!-- Header -->
    <div class="sidebar-header">
      <router-link to="/dashboard" class="sidebar-brand">
        <i class="bi bi-calendar-check"></i>
        <span>Asistencias</span>
      </router-link>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <!-- Dashboard -->
      <router-link to="/dashboard" class="sidebar-nav-item" active-class="active">
        <i class="bi bi-speedometer2 sidebar-nav-icon"></i>
        <span>Dashboard</span>
      </router-link>

      <!-- Usuarios (Solo ADMIN) -->
      <router-link
        v-if="authStore.isAdmin()"
        to="/usuarios"
        class="sidebar-nav-item"
        active-class="active"
      >
        <i class="bi bi-people sidebar-nav-icon"></i>
        <span>Usuarios</span>
      </router-link>

      <!-- Funcionarios (ADMIN y RRHH) -->
      <router-link
        v-if="authStore.isAdmin() || authStore.isRRHH()"
        to="/funcionarios"
        class="sidebar-nav-item"
        active-class="active"
      >
        <i class="bi bi-person-badge sidebar-nav-icon"></i>
        <span>Funcionarios</span>
      </router-link>

      <!-- Asistencias (ADMIN y RRHH) -->
      <router-link
        v-if="authStore.isAdmin() || authStore.isRRHH()"
        to="/asistencias"
        class="sidebar-nav-item"
        active-class="active"
      >
        <i class="bi bi-clipboard-check sidebar-nav-icon"></i>
        <span>Asistencias</span>
      </router-link>

      <!-- Reportes (ADMIN y RRHH) -->
      <router-link
        v-if="authStore.isAdmin() || authStore.isRRHH()"
        to="/reportes"
        class="sidebar-nav-item"
        active-class="active"
      >
        <i class="bi bi-file-earmark-pdf sidebar-nav-icon"></i>
        <span>Reportes</span>
      </router-link>

      <!-- Configuración de Horarios (ADMIN) -->
      <router-link
        v-if="authStore.isAdmin()"
        to="/configuracion-horarios"
        class="sidebar-nav-item"
        active-class="active"
      >
        <i class="bi bi-clock sidebar-nav-icon"></i>
        <span>Horarios</span>
      </router-link>

      <!-- REGISTRO FACIAL (ADMIN) -->
      <router-link
        v-if="authStore.isAdmin() || authStore.isRRHH()"
        to="/registro-facial"
        class="sidebar-nav-item"
        active-class="active"
      >
        <i class="bi bi-camera sidebar-nav-icon"></i>
        <span>Registro Facial</span>
      </router-link>

      <!-- MARCAJE FACIAL (ADMIN) -->
      <router-link
      v-if="authStore.isAdmin()"
      to="/marcaje-facial"
      class="sidebar-nav-item"
      active-class="active"
      >
        <i class="bi bi-camera-video sidebar-nav-icon"></i>
        <span>Marcaje Facial</span>
      </router-link>
      
      <!-- Divider -->
      <hr class="sidebar-divider" />

      <!-- Mi Perfil -->
      <router-link to="/perfil" class="sidebar-nav-item" active-class="active">
        <i class="bi bi-person-circle sidebar-nav-icon"></i>
        <span>Mi Perfil</span>
      </router-link>

      <!-- Configuración -->
      <router-link to="/configuracion" class="sidebar-nav-item" active-class="active">
        <i class="bi bi-gear sidebar-nav-icon"></i>
        <span>Configuración</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="text-center">
        <small class="text-muted">
          <i class="bi bi-shield-check"></i>
          v1.0.0
        </small>
      </div>
    </div>
  </div>

  <!-- Overlay para móvil -->
  <div
    v-if="isOpen"
    class="sidebar-overlay d-lg-none"
    @click="$emit('close')"
  ></div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';

defineProps<{
  isOpen: boolean;
}>();

defineEmits(['close']);

const authStore = useAuthStore();
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #343a40;
  color: white;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 1001;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar-brand:hover {
  color: #f8f9fa;
}

.sidebar-nav {
  padding: 1rem 0;
}

.sidebar-nav-item {
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.sidebar-nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar-nav-item.active {
  background-color: rgba(13, 110, 253, 0.2);
  color: white;
  border-left-color: #0d6efd;
}

.sidebar-nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.sidebar-divider {
  border-color: rgba(255, 255, 255, 0.1);
  margin: 1rem 0;
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* Responsive */
@media (max-width: 991.98px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }
}

/* Scrollbar */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
