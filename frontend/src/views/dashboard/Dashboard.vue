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
                <i class="bi bi-speedometer2 me-2"></i>
                Dashboard
              </h1>
              <p class="text-muted mb-0">Bienvenido, {{ authStore.userName }}</p>
            </div>
            <button 
              class="btn btn-primary"
              @click="refreshData"
              :disabled="dashboardStore.loading"
            >
              <i class="bi bi-arrow-clockwise me-2"></i>
              Actualizar
            </button>
          </div>

          <!-- Stats Cards -->
          <div class="row g-4 mb-4">
            <div class="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Total Funcionarios"
                :value="dashboardStore.estadisticas.totalFuncionarios"
                icon="people-fill"
                color="primary"
                :loading="dashboardStore.loading"
              />
            </div>

            <div class="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Asistencias Hoy"
                :value="dashboardStore.estadisticas.asistenciasHoy"
                icon="clipboard-check"
                color="success"
                :loading="dashboardStore.loading"
              />
            </div>

            <div class="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Tardanzas Hoy"
                :value="dashboardStore.estadisticas.tardanzasHoy"
                icon="exclamation-triangle-fill"
                color="warning"
                :loading="dashboardStore.loading"
              />
            </div>

            <div class="col-12 col-sm-6 col-xl-3" v-if="authStore.isAdmin()">
              <StatCard
                title="Total Usuarios"
                :value="dashboardStore.estadisticas.totalUsuarios"
                icon="person-badge-fill"
                color="info"
                :loading="dashboardStore.loading"
              />
            </div>
          </div>

          <!-- Charts and Tables Row -->
          <div class="row g-4">
            <!-- Asistencias del día -->
            <div class="col-12 col-lg-8">
              <div class="card shadow-sm h-100">
                <div class="card-header bg-white">
                  <h5 class="mb-0">
                    <i class="bi bi-calendar-check me-2"></i>
                    Asistencias de Hoy
                  </h5>
                </div>
                <div class="card-body">
                  <div v-if="dashboardStore.loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Cargando...</span>
                    </div>
                  </div>

                  <div v-else-if="dashboardStore.asistenciasHoy.length === 0" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                    <p class="mt-3 mb-0">No hay asistencias registradas hoy</p>
                  </div>

                  <div v-else class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Funcionario</th>
                          <th>Tipo Marcaje</th>
                          <th>Hora</th>
                          <th>Tardanza</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="asistencia in dashboardStore.asistenciasHoy.slice(0, 10)" :key="asistencia.id">
                          <td>
                            <div class="d-flex align-items-center">
                              <div class="avatar bg-primary bg-opacity-10 text-primary rounded-circle me-2" 
                                   style="width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;">
                                <i class="bi bi-person-fill"></i>
                              </div>
                              <div>
                                <div class="fw-semibold">
                                  {{ asistencia.funcionario?.nombre }} {{ asistencia.funcionario?.apellido }}
                                </div>
                                <small class="text-muted">{{ asistencia.funcionario?.cargo }}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span class="badge bg-info">
                              {{ formatTipoMarcaje(asistencia.tipoMarcaje) }}
                            </span>
                          </td>
                          <td>{{ formatHora(asistencia.horaMarcaje) }}</td>
                          <td>
                            <span v-if="asistencia.minutosTardanza > 0" class="text-warning fw-semibold">
                              {{ asistencia.minutosTardanza }} min
                            </span>
                            <span v-else class="text-success">
                              <i class="bi bi-check-circle-fill"></i> A tiempo
                            </span>
                          </td>
                          <td>
                            <span v-if="asistencia.verificado" class="badge bg-success">
                              <i class="bi bi-check-circle me-1"></i>
                              Verificado
                            </span>
                            <span v-else class="badge bg-secondary">
                              Pendiente
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div v-if="dashboardStore.asistenciasHoy.length > 10" class="text-center mt-3">
                    <router-link to="/asistencias" class="btn btn-outline-primary btn-sm">
                      Ver todas las asistencias
                      <i class="bi bi-arrow-right ms-1"></i>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="col-12 col-lg-4">
              <div class="card shadow-sm mb-4">
                <div class="card-header bg-white">
                  <h5 class="mb-0">
                    <i class="bi bi-lightning-fill me-2"></i>
                    Acciones Rápidas
                  </h5>
                </div>
                <div class="card-body">
                  <div class="d-grid gap-2">
                    <router-link
                      v-if="authStore.isAdmin() || authStore.isRRHH()"
                      to="/asistencias"
                      class="btn btn-outline-primary text-start"
                    >
                      <i class="bi bi-plus-circle me-2"></i>
                      Registrar Asistencia
                    </router-link>

                    <router-link
                      v-if="authStore.isAdmin() || authStore.isRRHH()"
                      to="/reportes"
                      class="btn btn-outline-success text-start"
                    >
                      <i class="bi bi-file-earmark-pdf me-2"></i>
                      Generar Reporte
                    </router-link>

                    <router-link
                      v-if="authStore.isAdmin()"
                      to="/funcionarios"
                      class="btn btn-outline-info text-start"
                    >
                      <i class="bi bi-person-plus me-2"></i>
                      Nuevo Funcionario
                    </router-link>

                    <router-link
                      to="/perfil"
                      class="btn btn-outline-secondary text-start"
                    >
                      <i class="bi bi-person-circle me-2"></i>
                      Mi Perfil
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- System Info -->
              <div class="card shadow-sm">
                <div class="card-header bg-white">
                  <h5 class="mb-0">
                    <i class="bi bi-info-circle me-2"></i>
                    Información del Sistema
                  </h5>
                </div>
                <div class="card-body">
                  <ul class="list-unstyled mb-0">
                    <li class="mb-2">
                      <i class="bi bi-calendar3 text-primary me-2"></i>
                      <strong>Fecha:</strong> {{ currentDate }}
                    </li>
                    <li class="mb-2">
                      <i class="bi bi-clock text-primary me-2"></i>
                      <strong>Hora:</strong> {{ currentTime }}
                    </li>
                    <li class="mb-2">
                      <i class="bi bi-person-badge text-primary me-2"></i>
                      <strong>Rol:</strong> {{ authStore.userRole }}
                    </li>
                    <li>
                      <i class="bi bi-shield-check text-primary me-2"></i>
                      <strong>Versión:</strong> 1.0.0
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/dashboard';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import StatCard from '@/components/dashboard/StatCard.vue';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const sidebarOpen = ref(false);

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

const currentTime = ref('');

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('es-ES');
};

const formatTipoMarcaje = (tipo: string) => {
  const tipos: { [key: string]: string } = {
    INGRESO_MANANA: 'Ingreso Mañana',
    SALIDA_DESCANSO: 'Salida Descanso',
    INGRESO_TARDE: 'Ingreso Tarde',
    SALIDA_FINAL: 'Salida Final',
  };
  return tipos[tipo] || tipo;
};

const formatHora = (hora: string) => {
  return new Date(hora).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const refreshData = async () => {
  await dashboardStore.refreshDashboard();
};

onMounted(async () => {
  await dashboardStore.refreshDashboard();
  
  // Actualizar reloj cada segundo
  updateTime();
  setInterval(updateTime, 1000);

  // Actualizar estadísticas cada 30 segundos
  setInterval(() => {
    dashboardStore.refreshDashboard();
  }, 30000);
});
</script>

<style scoped>
.avatar {
  width: 35px;
  height: 35px;
}
</style>