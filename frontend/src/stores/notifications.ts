import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notificationsService } from '@/services/notifications.service';

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const qrDataUrl = ref<string>('');
  const telegramVinculado = ref(false);
  const telegramChatId = ref<string | null>(null);
  const botUsername = ref('');
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Actions
  async function generarQR(funcionarioId: number) {
    try {
      loading.value = true;
      error.value = null;

      const result = await notificationsService.generarQRTelegram(funcionarioId);
      qrDataUrl.value = result.qrDataUrl;
      botUsername.value = result.botUsername;

      return { success: true, data: result };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al generar QR';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function verificarEstado(funcionarioId: number) {
    try {
      loading.value = true;
      error.value = null;

      const result = await notificationsService.verificarEstadoTelegram(funcionarioId);
      telegramVinculado.value = result.vinculado;
      telegramChatId.value = result.chatId;

      return { success: true, vinculado: result.vinculado };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al verificar estado';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function desvincular(funcionarioId: number) {
    try {
      loading.value = true;
      error.value = null;

      await notificationsService.desvincularTelegram(funcionarioId);
      telegramVinculado.value = false;
      telegramChatId.value = null;

      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al desvincular';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function enviarPrueba(funcionarioId: number) {
    try {
      loading.value = true;
      error.value = null;

      await notificationsService.enviarNotificacionPrueba(funcionarioId);
      return { success: true };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al enviar prueba';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    qrDataUrl,
    telegramVinculado,
    telegramChatId,
    botUsername,
    loading,
    error,
    // Actions
    generarQR,
    verificarEstado,
    desvincular,
    enviarPrueba,
  };
});