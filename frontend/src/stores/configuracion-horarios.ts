import { defineStore } from 'pinia';
import { ref } from 'vue';
import { configuracionHorariosService } from '@/services/configuracion-horarios.service';

export const useConfiguracionHorariosStore = defineStore('configuracionHorarios', () => {
  // State
  const configuraciones = ref<any[]>([]);
  const configuracionActual = ref<any>(null);
  const siguienteMarcaje = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  async function loadConfiguraciones() {
    try {
      loading.value = true;
      error.value = null;

      const result = await configuracionHorariosService.listar();
      
      // ✅ Forzar limpieza y nueva asignación
      configuraciones.value = [];
      
      const newConfigs = Array.isArray(result) ? result : [result];
      
      // ✅ Asignar en el siguiente tick para asegurar reactividad
      setTimeout(() => {
        configuraciones.value = newConfigs;
        
        // La primera o única configuración es la actual
        if (newConfigs.length > 0) {
          configuracionActual.value = newConfigs[0];
        } else {
          configuracionActual.value = null;
        }
        
        console.log('✅ Configuraciones cargadas:', configuraciones.value);
        console.log('✅ Configuración actual:', configuracionActual.value);
      }, 0);

      return { success: true, data: result };
    } catch (err: any) {
      // Error 404 es normal si no hay configuración
      if (err.response?.status === 404) {
        configuraciones.value = [];
        configuracionActual.value = null;
        return { success: true, data: [] };
      }
      
      error.value = err.response?.data?.message || 'Error al cargar configuraciones';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function loadSiguienteMarcaje() {
    try {
      const result = await configuracionHorariosService.obtenerSiguienteMarcaje();
      siguienteMarcaje.value = result;
      return { success: true, data: result };
    } catch (err: any) {
      console.error('Error al cargar siguiente marcaje:', err);
      return { success: false, error: err.response?.data?.message };
    }
  }

  async function obtenerPorTipo(tipo: string) {
    try {
      loading.value = true;
      error.value = null;

      const result = await configuracionHorariosService.obtenerPorTipo(tipo);
      return { success: true, data: result };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener configuración';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function validar() {
    try {
      loading.value = true;
      error.value = null;

      const result = await configuracionHorariosService.validar();
      return { success: true, data: result };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al validar configuración';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function actualizarPorTipo(tipo: string, data: any) {
    try {
      loading.value = true;
      error.value = null;

      await configuracionHorariosService.actualizarPorTipo(tipo, data);
      await loadConfiguraciones();
      
      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function actualizarBulk(data: any) {
    try {
      loading.value = true;
      error.value = null;

      await configuracionHorariosService.actualizarBulk(data);
      await loadConfiguraciones();
      
      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al actualizar';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function reset() {
    try {
      loading.value = true;
      error.value = null;

      await configuracionHorariosService.reset();
      await loadConfiguraciones();
      
      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al restablecer';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function obtenerConflictos(tipo: string, hora: string) {
    try {
      loading.value = true;
      error.value = null;

      const result = await configuracionHorariosService.obtenerConflictos(tipo, hora);
      return { success: true, data: result };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al obtener conflictos';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    configuraciones,
    configuracionActual,
    siguienteMarcaje,
    loading,
    error,
    // Actions
    loadConfiguraciones,
    loadSiguienteMarcaje,
    obtenerPorTipo,
    validar,
    actualizarPorTipo,
    actualizarBulk,
    reset,
    obtenerConflictos,
  };
});