import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { RolUsuario } from '@/types';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/Dashboard.vue'),
      meta: {
        requiresAuth: true,
        title: 'Dashboard',
      },
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('@/views/usuarios/UsuariosList.vue'),
      meta: {
        requiresAuth: true,
        requiredRoles: ['ADMIN'],
        title: 'Gestión de Usuarios',
      },
    },
    {
      path: '/funcionarios',
      name: 'funcionarios',
      component: () => import('@/views/funcionarios/FuncionariosList.vue'),
      meta: {
        requiresAuth: true,
        requiredRoles: ['ADMIN', 'RRHH'],
        title: 'Gestión de Funcionarios',
      },
    },
    {
      path: '/asistencias',
      name: 'asistencias',
      component: () => import('@/views/asistencias/AsistenciasList.vue'),
      meta: {
        requiresAuth: true,
        requiredRoles: ['ADMIN', 'RRHH'],
        title: 'Registro de Asistencias',
      },
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: () => import('@/views/reportes/ReportesList.vue'),
      meta: {
        requiresAuth: true,
        requiredRoles: ['ADMIN', 'RRHH'],
        title: 'Reportes',
      },
    },
    {
      path: '/configuracion-horarios',
      name: 'configuracion-horarios',
      component: () => import('@/views/configuracion-horarios/ConfiguracionHorarios.vue'),
      meta: {
        requiresAuth: true,
        requiredRoles: ['ADMIN'],
        title: 'Configuración de Horarios',
      },
    },
    {
      path: '/registro-facial',
      name: 'registro-facial',
      component: () => import('@/views/registro-facial/RegistroFacial.vue'),
      meta: {
        requiresAuth: true,
        requiredRoles: ['ADMIN', 'RRHH'],
        title: 'Registro facial',
      },
    },
    {
      path: '/marcaje-facial',
      name: 'marcaje-facial',
      component: () => import('@/views/marcaje-facial/MarcajeFacial.vue'),
      meta: {
        requiresAuth: true,
        requiredRoles: ['ADMIN'],
        title: 'Marcaje facial',
      },
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('@/views/perfil/Perfil.vue'),
      meta: {
        requiresAuth: true,
        title: 'Mi Perfil',
      },
    },
    {
      path: '/configuracion',
      name: 'configuracion',
      component: () => import('@/views/configuracion/Configuracion.vue'),
      meta: {
        requiresAuth: true,
        title: 'Configuración',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
});

// Guard de navegación
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();

  // Cargar usuario desde localStorage si existe
  if (!authStore.user && authStore.getToken()) {
    await authStore.loadUserFromStorage();
  }

  const requiresAuth = to.meta.requiresAuth !== false;
  const requiredRoles = to.meta.requiredRoles as RolUsuario[] | undefined;

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirigir al login si la ruta requiere autenticación
    next({ name: 'login' });
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    // Redirigir al dashboard si ya está autenticado
    next({ name: 'dashboard' });
  } else if (requiredRoles && !authStore.hasRole(requiredRoles)) {
    // No tiene el rol requerido
    alert('No tienes permisos para acceder a esta página');
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;