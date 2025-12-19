import api from './api';
import type { Asistencia, CreateAsistenciaDto, UpdateAsistenciaDto, EstadisticasAsistencias } from '@/types';

/**
 * Servicio de Asistencias
 */
class AsistenciasService {
  /**
   * Listar todas las asistencias
   */
  async getAll(limit?: number, offset?: number): Promise<Asistencia[]> {
    const params: any = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    
    return await api.get<Asistencia[]>('/asistencias', params);
  }

  /**
   * Obtener asistencias del día
   */
  async getHoy(): Promise<Asistencia[]> {
    return await api.get<Asistencia[]>('/asistencias/hoy');
  }

  /**
   * Obtener una asistencia por ID
   */
  async getById(id: number): Promise<Asistencia> {
    return await api.get<Asistencia>(`/asistencias/${id}`);
  }

  /**
   * Obtener asistencias por fecha
   */
  async getByFecha(fecha: string): Promise<Asistencia[]> {
    return await api.get<Asistencia[]>(`/asistencias/fecha/${fecha}`);
  }

  /**
   * Obtener asistencias por mes
   */
  async getByMes(mes: number, anio: number): Promise<Asistencia[]> {
    return await api.get<Asistencia[]>(`/asistencias/mes/${mes}/anio/${anio}`);
  }

  /**
   * Obtener asistencias de un funcionario
   */
  async getByFuncionario(funcionarioId: number, mes?: number, anio?: number): Promise<Asistencia[]> {
    const params: any = {};
    if (mes) params.mes = mes;
    if (anio) params.anio = anio;
    
    return await api.get<Asistencia[]>(`/asistencias/funcionario/${funcionarioId}`, params);
  }

  /**
   * Crear una nueva asistencia
   */
  async create(data: CreateAsistenciaDto): Promise<Asistencia> {
    return await api.post<Asistencia>('/asistencias', data);
  }

  /**
   * Actualizar una asistencia
   */
  async update(id: number, data: UpdateAsistenciaDto): Promise<Asistencia> {
    return await api.patch<Asistencia>(`/asistencias/${id}`, data);
  }

  /**
   * Eliminar una asistencia
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/asistencias/${id}`);
  }

  /**
   * Obtener estadísticas
   */
  async getEstadisticas(mes?: number, anio?: number): Promise<EstadisticasAsistencias> {
    const params: any = {};
    if (mes) params.mes = mes;
    if (anio) params.anio = anio;
    
    return await api.get<EstadisticasAsistencias>('/asistencias/estadisticas', params);
  }
}

export const asistenciasService = new AsistenciasService();
export default asistenciasService;