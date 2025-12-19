import api from './api';
import type { EstadisticasDashboard, Asistencia } from '@/types';

/**
 * Servicio de Dashboard
 */
class DashboardService {
  /**
   * Obtener estadísticas del dashboard
   */
  async getEstadisticas(): Promise<EstadisticasDashboard> {
    try {
      // Obtener estadísticas de diferentes endpoints
      const [funcionarios, usuarios, asistenciasHoy] = await Promise.all([
        api.get<any[]>('/funcionarios'),
        api.get<any[]>('/usuarios'),
        api.get<any[]>('/asistencias/hoy'),
      ]);

      // Contar tardanzas del día
      const tardanzasHoy = asistenciasHoy.filter(
        (a: any) => a.minutosTardanza > 0
      ).length;

      return {
        totalFuncionarios: funcionarios.length,
        totalUsuarios: usuarios.length,
        asistenciasHoy: asistenciasHoy.length,
        tardanzasHoy: tardanzasHoy,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalFuncionarios: 0,
        totalUsuarios: 0,
        asistenciasHoy: 0,
        tardanzasHoy: 0,
      };
    }
  }

  /**
   * Obtener asistencias del día
   */
  async getAsistenciasHoy(): Promise<Asistencia[]> {
    try {
      return await api.get<Asistencia[]>('/asistencias/hoy');
    } catch (error) {
      console.error('Error obteniendo asistencias del día:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de asistencias del mes
   */
  async getEstadisticasMes(mes?: number, anio?: number): Promise<any> {
    try {
      const params: any = {};
      if (mes) params.mes = mes;
      if (anio) params.anio = anio;

      return await api.get('/asistencias/estadisticas', params);
    } catch (error) {
      console.error('Error obteniendo estadísticas del mes:', error);
      return {
        totalMarcajes: 0,
        totalTardanzas: 0,
        minutosTardanzaTotal: 0,
        minutosTardanzaPromedio: 0,
      };
    }
  }

  /**
   * Obtener datos para gráfico de asistencias por día
   */
  async getGraficoAsistenciasMes(mes: number, anio: number): Promise<any> {
    try {
      const asistencias = await api.get<Asistencia[]>(
        `/asistencias/mes/${mes}/anio/${anio}`
      );

      // Agrupar por fecha
      const asistenciasPorDia = new Map<string, number>();
      
      asistencias.forEach((asistencia) => {
        const fecha = new Date(asistencia.fecha).toLocaleDateString('es-ES');
        asistenciasPorDia.set(
          fecha,
          (asistenciasPorDia.get(fecha) || 0) + 1
        );
      });

      // Convertir a arrays para Chart.js
      const labels = Array.from(asistenciasPorDia.keys());
      const data = Array.from(asistenciasPorDia.values());

      return { labels, data };
    } catch (error) {
      console.error('Error obteniendo datos del gráfico:', error);
      return { labels: [], data: [] };
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;