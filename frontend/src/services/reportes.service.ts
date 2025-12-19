import api from './api';
import type { Reporte, GenerarReporteDto } from '@/types';

/**
 * Servicio de Reportes
 */
class ReportesService {
  /**
   * Generar un nuevo reporte
   */
  async generar(data: GenerarReporteDto): Promise<Reporte> {
    return await api.post<Reporte>('/reportes/generar', data);
  }

  /**
   * Listar todos los reportes
   */
  async getAll(): Promise<Reporte[]> {
    return await api.get<Reporte[]>('/reportes');
  }

  /**
   * Obtener un reporte por ID
   */
  async getById(id: number): Promise<Reporte> {
    return await api.get<Reporte>(`/reportes/${id}`);
  }

  /**
   * Obtener reportes de un funcionario
   */
  async getByFuncionario(funcionarioId: number): Promise<Reporte[]> {
    return await api.get<Reporte[]>(`/reportes/funcionario/${funcionarioId}`);
  }

  /**
   * Descargar PDF de un reporte
   */
  async descargar(id: number): Promise<Blob> {
    return await api.download(`/reportes/${id}/descargar`);
  }

  /**
   * Regenerar un reporte
   */
  async regenerar(id: number): Promise<Reporte> {
    return await api.post<Reporte>(`/reportes/${id}/regenerar`);
  }

  /**
   * Eliminar un reporte
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/reportes/${id}`);
  }

  /**
   * Descargar archivo PDF
   */
  downloadPDF(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const reportesService = new ReportesService();
export default reportesService;