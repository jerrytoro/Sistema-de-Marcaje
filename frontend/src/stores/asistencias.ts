import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { asistenciasService } from '@/services/asistencias.service';
import type { Asistencia, CreateAsistenciaDto, UpdateAsistenciaDto, EstadisticasAsistencias } from '@/types';

export const useAsistenciasStore = defineStore('asistencias', () => {
  // State
  const asistencias = ref<Asistencia[]>([]);
  const asistenciasHoy = ref<Asistencia[]>([]);
  const selectedAsistencia = ref<Asistencia | null>(null);
  const estadisticas = ref<EstadisticasAsistencias>({
    totalMarcajes: 0,
    totalTardanzas: 0,
    minutosTardanzaTotal: 0,
    minutosTardanzaPromedio: 0,
  });
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Filters
  const filterFecha = ref('');
  const filterFuncionario = ref<number | null>(null);
  const filterTipo = ref('');

  // Getters
  const asistenciasFiltradas = computed(() => {
    let filtered = asistencias.value;

    // Filtrar por fecha
    if (filterFecha.value) {
      filtered = filtered.filter(a => 
        a.fecha.startsWith(filterFecha.value)
      );
    }

    // Filtrar por funcionario
    if (filterFuncionario.value) {
      filtered = filtered.filter(a => 
        a.funcionarioId === filterFuncionario.value
      );
    }

    // Filtrar por tipo
    if (filterTipo.value) {
      filtered = filtered.filter(a => 
        a.tipoMarcaje === filterTipo.value
      );
    }

    return filtered;
  });

  const totalAsistencias = computed(() => asistencias.value.length);
  const totalTardanzas = computed(() => 
    asistencias.value.filter(a => a.minutosTardanza > 0).length
  );

  // Actions
  async function loadAsistencias() {
    try {
      loading.value = true;
      error.value = null;

      asistencias.value = await asistenciasService.getAll();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar asistencias';
      console.error('Error loading asistencias:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadAsistenciasHoy() {
    try {
      loading.value = true;
      error.value = null;

      asistenciasHoy.value = await asistenciasService.getHoy();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar asistencias del día';
      console.error('Error loading asistencias hoy:', err);
    } finally {
      loading.value = false;
    }
  }

  async function loadEstadisticas(mes?: number, anio?: number) {
    try {
      loading.value = true;
      error.value = null;

      estadisticas.value = await asistenciasService.getEstadisticas(mes, anio);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar estadísticas';
      console.error('Error loading estadisticas:', err);
    } finally {
      loading.value = false;
    }
  }

  async function getAsistencia(id: number) {
    try {
      loading.value = true;
      error.value = null;

      selectedAsistencia.value = await asistenciasService.getById(id);
      return selectedAsistencia.value;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar asistencia';
      console.error('Error loading asistencia:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createAsistencia(data: CreateAsistenciaDto) {
    try {
      loading.value = true;
      error.value = null;

      const newAsistencia = await asistenciasService.create(data);
      asistencias.value.unshift(newAsistencia);
      
      return { success: true, data: newAsistencia };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear asistencia';
      console.error('Error creating asistencia:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function updateAsistencia(id: number, data: UpdateAsistenciaDto) {
    try {
      loading.value = true;
      error.value = null;

      const updated = await asistenciasService.update(id, data);
      
      const index = asistencias.value.findIndex(a => a.id === id);
      if (index !== -1) {
        asistencias.value[index] = updated;
      }

      return { success: true, data: updated };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar asistencia';
      console.error('Error updating asistencia:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function deleteAsistencia(id: number) {
    try {
      loading.value = true;
      error.value = null;

      await asistenciasService.delete(id);
      
      asistencias.value = asistencias.value.filter(a => a.id !== id);
      asistenciasHoy.value = asistenciasHoy.value.filter(a => a.id !== id);
      
      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar asistencia';
      console.error('Error deleting asistencia:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  function clearFilters() {
    filterFecha.value = '';
    filterFuncionario.value = null;
    filterTipo.value = '';
  }

  return {
    // State
    asistencias,
    asistenciasHoy,
    selectedAsistencia,
    estadisticas,
    loading,
    error,
    filterFecha,
    filterFuncionario,
    filterTipo,
    // Getters
    asistenciasFiltradas,
    totalAsistencias,
    totalTardanzas,
    // Actions
    loadAsistencias,
    loadAsistenciasHoy,
    loadEstadisticas,
    getAsistencia,
    createAsistencia,
    updateAsistencia,
    deleteAsistencia,
    clearFilters,
  };
});