<template>
  <div class="login-container">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-5 col-lg-4">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <!-- Logo y Título -->
              <div class="text-center mb-4">
                <i class="bi bi-shield-check text-primary" style="font-size: 3rem;"></i>
                <h2 class="mt-3 mb-1">Sistema de Asistencias</h2>
                <p class="text-muted">Iniciar Sesión</p>
              </div>

              <!-- Alerta de error -->
              <div v-if="authStore.error" class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ authStore.error }}
                <button type="button" class="btn-close" @click="authStore.error = null"></button>
              </div>

              <!-- Formulario -->
              <form @submit.prevent="handleLogin">
                <!-- Username -->
                <div class="mb-3">
                  <label for="username" class="form-label">
                    <i class="bi bi-person-fill me-1"></i>
                    Usuario
                  </label>
                  <input
                    type="text"
                    class="form-control form-control-lg"
                    id="username"
                    v-model="credentials.username"
                    placeholder="Ingrese su usuario"
                    required
                    :disabled="authStore.loading"
                  />
                </div>

                <!-- Password -->
                <div class="mb-4">
                  <label for="password" class="form-label">
                    <i class="bi bi-lock-fill me-1"></i>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    class="form-control form-control-lg"
                    id="password"
                    v-model="credentials.password"
                    placeholder="Ingrese su contraseña"
                    required
                    :disabled="authStore.loading"
                  />
                </div>

                <!-- Botón de login -->
                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100"
                  :disabled="authStore.loading"
                >
                  <span v-if="authStore.loading">
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Iniciando sesión...
                  </span>
                  <span v-else>
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    Iniciar Sesión
                  </span>
                </button>
              </form>

              <!-- Footer -->
              <div class="text-center mt-4">
                <small class="text-muted">
                  <i class="bi bi-info-circle me-1"></i>
                  Sistema de Control de Asistencias v1.0
                </small>
              </div>
            </div>
          </div>

          <!-- Credenciales de prueba -->
          <div class="card mt-3 border-0 bg-light">
            <div class="card-body p-3">
              <p class="mb-2 text-muted small">
                <i class="bi bi-key-fill me-1"></i>
                <strong>Credenciales de prueba:</strong>
              </p>
              <ul class="list-unstyled mb-0 small text-muted">
                <li><strong>Admin:</strong> admin / admin123</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { LoginDto } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const credentials = reactive<LoginDto>({
  username: '',
  password: '',
});

const handleLogin = async () => {
  const success = await authStore.login(credentials);
  
  if (success) {
    router.push('/dashboard');
  }
};
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.card {
  border-radius: 15px;
}

.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
</style>
