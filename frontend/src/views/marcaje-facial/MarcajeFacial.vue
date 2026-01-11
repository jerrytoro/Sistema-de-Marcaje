<template>
  <div class="kiosk-container">
    <!-- Header -->
    <div class="kiosk-header">
      <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="mb-0 text-white">
              <i class="bi bi-camera-video me-2"></i>
              Sistema de Asistencias - Marcaje Facial
            </h1>
          </div>
          <div>
            <span class="badge bg-white text-primary fs-5 px-4 py-2">
              {{ horaActual }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: Sidebar + Camera -->
    <div class="kiosk-body">
      <div class="kiosk-layout">
        <!-- ===== COLUMNA IZQUIERDA: Instrucciones + Estadísticas ===== -->
        <aside class="kiosk-sidebar kiosk-sidebar-left">
          <!-- Instrucciones -->
          <div class="sidebar-card">
            <div class="sidebar-card-header">
              <i class="bi bi-info-circle-fill me-2"></i>
              Instrucciones
            </div>
            <div class="sidebar-card-body">
              <ol class="instruction-list">
                <li>Colócate frente a la cámara</li>
                <li>Asegúrate de tener buena iluminación</li>
                <li>Mira directamente a la cámara</li>
                <li>El sistema te reconocerá automáticamente</li>
              </ol>
            </div>
          </div>

          <!-- Estadísticas del día -->
          <div class="sidebar-card mt-3">
            <div class="sidebar-card-header">
              <i class="bi bi-bar-chart-fill me-2"></i>
              Estadísticas del Día
            </div>
            <div class="sidebar-card-body">
              <div class="stat-item">
                <div class="stat-icon bg-primary">
                  <i class="bi bi-people-fill"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.marcajesHoy }}</div>
                  <div class="stat-label">Marcajes Hoy</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon bg-success">
                  <i class="bi bi-check-circle-fill"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.puntuales }}</div>
                  <div class="stat-label">A Tiempo</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon bg-warning">
                  <i class="bi bi-clock-fill"></i>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ stats.tardanzas }}</div>
                  <div class="stat-label">Tardanzas</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- ===== COLUMNA CENTRAL: Cámara ===== -->
        <main class="kiosk-main-center">
          <!-- Cámara -->
          <div class="camera-section">
            <div class="camera-container" :class="getCameraClass()">
              <video ref="videoElement" autoplay playsinline :class="{ 'd-none': !cameraActive }"></video>

              <canvas ref="canvasElement" class="d-none"></canvas>

              <!-- Overlay de procesamiento -->
              <div v-if="procesando" class="camera-overlay">
                <div class="spinner-border text-white" style="width: 4rem; height: 4rem;"></div>
                <h4 class="text-white mt-3">Verificando rostro...</h4>
              </div>

              <!-- Resultado Exitoso -->
              <div v-if="resultado?.success" class="camera-overlay bg-success">
                <i class="bi bi-check-circle-fill text-white" style="font-size: 6rem;"></i>
                <h3 class="text-white mt-3">¡Marcaje Exitoso!</h3>
                <h4 class="text-white mt-2">{{ resultado.funcionario }}</h4>
                <div class="mt-3">
                  <span class="badge bg-white text-success fs-5 px-3 py-2">
                    {{ resultado.tipo }}
                  </span>
                </div>
                <p class="text-white fs-5 mt-2">{{ resultado.hora }}</p>

                <!-- Tardanza o Salida Anticipada -->
                <div v-if="esIngreso(resultado.tipo) && resultado.tardanza && resultado.tardanza > 0"
                  class="alert alert-warning mt-2 d-inline-block">
                  <i class="bi bi-clock me-2"></i>
                  Tardanza: {{ resultado.tardanza }} min
                </div>
                <div v-else-if="esIngreso(resultado.tipo)" class="alert alert-light mt-2 d-inline-block">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  A tiempo
                </div>
                <div
                  v-else-if="esSalida(resultado.tipo) && resultado.salidaAnticipada && resultado.salidaAnticipada > 0"
                  class="alert alert-danger mt-2 d-inline-block">
                  <i class="bi bi-exclamation-circle-fill me-2"></i>
                  Salida anticipada: {{ resultado.salidaAnticipada }} min
                </div>
                <div v-else-if="esSalida(resultado.tipo)" class="alert alert-light mt-2 d-inline-block">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  Normal
                </div>
              </div>

              <!-- Resultado Fallido -->
              <div v-if="resultado && !resultado.success" class="camera-overlay bg-danger">
                <i class="bi bi-x-circle-fill text-white" style="font-size: 6rem;"></i>
                <h3 class="text-white mt-3">No Reconocido</h3>
                <p class="text-white fs-6 mt-2">{{ resultado.message }}</p>
                <button class="btn btn-light btn-lg mt-3 px-4" @click="reiniciar">
                  <i class="bi bi-arrow-clockwise me-2"></i>
                  Intentar Nuevamente
                </button>
              </div>

              <!-- Placeholder -->
              <div v-if="!cameraActive && !cargandoModelos" class="camera-placeholder">
                <i class="bi bi-camera fs-1 text-muted"></i>
                <p class="text-muted mt-2">Iniciando cámara...</p>
              </div>
            </div>
          </div>
        </main>

        <!-- ===== COLUMNA DERECHA: Estado del Sistema ===== -->
        <aside class="kiosk-sidebar kiosk-sidebar-right">
          <!-- Estado del Sistema -->
          <div class="sidebar-card">
            <div class="sidebar-card-header">
              <i class="bi bi-activity me-2"></i>
              Estado del Sistema
            </div>
            <div class="sidebar-card-body">
              <!-- Cargando modelos -->
              <div v-if="cargandoModelos" class="status-box status-warning">
                <div class="spinner-border spinner-border-sm me-2"></div>
                <div>
                  <div class="status-title">Iniciando IA</div>
                  <div class="status-text">Cargando modelos...</div>
                </div>
              </div>

              <!-- Sistema activo -->
              <div v-else-if="cameraActive && !procesando && !resultado" class="status-box status-success">
                <i class="bi bi-camera-video-fill fs-3 me-2"></i>
                <div>
                  <div class="status-title">Sistema Activo</div>
                  <div class="status-text">Reconocimiento automático cada 5s</div>
                </div>
              </div>

              <!-- Verificando -->
              <div v-else-if="procesando" class="status-box status-info">
                <div class="spinner-border spinner-border-sm me-2"></div>
                <div>
                  <div class="status-title">Verificando</div>
                  <div class="status-text">Procesando rostro...</div>
                </div>
              </div>

              <!-- Resultado exitoso -->
              <div v-else-if="resultado?.success" class="status-box status-success">
                <i class="bi bi-check-circle-fill fs-3 me-2"></i>
                <div>
                  <div class="status-title">¡Éxito!</div>
                  <div class="status-text">Marcaje registrado</div>
                </div>
              </div>

              <!-- Resultado fallido -->
              <div v-else-if="resultado && !resultado.success" class="status-box status-danger">
                <i class="bi bi-x-circle-fill fs-3 me-2"></i>
                <div>
                  <div class="status-title">No Reconocido</div>
                  <div class="status-text">Intenta nuevamente</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón de captura manual -->
          <div v-if="cameraActive && !procesando && !resultado && !cargandoModelos" class="mt-3">
            <button class="btn btn-outline-light btn-lg w-100 py-3" @click="capturarManual">
              <i class="bi bi-camera-fill d-block fs-2 mb-2"></i>
              <span>Capturar<br>Manualmente</span>
            </button>
          </div>

          <!-- Info adicional -->
          <div class="sidebar-card mt-3">
            <div class="sidebar-card-body text-center">
              <i class="bi bi-shield-check text-success fs-2"></i>
              <p class="mt-2 mb-0 small text-muted">
                Sistema seguro con<br>reconocimiento facial<br>de alta precisión
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- Footer -->
    <div class="kiosk-footer">
      <div class="container-fluid">
        <div class="text-center text-white">
          <small>Sistema de Control de Asistencias - {{ new Date().getFullYear() }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as faceapi from 'face-api.js';
import api from '@/services/api';

// ✅ Interfaces actualizadas
interface Resultado {
  success: boolean;
  funcionario?: string;
  tipo?: string;
  hora?: string;
  tardanza?: number;
  salidaAnticipada?: number;  // ✅ NUEVO
  message?: string;
}

interface Stats {
  marcajesHoy: number;
  puntuales: number;
  tardanzas: number;
}

interface VerificacionResponse {
  success: boolean;
  message?: string;
  funcionario?: {
    nombre: string;
    apellido: string;
  };
  asistencia?: {
    tipoMarcaje: string;
    fecha: string;
    minutosTardanza?: number;
    minutosSalidaAnticipada?: number;  // ✅ NUEVO
  };
}

// Refs
const videoElement = ref<HTMLVideoElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);
const cameraActive = ref(false);
const procesando = ref(false);
const resultado = ref<Resultado | null>(null);
const horaActual = ref('');
const cargandoModelos = ref(true);

const stats = ref<Stats>({
  marcajesHoy: 0,
  puntuales: 0,
  tardanzas: 0,
});

let stream: MediaStream | null = null;
let verificacionInterval: NodeJS.Timeout | null = null;

// Actualizar hora
setInterval(() => {
  const now = new Date();
  horaActual.value = now.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}, 1000);

function getCameraClass(): string {
  if (resultado.value?.success) return 'camera-success';
  if (resultado.value && !resultado.value.success) return 'camera-error';
  return '';
}

// Cargar modelos
async function cargarModelos(): Promise<void> {
  try {
    cargandoModelos.value = true;
    console.log('🔄 Cargando modelos...');

    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    console.log('✅ Modelos cargados');
    cargandoModelos.value = false;
  } catch (error) {
    console.error('❌ Error al cargar modelos:', error);
    alert('Error al cargar modelos');
    cargandoModelos.value = false;
  }
}

async function iniciarCamara(): Promise<void> {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
    });

    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      cameraActive.value = true;
      verificacionInterval = setInterval(verificarRostroAutomatico, 5000);
    }
  } catch (error) {
    console.error('Error cámara:', error);
    alert('No se pudo acceder a la cámara');
  }
}

function detenerCamara(): void {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  if (verificacionInterval) {
    clearInterval(verificacionInterval);
    verificacionInterval = null;
  }
  cameraActive.value = false;
}

async function verificarRostroAutomatico(): Promise<void> {
  if (procesando.value || resultado.value || !cameraActive.value) return;
  await capturarYVerificar();
}

async function capturarManual(): Promise<void> {
  await capturarYVerificar();
}

async function capturarYVerificar(): Promise<void> {
  if (procesando.value) return;

  try {
    procesando.value = true;

    const video = videoElement.value;
    const canvas = canvasElement.value;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const detection = await faceapi
      .detectSingleFace(canvas)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      resultado.value = { success: false, message: 'No se detectó rostro' };
      setTimeout(reiniciar, 5000);
      return;
    }

    const descriptor = Array.from(detection.descriptor);

    const verificacion = await api.post('/facial-recognition/verificar-descriptor', {
      descriptor
    }) as VerificacionResponse;

    if (verificacion.success && verificacion.funcionario && verificacion.asistencia) {
      // ✅ MEJOR: Formatear desde el timestamp actual de JavaScript
      const ahora = new Date();
      resultado.value = {
        success: true,
        funcionario: `${verificacion.funcionario.nombre} ${verificacion.funcionario.apellido}`,
        tipo: formatTipoMarcaje(verificacion.asistencia.tipoMarcaje),
        hora: ahora.toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        tardanza: verificacion.asistencia.minutosTardanza || 0,
        salidaAnticipada: verificacion.asistencia.minutosSalidaAnticipada || 0,
      };

      if (verificacionInterval) {
        clearInterval(verificacionInterval);
        verificacionInterval = null;
      }

      await cargarEstadisticas();
      setTimeout(reiniciar, 5000);
    } else {
      resultado.value = {
        success: false,
        message: verificacion.message || 'Rostro no reconocido',
      };
      setTimeout(reiniciar, 5000);
    }
  } catch (error: any) {
    resultado.value = {
      success: false,
      message: error.response?.data?.message || 'Error al procesar',
    };
    setTimeout(reiniciar, 5000);
  } finally {
    procesando.value = false;
  }
}

function formatTipoMarcaje(tipo: string): string {
  const tipos: { [key: string]: string } = {
    INGRESO_MANANA: 'Ingreso Mañana',
    SALIDA_DESCANSO: 'Salida Descanso',
    INGRESO_TARDE: 'Ingreso Tarde',
    SALIDA_FINAL: 'Salida Final',
  };
  return tipos[tipo] || tipo;
}

// ✅ NUEVAS FUNCIONES HELPER
function esIngreso(tipo?: string): boolean {
  return tipo === 'Ingreso Mañana' || tipo === 'Ingreso Tarde';
}

function esSalida(tipo?: string): boolean {
  return tipo === 'Salida Descanso' || tipo === 'Salida Final';
}

function reiniciar(): void {
  resultado.value = null;
  if (!verificacionInterval) {
    verificacionInterval = setInterval(verificarRostroAutomatico, 5000);
  }
}

async function cargarEstadisticas(): Promise<void> {
  try {
    const asistenciasHoy = await api.get('/asistencias/hoy') as any[];
    stats.value.marcajesHoy = asistenciasHoy.length;
    stats.value.puntuales = asistenciasHoy.filter((a: any) => !a.minutosTardanza || a.minutosTardanza === 0).length;
    stats.value.tardanzas = asistenciasHoy.filter((a: any) => a.minutosTardanza > 0).length;
  } catch (error) {
    console.error('Error estadísticas:', error);
  }
}

onMounted(async () => {
  horaActual.value = new Date().toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  await cargarModelos();
  await cargarEstadisticas();
  await iniciarCamara();
});

onBeforeUnmount(() => {
  detenerCamara();
});
</script>

<style scoped>
.kiosk-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.kiosk-header {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem 0;
  backdrop-filter: blur(10px);
}

.kiosk-body {
  flex: 1;
  display: flex;
  padding: 1.5rem;
}

.kiosk-footer {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem 0;
  backdrop-filter: blur(10px);
}

/* ✅ NUEVO LAYOUT CON SIDEBAR */
.kiosk-layout {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  /* Izq: 280px, Centro: flex, Der: 280px */
  gap: 1.5rem;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  height: 100%;
}

.kiosk-sidebar {
  display: flex;
  flex-direction: column;
}

.kiosk-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

/* SIDEBAR CARDS */
.sidebar-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.sidebar-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.25rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.text-center.mt-3 {
  min-height: 80px;
  /* ✅ Altura fija para evitar saltos */
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-card-body {
  padding: 1.25rem;
}

.instruction-list {
  margin: 0;
  padding-left: 1.25rem;
  list-style: decimal;
}

.instruction-list li {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.instruction-list li:last-child {
  margin-bottom: 0;
}

/* ESTADÍSTICAS */
.stat-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e9ecef;
}

.stat-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: white;
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  line-height: 1;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

/* ESTADO DEL SISTEMA */
.status-indicator {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #495057;
}

/* CÁMARA */
.camera-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.camera-container {
  position: relative;
  width: 100%;
  height: 660px !important;
  min-height: 480px;
  background: #000;
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 5px solid #ddd;
  transition: border-color 0.3s;
}

.camera-container.camera-success {
  border-color: #28a745;
  animation: pulse-success 1s ease-in-out;
}

.camera-container.camera-error {
  border-color: #dc3545;
}

.camera-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.alert-camera {
  font-size: 1rem;
  padding: 1.25rem;
}

/* Status boxes (sidebar derecho) */
.status-box {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  min-height: 80px;
  /* ✅ Altura fija */
}

.status-box.status-success {
  background: rgba(40, 167, 69, 0.1);
  border: 2px solid #28a745;
  color: #28a745;
}

.status-box.status-warning {
  background: rgba(255, 193, 7, 0.1);
  border: 2px solid #ffc107;
  color: #856404;
}

.status-box.status-info {
  background: rgba(23, 162, 184, 0.1);
  border: 2px solid #17a2b8;
  color: #117a8b;
}

.status-box.status-danger {
  background: rgba(220, 53, 69, 0.1);
  border: 2px solid #dc3545;
  color: #dc3545;
}

.status-title {
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.2;
}

.status-text {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

@keyframes pulse-success {

  0%,
  100% {
    border-color: #28a745;
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4);
  }

  50% {
    border-color: #28a745;
    box-shadow: 0 0 0 20px rgba(40, 167, 69, 0);
  }
}

/* Responsive */
@media (max-width: 1400px) {
  .kiosk-layout {
    grid-template-columns: 260px 1fr 260px;
  }

  .camera-container {
    height: 400px !important;
    min-height: 400px;
    max-height: 400px;
  }
}

@media (max-width: 1200px) {
  .kiosk-layout {
    grid-template-columns: 240px 1fr 240px;
  }
}

@media (max-width: 992px) {
  .kiosk-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .kiosk-sidebar-left {
    order: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .kiosk-main-center {
    order: 2;
  }

  .kiosk-sidebar-right {
    order: 3;
  }
}
</style>