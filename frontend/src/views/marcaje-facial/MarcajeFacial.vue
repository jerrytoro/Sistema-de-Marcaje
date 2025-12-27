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

    <!-- Main Content -->
    <div class="kiosk-body">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-10">
            <!-- Instrucciones -->
            <div class="alert alert-info alert-lg mb-4" v-if="!procesando && !resultado && !cargandoModelos">
              <div class="d-flex align-items-center">
                <i class="bi bi-info-circle-fill fs-1 me-3"></i>
                <div>
                  <h4 class="mb-2">Instrucciones para marcar asistencia:</h4>
                  <ol class="mb-0">
                    <li>Colócate frente a la cámara</li>
                    <li>Asegúrate de tener buena iluminación</li>
                    <li>Mira directamente a la cámara</li>
                    <li>El sistema te reconocerá automáticamente</li>
                  </ol>
                </div>
              </div>
            </div>

            <!-- Cargando Modelos -->
            <div v-if="cargandoModelos" class="alert alert-warning alert-lg mb-4">
              <div class="d-flex align-items-center">
                <div class="spinner-border me-3" style="width: 3rem; height: 3rem;"></div>
                <div>
                  <h4 class="mb-2">Iniciando sistema de reconocimiento facial...</h4>
                  <p class="mb-0">Por favor espera, cargando modelos de IA</p>
                </div>
              </div>
            </div>

            <!-- Cámara -->
            <div class="camera-section">
              <div class="camera-container" :class="getCameraClass()">
                <video
                  ref="videoElement"
                  autoplay
                  playsinline
                  :class="{ 'd-none': !cameraActive }"
                ></video>

                <canvas ref="canvasElement" class="d-none"></canvas>

                <!-- Overlay de procesamiento -->
                <div v-if="procesando" class="camera-overlay">
                  <div class="spinner-border text-white" style="width: 5rem; height: 5rem;"></div>
                  <h3 class="text-white mt-4">Verificando rostro...</h3>
                  <p class="text-white-50">Procesando reconocimiento facial</p>
                </div>

                <!-- Resultado Exitoso -->
                <div v-if="resultado?.success" class="camera-overlay bg-success">
                  <i class="bi bi-check-circle-fill text-white" style="font-size: 8rem;"></i>
                  <h2 class="text-white mt-4">¡Marcaje Exitoso!</h2>
                  <h3 class="text-white mt-3">{{ resultado.funcionario }}</h3>
                  <div class="mt-4">
                    <span class="badge bg-white text-success fs-4 px-4 py-2">
                      {{ resultado.tipo }}
                    </span>
                  </div>
                  <p class="text-white fs-4 mt-3">{{ resultado.hora }}</p>
                  <div v-if="resultado.tardanza && resultado.tardanza > 0" class="alert alert-warning mt-3 d-inline-block">
                    <i class="bi bi-clock me-2"></i>
                    Tardanza: {{ resultado.tardanza || 0 }} minutos
                  </div>
                  <div v-else class="alert alert-light mt-3 d-inline-block">
                    <i class="bi bi-check-circle-fill text-success me-2"></i>
                    A tiempo
                  </div>
                </div>

                <!-- Resultado Fallido -->
                <div v-if="resultado && !resultado.success" class="camera-overlay bg-danger">
                  <i class="bi bi-x-circle-fill text-white" style="font-size: 8rem;"></i>
                  <h2 class="text-white mt-4">No Reconocido</h2>
                  <p class="text-white fs-5 mt-3">{{ resultado.message }}</p>
                  <button class="btn btn-light btn-lg mt-4 px-5" @click="reiniciar">
                    <i class="bi bi-arrow-clockwise me-2"></i>
                    Intentar Nuevamente
                  </button>
                </div>

                <!-- Placeholder -->
                <div v-if="!cameraActive && !cargandoModelos" class="camera-placeholder">
                  <i class="bi bi-camera fs-1 text-muted"></i>
                  <p class="text-muted mt-3 fs-5">Iniciando cámara...</p>
                </div>
              </div>
            </div>

            <!-- Botón Manual (emergencia) -->
            <div class="text-center mt-4" v-if="!procesando && !resultado && cameraActive && !cargandoModelos">
              <button class="btn btn-outline-light btn-lg px-5" @click="capturarManual">
                <i class="bi bi-camera me-2"></i>
                Capturar Manualmente
              </button>
            </div>

            <!-- Estadísticas del día -->
            <div class="row mt-4" v-if="!procesando && !resultado">
              <div class="col-md-4">
                <div class="stat-card">
                  <i class="bi bi-people-fill text-primary"></i>
                  <h3>{{ stats.marcajesHoy }}</h3>
                  <p>Marcajes Hoy</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="stat-card">
                  <i class="bi bi-check-circle-fill text-success"></i>
                  <h3>{{ stats.puntuales }}</h3>
                  <p>A Tiempo</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="stat-card">
                  <i class="bi bi-clock-fill text-warning"></i>
                  <h3>{{ stats.tardanzas }}</h3>
                  <p>Tardanzas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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

// Interfaces
interface Resultado {
  success: boolean;
  funcionario?: string;
  tipo?: string;
  hora?: string;
  tardanza?: number;
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

// Actualizar hora cada segundo
setInterval(() => {
  const now = new Date();
  horaActual.value = now.toLocaleTimeString('es-ES', {
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

// Cargar modelos de face-api.js
async function cargarModelos(): Promise<void> {
  try {
    cargandoModelos.value = true;
    console.log('🔄 Cargando modelos de face-api.js...');
    
    const MODEL_URL = '/models';
    
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    
    console.log('✅ Modelos cargados exitosamente');
    cargandoModelos.value = false;
  } catch (error) {
    console.error('❌ Error al cargar modelos:', error);
    alert('Error al cargar modelos de reconocimiento facial');
    cargandoModelos.value = false;
  }
}

async function iniciarCamara(): Promise<void> {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
    });

    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      cameraActive.value = true;

      // Iniciar verificación automática cada 2 segundos
      verificacionInterval = setInterval(verificarRostroAutomatico, 2000);
    }
  } catch (error) {
    console.error('Error al acceder a la cámara:', error);
    alert('No se pudo acceder a la cámara. Verifica los permisos.');
  }
}

function detenerCamara(): void {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  
  if (verificacionInterval) {
    clearInterval(verificacionInterval);
    verificacionInterval = null;
  }
  
  cameraActive.value = false;
}

async function verificarRostroAutomatico(): Promise<void> {
  if (procesando.value || resultado.value || cargandoModelos.value) return;
  await capturarYVerificar();
}

async function capturarManual(): Promise<void> {
  await capturarYVerificar();
}

async function capturarYVerificar(): Promise<void> {
  if (!videoElement.value || !canvasElement.value) return;

  procesando.value = true;

  try {
    console.log('📸 Capturando foto...');
    
    // Capturar foto del video
    const video = videoElement.value;
    const canvas = canvasElement.value;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    console.log('🔍 Detectando rostro...');
    
    // Detectar rostro y extraer descriptor
    const detection = await faceapi
      .detectSingleFace(canvas)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    if (!detection) {
      console.log('❌ No se detectó ningún rostro');
      resultado.value = {
        success: false,
        message: 'No se detectó ningún rostro. Intenta de nuevo.',
      };
      setTimeout(reiniciar, 3000);
      return;
    }
    
    console.log('✅ Rostro detectado, extrayendo descriptor...');
    
    // Convertir descriptor a array
    const descriptor = Array.from(detection.descriptor);
    
    console.log('📤 Enviando descriptor al servidor...');
    
    // Verificar con el backend
    const verificacion = await api.post('/facial-recognition/verificar-descriptor', {
      descriptor
    }) as VerificacionResponse;

    console.log('📥 Respuesta del servidor:', verificacion);

    if (verificacion.success && verificacion.funcionario && verificacion.asistencia) {
      // Reconocido
      resultado.value = {
        success: true,
        funcionario: `${verificacion.funcionario.nombre} ${verificacion.funcionario.apellido}`,
        tipo: formatTipoMarcaje(verificacion.asistencia.tipoMarcaje),
        hora: new Date(verificacion.asistencia.fecha).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        tardanza: verificacion.asistencia.minutosTardanza || 0,
      };

      // Detener verificación automática
      if (verificacionInterval) {
        clearInterval(verificacionInterval);
        verificacionInterval = null;
      }

      // Recargar estadísticas
      await cargarEstadisticas();

      // Reiniciar después de 5 segundos
      setTimeout(reiniciar, 5000);
    } else {
      // No reconocido
      resultado.value = {
        success: false,
        message: verificacion.message || 'Rostro no reconocido',
      };

      // Reiniciar después de 3 segundos
      setTimeout(reiniciar, 3000);
    }
  } catch (error: any) {
    console.error('❌ Error:', error);
    resultado.value = {
      success: false,
      message: error.response?.data?.message || error.message || 'Error al procesar',
    };

    setTimeout(reiniciar, 3000);
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

function reiniciar(): void {
  resultado.value = null;
  
  // Reiniciar verificación automática
  if (!verificacionInterval) {
    verificacionInterval = setInterval(verificarRostroAutomatico, 2000);
  }
}

async function cargarEstadisticas(): Promise<void> {
  try {
    const asistenciasHoy = await api.get('/asistencias/hoy') as any[];
    
    stats.value.marcajesHoy = asistenciasHoy.length;
    stats.value.puntuales = asistenciasHoy.filter((a: any) => !a.minutosTardanza || a.minutosTardanza === 0).length;
    stats.value.tardanzas = asistenciasHoy.filter((a: any) => a.minutosTardanza > 0).length;
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
}

onMounted(async () => {
  horaActual.value = new Date().toLocaleTimeString('es-ES', {
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
  align-items: center;
  padding: 2rem 0;
}

.kiosk-footer {
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem 0;
  backdrop-filter: blur(10px);
}

.camera-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.camera-container {
  position: relative;
  width: 100%;
  max-width: 1280px;
  height: 720px;
  margin: 0 auto;
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

.alert-lg {
  font-size: 1.1rem;
  padding: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.stat-card i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.stat-card h3 {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.stat-card p {
  margin: 0;
  opacity: 0.9;
}

@keyframes pulse-success {
  0%, 100% {
    border-color: #28a745;
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4);
  }
  50% {
    border-color: #28a745;
    box-shadow: 0 0 0 20px rgba(40, 167, 69, 0);
  }
}

@media (max-width: 768px) {
  .camera-container {
    height: 480px;
  }
}
</style>