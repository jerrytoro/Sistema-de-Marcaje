<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="text-center">
      <h1 class="display-1 fw-bold text-primary">404</h1>
      <p class="fs-3 text-muted mb-4">Página no encontrada</p>
      <p class="text-muted mb-4">La página que buscas no existe o ha sido movida.</p>
      <router-link to="/dashboard" class="btn btn-primary btn-lg">
        <i class="bi bi-house-door me-2"></i>
        Ir al Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>