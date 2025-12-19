import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dashboardService } from '@/services/dashboard.service';
import type { EstadisticasDashboard, Asistencia } from '@/types';

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const estadisticas = ref<EstadisticasDashboard>({
    totalFuncionarios: 0,
    totalUsuarios: 0,
    asistenciasHoy: 0,
    tardanzasHoy: 0,
  });

  const asistenciasHoy = ref<Asistencia[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  async function loadEstadisticas() {
    try {
      loading.value = true;
      error.value = null;

      estadisticas.value = await dashboardService.getEstadisticas();
    } catch (err: any) {
      error.value = err.message || 'Error al cargar estadísticas';
      console.error('Error loading estadisticas:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadAsistenciasHoy() {
    try {
      loading.value = true;
      error.value = null;

      asistenciasHoy.value = await dashboardService.getAsistenciasHoy();
    } catch (err: any) {
      error.value = err.message || 'Error al cargar asistencias';
      console.error('Error loading asistencias:', err);
    } finally {
      loading.value = false;
    }
  }

  async function refreshDashboard() {
    await Promise.all([
      loadEstadisticas(),
      loadAsistenciasHoy(),
    ]);
  }

  return {
    // State
    estadisticas,
    asistenciasHoy,
    loading,
    error,
    // Actions
    loadEstadisticas,
    loadAsistenciasHoy,
    refreshDashboard,
  };
});