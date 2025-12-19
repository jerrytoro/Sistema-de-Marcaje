import api from './api';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto } from '@/types';

/**
 * Servicio de Usuarios
 */
class UsuariosService {
  /**
   * Listar todos los usuarios
   */
  async getAll(): Promise<Usuario[]> {
    return await api.get<Usuario[]>('/usuarios');
  }

  /**
   * Obtener un usuario por ID
   */
  async getById(id: number): Promise<Usuario> {
    return await api.get<Usuario>(`/usuarios/${id}`);
  }

  /**
   * Crear un nuevo usuario
   */
  async create(data: CreateUsuarioDto): Promise<Usuario> {
    return await api.post<Usuario>('/usuarios', data);
  }

  /**
   * Actualizar un usuario
   */
  async update(id: number, data: UpdateUsuarioDto): Promise<Usuario> {
    return await api.patch<Usuario>(`/usuarios/${id}`, data);
  }

  /**
   * Eliminar un usuario (soft delete)
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(id: number, data: ChangePasswordDto): Promise<void> {
    await api.patch(`/usuarios/${id}/cambiar-password`, data);
  }

  /**
   * Buscar usuarios
   */
  async search(search: string): Promise<Usuario[]> {
    return await api.get<Usuario[]>('/usuarios/buscar', { search });
  }

  /**
   * Filtrar usuarios por rol
   */
  async filterByRole(rol: string): Promise<Usuario[]> {
    const usuarios = await this.getAll();
    return usuarios.filter(u => u.rol === rol);
  }

  /**
   * Filtrar usuarios por estado
   */
  async filterByStatus(estado: boolean): Promise<Usuario[]> {
    const usuarios = await this.getAll();
    return usuarios.filter(u => u.estado === estado);
  }
}

export const usuariosService = new UsuariosService();
export default usuariosService;