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
                <i class="bi bi-clock-history me-2"></i>
                Configuración de Horarios
              </h1>
              <p class="text-muted mb-0">
                Define los horarios de ingreso y salida para el control de asistencias
              </p>
            </div>
            <div class="btn-group">
              <button class="btn btn-outline-secondary" @click="loadConfiguraciones" :disabled="configStore.loading">
                <i class="bi bi-arrow-clockwise me-2"></i>
                Actualizar
              </button>
              <button v-if="!configuracionActual" class="btn btn-primary" @click="openCreateModal">
                <i class="bi bi-plus-circle me-2"></i>
                Nueva Configuración
              </button>
            </div>
          </div>

          <!-- Info Alert -->
          <div class="alert alert-info mb-4">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Sistema de 4 Marcajes:</strong>
            Define los horarios para Ingreso Mañana, Salida Descanso, Ingreso Tarde y Salida Final.
          </div>

          <!-- Loading -->
          <div v-if="configStore.loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>

          <!-- Error -->
          <div v-if="configStore.error" class="alert alert-danger alert-dismissible">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ configStore.error }}
            <button type="button" class="btn-close" @click="configStore.error = null"></button>
          </div>

          <!-- Configuración Actual -->
          <div v-if="!configStore.loading && configuracionActual" class="card shadow-sm mb-4">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-check-circle me-2"></i>
                Configuración Activa
              </h5>
              <span v-if="configStore.siguienteMarcaje" class="badge bg-white text-success">
                Próximo: {{ getTipoMarcajeTexto(configStore.siguienteMarcaje.tipoMarcaje) }}
              </span>
            </div>
            <div class="card-body">
              <div class="row g-4">
                <!-- Ingreso Mañana -->
                <div class="col-md-6 col-lg-3">
                  <div class="horario-card" :class="{ 'active': esSiguienteMarcaje('INGRESO_MANANA') }">
                    <div class="horario-icon bg-success">
                      <i class="bi bi-sunrise"></i>
                    </div>
                    <h6 class="text-muted mb-1">Ingreso Mañana</h6>
                    <h3 class="mb-1">{{ configuracionActual.horaIngresoManana || '--:--' }}</h3>
                    <small class="text-muted">
                      <i class="bi bi-clock me-1"></i>
                      Tolerancia: {{ configuracionActual.toleranciaIngresoManana || 0 }} min
                    </small>
                  </div>
                </div>

                <!-- Salida Descanso -->
                <div class="col-md-6 col-lg-3">
                  <div class="horario-card" :class="{ 'active': esSiguienteMarcaje('SALIDA_DESCANSO') }">
                    <div class="horario-icon bg-warning">
                      <i class="bi bi-cup-hot"></i>
                    </div>
                    <h6 class="text-muted mb-1">Salida Descanso</h6>
                    <h3 class="mb-1">{{ configuracionActual.horaSalidaDescanso || '--:--' }}</h3>
                    <small class="text-muted">
                      <i class="bi bi-clock me-1"></i>
                      Tolerancia: {{ configuracionActual.toleranciaSalidaDescanso || 0 }} min
                    </small>
                  </div>
                </div>

                <!-- Ingreso Tarde -->
                <div class="col-md-6 col-lg-3">
                  <div class="horario-card" :class="{ 'active': esSiguienteMarcaje('INGRESO_TARDE') }">
                    <div class="horario-icon bg-info">
                      <i class="bi bi-sun"></i>
                    </div>
                    <h6 class="text-muted mb-1">Ingreso Tarde</h6>
                    <h3 class="mb-1">{{ configuracionActual.horaIngresoTarde || '--:--' }}</h3>
                    <small class="text-muted">
                      <i class="bi bi-clock me-1"></i>
                      Tolerancia: {{ configuracionActual.toleranciaIngresoTarde || 0 }} min
                    </small>
                  </div>
                </div>

                <!-- Salida Final -->
                <div class="col-md-6 col-lg-3">
                  <div class="horario-card" :class="{ 'active': esSiguienteMarcaje('SALIDA_FINAL') }">
                    <div class="horario-icon bg-danger">
                      <i class="bi bi-moon"></i>
                    </div>
                    <h6 class="text-muted mb-1">Salida Final</h6>
                    <h3 class="mb-1">{{ configuracionActual.horaSalidaFinal || '--:--' }}</h3>
                    <small class="text-muted">
                      <i class="bi bi-clock me-1"></i>
                      Tolerancia: {{ configuracionActual.toleranciaSalidaFinal || 0 }} min
                    </small>
                  </div>
                </div>
              </div>

              <hr class="my-4">

              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-warning" @click="openEditModal">
                  <i class="bi bi-pencil me-2"></i>
                  Editar
                </button>
                <button class="btn btn-outline-info" @click="validarConfiguracion">
                  <i class="bi bi-check-circle me-2"></i>
                  Validar
                </button>
                <button class="btn btn-outline-secondary" @click="verConflictos">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  Ver Conflictos
                </button>
                <button class="btn btn-outline-danger" @click="confirmarReset">
                  <i class="bi bi-arrow-counterclockwise me-2"></i>
                  Restablecer
                </button>
              </div>
            </div>
          </div>

          <!-- Todas las Configuraciones -->
          <div v-if="!configStore.loading && configuraciones.length > 0" class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">
                <i class="bi bi-list me-2"></i>
                Historial de Configuraciones ({{ configuraciones.length }})
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Ingreso Mañana</th>
                      <th>Salida Descanso</th>
                      <th>Ingreso Tarde</th>
                      <th>Salida Final</th>
                      <th>Creado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="config in configuraciones" :key="config.id">
                      <td>
                        <span class="badge bg-secondary">{{ config.id || 'N/A' }}</span>
                      </td>
                      <td>
                        <strong>{{ config.horaIngresoManana || '--:--' }}</strong>
                        <small class="text-muted d-block">
                          ±{{ config.toleranciaIngresoManana || 0 }}m
                        </small>
                      </td>
                      <td>
                        <strong>{{ config.horaSalidaDescanso || '--:--' }}</strong>
                        <small class="text-muted d-block">
                          ±{{ config.toleranciaSalidaDescanso || 0 }}m
                        </small>
                      </td>
                      <td>
                        <strong>{{ config.horaIngresoTarde || '--:--' }}</strong>
                        <small class="text-muted d-block">
                          ±{{ config.toleranciaIngresoTarde || 0 }}m
                        </small>
                      </td>
                      <td>
                        <strong>{{ config.horaSalidaFinal || '--:--' }}</strong>
                        <small class="text-muted d-block">
                          ±{{ config.toleranciaSalidaFinal || 0 }}m
                        </small>
                      </td>
                      <td>
                        <small>{{ formatDate(config.createdAt) }}</small>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary" @click="selectConfiguracion(config)"
                          title="Ver detalles">
                          <i class="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Sin Configuración -->
          <div v-if="!configStore.loading && !configuracionActual && configStore.configuraciones.length === 0"
            class="card shadow-sm">
            <div class="card-body text-center py-5">
              <i class="bi bi-clock-history" style="font-size: 4rem; color: #ccc;"></i>
              <h4 class="mt-3">No hay configuración de horarios</h4>
              <p class="text-muted">Crea la primera configuración para comenzar.</p>
              <button class="btn btn-primary btn-lg" @click="openCreateModal">
                <i class="bi bi-plus-circle me-2"></i>
                Crear Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <div class="modal fade" id="modalConfiguracion" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header" :class="isEditing ? 'bg-warning' : 'bg-primary text-white'">
            <h5 class="modal-title text-white">
              <i class="bi me-2" :class="isEditing ? 'bi-pencil' : 'bi-plus-circle'"></i>
              {{ isEditing ? 'Editar' : 'Nueva' }} Configuración de Horarios
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row g-3">
                <!-- Ingreso Mañana -->
                <div class="col-12">
                  <h6 class="text-success border-bottom pb-2">
                    <i class="bi bi-sunrise me-2"></i>
                    Ingreso Mañana
                  </h6>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Hora *</label>
                  <input type="time" class="form-control" v-model="form.horaIngresoManana" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tolerancia (minutos) *</label>
                  <input type="number" class="form-control" v-model.number="form.toleranciaIngresoManana" min="0"
                    max="60" required />
                </div>

                <!-- Salida Descanso -->
                <div class="col-12 mt-4">
                  <h6 class="text-warning border-bottom pb-2">
                    <i class="bi bi-cup-hot me-2"></i>
                    Salida Descanso
                  </h6>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Hora *</label>
                  <input type="time" class="form-control" v-model="form.horaSalidaDescanso" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tolerancia (minutos) *</label>
                  <input type="number" class="form-control" v-model.number="form.toleranciaSalidaDescanso" min="0"
                    max="60" required />
                </div>

                <!-- Ingreso Tarde -->
                <div class="col-12 mt-4">
                  <h6 class="text-info border-bottom pb-2">
                    <i class="bi bi-sun me-2"></i>
                    Ingreso Tarde
                  </h6>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Hora *</label>
                  <input type="time" class="form-control" v-model="form.horaIngresoTarde" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tolerancia (minutos) *</label>
                  <input type="number" class="form-control" v-model.number="form.toleranciaIngresoTarde" min="0"
                    max="60" required />
                </div>

                <!-- Salida Final -->
                <div class="col-12 mt-4">
                  <h6 class="text-danger border-bottom pb-2">
                    <i class="bi bi-moon me-2"></i>
                    Salida Final
                  </h6>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Hora *</label>
                  <input type="time" class="form-control" v-model="form.horaSalidaFinal" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tolerancia (minutos) *</label>
                  <input type="number" class="form-control" v-model.number="form.toleranciaSalidaFinal" min="0" max="60"
                    required />
                </div>
              </div>

              <div class="modal-footer border-0 px-0 pb-0 mt-4">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" class="btn" :class="isEditing ? 'btn-warning' : 'btn-primary'"
                  :disabled="configStore.loading">
                  <span v-if="configStore.loading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Guardando...
                  </span>
                  <span v-else>
                    <i class="bi me-2" :class="isEditing ? 'bi-check-circle' : 'bi-save'"></i>
                    {{ isEditing ? 'Actualizar' : 'Guardar' }}
                  </span>
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
import { ref, reactive, onMounted, computed } from 'vue';
import { Modal } from 'bootstrap';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import { useConfiguracionHorariosStore } from '@/stores/configuracion-horarios';

const configStore = useConfiguracionHorariosStore();
const sidebarOpen = ref(false);
const isEditing = ref(false);

const form = reactive({
  horaIngresoManana: '',
  toleranciaIngresoManana: 15,
  horaSalidaDescanso: '',
  toleranciaSalidaDescanso: 15,
  horaIngresoTarde: '',
  toleranciaIngresoTarde: 15,
  horaSalidaFinal: '',
  toleranciaSalidaFinal: 15,
});

let modal: Modal | null = null;

// Funciones helper
function getTipoMarcajeTexto(tipo: string): string {
  const map: Record<string, string> = {
    'INGRESO_MANANA': 'Ingreso Mañana',
    'SALIDA_DESCANSO': 'Salida Descanso',
    'INGRESO_TARDE': 'Ingreso Tarde',
    'SALIDA_FINAL': 'Salida Final'
  };
  return map[tipo] || tipo;
}

function esSiguienteMarcaje(tipo: string): boolean {
  if (!configStore.siguienteMarcaje) return false;
  return configStore.siguienteMarcaje.tipoMarcaje === tipo;
}

// Computed properties - AGREGANDO console.log para depuración
const configuraciones = computed(() => {
  console.log('Datos crudos del store:', configStore.configuraciones);

  // Los datos vienen como un array de 4 marcajes individuales
  // Necesitamos agruparlos por fecha
  if (!configStore.configuraciones || configStore.configuraciones.length === 0) {
    return [];
  }

  // Agrupar por createdAt (misma fecha)
  const grupos: any[] = [];
  const marcajesPorFecha: { [key: string]: any[] } = {};

  configStore.configuraciones.forEach(marcaje => {
    const fecha = marcaje.createdAt ? marcaje.createdAt.split('T')[0] : 'unknown';

    if (!marcajesPorFecha[fecha]) {
      marcajesPorFecha[fecha] = [];
    }

    marcajesPorFecha[fecha].push(marcaje);
  });

  // Crear configuraciones agrupadas
  Object.values(marcajesPorFecha).forEach((marcajes: any[]) => {
    const config: any = {
      id: Math.min(...marcajes.map(m => m.id)),
      horaIngresoManana: '',
      toleranciaIngresoManana: 0,
      horaSalidaDescanso: '',
      toleranciaSalidaDescanso: 0,
      horaIngresoTarde: '',
      toleranciaIngresoTarde: 0,
      horaSalidaFinal: '',
      toleranciaSalidaFinal: 0,
      createdAt: marcajes[0]?.createdAt || marcajes[0]?.createAt || new Date().toISOString(),
      marcajes: marcajes
    };

    // Asignar valores basados en tipoMarcaje
    marcajes.forEach(marcaje => {
      switch (marcaje.tipoMarcaje) {
        case 'INGRESO_MANANA':
          config.horaIngresoManana = marcaje.horaProgramada;
          config.toleranciaIngresoManana = parseInt(marcaje.toleranciaMinutos) || 0;
          break;
        case 'SALIDA_DESCANSO':
          config.horaSalidaDescanso = marcaje.horaProgramada;
          config.toleranciaSalidaDescanso = parseInt(marcaje.toleranciaMinutos) || 0;
          break;
        case 'INGRESO_TARDE':
          config.horaIngresoTarde = marcaje.horaProgramada;
          config.toleranciaIngresoTarde = parseInt(marcaje.toleranciaMinutos) || 0;
          break;
        case 'SALIDA_FINAL':
          config.horaSalidaFinal = marcaje.horaProgramada;
          config.toleranciaSalidaFinal = parseInt(marcaje.toleranciaMinutos) || 0;
          break;
      }
    });

    grupos.push(config);
  });

  console.log('Configuraciones procesadas:', grupos);
  return grupos;
});

const configuracionActual = computed(() => {
  if (configuraciones.value.length > 0) {
    const actual = configuraciones.value[0];
    console.log('Configuración actual:', actual);
    return actual;
  }
  return null;
});

// Usar las funciones del store
async function loadConfiguraciones() {
  await configStore.loadConfiguraciones();
}

async function loadProximoMarcaje() {
  await configStore.loadSiguienteMarcaje();
}

async function validarConfiguracion() {
  const result = await configStore.validar();
  if (result.success) {
    alert(result.data?.message || 'Configuración válida ✓');
  } else {
    alert('Error de validación: ' + result.error);
  }
}

async function verConflictos() {
  if (!configuracionActual.value) return;

  const result = await configStore.obtenerConflictos('INGRESO_MANANA', configuracionActual.value.horaIngresoManana);
  if (result.success) {
    if (result.data?.conflictos && result.data.conflictos.length > 0) {
      alert(`Conflictos encontrados:\n${JSON.stringify(result.data.conflictos, null, 2)}`);
    } else {
      alert('No se encontraron conflictos');
    }
  } else {
    alert('Error al verificar conflictos: ' + result.error);
  }
}

function openCreateModal() {
  isEditing.value = false;

  Object.assign(form, {
    horaIngresoManana: '08:00',
    toleranciaIngresoManana: 15,
    horaSalidaDescanso: '12:00',
    toleranciaSalidaDescanso: 15,
    horaIngresoTarde: '14:00',
    toleranciaIngresoTarde: 15,
    horaSalidaFinal: '18:00',
    toleranciaSalidaFinal: 15,
  });

  const modalElement = document.getElementById('modalConfiguracion');
  if (modalElement) {
    modal = new Modal(modalElement);
    modal.show();
  }
}

function openEditModal() {
  if (!configuracionActual.value) {
    alert('No hay configuración para editar');
    return;
  }

  isEditing.value = true;

  Object.assign(form, {
    horaIngresoManana: configuracionActual.value.horaIngresoManana || '08:00',
    toleranciaIngresoManana: configuracionActual.value.toleranciaIngresoManana || 15,
    horaSalidaDescanso: configuracionActual.value.horaSalidaDescanso || '12:00',
    toleranciaSalidaDescanso: configuracionActual.value.toleranciaSalidaDescanso || 15,
    horaIngresoTarde: configuracionActual.value.horaIngresoTarde || '14:00',
    toleranciaIngresoTarde: configuracionActual.value.toleranciaIngresoTarde || 15,
    horaSalidaFinal: configuracionActual.value.horaSalidaFinal || '18:00',
    toleranciaSalidaFinal: configuracionActual.value.toleranciaSalidaFinal || 15,
  });

  const modalElement = document.getElementById('modalConfiguracion');
  if (modalElement) {
    modal = new Modal(modalElement);
    modal.show();
  }
}

async function handleSubmit() {
  try {
    // Preparar los datos para enviar
    const marcajes = [
      {
        tipoMarcaje: 'INGRESO_MANANA',
        horaProgramada: form.horaIngresoManana,
        toleranciaMinutos: form.toleranciaIngresoManana
      },
      {
        tipoMarcaje: 'SALIDA_DESCANSO',
        horaProgramada: form.horaSalidaDescanso,
        toleranciaMinutos: form.toleranciaSalidaDescanso
      },
      {
        tipoMarcaje: 'INGRESO_TARDE',
        horaProgramada: form.horaIngresoTarde,
        toleranciaMinutos: form.toleranciaIngresoTarde
      },
      {
        tipoMarcaje: 'SALIDA_FINAL',
        horaProgramada: form.horaSalidaFinal,
        toleranciaMinutos: form.toleranciaSalidaFinal
      }
    ];

    console.log('Enviando marcajes:', marcajes);

    const result = await configStore.actualizarBulk(marcajes);
    if (result.success) {
      alert(isEditing.value ? 'Configuración actualizada exitosamente' : 'Configuración creada exitosamente');
      modal?.hide();
      await loadConfiguraciones();
    } else {
      alert('Error: ' + result.error);
    }
  } catch (err: any) {
    console.error('Error al guardar:', err);
    alert('Error al guardar la configuración: ' + err.message);
  }
}

async function resetConfiguracion() {
  const result = await configStore.reset();
  if (result.success) {
    alert('Configuración restablecida a valores por defecto');
    await loadConfiguraciones();
  } else {
    alert('Error al restablecer: ' + result.error);
  }
}

function confirmarReset() {
  if (confirm('¿Estás seguro de restablecer la configuración a valores por defecto?')) {
    resetConfiguracion();
  }
}

function selectConfiguracion(config: any) {
  console.log('Configuración seleccionada:', config);
  alert(`Configuración ID: ${config.id}\n\n` +
    `Ingreso Mañana: ${config.horaIngresoManana || '--:--'} (±${config.toleranciaIngresoManana || 0}m)\n` +
    `Salida Descanso: ${config.horaSalidaDescanso || '--:--'} (±${config.toleranciaSalidaDescanso || 0}m)\n` +
    `Ingreso Tarde: ${config.horaIngresoTarde || '--:--'} (±${config.toleranciaIngresoTarde || 0}m)\n` +
    `Salida Final: ${config.horaSalidaFinal || '--:--'} (±${config.toleranciaSalidaFinal || 0}m)`);
}

function formatDate(date: string): string {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return date;
  }
}

onMounted(async () => {
  console.log('Componente montado');
  await loadConfiguraciones();
  await loadProximoMarcaje();
});
</script>

<style scoped>
.horario-card {
  text-align: center;
  padding: 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s;
}

.horario-card.active {
  border-color: #28a745;
  background: #d4edda;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

.horario-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 1.5rem;
}
</style>