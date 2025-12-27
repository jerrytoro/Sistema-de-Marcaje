import api from './api';

/**
 * Servicio de Reconocimiento Facial (Frontend - Solo Descriptores)
 */
class FacialRecognitionService {
  /**
   * Registrar descriptores faciales (ya procesados en frontend)
   */
  async registrarDescriptores(
    funcionarioId: number,
    descriptores: { descriptor: number[]; instruccion: string }[]
  ): Promise<any> {
    return await api.post(`/facial-recognition/registrar-descriptores/${funcionarioId}`, {
      descriptores
    });
  }

  /**
   * Verificar descriptor facial y marcar asistencia
   */
  async verificarDescriptor(descriptor: number[]): Promise<any> {
    return await api.post('/facial-recognition/verificar-descriptor', {
      descriptor
    });
  }

  /**
   * Obtener estado del registro facial
   */
  async obtenerEstado(funcionarioId: number): Promise<any> {
    return await api.get(`/facial-recognition/status/${funcionarioId}`);
  }

  /**
   * Eliminar registros faciales
   */
  async eliminarRegistros(funcionarioId: number): Promise<void> {
    await api.delete(`/facial-recognition/delete/${funcionarioId}`);
  }
}

export const facialRecognitionService = new FacialRecognitionService();
export default facialRecognitionService;