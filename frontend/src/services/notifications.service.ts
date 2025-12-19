import api from './api';

/**
 * Servicio de Notificaciones (Frontend)
 */
class NotificationsService {
  /**
   * Generar código QR para vincular Telegram
   */
  async generarQRTelegram(funcionarioId: number): Promise<any> {
    return await api.get(`/notifications/telegram/qr/${funcionarioId}`);
  }

  /**
   * Verificar estado de vinculación de Telegram
   */
  async verificarEstadoTelegram(funcionarioId: number): Promise<any> {
    return await api.get(`/notifications/telegram/status/${funcionarioId}`);
  }

  /**
   * Desvincular cuenta de Telegram
   */
  async desvincularTelegram(funcionarioId: number): Promise<void> {
    await api.delete(`/notifications/telegram/${funcionarioId}`);
  }

  /**
   * Enviar notificación de prueba
   */
  async enviarNotificacionPrueba(funcionarioId: number): Promise<any> {
    return await api.post(`/notifications/test/${funcionarioId}`);
  }

  /**
   * Verificar estado del bot
   */
  async verificarEstadoBot(): Promise<any> {
    return await api.get('/notifications/bot-status');
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;