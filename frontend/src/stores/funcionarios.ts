import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { funcionariosService } from '@/services/funcionarios.service';
import type { Funcionario } from '@/types';

export const useFuncionariosStore = defineStore('funcionarios', () => {
  // State
  const funcionarios = ref<Funcionario[]>([]);
  const selectedFuncionario = ref<Funcionario | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Filters
  const searchQuery = ref('');
  const filterDependencia = ref<string>('');
  const filterCargo = ref<string>('');
  const filterEstado = ref<string>('');

  // Listas para filtros
  const dependencias = ref<string[]>([]);
  const cargos = ref<string[]>([]);

  // Getters
  const funcionariosFiltrados = computed(() => {
    let filtered = funcionarios.value;

    // Filtrar por búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(f => 
        f.nombre.toLowerCase().includes(query) ||
        f.apellido.toLowerCase().includes(query) ||
        f.cargo.toLowerCase().includes(query) ||
        f.dependencia.toLowerCase().includes(query)
      );
    }

    // Filtrar por dependencia
    if (filterDependencia.value) {
      filtered = filtered.filter(f => f.dependencia === filterDependencia.value);
    }

    // Filtrar por cargo
    if (filterCargo.value) {
      filtered = filtered.filter(f => f.cargo === filterCargo.value);
    }

    // Filtrar por estado
    if (filterEstado.value) {
      const estado = filterEstado.value === 'true';
      filtered = filtered.filter(f => f.estado === estado);
    }

    return filtered;
  });

  const totalFuncionarios = computed(() => funcionarios.value.length);
  const funcionariosActivos = computed(() => funcionarios.value.filter(f => f.estado).length);
  const funcionariosInactivos = computed(() => funcionarios.value.filter(f => !f.estado).length);

  // Actions
  async function loadFuncionarios() {
    try {
      loading.value = true;
      error.value = null;

      funcionarios.value = await funcionariosService.getAll();
      
      // Cargar listas para filtros
      dependencias.value = await funcionariosService.getDependencias();
      cargos.value = await funcionariosService.getCargos();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar funcionarios';
      console.error('Error loading funcionarios:', err);
    } finally {
      loading.value = false;
    }
  }

  async function getFuncionario(id: number) {
    try {
      loading.value = true;
      error.value = null;

      selectedFuncionario.value = await funcionariosService.getById(id);
      return selectedFuncionario.value;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar funcionario';
      console.error('Error loading funcionario:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateFuncionario(id: number, data: Partial<Funcionario>) {
    try {
      loading.value = true;
      error.value = null;

      const updated = await funcionariosService.update(id, data);
      
      const index = funcionarios.value.findIndex(f => f.id === id);
      if (index !== -1) {
        funcionarios.value[index] = updated;
      }

      return { success: true, data: updated };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar funcionario';
      console.error('Error updating funcionario:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  function clearFilters() {
    searchQuery.value = '';
    filterDependencia.value = '';
    filterCargo.value = '';
    filterEstado.value = '';
  }

  return {
    // State
    funcionarios,
    selectedFuncionario,
    loading,
    error,
    searchQuery,
    filterDependencia,
    filterCargo,
    filterEstado,
    dependencias,
    cargos,
    // Getters
    funcionariosFiltrados,
    totalFuncionarios,
    funcionariosActivos,
    funcionariosInactivos,
    // Actions
    loadFuncionarios,
    getFuncionario,
    updateFuncionario,
    clearFilters,
  };
});