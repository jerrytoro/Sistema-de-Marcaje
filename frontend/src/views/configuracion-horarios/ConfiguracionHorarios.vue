<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
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
  ventanaInicioIngresoManana: '',      // ✅ NUEVO
  ventanaFinIngresoManana: '',         // ✅ NUEVO

  horaSalidaDescanso: '',
  toleranciaSalidaDescanso: 15,
  ventanaInicioSalidaDescanso: '',     // ✅ NUEVO
  ventanaFinSalidaDescanso: '',        // ✅ NUEVO

  horaIngresoTarde: '',
  toleranciaIngresoTarde: 15,
  ventanaInicioIngresoTarde: '',       // ✅ NUEVO
  ventanaFinIngresoTarde: '',          // ✅ NUEVO

  horaSalidaFinal: '',
  toleranciaSalidaFinal: 15,
  ventanaInicioSalidaFinal: '',        // ✅ NUEVO
  ventanaFinSalidaFinal: '',           // ✅ NUEVO
});

// ✅ Nuevo: Form para edición individual
const formIndividual = reactive({
  hora: '',
  tolerancia: 15,
  ventanaInicio: '',
  ventanaFin: '',
  tipo: '',
  titulo: '',
  icono: '',
  color: ''
});

let modal: Modal | null = null;
let modalIndividual: Modal | null = null;

function getTipoMarcajeTexto(tipo: string): string {
  const tipos: { [key: string]: string } = {
    INGRESO_MANANA: 'Ingreso Mañana',
    SALIDA_DESCANSO: 'Salida Descanso',
    INGRESO_TARDE: 'Ingreso Tarde',
    SALIDA_FINAL: 'Salida Final'
  };
  return tipos[tipo] || tipo;
}

function esSiguienteMarcaje(tipo: string): boolean {
  return configStore.siguienteMarcaje?.tipoMarcaje === tipo;
}
// ✅ VERSIÓN MEJORADA
function esVentanaActiva(tipo: string): boolean {
  if (!configStore.siguienteMarcaje) return false;

  // Solo es "activo" si es el marcaje actual Y el mensaje contiene "activa"
  const esMarcajeActual = configStore.siguienteMarcaje.tipoMarcaje === tipo;
  const estaActiva = configStore.siguienteMarcaje.mensaje?.toLowerCase().includes('ventana activa') ||
    configStore.siguienteMarcaje.mensaje?.toLowerCase().includes('activa hasta');

  console.log('🔍 Verificando ventana activa:', {
    tipo,
    esMarcajeActual,
    mensaje: configStore.siguienteMarcaje.mensaje,
    estaActiva
  });

  return esMarcajeActual && estaActiva;
}
function getAlertClass(): string {
  if (!configStore.siguienteMarcaje) return 'alert-secondary';

  // Si está activo (dentro de ventana)
  if (configStore.siguienteMarcaje.mensaje?.includes('activa')) {
    return 'alert-success';
  }

  // Si está por activarse
  return 'alert-info';
}

function getIconoMarcaje(): string {
  if (!configStore.siguienteMarcaje) return 'bi-clock';

  const tipo = configStore.siguienteMarcaje.tipoMarcaje;
  const iconos: { [key: string]: string } = {
    'INGRESO_MANANA': 'bi-sunrise',
    'SALIDA_DESCANSO': 'bi-cup-hot',
    'INGRESO_TARDE': 'bi-sun',
    'SALIDA_FINAL': 'bi-moon'
  };

  return iconos[tipo] || 'bi-clock';
}


const configuraciones = computed(() => {
  const configs = configStore.configuraciones;
  console.log('🔍 Configuraciones raw del store:', configs);

  if (!Array.isArray(configs) || configs.length === 0) {
    return [];
  }

  // Si ya vienen agrupadas (objeto con horaIngresoManana, etc.)
  if (configs[0].horaIngresoManana !== undefined) {
    console.log('✅ Configuraciones ya agrupadas:', configs);
    return configs;
  }

  // Si vienen como array de marcajes individuales, agrupar
  const grupos: any[] = [];
  const configMap = new Map();

  configs.forEach((config: any) => {
    const key = config.createdAt || 'default';
    if (!configMap.has(key)) {
      configMap.set(key, {
        id: config.id,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
        horaIngresoManana: '',
        toleranciaIngresoManana: 0,
        ventanaInicioIngresoManana: '',
        ventanaFinIngresoManana: '',
        horaSalidaDescanso: '',
        toleranciaSalidaDescanso: 0,
        ventanaInicioSalidaDescanso: '',
        ventanaFinSalidaDescanso: '',
        horaIngresoTarde: '',
        toleranciaIngresoTarde: 0,
        ventanaInicioIngresoTarde: '',
        ventanaFinIngresoTarde: '',
        horaSalidaFinal: '',
        toleranciaSalidaFinal: 0,
        ventanaInicioSalidaFinal: '',
        ventanaFinSalidaFinal: '',
      });
    }

    const grupo = configMap.get(key);

    // ✅ Convertir explícitamente toleranciaMinutos a número
    const tolerancia = Number(config.toleranciaMinutos) || 0;

    switch (config.tipoMarcaje) {
      case 'INGRESO_MANANA':
        grupo.horaIngresoManana = config.horaProgramada;
        grupo.toleranciaIngresoManana = tolerancia;
        grupo.ventanaInicioIngresoManana = config.horaInicioVentana;
        grupo.ventanaFinIngresoManana = config.horaFinVentana;
        break;
      case 'SALIDA_DESCANSO':
        grupo.horaSalidaDescanso = config.horaProgramada;
        grupo.toleranciaSalidaDescanso = tolerancia;
        grupo.ventanaInicioSalidaDescanso = config.horaInicioVentana;
        grupo.ventanaFinSalidaDescanso = config.horaFinVentana;
        break;
      case 'INGRESO_TARDE':
        grupo.horaIngresoTarde = config.horaProgramada;
        grupo.toleranciaIngresoTarde = tolerancia;
        grupo.ventanaInicioIngresoTarde = config.horaInicioVentana;
        grupo.ventanaFinIngresoTarde = config.horaFinVentana;
        break;
      case 'SALIDA_FINAL':
        grupo.horaSalidaFinal = config.horaProgramada;
        grupo.toleranciaSalidaFinal = tolerancia;
        grupo.ventanaInicioSalidaFinal = config.horaInicioVentana;
        grupo.ventanaFinSalidaFinal = config.horaFinVentana;
        break;
    }
  });

  configMap.forEach(grupo => grupos.push(grupo));
  console.log('✅ Configuraciones agrupadas:', grupos);
  return grupos;
});

const configuracionActual = computed(() => {
  return configuraciones.value.length > 0 ? configuraciones.value[0] : null;
});

async function loadConfiguraciones() {
  await configStore.loadConfiguraciones();
}

async function loadProximoMarcaje() {
  await configStore.loadSiguienteMarcaje();
}

async function validarConfiguracion() {
  const result = await configStore.validar();
  alert(result.success ? (result.data?.message || 'Configuración válida ✓') : 'Error: ' + result.error);
}

async function verConflictos() {
  if (!configuracionActual.value) return;
  const result = await configStore.obtenerConflictos('INGRESO_MANANA', configuracionActual.value.horaIngresoManana);
  if (result.success) {
    alert(result.data?.conflictos?.length > 0
      ? `Conflictos encontrados:\n${JSON.stringify(result.data.conflictos, null, 2)}`
      : 'No se encontraron conflictos');
  } else {
    alert('Error: ' + result.error);
  }
}

function openCreateModal() {
  isEditing.value = false;
  Object.assign(form, {
    horaIngresoManana: '08:00',
    toleranciaIngresoManana: 5,
    ventanaInicioIngresoManana: '06:30',    // ✅ NUEVO
    ventanaFinIngresoManana: '09:00',       // ✅ NUEVO

    horaSalidaDescanso: '12:00',
    toleranciaSalidaDescanso: 0,
    ventanaInicioSalidaDescanso: '11:00',   // ✅ NUEVO
    ventanaFinSalidaDescanso: '13:00',      // ✅ NUEVO

    horaIngresoTarde: '14:00',
    toleranciaIngresoTarde: 0,
    ventanaInicioIngresoTarde: '13:00',     // ✅ NUEVO
    ventanaFinIngresoTarde: '15:00',        // ✅ NUEVO

    horaSalidaFinal: '18:00',
    toleranciaSalidaFinal: 0,
    ventanaInicioSalidaFinal: '17:00',      // ✅ NUEVO
    ventanaFinSalidaFinal: '21:00',         // ✅ NUEVO
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
    // Horas y tolerancias (ya existentes)
    horaIngresoManana: configuracionActual.value.horaIngresoManana ?? '08:00',
    toleranciaIngresoManana: configuracionActual.value.toleranciaIngresoManana ?? 5,

    // ✅ AGREGAR: Ventanas Ingreso Mañana
    ventanaInicioIngresoManana: configuracionActual.value.ventanaInicioIngresoManana ?? '06:30',
    ventanaFinIngresoManana: configuracionActual.value.ventanaFinIngresoManana ?? '09:00',

    horaSalidaDescanso: configuracionActual.value.horaSalidaDescanso ?? '12:00',
    toleranciaSalidaDescanso: configuracionActual.value.toleranciaSalidaDescanso ?? 0,

    // ✅ AGREGAR: Ventanas Salida Descanso
    ventanaInicioSalidaDescanso: configuracionActual.value.ventanaInicioSalidaDescanso ?? '11:00',
    ventanaFinSalidaDescanso: configuracionActual.value.ventanaFinSalidaDescanso ?? '13:00',

    horaIngresoTarde: configuracionActual.value.horaIngresoTarde ?? '14:00',
    toleranciaIngresoTarde: configuracionActual.value.toleranciaIngresoTarde ?? 0,

    // ✅ AGREGAR: Ventanas Ingreso Tarde
    ventanaInicioIngresoTarde: configuracionActual.value.ventanaInicioIngresoTarde ?? '13:00',
    ventanaFinIngresoTarde: configuracionActual.value.ventanaFinIngresoTarde ?? '15:00',

    horaSalidaFinal: configuracionActual.value.horaSalidaFinal ?? '18:00',
    toleranciaSalidaFinal: configuracionActual.value.toleranciaSalidaFinal ?? 0,

    // ✅ AGREGAR: Ventanas Salida Final
    ventanaInicioSalidaFinal: configuracionActual.value.ventanaInicioSalidaFinal ?? '17:00',
    ventanaFinSalidaFinal: configuracionActual.value.ventanaFinSalidaFinal ?? '21:00',
  });

  const modalElement = document.getElementById('modalConfiguracion');
  if (modalElement) {
    modal = new Modal(modalElement);
    modal.show();
  }
}

async function handleSubmit() {
  try {
    const marcajes = {
      INGRESO_MANANA: {
        horaProgramada: form.horaIngresoManana,
        toleranciaMinutos: form.toleranciaIngresoManana,
        horaInicioVentana: form.ventanaInicioIngresoManana,    // ✅ NUEVO
        horaFinVentana: form.ventanaFinIngresoManana           // ✅ NUEVO
      },
      SALIDA_DESCANSO: {
        horaProgramada: form.horaSalidaDescanso,
        toleranciaMinutos: form.toleranciaSalidaDescanso,
        horaInicioVentana: form.ventanaInicioSalidaDescanso,   // ✅ NUEVO
        horaFinVentana: form.ventanaFinSalidaDescanso          // ✅ NUEVO
      },
      INGRESO_TARDE: {
        horaProgramada: form.horaIngresoTarde,
        toleranciaMinutos: form.toleranciaIngresoTarde,
        horaInicioVentana: form.ventanaInicioIngresoTarde,     // ✅ NUEVO
        horaFinVentana: form.ventanaFinIngresoTarde            // ✅ NUEVO
      },
      SALIDA_FINAL: {
        horaProgramada: form.horaSalidaFinal,
        toleranciaMinutos: form.toleranciaSalidaFinal,
        horaInicioVentana: form.ventanaInicioSalidaFinal,      // ✅ NUEVO
        horaFinVentana: form.ventanaFinSalidaFinal             // ✅ NUEVO
      }
    };

    console.log('📤 Enviando configuración con ventanas:', marcajes);

    const result = await configStore.actualizarBulk(marcajes);

    if (result.success) {
      modal?.hide();
      await configStore.loadConfiguraciones();
      //await new Promise(resolve => setTimeout(resolve, 100));
      await nextTick();
      await nextTick();
      console.log('✅ Datos actualizados en el store:', configStore.configuracionActual);
      alert(isEditing.value ? 'Configuración actualizada ✓' : 'Configuración creada ✓');
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error: any) {
    console.error('Error:', error);
    alert('Error: ' + error.message);
  }
}

// ✅ Nueva función para abrir modal de edición individual
function editarMarcajeIndividual(tipo: string) {
  if (!configuracionActual.value) {
    alert('No hay configuración para editar');
    return;
  }

  let hora = '';
  let tolerancia = 0;
  let ventanaInicio = '';
  let ventanaFin = '';
  let titulo = '';
  let icono = '';
  let color = '';

  // ✅ Obtener valores actuales SIN usar || (permite 0 legítimo)
  switch (tipo) {
    case 'INGRESO_MANANA':
      hora = configuracionActual.value.horaIngresoManana ?? '08:00';
      tolerancia = configuracionActual.value.toleranciaIngresoManana ?? 15;
      ventanaInicio = configuracionActual.value.ventanaInicioIngresoManana;
      ventanaFin = configuracionActual.value.ventanaFinIngresoManana;
      titulo = 'Ingreso Mañana';
      icono = 'sunrise';
      color = 'success';
      break;
    case 'SALIDA_DESCANSO':
      hora = configuracionActual.value.horaSalidaDescanso ?? '12:00';
      tolerancia = configuracionActual.value.toleranciaSalidaDescanso ?? 15;
      ventanaInicio = configuracionActual.value.ventanaInicioSalidaDescanso;
      ventanaFin = configuracionActual.value.ventanaFinSalidaDescanso;
      titulo = 'Salida Descanso';
      icono = 'cup-hot';
      color = 'warning';
      break;
    case 'INGRESO_TARDE':
      hora = configuracionActual.value.horaIngresoTarde ?? '14:00';
      tolerancia = configuracionActual.value.toleranciaIngresoTarde ?? 15;
      ventanaInicio = configuracionActual.value.ventanaInicioIngresoTarde;
      ventanaFin = configuracionActual.value.ventanaFinIngresoTarde;
      titulo = 'Ingreso Tarde';
      icono = 'sun';
      color = 'info';
      break;
    case 'SALIDA_FINAL':
      hora = configuracionActual.value.horaSalidaFinal ?? '18:00';
      tolerancia = configuracionActual.value.toleranciaSalidaFinal ?? 15;
      ventanaInicio = configuracionActual.value.ventanaInicioSalidaFinal;
      ventanaFin = configuracionActual.value.ventanaFinSalidaFinal;
      titulo = 'Salida Final';
      icono = 'moon';
      color = 'danger';
      break;
  }

  // Llenar formulario individual
  formIndividual.hora = hora;
  formIndividual.tolerancia = tolerancia;
  formIndividual.ventanaInicio = ventanaInicio;
  formIndividual.ventanaFin = ventanaFin;
  formIndividual.tipo = tipo;
  formIndividual.titulo = titulo;
  formIndividual.icono = icono;
  formIndividual.color = color;

  console.log('✅ Modal individual:', { tipo, hora, tolerancia });

  // Abrir modal
  const modalElement = document.getElementById('modalEditarIndividual');
  if (modalElement) {
    modalIndividual = new Modal(modalElement);
    modalIndividual.show();
  }
}

// ✅ Función para guardar edición individual
async function guardarMarcajeIndividual() {
  try {
    const datos = {
      horaProgramada: formIndividual.hora,
      toleranciaMinutos: Number(formIndividual.tolerancia),
      horaInicioVentana: formIndividual.ventanaInicio,
      horaFinVentana: formIndividual.ventanaFin
    };

    console.log(`📤 Actualizando ${formIndividual.tipo}:`, datos);

    const result = await configStore.actualizarPorTipo(formIndividual.tipo, datos);

    if (result.success) {
      modalIndividual?.hide();
      await configStore.loadConfiguraciones();
      await nextTick();
      // ✅ Forzar recarga completa
      console.log('🔄 Recargando configuraciones...');
      await loadConfiguraciones();
      await loadProximoMarcaje();

      alert(`✅ ${formIndividual.titulo} actualizado exitosamente`);
    } else {
      alert('❌ Error: ' + result.error);
    }
  } catch (err: any) {
    console.error('❌ Error:', err);
    alert('Error: ' + err.message);
  }
}

async function resetConfiguracion() {
  const result = await configStore.reset();
  if (result.success) {
    alert('✅ Restablecido');
    await loadConfiguraciones();
    await loadProximoMarcaje();
  } else {
    alert('❌ Error: ' + result.error);
  }
}

function confirmarReset() {
  if (confirm('¿Restablecer?')) resetConfiguracion();
}

onMounted(async () => {
  await loadConfiguraciones();
  await loadProximoMarcaje();
});
</script>

<template>
  <div class="main-wrapper">
    <Sidebar :isOpen="sidebarOpen" @close="sidebarOpen = false" />
    <div class="main-content">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="content-area">
        <div class="container-fluid">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 class="mb-1"><i class="bi bi-clock-history me-2"></i>Configuración de Horarios</h1>
              <p class="text-muted mb-0">Define los horarios de ingreso y salida</p>
            </div>
            <div class="btn-group">
              <button class="btn btn-outline-secondary" @click="loadConfiguraciones" :disabled="configStore.loading">
                <i class="bi bi-arrow-clockwise me-2"></i>Actualizar
              </button>
              <button v-if="!configuracionActual" class="btn btn-primary" @click="openCreateModal">
                <i class="bi bi-plus-circle me-2"></i>Nueva Configuración
              </button>
            </div>
          </div>

          <div class="alert alert-info mb-4">
            <i class="bi bi-info-circle me-2"></i><strong>Sistema de 4 Marcajes</strong>
          </div>

          <div v-if="configStore.loading" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
          </div>

          <div v-if="configStore.error" class="alert alert-danger alert-dismissible">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ configStore.error }}
            <button type="button" class="btn-close" @click="configStore.error = null"></button>
          </div>

          <div v-if="!configStore.loading && configuracionActual" class="card shadow-sm mb-4">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-check-circle me-2"></i>Configuración Activa</h5>
              <div v-if="configStore.siguienteMarcaje" class="" :class="getAlertClass()">
                <div class="d-flex align-items-center">
                  <i class="bi fs-4 me-3" :class="getIconoMarcaje()"></i>
                  <div>
                    <strong class="d-block">{{ getTipoMarcajeTexto(configStore.siguienteMarcaje.tipoMarcaje) }}</strong>
                    <small v-if="configStore.siguienteMarcaje.mensaje">
                      {{ configStore.siguienteMarcaje.mensaje }}
                    </small>
                    <small v-else-if="configStore.siguienteMarcaje.minutosRestantes > 0">
                      {{ configStore.siguienteMarcaje.minutosRestantes }} minutos restantes
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="row g-4">
                <div class="col-md-6 col-lg-3">
                  <div class="horario-card" :class="{ 'active': esVentanaActiva('INGRESO_MANANA') }">
                    <div class="horario-icon bg-success"><i class="bi bi-sunrise"></i></div>
                    <h6 class="text-muted mb-1">Ingreso Mañana</h6>
                    <h3 class="mb-1">{{ configuracionActual.horaIngresoManana || '--:--' }}</h3>
                    <small class="text-muted">
                      <i class="bi bi-clock me-1"></i>
                      {{ configuracionActual.toleranciaIngresoManana ?? 0 }} min
                    </small>
                    <button class="btn btn-sm btn-outline-success mt-2 w-100"
                      @click="editarMarcajeIndividual('INGRESO_MANANA')">
                      <i class="bi bi-pencil-square me-1"></i>Editar
                    </button>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="horario-card" :class="{ 'active': esVentanaActiva('SALIDA_DESCANSO') }">
                    <div class="horario-icon bg-warning"><i class="bi bi-cup-hot"></i></div>
                    <h6 class="text-muted mb-1">Salida Descanso</h6>
                    <h3 class="mb-1">{{ configuracionActual.horaSalidaDescanso || '--:--' }}</h3>
                    <small class="text-muted">
                      <i class="bi bi-clock me-1"></i>
                      {{ configuracionActual.toleranciaSalidaDescanso ?? 0 }} min
                    </small>
                    <button class="btn btn-sm btn-outline-warning mt-2 w-100"
                      @click="editarMarcajeIndividual('SALIDA_DESCANSO')">
                      <i class="bi bi-pencil-square me-1"></i>Editar
                    </button>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="horario-card" :class="{ 'active': esVentanaActiva('INGRESO_TARDE') }">
                    <div class="horario-icon bg-info"><i class="bi bi-sun"></i></div>
                    <h6 class="text-muted mb-1">Ingreso Tarde</h6>
                    <h3 class="mb-1">{{ configuracionActual.horaIngresoTarde || '--:--' }}</h3>
                    <small class="text-muted">
                      <i class="bi bi-clock me-1"></i>
                      {{ configuracionActual.toleranciaIngresoTarde ?? 0 }} min
                    </small>
                    <button class="btn btn-sm btn-outline-info mt-2 w-100"
                      @click="editarMarcajeIndividual('INGRESO_TARDE')">
                      <i class="bi bi-pencil-square me-1"></i>Editar
                    </button>
                  </div>
                </div>
                <div class="col-md-6 col-lg-3">
                  <div class="horario-card" :class="{ 'active': esVentanaActiva('SALIDA_FINAL') }">
                    <div class="horario-icon bg-danger"><i class="bi bi-moon"></i></div>
                    <h6 class="text-muted mb-1">Salida Final</h6>
                    <h3 class="mb-1">{{ configuracionActual.horaSalidaFinal || '--:--' }}</h3>
                    <small class="text-muted">
                      <i class="bi bi-clock me-1"></i>
                      {{ configuracionActual.toleranciaSalidaFinal ?? 0 }} min
                    </small>
                    <button class="btn btn-sm btn-outline-danger mt-2 w-100"
                      @click="editarMarcajeIndividual('SALIDA_FINAL')">
                      <i class="bi bi-pencil-square me-1"></i>Editar
                    </button>
                  </div>
                </div>
              </div>
              <hr class="my-4">
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-warning" @click="openEditModal"><i class="bi bi-pencil me-2"></i>Editar</button>
                <button class="btn btn-outline-info" @click="validarConfiguracion"><i
                    class="bi bi-check-circle me-2"></i>Validar</button>
                <button class="btn btn-outline-secondary" @click="verConflictos"><i
                    class="bi bi-exclamation-triangle me-2"></i>Ver Conflictos</button>
                <button class="btn btn-outline-danger" @click="confirmarReset"><i
                    class="bi bi-arrow-counterclockwise me-2"></i>Restablecer</button>
              </div>
            </div>
          </div>

          <div v-if="!configStore.loading && !configuracionActual" class="card shadow-sm">
            <div class="card-body text-center py-5">
              <i class="bi bi-clock-history" style="font-size: 4rem; color: #ccc;"></i>
              <h4 class="mt-3">No hay configuración</h4>
              <button class="btn btn-primary btn-lg mt-3" @click="openCreateModal"><i
                  class="bi bi-plus-circle me-2"></i>Crear</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="modalConfiguracion" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header" :class="isEditing ? 'bg-warning' : 'bg-primary text-white'">
            <h5 class="modal-title text-white">
              <i class="bi me-2" :class="isEditing ? 'bi-pencil' : 'bi-plus-circle'"></i>
              {{ isEditing ? 'Editar' : 'Nueva' }} Configuración
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="row g-3">
                <div class="col-12">
                  <h6 class="text-success border-bottom pb-2"><i class="bi bi-sunrise me-2"></i>Ingreso Mañana</h6>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Hora *</label>
                  <input type="time" class="form-control" v-model="form.horaIngresoManana" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Tolerancia (minutos) *</label>
                  <input type="number" class="form-control" v-model.number="form.toleranciaIngresoManana" min="0"
                    max="60" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Ventana de Tiempo *</label>
                  <div class="input-group">
                    <input type="time" class="form-control" v-model="form.ventanaInicioIngresoManana" required
                      placeholder="Inicio" />
                    <span class="input-group-text">-</span>
                    <input type="time" class="form-control" v-model="form.ventanaFinIngresoManana" required
                      placeholder="Fin" />
                  </div>
                  <small class="text-muted">Rango permitido para marcar</small>
                </div>


                <div class="col-12 mt-4">
                  <h6 class="text-warning border-bottom pb-2"><i class="bi bi-cup-hot me-2"></i>Salida Descanso</h6>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Hora *</label>
                  <input type="time" class="form-control" v-model="form.horaSalidaDescanso" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Tolerancia (minutos) *</label>
                  <input type="number" class="form-control" v-model.number="form.toleranciaSalidaDescanso" min="0"
                    max="60" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Ventana de Tiempo *</label>
                  <div class="input-group">
                    <input type="time" class="form-control" v-model="form.ventanaInicioSalidaDescanso" required
                      placeholder="Inicio" />
                    <span class="input-group-text">-</span>
                    <input type="time" class="form-control" v-model="form.ventanaFinSalidaDescanso" required
                      placeholder="Fin" />
                  </div>
                  <small class="text-muted">Rango permitido para marcar</small>
                </div>


                <div class="col-12 mt-4">
                  <h6 class="text-info border-bottom pb-2"><i class="bi bi-sun me-2"></i>Ingreso Tarde</h6>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Hora *</label>
                  <input type="time" class="form-control" v-model="form.horaIngresoTarde" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Tolerancia (minutos) *</label>
                  <input type="number" class="form-control" v-model.number="form.toleranciaIngresoTarde" min="0"
                    max="60" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Ventana de Tiempo *</label>
                  <div class="input-group">
                    <input type="time" class="form-control" v-model="form.ventanaInicioIngresoTarde" required
                      placeholder="Inicio" />
                    <span class="input-group-text">-</span>
                    <input type="time" class="form-control" v-model="form.ventanaFinIngresoTarde" required
                      placeholder="Fin" />
                  </div>
                  <small class="text-muted">Rango permitido para marcar</small>
                </div>

                <div class="col-12 mt-4">
                  <h6 class="text-danger border-bottom pb-2"><i class="bi bi-moon me-2"></i>Salida Final</h6>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Hora *</label>
                  <input type="time" class="form-control" v-model="form.horaSalidaFinal" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Tolerancia (minutos) *</label>
                  <input type="number" class="form-control" v-model.number="form.toleranciaSalidaFinal" min="0" max="60"
                    required />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Ventana de Tiempo *</label>
                  <div class="input-group">
                    <input type="time" class="form-control" v-model="form.ventanaInicioSalidaFinal" required
                      placeholder="Inicio" />
                    <span class="input-group-text">-</span>
                    <input type="time" class="form-control" v-model="form.ventanaFinSalidaFinal" required
                      placeholder="Fin" />
                  </div>
                  <small class="text-muted">Rango permitido para marcar</small>
                </div>

              </div>
              <div class="modal-footer border-0 px-0 pb-0 mt-4">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" class="btn" :class="isEditing ? 'btn-warning' : 'btn-primary'"
                  :disabled="configStore.loading">
                  <span v-if="configStore.loading"><span
                      class="spinner-border spinner-border-sm me-2"></span>Guardando...</span>
                  <span v-else><i class="bi me-2" :class="isEditing ? 'bi-check-circle' : 'bi-save'"></i>{{ isEditing ?
                    'Actualizar' : 'Guardar' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Editar Individual -->
    <div class="modal fade" id="modalEditarIndividual" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" :class="`bg-${formIndividual.color}`">
            <h5 class="modal-title text-white">
              <i class="bi me-2" :class="`bi-${formIndividual.icono}`"></i>
              Editar {{ formIndividual.titulo }}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="guardarMarcajeIndividual">
              <div class="mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-clock me-2"></i>
                  Hora Programada *
                </label>
                <input type="time" class="form-control form-control-lg" v-model="formIndividual.hora" required />
                <small class="text-muted">Formato 24 horas (HH:MM)</small>
              </div>

              <div class="mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-hourglass-split me-2"></i>
                  Tolerancia (minutos) *
                </label>
                <input type="number" class="form-control form-control-lg" v-model.number="formIndividual.tolerancia"
                  min="0" max="60" required />
                <small class="text-muted">Tiempo de tolerancia antes de marcar tardanza</small>
              </div>
              <!-- ✅ NUEVO: Ventana de Tiempo -->
              <div class="mb-3">
                <label class="form-label fw-bold">
                  <i class="bi bi-calendar-range me-2"></i>
                  Ventana de Tiempo *
                </label>
                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label small">Inicio</label>
                    <input type="time" class="form-control" v-model="formIndividual.ventanaInicio" required />
                  </div>
                  <div class="col-6">
                    <label class="form-label small">Fin</label>
                    <input type="time" class="form-control" v-model="formIndividual.ventanaFin" required />
                  </div>
                </div>
                <small class="text-muted">Rango permitido para marcar este tipo de asistencia</small>
              </div>

              <!-- Vista Previa -->
              <div class="alert alert-light border">
                <strong>Vista Previa:</strong><br>
                Hora: <span class="badge bg-primary">{{ formIndividual.hora || '--:--' }}</span>
                Tolerancia: <span class="badge bg-secondary">{{ formIndividual.tolerancia || 0 }} min</span><br>
                Ventana: <span class="badge bg-info">{{ formIndividual.ventanaInicio || '--:--' }} - {{
                  formIndividual.ventanaFin || '--:--' }}</span>
              </div>
              <!-- Botones -->
              <div class="modal-footer border-0 px-0 pb-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  <i class="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button type="submit" class="btn" :class="`btn-${formIndividual.color}`"
                  :disabled="configStore.loading">
                  <span v-if="configStore.loading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Guardando...
                  </span>
                  <span v-else>
                    <i class="bi bi-check-circle me-2"></i>
                    Guardar Cambios
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