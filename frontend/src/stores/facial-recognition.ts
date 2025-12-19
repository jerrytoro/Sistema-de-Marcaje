import { defineStore } from 'pinia';
import { ref } from 'vue';
import { facialRecognitionService } from '@/services/facial-recognition.service';

export const useFacialRecognitionStore = defineStore('facialRecognition', () => {
  // State
  const funcionariosConFacial = ref<any[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const registroExitoso = ref(false);

  // Actions
  async function registrarRostro(funcionarioId: number, fotoBlob: Blob) {
    try {
      loading.value = true;
      error.value = null;
      registroExitoso.value = false;

      const result = await facialRecognitionService.registrarDatosFaciales(
        funcionarioId,
        fotoBlob
      );

      registroExitoso.value = true;
      return { success: true, data: result };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al registrar datos faciales';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function verificarRostro(fotoBlob: Blob) {
    try {
      loading.value = true;
      error.value = null;

      const result = await facialRecognitionService.verificarRostro(fotoBlob);
      return { success: true, data: result };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al verificar rostro';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function loadFuncionariosConFacial() {
    try {
      loading.value = true;
      error.value = null;

      funcionariosConFacial.value = await facialRecognitionService.listarFuncionariosConDatosFaciales();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al cargar funcionarios';
    } finally {
      loading.value = false;
    }
  }

  async function eliminarDatosFaciales(funcionarioId: number) {
    try {
      loading.value = true;
      error.value = null;

      await facialRecognitionService.eliminarDatosFaciales(funcionarioId);
      
      // Recargar lista
      await loadFuncionariosConFacial();
      
      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar datos faciales';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    funcionariosConFacial,
    loading,
    error,
    registroExitoso,
    // Actions
    registrarRostro,
    verificarRostro,
    loadFuncionariosConFacial,
    eliminarDatosFaciales,
  };
});