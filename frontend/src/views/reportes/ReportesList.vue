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
                <i class="bi bi-file-earmark-pdf me-2"></i>
                Reportes PDF
              </h1>
              <p class="text-muted mb-0">
                {{ reportesStore.totalReportes }} reportes generados
              </p>
            </div>
            <button 
              class="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#modalGenerar"
            >
              <i class="bi bi-plus-circle me-2"></i>
              Generar Reporte
            </button>
          </div>

          <!-- Info Card -->
          <div class="alert alert-info d-flex align-items-center mb-4" role="alert">
            <i class="bi bi-info-circle-fill fs-4 me-3"></i>
            <div>
              <strong>¿Qué son los reportes?</strong><br>
              Los reportes PDF contienen el resumen mensual de asistencias de un funcionario, 
              incluyendo marcajes, tardanzas, y estadísticas del mes.
            </div>
          </div>

          <!-- Filtros -->
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label">
                    <i class="bi bi-calendar-month me-1"></i>
                    Mes
                  </label>
                  <select class="form-select" v-model.number="reportesStore.filterMes">
                    <option :value="null">Todos</option>
                    <option v-for="mes in meses" :key="mes.value" :value="mes.value">
                      {{ mes.label }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">
                    <i class="bi bi-calendar3 me-1"></i>
                    Año
                  </label>
                  <select class="form-select" v-model.number="reportesStore.filterAnio">
                    <option :value="null">Todos</option>
                    <option v-for="anio in anios" :key="anio" :value="anio">
                      {{ anio }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">
                    <i class="bi bi-person me-1"></i>
                    Funcionario
                  </label>
                  <select class="form-select" v-model.number="reportesStore.filterFuncionario">
                    <option :value="null">Todos</option>
                    <option v-for="func in funcionarios" :key="func.id" :value="func.id">
                      {{ func.nombre }} {{ func.apellido }}
                    </option>
                  </select>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button 
                    class="btn btn-outline-secondary w-100"
                    @click="reportesStore.clearFilters()"
                  >
                    <i class="bi bi-x-circle me-1"></i>
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="reportesStore.loading" class="text-center py-5">
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
                      <th>Periodo</th>
                      <th>Generado</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="reportesStore.reportesFiltrados.length === 0">
                      <td colspan="6" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                        <p class="mt-3 mb-0">No hay reportes generados</p>
                      </td>
                    </tr>
                    <tr v-for="reporte in reportesStore.reportesFiltrados" :key="reporte.id">
                      <td>
                        <span class="badge bg-secondary">#{{ reporte.id }}</span>
                      </td>
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="avatar bg-danger bg-opacity-10 text-danger rounded-circle me-2">
                            <i class="bi bi-person-fill"></i>
                          </div>
                          <div>
                            <div class="fw-semibold">
                              {{ reporte.funcionario?.nombre }} {{ reporte.funcionario?.apellido }}
                            </div>
                            <small class="text-muted">{{ reporte.funcionario?.cargo }}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-primary">
                          {{ getNombreMes(reporte.mes) }} {{ reporte.anio }}
                        </span>
                      </td>
                      <td>
                        <small class="text-muted">
                          {{ formatFecha(reporte.generatedAt) }}
                        </small>
                      </td>
                      <td>
                        <span class="badge bg-success">
                          <i class="bi bi-file-earmark-pdf me-1"></i>
                          Generado
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button
                            class="btn btn-outline-success"
                            @click="descargar(reporte)"
                            title="Descargar PDF"
                          >
                            <i class="bi bi-download"></i>
                          </button>
                          <button
                            class="btn btn-outline-warning"
                            @click="confirmRegenerar(reporte)"
                            title="Regenerar"
                          >
                            <i class="bi bi-arrow-clockwise"></i>
                          </button>
                          <button
                            class="btn btn-outline-danger"
                            @click="confirmDelete(reporte)"
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

    <!-- Modal Generar Reporte -->
    <div class="modal fade" id="modalGenerar" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-file-earmark-pdf me-2"></i>
              Generar Reporte
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleGenerar">
              <div class="mb-3">
                <label class="form-label">Funcionario *</label>
                <select class="form-select" v-model.number="formGenerar.funcionarioId" required>
                  <option value="">Seleccionar...</option>
                  <option v-for="func in funcionarios" :key="func.id" :value="func.id">
                    {{ func.nombre }} {{ func.apellido }} - {{ func.cargo }}
                  </option>
                </select>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Mes *</label>
                  <select class="form-select" v-model.number="formGenerar.mes" required>
                    <option value="">Seleccionar...</option>
                    <option v-for="mes in meses" :key="mes.value" :value="mes.value">
                      {{ mes.label }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label">Año *</label>
                  <select class="form-select" v-model.number="formGenerar.anio" required>
                    <option value="">Seleccionar...</option>
                    <option v-for="anio in anios" :key="anio" :value="anio">
                      {{ anio }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="alert alert-info small">
                <i class="bi bi-info-circle me-2"></i>
                El reporte contendrá todas las asistencias del periodo seleccionado.
              </div>

              <div class="modal-footer border-0 px-0 pb-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" :disabled="reportesStore.loading">
                  <span v-if="reportesStore.loading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Generando...
                  </span>
                  <span v-else>
                    <i class="bi bi-check-circle me-2"></i>
                    Generar Reporte
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
import { ref, reactive, onMounted } from 'vue';
import { useReportesStore } from '@/stores/reportes';
import { funcionariosService } from '@/services/funcionarios.service';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import type { Reporte, GenerarReporteDto, Funcionario } from '@/types';
import { Modal } from 'bootstrap';

const reportesStore = useReportesStore();
const sidebarOpen = ref(false);
const funcionarios = ref<Funcionario[]>([]);

const formGenerar = reactive<GenerarReporteDto>({
  funcionarioId: 0,
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear(),
});

const meses = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const currentYear = new Date().getFullYear();
const anios = Array.from({ length: 5 }, (_, i) => currentYear - i);

const getNombreMes = (mes: number) => {
  return meses.find(m => m.value === mes)?.label || mes.toString();
};

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleGenerar = async () => {
  const result = await reportesStore.generarReporte(formGenerar);
  
  if (result.success) {
    const modal = Modal.getInstance(document.getElementById('modalGenerar')!);
    modal?.hide();
    
    // Reset form
    formGenerar.funcionarioId = 0;
    formGenerar.mes = new Date().getMonth() + 1;
    formGenerar.anio = new Date().getFullYear();
    
    alert('Reporte generado exitosamente');
  } else {
    alert(`Error: ${result.error}`);
  }
};

const descargar = async (reporte: Reporte) => {
  const result = await reportesStore.descargarReporte(reporte.id);
  
  if (!result.success) {
    alert(`Error: ${result.error}`);
  }
};

const confirmRegenerar = async (reporte: Reporte) => {
  if (!confirm(`¿Está seguro de regenerar el reporte de ${reporte.funcionario?.nombre}?`)) {
    return;
  }
  
  const result = await reportesStore.regenerarReporte(reporte.id);
  
  if (result.success) {
    alert('Reporte regenerado exitosamente');
  } else {
    alert(`Error: ${result.error}`);
  }
};

const confirmDelete = async (reporte: Reporte) => {
  if (!confirm(`¿Está seguro de eliminar este reporte?`)) {
    return;
  }
  
  const result = await reportesStore.deleteReporte(reporte.id);
  
  if (result.success) {
    alert('Reporte eliminado exitosamente');
  } else {
    alert(`Error: ${result.error}`);
  }
};

onMounted(async () => {
  await reportesStore.loadReportes();
  funcionarios.value = await funcionariosService.getAll();
});
</script>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>