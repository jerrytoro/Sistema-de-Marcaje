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
                <i class="bi bi-person-badge me-2"></i>
                Gestión de Funcionarios
              </h1>
              <p class="text-muted mb-0">
                {{ funcionariosStore.totalFuncionarios }} funcionarios totales
                <span class="text-success ms-2">{{ funcionariosStore.funcionariosActivos }} activos</span>
              </p>
            </div>
            <button 
              class="btn btn-primary"
              @click="funcionariosStore.loadFuncionarios()"
            >
              <i class="bi bi-arrow-clockwise me-2"></i>
              Actualizar
            </button>
          </div>

          <!-- Stats Cards -->
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <div class="card border-0 shadow-sm">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="text-muted text-uppercase mb-2" style="font-size: 0.75rem;">Total Funcionarios</h6>
                      <h2 class="mb-0 fw-bold">{{ funcionariosStore.totalFuncionarios }}</h2>
                    </div>
                    <div class="bg-primary bg-opacity-10 text-primary rounded p-3">
                      <i class="bi bi-people-fill fs-3"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card border-0 shadow-sm">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="text-muted text-uppercase mb-2" style="font-size: 0.75rem;">Activos</h6>
                      <h2 class="mb-0 fw-bold text-success">{{ funcionariosStore.funcionariosActivos }}</h2>
                    </div>
                    <div class="bg-success bg-opacity-10 text-success rounded p-3">
                      <i class="bi bi-check-circle-fill fs-3"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card border-0 shadow-sm">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="text-muted text-uppercase mb-2" style="font-size: 0.75rem;">Inactivos</h6>
                      <h2 class="mb-0 fw-bold text-secondary">{{ funcionariosStore.funcionariosInactivos }}</h2>
                    </div>
                    <div class="bg-secondary bg-opacity-10 text-secondary rounded p-3">
                      <i class="bi bi-x-circle-fill fs-3"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label">
                    <i class="bi bi-search me-1"></i>
                    Buscar
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Nombre, apellido, cargo..."
                    v-model="funcionariosStore.searchQuery"
                  />
                </div>
                <div class="col-md-3">
                  <label class="form-label">
                    <i class="bi bi-building me-1"></i>
                    Dependencia
                  </label>
                  <select class="form-select" v-model="funcionariosStore.filterDependencia">
                    <option value="">Todas</option>
                    <option v-for="dep in funcionariosStore.dependencias" :key="dep" :value="dep">
                      {{ dep }}
                    </option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label">
                    <i class="bi bi-briefcase me-1"></i>
                    Cargo
                  </label>
                  <select class="form-select" v-model="funcionariosStore.filterCargo">
                    <option value="">Todos</option>
                    <option v-for="cargo in funcionariosStore.cargos" :key="cargo" :value="cargo">
                      {{ cargo }}
                    </option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label">
                    <i class="bi bi-toggle-on me-1"></i>
                    Estado
                  </label>
                  <select class="form-select" v-model="funcionariosStore.filterEstado">
                    <option value="">Todos</option>
                    <option value="true">Activos</option>
                    <option value="false">Inactivos</option>
                  </select>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button 
                    class="btn btn-outline-secondary w-100"
                    @click="funcionariosStore.clearFilters()"
                  >
                    <i class="bi bi-x-circle me-1"></i>
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="funcionariosStore.loading" class="text-center py-5">
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
                      <th>Funcionario</th>
                      <th>Cargo</th>
                      <th>Dependencia</th>
                      <th>Usuario</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="funcionariosStore.funcionariosFiltrados.length === 0">
                      <td colspan="7" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                        <p class="mt-3 mb-0">No se encontraron funcionarios</p>
                      </td>
                    </tr>
                    <tr v-for="funcionario in funcionariosStore.funcionariosFiltrados" :key="funcionario.id">
                      <td>{{ funcionario.id }}</td>
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar bg-info bg-opacity-10 text-info rounded-circle me-2"
                               style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                            <i class="bi bi-person-fill"></i>
                          </div>
                          <div>
                            <div class="fw-semibold">{{ funcionario.nombre }} {{ funcionario.apellido }}</div>
                            <small class="text-muted">ID: {{ funcionario.id }}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-primary">{{ funcionario.cargo }}</span>
                      </td>
                      <td>{{ funcionario.dependencia }}</td>
                      <td>
                        <span v-if="funcionario.usuario" class="text-muted">
                          <i class="bi bi-person-check me-1"></i>
                          {{ funcionario.usuario.username }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>
                        <span class="badge" :class="funcionario.estado ? 'bg-success' : 'bg-secondary'">
                          {{ funcionario.estado ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button
                            class="btn btn-outline-info"
                            @click="viewDetalle(funcionario)"
                            data-bs-toggle="modal"
                            data-bs-target="#modalDetalle"
                            title="Ver detalle"
                          >
                            <i class="bi bi-eye"></i>
                          </button>
                          <button
                            class="btn btn-outline-primary"
                            @click="selectFuncionarioEdit(funcionario)"
                            data-bs-toggle="modal"
                            data-bs-target="#modalEditar"
                            title="Editar"
                          >
                            <i class="bi bi-pencil"></i>
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

    <!-- Modal Detalle -->
    <div class="modal fade" id="modalDetalle" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title">
              <i class="bi bi-person-badge me-2"></i>
              Detalle del Funcionario
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" v-if="selectedFuncionario">
            <div class="row g-4">
              <div class="col-12 text-center">
                <div class="avatar bg-info bg-opacity-10 text-info rounded-circle mx-auto"
                     style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                  <i class="bi bi-person-fill" style="font-size: 2.5rem;"></i>
                </div>
                <h4 class="mt-3 mb-1">{{ selectedFuncionario.nombre }} {{ selectedFuncionario.apellido }}</h4>
                <p class="text-muted mb-0">{{ selectedFuncionario.cargo }}</p>
              </div>

              <div class="col-12">
                <hr>
              </div>

              <div class="col-md-6">
                <label class="text-muted small">Nombre</label>
                <p class="mb-0 fw-semibold">{{ selectedFuncionario.nombre }}</p>
              </div>

              <div class="col-md-6">
                <label class="text-muted small">Apellido</label>
                <p class="mb-0 fw-semibold">{{ selectedFuncionario.apellido }}</p>
              </div>

              <div class="col-md-6">
                <label class="text-muted small">Cargo</label>
                <p class="mb-0"><span class="badge bg-primary">{{ selectedFuncionario.cargo }}</span></p>
              </div>

              <div class="col-md-6">
                <label class="text-muted small">Dependencia</label>
                <p class="mb-0 fw-semibold">{{ selectedFuncionario.dependencia }}</p>
              </div>

              <div class="col-md-6">
                <label class="text-muted small">Estado</label>
                <p class="mb-0">
                  <span class="badge" :class="selectedFuncionario.estado ? 'bg-success' : 'bg-secondary'">
                    {{ selectedFuncionario.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </p>
              </div>

              <div class="col-md-6" v-if="selectedFuncionario.usuario">
                <label class="text-muted small">Usuario Asociado</label>
                <p class="mb-0 fw-semibold">
                  <i class="bi bi-person-check me-1"></i>
                  {{ selectedFuncionario.usuario.username }}
                </p>
              </div>

              <div class="col-md-6">
                <label class="text-muted small">Fecha de Registro</label>
                <p class="mb-0">{{ formatDate(selectedFuncionario.createdAt) }}</p>
              </div>

              <div class="col-md-6">
                <label class="text-muted small">Última Actualización</label>
                <p class="mb-0">{{ formatDate(selectedFuncionario.updatedAt) }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editar -->
    <div class="modal fade" id="modalEditar" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-warning">
            <h5 class="modal-title">
              <i class="bi bi-pencil me-2"></i>
              Editar Funcionario
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleUpdate">
              <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formEdit.nombre"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Apellido</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formEdit.apellido"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Cargo</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formEdit.cargo"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Dependencia</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formEdit.dependencia"
                  required
                />
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
                    Funcionario activo
                  </label>
                </div>
              </div>

              <div class="modal-footer border-0 px-0 pb-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-warning" :disabled="funcionariosStore.loading">
                  <i class="bi bi-check-circle me-2"></i>
                  Actualizar
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
import { useFuncionariosStore } from '@/stores/funcionarios';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import type { Funcionario } from '@/types';
import { Modal } from 'bootstrap';

const funcionariosStore = useFuncionariosStore();
const sidebarOpen = ref(false);
const selectedFuncionario = ref<Funcionario | null>(null);

const formEdit = reactive({
  nombre: '',
  apellido: '',
  cargo: '',
  dependencia: '',
  estado: true,
});

const viewDetalle = (funcionario: Funcionario) => {
  selectedFuncionario.value = funcionario;
};

const selectFuncionarioEdit = (funcionario: Funcionario) => {
  selectedFuncionario.value = funcionario;
  formEdit.nombre = funcionario.nombre;
  formEdit.apellido = funcionario.apellido;
  formEdit.cargo = funcionario.cargo;
  formEdit.dependencia = funcionario.dependencia;
  formEdit.estado = funcionario.estado;
};

const handleUpdate = async () => {
  if (!selectedFuncionario.value) return;
  
  const result = await funcionariosStore.updateFuncionario(selectedFuncionario.value.id, formEdit);
  
  if (result.success) {
    const modal = Modal.getInstance(document.getElementById('modalEditar')!);
    modal?.hide();
    alert('Funcionario actualizado exitosamente');
  } else {
    alert(`Error: ${result.error}`);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

onMounted(() => {
  funcionariosStore.loadFuncionarios();
});
</script>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
}
</style>