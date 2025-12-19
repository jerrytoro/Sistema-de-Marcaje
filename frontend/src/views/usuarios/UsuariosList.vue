<template>
  <div class="main-wrapper">
    <Sidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />
    
    <div class="main-content">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      
      <div class="content-area">
        <div class="container-fluid">
          <!-- Header -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="mb-1">
                <i class="bi bi-people me-2"></i>
                Gestión de Usuarios
              </h1>
              <p class="text-muted mb-0">
                {{ usuariosStore.totalUsuarios }} usuarios totales
                <span class="text-success ms-2">{{ usuariosStore.usuariosActivos }} activos</span>
              </p>
            </div>
            <button 
              class="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#modalCrearUsuario"
            >
              <i class="bi bi-plus-circle me-2"></i>
              Nuevo Usuario
            </button>
          </div>

          <!-- Filters -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">
                    <i class="bi bi-search me-1"></i>
                    Buscar
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Usuario, nombre o apellido..."
                    v-model="usuariosStore.searchQuery"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label">
                    <i class="bi bi-person-badge me-1"></i>
                    Rol
                  </label>
                  <select class="form-select" v-model="usuariosStore.filterRol">
                    <option value="">Todos</option>
                    <option value="ADMIN">Admin</option>
                    <option value="RRHH">RRHH</option>
                    <option value="FUNCIONARIO">Funcionario</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">
                    <i class="bi bi-toggle-on me-1"></i>
                    Estado
                  </label>
                  <select class="form-select" v-model="usuariosStore.filterEstado">
                    <option value="">Todos</option>
                    <option value="true">Activos</option>
                    <option value="false">Inactivos</option>
                  </select>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button 
                    class="btn btn-outline-secondary w-100"
                    @click="usuariosStore.clearFilters()"
                  >
                    <i class="bi bi-x-circle me-1"></i>
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="usuariosStore.loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>

          <!-- Tabla -->
          <div v-else class="card shadow-sm">
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Funcionario</th>
                      <th>Cargo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th class="text-center">
                        <i class="bi bi-camera-video" title="Reconocimiento Facial"></i>
                      </th>
                      <th class="text-center">
                        <i class="bi bi-telegram" title="Telegram"></i>
                      </th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="usuariosStore.usuariosFiltrados.length === 0">
                      <td colspan="9" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                        <p class="mt-3 mb-0">No se encontraron usuarios</p>
                      </td>
                    </tr>
                    <tr v-for="usuario in usuariosStore.usuariosFiltrados" :key="usuario.id">
                      <td>{{ usuario.id }}</td>
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar bg-primary bg-opacity-10 text-primary rounded-circle me-2"
                               style="width: 35px; height: 35px; display: flex; align-items: center; justify-content: center;">
                            <i class="bi bi-person-fill"></i>
                          </div>
                          <strong>{{ usuario.username }}</strong>
                        </div>
                      </td>
                      <td>
                        <span v-if="usuario.funcionario">
                          {{ usuario.funcionario.nombre }} {{ usuario.funcionario.apellido }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>
                        <span v-if="usuario.funcionario">
                          {{ usuario.funcionario.cargo }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>
                        <span class="badge" :class="getRolBadgeClass(usuario.rol)">
                          {{ usuario.rol }}
                        </span>
                      </td>
                      <td>
                        <span class="badge" :class="usuario.estado ? 'bg-success' : 'bg-secondary'">
                          {{ usuario.estado ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <!-- Reconocimiento Facial -->
                      <td class="text-center">
                        <span v-if="usuario.funcionario?.facialDataRegistered"
                              class="badge bg-success" 
                              title="Facial registrado">
                          <i class="bi bi-check-circle"></i>
                        </span>
                        <span v-else class="badge bg-secondary" title="Sin facial">
                          <i class="bi bi-x-circle"></i>
                        </span>
                      </td>
                      <!-- Telegram -->
                      <td class="text-center">
                        <span v-if="usuario.funcionario?.telegramChatId" 
                              class="badge bg-info" 
                              title="Telegram vinculado">
                          <i class="bi bi-check-circle"></i>
                        </span>
                        <span v-else class="badge bg-secondary" title="Sin Telegram">
                          <i class="bi bi-x-circle"></i>
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button
                            class="btn btn-outline-primary"
                            @click="selectUsuarioEdit(usuario)"
                            
                            title="Editar" 
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button
                            class="btn btn-outline-warning"
                            @click="selectUsuarioPassword(usuario)"
                            data-bs-toggle="modal"
                            data-bs-target="#modalCambiarPassword"
                            title="Cambiar contraseña"
                          >
                            <i class="bi bi-key"></i>
                          </button>
                          <button
                            class="btn btn-outline-danger"
                            @click="confirmDelete(usuario)"
                            title="Eliminar"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear Usuario -->
    <div class="modal fade" id="modalCrearUsuario" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-person-plus me-2"></i>
              Nuevo Usuario
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleCreate">
              <div class="row g-3">
                <div class="col-12">
                  <h6 class="text-muted border-bottom pb-2">Datos de Usuario</h6>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Usuario *</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formCreate.username"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Contraseña *</label>
                  <input
                    type="password"
                    class="form-control"
                    v-model="formCreate.password"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Rol *</label>
                  <select class="form-select" v-model="formCreate.rol" required>
                    <option value="">Seleccionar...</option>
                    <option value="ADMIN">Admin</option>
                    <option value="RRHH">RRHH</option>
                    <option value="FUNCIONARIO">Funcionario</option>
                  </select>
                </div>

                <div class="col-12 mt-4">
                  <h6 class="text-muted border-bottom pb-2">Datos del Funcionario</h6>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nombre *</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formCreate.nombre"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Apellido *</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formCreate.apellido"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Cargo *</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formCreate.cargo"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Dependencia *</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="formCreate.dependencia"
                    required
                  />
                </div>
              </div>

              <div class="modal-footer border-0 px-0 pb-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="usuariosStore.loading">
                  <span v-if="usuariosStore.loading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Creando...
                  </span>
                  <span v-else>
                    <i class="bi bi-check-circle me-2"></i>
                    Crear Usuario
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editar Usuario -->
    <div class="modal fade" id="modalEditarUsuario" ref="modalRef" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-warning">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Editar Usuario
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleUpdate">
              <div class="mb-3">
                <label class="form-label">Usuario</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formEdit.username"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Rol</label>
                <select class="form-select" v-model="formEdit.rol">
                  <option value="ADMIN">Admin</option>
                  <option value="RRHH">RRHH</option>
                  <option value="FUNCIONARIO">Funcionario</option>
                </select>
              </div>
              <div class="mb-3">
                <div class="form-check form-switch">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="formEdit.estado"
                    id="estadoCheck"
                  />
                  <label class="form-check-label" for="estadoCheck">
                    Usuario activo
                  </label>
                </div>
              </div>

              <div class="modal-footer border-0 px-0 pb-0">
                <button type="button" class="btn btn-secondary" @click="closeModal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-warning" :disabled="usuariosStore.loading" @click="closeModal">
                  <i class="bi bi-check-circle me-2"></i>
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Cambiar Contraseña -->
    <div class="modal fade" id="modalCambiarPassword" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-info">
            <h5 class="modal-title text-white">
              <i class="bi bi-key me-2"></i>
              Cambiar Contraseña
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleChangePassword">
              <div class="mb-3">
                <label class="form-label">Contraseña Actual</label>
                <input
                  type="password"
                  class="form-control"
                  v-model="formPassword.currentPassword"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Nueva Contraseña</label>
                <input
                  type="password"
                  class="form-control"
                  v-model="formPassword.newPassword"
                  required
                />
              </div>

              <div class="modal-footer border-0 px-0 pb-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-info text-white" :disabled="usuariosStore.loading">
                  <i class="bi bi-check-circle me-2"></i>
                  Cambiar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useUsuariosStore } from '@/stores/usuarios';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto } from '@/types';
import { Modal } from 'bootstrap';

const usuariosStore = useUsuariosStore();
const sidebarOpen = ref(false);
const selectedUsuario = ref<Usuario | null>(null);


/////
const modalRef = ref<HTMLDivElement | null>(null);
let myModal: Modal | null = null;
const initModal = () => {
  if (modalRef.value) {
    myModal = new Modal(modalRef.value);
  }
};
const openModal = () => {
  if (myModal) {
    myModal.show();
  }
};
const closeModal = () => {
  if (myModal) {
    myModal.hide();
  }
};
/////
const formCreate = reactive<CreateUsuarioDto>({
  username: '',
  password: '',
  rol: 'FUNCIONARIO' as any,
  nombre: '',
  apellido: '',
  cargo: '',
  dependencia: '',
});

const formEdit = reactive<UpdateUsuarioDto>({
  username: '',
  rol: 'FUNCIONARIO' as any,
  estado: true,
});

const formPassword = reactive<ChangePasswordDto>({
  currentPassword: '',
  newPassword: '',
});

const getRolBadgeClass = (rol: string) => {
  const classes: { [key: string]: string } = {
    ADMIN: 'bg-danger',
    RRHH: 'bg-warning text-dark',
    FUNCIONARIO: 'bg-info',
  };
  return classes[rol] || 'bg-secondary';
};

const selectUsuarioEdit = (usuario: Usuario) => {
  selectedUsuario.value = usuario;
  formEdit.username = usuario.username;
  formEdit.rol = usuario.rol as any;
  formEdit.estado = usuario.estado;
  openModal();
};

const selectUsuarioPassword = (usuario: Usuario) => {
  selectedUsuario.value = usuario;
  formPassword.currentPassword = '';
  formPassword.newPassword = '';
};

const handleCreate = async () => {
  const result = await usuariosStore.createUsuario(formCreate);
  
  if (result.success) {
    const modal = Modal.getInstance(document.getElementById('modalCrearUsuario')!);
    modal?.hide();
    
    // Reset form
    Object.assign(formCreate, {
      username: '',
      password: '',
      rol: 'FUNCIONARIO',
      nombre: '',
      apellido: '',
      cargo: '',
      dependencia: '',
    });
    
    alert('Usuario creado exitosamente');
  } else {
    alert(`Error: ${result.error}`);
  }
};

const handleUpdate = async () => {
  if (!selectedUsuario.value) return;
  
  const result = await usuariosStore.updateUsuario(selectedUsuario.value.id, formEdit);
  
  if (result.success) {
    //const modal = Modal.getInstance(document.getElementById('modalEditarUsuario')!);
    //modal?.hide();
    closeModal();
    alert('Usuario actualizado exitosamente');
  } else {
    alert(`Error: ${result.error}`);
  }
};

const handleChangePassword = async () => {
  if (!selectedUsuario.value) return;
  
  const result = await usuariosStore.changePassword(selectedUsuario.value.id, formPassword);
  
  if (result.success) {
    const modal = Modal.getInstance(document.getElementById('modalCambiarPassword')!);
    modal?.hide();
    
    formPassword.currentPassword = '';
    formPassword.newPassword = '';
    
    alert('Contraseña cambiada exitosamente');
  } else {
    alert(`Error: ${result.error}`);
  }
};

const confirmDelete = async (usuario: Usuario) => {
  if (!confirm(`¿Está seguro de eliminar el usuario "${usuario.username}"?`)) {
    return;
  }
  
  const result = await usuariosStore.deleteUsuario(usuario.id);
  
  if (result.success) {
    alert('Usuario eliminado exitosamente');
  } else {
    alert(`Error: ${result.error}`);
  }
};

onMounted(() => {
  usuariosStore.loadUsuarios();
  initModal();
});
</script>

<style scoped>
.avatar {
  width: 35px;
  height: 35px;
}
</style>