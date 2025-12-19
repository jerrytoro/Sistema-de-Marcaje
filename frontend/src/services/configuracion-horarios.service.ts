import api from './api';

/**
 * Servicio de Configuración de Horarios (Frontend)
 */
class ConfiguracionHorariosService {
  /**
   * 1. GET /api/configuracion-horarios - Listar (Público)
   */
  async listar(): Promise<any> {
    return await api.get('/configuracion-horarios');
  }

  /**
   * 2. GET /api/configuracion-horarios/siguiente - Próximo marcaje (Público)
   */
  async obtenerSiguienteMarcaje(): Promise<any> {
    return await api.get('/configuracion-horarios/siguiente');
  }

  /**
   * 3. GET /api/configuracion-horarios/:tipo - Ver uno (Público)
   */
  async obtenerPorTipo(tipo: string): Promise<any> {
    return await api.get(`/configuracion-horarios/${tipo}`);
  }

  /**
   * 4. GET /api/configuracion-horarios/validar - Validar (ADMIN, RRHH)
   */
  async validar(): Promise<any> {
    return await api.get('/configuracion-horarios/validar');
  }

  /**
   * 5. PATCH /api/configuracion-horarios/:tipo - Actualizar uno (ADMIN)
   */
  async actualizarPorTipo(tipo: string, data: any): Promise<any> {
    return await api.patch(`/configuracion-horarios/${tipo}`, data);
  }

  /**
   * 6. PATCH /api/configuracion-horarios/bulk - Actualizar varios (ADMIN)
   */
  async actualizarBulk(data: any): Promise<any> {
    return await api.patch('/configuracion-horarios/bulk', data);
  }

  /**
   * 7. POST /api/configuracion-horarios/reset - Reset (ADMIN)
   */
  async reset(): Promise<any> {
    return await api.post('/configuracion-horarios/reset', {});
  }

  /**
   * 8. GET /api/configuracion-horarios/:tipo/conflictos/:hora - Conflictos (ADMIN, RRHH)
   */
  async obtenerConflictos(tipo: string, hora: string): Promise<any> {
    return await api.get(`/configuracion-horarios/${tipo}/conflictos/${hora}`);
  }
}

export const configuracionHorariosService = new ConfiguracionHorariosService();
export default configuracionHorariosService;