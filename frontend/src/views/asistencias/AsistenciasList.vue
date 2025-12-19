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
                <i class="bi bi-clipboard-check me-2"></i>
                Registro de Asistencias
              </h1>
              <p class="text-muted mb-0">
                {{ asistenciasStore.asistenciasHoy.length }} marcajes hoy
              </p>
            </div>
            <button 
              class="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#modalCrear"
            >
              <i class="bi bi-plus-circle me-2"></i>
              Nuevo Marcaje
            </button>
          </div>

          <!-- Tabs -->
          <ul class="nav nav-tabs mb-4" role="tablist">
            <li class="nav-item">
              <button 
                class="nav-link active" 
                data-bs-toggle="tab" 
                data-bs-target="#hoy"
                @click="loadHoy"
              >
                <i class="bi bi-calendar-day me-2"></i>
                Hoy
              </button>
            </li>
            <li class="nav-item">
              <button 
                class="nav-link" 
                data-bs-toggle="tab" 
                data-bs-target="#todas"
                @click="loadTodas"
              >
                <i class="bi bi-calendar3 me-2"></i>
                Todas
              </button>
            </li>
          </ul>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Tab Hoy -->
            <div class="tab-pane fade show active" id="hoy">
              <div v-if="asistenciasStore.loading" class="text-center py-5">
                <div class="spinner-border text-primary"></div>
              </div>

              <div v-else-if="asistenciasStore.asistenciasHoy.length === 0" class="text-center py-5">
                <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                <p class="text-muted mt-3">No hay marcajes registrados hoy</p>
              </div>

              <div v-else class="card shadow-sm">
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                      <thead class="table-light">
                        <tr>
                          <th>Hora</th>
                          <th>Funcionario</th>
                          <th>Tipo Marcaje</th>
                          <th>Tardanza</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="asistencia in asistenciasStore.asistenciasHoy" :key="asistencia.id">
                          <td>
                            <strong>{{ formatHora(asistencia.horaMarcaje) }}</strong>
                          </td>
                          <td>
                            <div class="d-flex align-items-center">
                              <div class="avatar bg-info bg-opacity-10 text-info rounded-circle me-2">
                                <i class="bi bi-person-fill"></i>
                              </div>
                              <div>
                                <div class="fw-semibold">
                                  {{ asistencia.funcionario?.nombre }} {{ asistencia.funcionario?.apellido }}
                                </div>
                                <small class="text-muted">{{ asistencia.funcionario?.cargo }}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span class="badge" :class="getTipoBadgeClass(asistencia.tipoMarcaje)">
                              {{ formatTipoMarcaje(asistencia.tipoMarcaje) }}
                            </span>
                          </td>
                          <td>
                            <span v-if="asistencia.minutosTardanza > 0" class="text-warning fw-semibold">
                              <i class="bi bi-clock me-1"></i>
                              {{ asistencia.minutosTardanza }} min
                            </span>
                            <span v-else class="text-success">
                              <i class="bi bi-check-circle-fill me-1"></i>
                              A tiempo
                            </span>
                          </td>
                          <td>
                            <span v-if="asistencia.verificado" class="badge bg-success">
                              Verificado
                            </span>
                            <span v-else class="badge bg-secondary">
                              Pendiente
                            </span>
                          </td>
                          <td>
                            <div class="btn-group btn-group-sm">
                              <button
                                class="btn btn-outline-primary"
                                @click="selectAsistenciaEdit(asistencia)"
                                data-bs-toggle="modal"
                                data-bs-target="#modalEditar"
                                title="Editar"
                              >
                                <i class="bi bi-pencil"></i>
                              </button>
                              <button
                                class="btn btn-outline-danger"
                                @click="confirmDelete(asistencia)"
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

            <!-- Tab Todas -->
            <div class="tab-pane fade" id="todas">
              <!-- Filtros -->
              <div class="card shadow-sm mb-4">
                <div class="card-body">
                  <div class="row g-3">
                    <div class="col-md-4">
                      <label class="form-label">Fecha</label>
                      <input
                        type="date"
                        class="form-control"
                        v-model="asistenciasStore.filterFecha"
                      />
                    </div>
                    <div class="col-md-3">
                      <label class="form-label">Tipo Marcaje</label>
                      <select class="form-select" v-model="asistenciasStore.filterTipo">
                        <option value="">Todos</option>
                        <option value="INGRESO_MANANA">Ingreso Mañana</option>
                        <option value="SALIDA_DESCANSO">Salida Descanso</option>
                        <option value="INGRESO_TARDE">Ingreso Tarde</option>
                        <option value="SALIDA_FINAL">Salida Final</option>
                      </select>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                      <button 
                        class="btn btn-outline-secondary w-100"
                        @click="asistenciasStore.clearFilters()"
                      >
                        <i class="bi bi-x-circle me-1"></i>
                        Limpiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tabla -->
              <div v-if="asistenciasStore.loading" class="text-center py-5">
                <div class="spinner-border text-primary"></div>
              </div>

              <div v-else class="card shadow-sm">
                <div class="card-body p-0">
                  <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                      <thead class="table-light">
                        <tr>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Funcionario</th>
                          <th>Tipo</th>
                          <th>Tardanza</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="asistenciasStore.asistenciasFiltradas.length === 0">
                          <td colspan="6" class="text-center py-5 text-muted">
                            No hay asistencias registradas
                          </td>
                        </tr>
                        <tr v-for="asistencia in asistenciasStore.asistenciasFiltradas.slice(0, 50)" :key="asistencia.id">
                          <td>{{ formatFecha(asistencia.fecha) }}</td>
                          <td>{{ formatHora(asistencia.horaMarcaje) }}</td>
                          <td>
                            {{ asistencia.funcionario?.nombre }} {{ asistencia.funcionario?.apellido }}
                          </td>
                          <td>
                            <span class="badge" :class="getTipoBadgeClass(asistencia.tipoMarcaje)">
                              {{ formatTipoMarcaje(asistencia.tipoMarcaje) }}
                            </span>
                          </td>
                          <td>
                            <span v-if="asistencia.minutosTardanza > 0" class="text-warning">
                              {{ asistencia.minutosTardanza }} min
                            </span>
                            <span v-else class="text-success">-</span>
                          </td>
                          <td>
                            <div class="btn-group btn-group-sm">
                              <button
                                class="btn btn-outline-primary"
                                @click="selectAsistenciaEdit(asistencia)"
                                data-bs-toggle="modal"
                                data-bs-target="#modalEditar"
                              >
                                <i class="bi bi-pencil"></i>
                              </button>
                              <button
                                class="btn btn-outline-danger"
                                @click="confirmDelete(asistencia)"
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
      </div>
    </div>

    <!-- Modal Crear -->
    <div class="modal fade" id="modalCrear" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-plus-circle me-2"></i>
              Registrar Marcaje
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleCreate">
              <div class="mb-3">
                <label class="form-label">Funcionario *</label>
                <select class="form-select" v-model="formCreate.funcionarioId" required>
                  <option value="">Seleccionar...</option>
                  <option v-for="func in funcionarios" :key="func.id" :value="func.id">
                    {{ func.nombre }} {{ func.apellido }} - {{ func.cargo }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Fecha *</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="formCreate.fecha"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Hora de Marcaje *</label>
                <input
                  type="time"
                  class="form-control"
                  v-model="formCreate.horaMarcaje"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Tipo de Marcaje *</label>
                <select class="form-select" v-model="formCreate.tipoMarcaje" required>
                  <option value="">Seleccionar...</option>
                  <option value="INGRESO_MANANA">Ingreso Mañana</option>
                  <option value="SALIDA_DESCANSO">Salida Descanso</option>
                  <option value="INGRESO_TARDE">Ingreso Tarde</option>
                  <option value="SALIDA_FINAL">Salida Final</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Minutos de Tardanza</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="formCreate.minutosTardanza"
                  min="0"
                />
              </div>

              <div class="modal-footer border-0 px-0 pb-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="asistenciasStore.loading">
                  <i class="bi bi-check-circle me-2"></i>
                  Registrar
                </button>
              </div>
            </form>
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
              Editar Marcaje
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleUpdate">
              <div class="mb-3">
                <label class="form-label">Hora de Marcaje</label>
                <input
                  type="time"
                  class="form-control"
                  v-model="formEdit.horaMarcaje"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Minutos de Tardanza</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="formEdit.minutosTardanza"
                  min="0"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Observación</label>
                <textarea
                  class="form-control"
                  v-model="formEdit.observacion"
                  rows="3"
                ></textarea>
              </div>

              <div class="modal-footer border-0 px-0 pb-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-warning" :disabled="asistenciasStore.loading">
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
import { useAsistenciasStore } from '@/stores/asistencias';
import { funcionariosService } from '@/services/funcionarios.service';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import type { Asistencia, CreateAsistenciaDto, UpdateAsistenciaDto, Funcionario } from '@/types';
import { Modal } from 'bootstrap';

const asistenciasStore = useAsistenciasStore();
const sidebarOpen = ref(false);
const selectedAsistencia = ref<Asistencia | null>(null);
const funcionarios = ref<Funcionario[]>([]);

const formCreate = reactive<CreateAsistenciaDto>({
  funcionarioId: 0,
  fecha: new Date().toISOString().split('T')[0],
  horaMarcaje: new Date().toTimeString().slice(0, 5),
  tipoMarcaje: 'INGRESO_MANANA' as any,
  minutosTardanza: 0,
});

const formEdit = reactive<UpdateAsistenciaDto>({
  horaMarcaje: '',
  minutosTardanza: 0,
  observacion: '',
});

const getTipoBadgeClass = (tipo: string) => {
  const classes: { [key: string]: string } = {
    INGRESO_MANANA: 'bg-success',
    SALIDA_DESCANSO: 'bg-warning text-dark',
    INGRESO_TARDE: 'bg-info',
    SALIDA_FINAL: 'bg-danger',
  };
  return classes[tipo] || 'bg-secondary';
};

const formatTipoMarcaje = (tipo: string) => {
  const tipos: { [key: string]: string } = {
    INGRESO_MANANA: 'Ingreso Mañana',
    SALIDA_DESCANSO: 'Salida Descanso',
    INGRESO_TARDE: 'Ingreso Tarde',
    SALIDA_FINAL: 'Salida Final',
  };
  return tipos[tipo] || tipo;
};

const formatHora = (hora: string) => {
  return new Date(hora).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES');
};

const loadHoy = async () => {
  await asistenciasStore.loadAsistenciasHoy();
};

const loadTodas = async () => {
  await asistenciasStore.loadAsistencias();
};

const selectAsistenciaEdit = (asistencia: Asistencia) => {
  selectedAsistencia.value = asistencia;
  formEdit.horaMarcaje = new Date(asistencia.horaMarcaje).toTimeString().slice(0, 5);
  formEdit.minutosTardanza = asistencia.minutosTardanza;
  formEdit.observacion = asistencia.observacion || '';
};

const handleCreate = async () => {
  const result = await asistenciasStore.createAsistencia(formCreate);
  
  if (result.success) {
    const modal = Modal.getInstance(document.getElementById('modalCrear')!);
    modal?.hide();
    
    // Reset form
    formCreate.funcionarioId = 0;
    formCreate.fecha = new Date().toISOString().split('T')[0];
    formCreate.horaMarcaje = new Date().toTimeString().slice(0, 5);
    formCreate.tipoMarcaje = 'INGRESO_MANANA' as any;
    formCreate.minutosTardanza = 0;
    
    await loadHoy();
    alert('Marcaje registrado exitosamente');
  } else {
    alert(`Error: ${result.error}`);
  }
};

const handleUpdate = async () => {
  if (!selectedAsistencia.value) return;
  
  const result = await asistenciasStore.updateAsistencia(selectedAsistencia.value.id, formEdit);
  
  if (result.success) {
    const modal = Modal.getInstance(document.getElementById('modalEditar')!);
    modal?.hide();
    
    await loadHoy();
    alert('Marcaje actualizado exitosamente');
  } else {
    alert(`Error: ${result.error}`);
  }
};

const confirmDelete = async (asistencia: Asistencia) => {
  if (!confirm(`¿Está seguro de eliminar este marcaje?`)) {
    return;
  }
  
  const result = await asistenciasStore.deleteAsistencia(asistencia.id);
  
  if (result.success) {
    await loadHoy();
    alert('Marcaje eliminado exitosamente');
  } else {
    alert(`Error: ${result.error}`);
  }
};

onMounted(async () => {
  await asistenciasStore.loadAsistenciasHoy();
  funcionarios.value = await funcionariosService.getActivos();
});
</script>

<style scoped>
.avatar {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>