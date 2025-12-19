import api from './api';
import type { Funcionario } from '@/types';

/**
 * Servicio de Funcionarios
 */
class FuncionariosService {
  /**
   * Listar todos los funcionarios
   */
  async getAll(): Promise<Funcionario[]> {
    return await api.get<Funcionario[]>('/funcionarios');
  }

  /**
   * Obtener un funcionario por ID
   */
  async getById(id: number): Promise<Funcionario> {
    return await api.get<Funcionario>(`/funcionarios/${id}`);
  }

  /**
   * Actualizar un funcionario
   */
  async update(id: number, data: Partial<Funcionario>): Promise<Funcionario> {
    return await api.patch<Funcionario>(`/funcionarios/${id}`, data);
  }

  /**
   * Buscar funcionarios
   */
  async search(query: string): Promise<Funcionario[]> {
    return await api.get<Funcionario[]>(`/funcionarios/buscar`, { search: query });
  }

  /**
   * Filtrar por dependencia
   */
  async filterByDependencia(dependencia: string): Promise<Funcionario[]> {
    return await api.get<Funcionario[]>(`/funcionarios/dependencia/${dependencia}`);
  }

  /**
   * Filtrar por cargo
   */
  async filterByCargo(cargo: string): Promise<Funcionario[]> {
    return await api.get<Funcionario[]>(`/funcionarios/cargo/${cargo}`);
  }

  /**
   * Obtener estadísticas
   */
  async getEstadisticas(): Promise<any> {
    return await api.get('/funcionarios/estadisticas');
  }

  /**
   * Obtener funcionarios activos
   */
  async getActivos(): Promise<Funcionario[]> {
    const funcionarios = await this.getAll();
    return funcionarios.filter(f => f.estado);
  }

  /**
   * Obtener funcionarios inactivos
   */
  async getInactivos(): Promise<Funcionario[]> {
    const funcionarios = await this.getAll();
    return funcionarios.filter(f => !f.estado);
  }

  /**
   * Obtener lista de dependencias únicas
   */
  async getDependencias(): Promise<string[]> {
    const funcionarios = await this.getAll();
    const dependencias = new Set(funcionarios.map(f => f.dependencia));
    return Array.from(dependencias).sort();
  }

  /**
   * Obtener lista de cargos únicos
   */
  async getCargos(): Promise<string[]> {
    const funcionarios = await this.getAll();
    const cargos = new Set(funcionarios.map(f => f.cargo));
    return Array.from(cargos).sort();
  }
}

export const funcionariosService = new FuncionariosService();
export default funcionariosService;