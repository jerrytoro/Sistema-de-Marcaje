import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usuariosService } from '@/services/usuarios.service';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto } from '@/types';

export const useUsuariosStore = defineStore('usuarios', () => {
  // State
  const usuarios = ref<Usuario[]>([]);
  const selectedUsuario = ref<Usuario | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Filters
  const searchQuery = ref('');
  const filterRol = ref<string>('');
  const filterEstado = ref<string>('');

  // Getters
  const usuariosFiltrados = computed(() => {
    let filtered = usuarios.value;

    // Filtrar por búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(query) ||
        (u.funcionario?.nombre || '').toLowerCase().includes(query) ||
        (u.funcionario?.apellido || '').toLowerCase().includes(query)
      );
    }

    // Filtrar por rol
    if (filterRol.value) {
      filtered = filtered.filter(u => u.rol === filterRol.value);
    }

    // Filtrar por estado
    if (filterEstado.value) {
      const estado = filterEstado.value === 'true';
      filtered = filtered.filter(u => u.estado === estado);
    }

    return filtered;
  });

  const totalUsuarios = computed(() => usuarios.value.length);
  const usuariosActivos = computed(() => usuarios.value.filter(u => u.estado).length);
  const usuariosInactivos = computed(() => usuarios.value.filter(u => !u.estado).length);

  // Actions
  async function loadUsuarios() {
    try {
      loading.value = true;
      error.value = null;

      usuarios.value = await usuariosService.getAll();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar usuarios';
      console.error('Error loading usuarios:', err);
    } finally {
      loading.value = false;
    }
  }

  async function getUsuario(id: number) {
    try {
      loading.value = true;
      error.value = null;

      selectedUsuario.value = await usuariosService.getById(id);
      return selectedUsuario.value;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar usuario';
      console.error('Error loading usuario:', err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createUsuario(data: CreateUsuarioDto) {
    try {
      loading.value = true;
      error.value = null;

      const newUsuario = await usuariosService.create(data);
      usuarios.value.push(newUsuario);
      
      return { success: true, data: newUsuario };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al crear usuario';
      console.error('Error creating usuario:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function updateUsuario(id: number, data: UpdateUsuarioDto) {
    try {
      loading.value = true;
      error.value = null;

      const updated = await usuariosService.update(id, data);
      
      const index = usuarios.value.findIndex(u => u.id === id);
      if (index !== -1) {
        usuarios.value[index] = updated;
      }

      return { success: true, data: updated };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar usuario';
      console.error('Error updating usuario:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function deleteUsuario(id: number) {
    try {
      loading.value = true;
      error.value = null;

      await usuariosService.delete(id);
      
      usuarios.value = usuarios.value.filter(u => u.id !== id);
      
      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar usuario';
      console.error('Error deleting usuario:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(id: number, data: ChangePasswordDto) {
    try {
      loading.value = true;
      error.value = null;

      await usuariosService.changePassword(id, data);
      
      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cambiar contraseña';
      console.error('Error changing password:', err);
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  function clearFilters() {
    searchQuery.value = '';
    filterRol.value = '';
    filterEstado.value = '';
  }

  return {
    // State
    usuarios,
    selectedUsuario,
    loading,
    error,
    searchQuery,
    filterRol,
    filterEstado,
    // Getters
    usuariosFiltrados,
    totalUsuarios,
    usuariosActivos,
    usuariosInactivos,
    // Actions
    loadUsuarios,
    getUsuario,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    changePassword,
    clearFilters,
  };
});