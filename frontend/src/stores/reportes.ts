import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { reportesService } from '@/services/reportes.service';
import type { Reporte, GenerarReporteDto } from '@/types';

export const useReportesStore = defineStore('reportes', () => {
  // State
  const reportes = ref<Reporte[]>([]);
  const selectedReporte = ref<Reporte | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Filters
  const filterMes = ref<number | null>(null);
  const filterAnio = ref<number | null>(null);
  const filterFuncionario = ref<number | null>(null);

  // Getters
  const reportesFiltrados = computed(() => {
    let filtered = reportes.value;

    // Filtrar por mes
    if (filterMes.value !== null) {
      filtered = filtered.filter(r => r.mes === filterMes.value);
    }

    // Filtrar por año
    if (filterAnio.value !== null) {
      filtered = filtered.filter(r => r.anio === filterAnio.value);
    }

    // Filtrar por funcionario
    if (filterFuncionario.value !== null) {
      filtered = filtered.filter(r => r.funcionarioId === filterFuncionario.value);
    }

    return filtered;
  });

  const totalReportes = computed(() => reportes.value.length);

  // Actions
  async function loadReportes() {
    try {
      loading.value = true;
      error.value = null;

      reportes.value = await reportesService.getAll();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar reportes';
      console.error('Error loading reportes:', err);
    } finally {
      loading.value = false;
    }
  }

  async function getReporte(id: number) {
    try {
      loading.value = true;
      error.value = null;

      selectedReporte.value = await reportesService.getById(id);
      return selectedReporte.value;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar reporte';
      console.error('Error loading reporte:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function generarReporte(data: GenerarReporteDto) {
    try {
      loading.value = true;
      error.value = null;

      const newReporte = await reportesService.generar(data);
      reportes.value.unshift(newReporte);
      
      return { success: true, data: newReporte };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al generar reporte';
      console.error('Error generating reporte:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function descargarReporte(id: number, filename?: string) {
    try {
      loading.value = true;
      error.value = null;

      const blob = await reportesService.descargar(id);
      
      if (!filename) {
        const reporte = reportes.value.find(r => r.id === id);
        if (reporte) {
          filename = `Reporte_${reporte.funcionario?.nombre}_${reporte.mes}_${reporte.anio}.pdf`;
        } else {
          filename = `Reporte_${id}.pdf`;
        }
      }

      reportesService.downloadPDF(blob, filename);
      
      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al descargar reporte';
      console.error('Error downloading reporte:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function regenerarReporte(id: number) {
    try {
      loading.value = true;
      error.value = null;

      const updated = await reportesService.regenerar(id);
      
      const index = reportes.value.findIndex(r => r.id === id);
      if (index !== -1) {
        reportes.value[index] = updated;
      }

      return { success: true, data: updated };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al regenerar reporte';
      console.error('Error regenerating reporte:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function deleteReporte(id: number) {
    try {
      loading.value = true;
      error.value = null;

      await reportesService.delete(id);
      
      reportes.value = reportes.value.filter(r => r.id !== id);
      
      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar reporte';
      console.error('Error deleting reporte:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  function clearFilters() {
    filterMes.value = null;
    filterAnio.value = null;
    filterFuncionario.value = null;
  }

  return {
    // State
    reportes,
    selectedReporte,
    loading,
    error,
    filterMes,
    filterAnio,
    filterFuncionario,
    // Getters
    reportesFiltrados,
    totalReportes,
    // Actions
    loadReportes,
    getReporte,
    generarReporte,
    descargarReporte,
    regenerarReporte,
    deleteReporte,
    clearFilters,
  };
});