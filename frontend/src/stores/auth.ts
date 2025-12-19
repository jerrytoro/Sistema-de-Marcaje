import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.service';
import type { LoginDto, Usuario, RolUsuario } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<Usuario | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => {
    console.log('Current user:', user.value); // Debug
    return user.value?.rol || null;
  });
  const userName = computed(() => {
    if (!user.value) return '';
    if (user.value.funcionario) {
      return `${user.value.funcionario.nombre} ${user.value.funcionario.apellido}`;
    }
    return user.value.username || '';
  });

  // Actions
  async function login(credentials: LoginDto) {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.login(credentials);
      
      console.log('Login response:', response); // Debug
      
      token.value = response.accessToken;
      user.value = response.user;

      console.log('User after login:', user.value); // Debug
      console.log('Token after login:', token.value); // Debug

      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al iniciar sesión';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    authService.logout();
    user.value = null;
    token.value = null;
  }

  async function loadUserFromStorage() {
    const storedUser = authService.getCurrentUser();
    const storedToken = authService.getToken();

    if (storedUser && storedToken) {
      user.value = storedUser;
      token.value = storedToken;

      // Verificar que el token sigue siendo válido
      try {
        const profile = await authService.getProfile();
        user.value = profile;
      } catch {
        // Token inválido, hacer logout
        logout();
      }
    }
  }

  function hasRole(role: RolUsuario | RolUsuario[]): boolean {
    if (!user.value) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.value.rol);
    }
    
    return user.value.rol === role;
  }

  function isAdmin(): boolean {
    return user.value?.rol === 'ADMIN';
  }

  function isRRHH(): boolean {
    return user.value?.rol === 'RRHH';
  }

  function isFuncionario(): boolean {
    return user.value?.rol === 'FUNCIONARIO';
  }

  function getToken(): string | null {
    return token.value || authService.getToken();
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    userRole,
    userName,
    // Actions
    login,
    logout,
    loadUserFromStorage,
    hasRole,
    isAdmin,
    isRRHH,
    isFuncionario,
    getToken,
  };
});