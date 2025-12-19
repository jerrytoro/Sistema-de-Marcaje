<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import TelegramVinculacion from '@/components/TelegramVinculacion.vue';

const authStore = useAuthStore();
const sidebarOpen = ref(false);

// Datos del usuario (tabla: usuarios)
const usuario = ref({
  username: '',
  rol: '',
  estado: true,
});

// Datos del funcionario (tabla: funcionarios)
const funcionario = ref({
  id: 0,
  nombre: '',
  apellido: '',
  cargo: '',
  dependencia: '',
});

// Estado de reconocimiento facial
const facialRegistrado = ref(false);

// Estado de telegram
const telegramVinculado = ref(false);

function getRoleLabel(rol: string): string {
  const roles: { [key: string]: string } = {
    ADMIN: 'Administrador',
    RRHH: 'Recursos Humanos',
    FUNCIONARIO: 'Funcionario',
  };
  return roles[rol] || rol;
}

function getRoleBadgeClass(rol: string): string {
  const classes: { [key: string]: string } = {
    ADMIN: 'bg-danger',
    RRHH: 'bg-warning text-dark',
    FUNCIONARIO: 'bg-primary',
  };
  return classes[rol] || 'bg-secondary';
}

function cambiarContrasena() {
  alert('Función de cambiar contraseña - Por implementar');
}

onMounted(() => {
  const user = authStore.user;
  
  console.log('=== DEBUG PERFIL ===');
  console.log('Usuario completo:', JSON.stringify(user, null, 2));
  
  if (user && user.funcionario) {
    // Datos del usuario
    usuario.value = {
      username: user.username || '',
      rol: user.rol || '',
      // ✅ Usar el estado del FUNCIONARIO, no del usuario
      estado: !!user.funcionario.estado,
    };

    // Datos del funcionario
    funcionario.value = {
      id: user.funcionario.id || 0,
      nombre: user.funcionario.nombre || '',
      apellido: user.funcionario.apellido || '',
      cargo: user.funcionario.cargo || '',
      dependencia: user.funcionario.dependencia || '',
    };

    // Estados adicionales
    const func = user.funcionario as any;
    facialRegistrado.value = !!func.facialDataRegistered;
    telegramVinculado.value = !!func.telegramChatId;
    
    console.log('Estado funcionario:', user.funcionario.estado);
    console.log('Estado convertido:', usuario.value.estado);
    console.log('Facial:', facialRegistrado.value);
    console.log('Telegram:', telegramVinculado.value);
    console.log('===================');
  }
});
</script>

<template>
  <div class="main-wrapper">
    <Sidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />
    
    <div class="main-content">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      
      <div class="content-area">
        <div class="container-fluid">
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="mb-1">
                <i class="bi bi-person-circle me-2"></i>
                Mi Perfil
              </h1>
              <p class="text-muted mb-0">
                Administra tu información personal y configuración
              </p>
            </div>
          </div>

          <div class="row">
            <!-- Información Personal -->
            <div class="col-lg-8 mb-4">
              <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">
                    <i class="bi bi-person-badge me-2"></i>
                    Información Personal
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label fw-bold">Nombre Completo</label>
                      <p class="form-control-plaintext">
                        {{ funcionario.nombre }} {{ funcionario.apellido }}
                      </p>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label fw-bold">Cargo</label>
                      <p class="form-control-plaintext">{{ funcionario.cargo }}</p>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label fw-bold">Dependencia</label>
                      <p class="form-control-plaintext">{{ funcionario.dependencia }}</p>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label fw-bold">Usuario (Login)</label>
                      <p class="form-control-plaintext">{{ usuario.username }}</p>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label fw-bold">Rol</label>
                      <p class="form-control-plaintext">
                        <span class="badge" :class="getRoleBadgeClass(usuario.rol)">
                          {{ getRoleLabel(usuario.rol) }}
                        </span>
                      </p>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label fw-bold">Estado</label>
                      <p class="form-control-plaintext">
                        <span class="badge" :class="usuario.estado ? 'bg-success' : 'bg-danger'">
                          {{ usuario.estado ? 'Activo' : 'Inactivo' }}
                        </span>
                      </p>
                    </div>
                    
                    <div class="col-md-6">
                      <label class="form-label fw-bold">Reconocimiento Facial</label>
                      <p class="form-control-plaintext">
                        <span 
                          class="badge" 
                          :class="facialRegistrado ? 'bg-success' : 'bg-secondary'"
                        >
                          <i class="bi" :class="facialRegistrado ? 'bi-check-circle' : 'bi-x-circle'"></i>
                          {{ facialRegistrado ? 'Registrado' : 'No registrado' }}
                        </span>
                      </p>
                    </div>

                    <div class="col-md-6">
                      <label class="form-label fw-bold">Telegram</label>
                      <p class="form-control-plaintext">
                        <span 
                          class="badge" 
                          :class="telegramVinculado ? 'bg-info' : 'bg-secondary'"
                        >
                          <i class="bi" :class="telegramVinculado ? 'bi-telegram' : 'bi-x-circle'"></i>
                          {{ telegramVinculado ? 'Vinculado' : 'No vinculado' }}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <hr class="my-4">
                  
                  <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary" @click="cambiarContrasena">
                      <i class="bi bi-key me-2"></i>
                      Cambiar Contraseña
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sidebar Derecha -->
            <div class="col-lg-4">
              <!-- Avatar -->
              <div class="card shadow-sm mb-4">
                <div class="card-body text-center">
                  <div class="avatar-large mx-auto mb-3">
                    {{ funcionario.nombre?.[0] || 'U' }}{{ funcionario.apellido?.[0] || '' }}
                  </div>
                  <h5 class="mb-1">{{ funcionario.nombre }} {{ funcionario.apellido }}</h5>
                  <p class="text-muted mb-0">{{ funcionario.cargo }}</p>
                  <p class="text-muted small">{{ funcionario.dependencia }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Vinculación Telegram -->
          <div class="row">
            <div class="col-12">
              <TelegramVinculacion :funcionarioId="funcionario.id" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 3rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}

.form-control-plaintext {
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
  margin-bottom: 0;
  font-size: 1rem;
  color: #212529;
}
</style>