import api from './api';
import type { LoginDto, LoginResponse, Usuario } from '@/types';

/**
 * Servicio de Autenticación
 */
class AuthService {
  /**
   * Login de usuario
   */
  async login(credentials: LoginDto): Promise<LoginResponse> {
    const response = await api.post<any>('/auth/login', credentials);
    
    // El backend devuelve "usuario" pero necesitamos "user"
    const loginResponse: LoginResponse = {
      accessToken: response.accessToken,
      user: response.usuario || response.user, // Mapear usuario -> user
    };
    
    // Guardar token y usuario en localStorage
    if (loginResponse.accessToken) {
      localStorage.setItem('token', loginResponse.accessToken);
      localStorage.setItem('user', JSON.stringify(loginResponse.user));
    }
    
    return loginResponse;
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile(): Promise<Usuario> {
    return await api.get<Usuario>('/auth/profile');
  }

  /**
   * Verificar si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Obtener usuario actual desde localStorage
   */
  getCurrentUser(): Usuario | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService();
export default authService;