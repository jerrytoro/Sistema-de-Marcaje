import api from './api';

/**
 * Servicio de Reconocimiento Facial (Frontend)
 */
class FacialRecognitionService {
  /**
   * Registrar datos faciales de un funcionario
   */
  async registrarDatosFaciales(funcionarioId: number, fotoBlob: Blob): Promise<any> {
    const formData = new FormData();
    formData.append('foto', fotoBlob, 'rostro.jpg');

    const response = await fetch(`${import.meta.env.VITE_API_URL}/facial-recognition/register/${funcionarioId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar datos faciales');
    }

    return await response.json();
  }

  /**
   * Verificar rostro (sin registrar)
   */
  async verificarRostro(fotoBlob: Blob): Promise<any> {
    const formData = new FormData();
    formData.append('foto', fotoBlob, 'rostro.jpg');

    const response = await fetch(`${import.meta.env.VITE_API_URL}/facial-recognition/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al verificar rostro');
    }

    return await response.json();
  }

  /**
   * Obtener datos faciales de un funcionario
   */
  async obtenerDatosFaciales(funcionarioId: number): Promise<any> {
    return await api.get(`/facial-recognition/${funcionarioId}`);
  }

  /**
   * Listar todos los funcionarios con datos faciales
   */
  async listarFuncionariosConDatosFaciales(): Promise<any[]> {
    return await api.get('/facial-recognition');
  }

  /**
   * Eliminar datos faciales
   */
  async eliminarDatosFaciales(funcionarioId: number): Promise<void> {
    await api.delete(`/facial-recognition/${funcionarioId}`);
  }
}

export const facialRecognitionService = new FacialRecognitionService();
export default facialRecognitionService;