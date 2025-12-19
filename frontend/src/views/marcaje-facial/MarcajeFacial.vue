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
            <span class="badge bg-white text-primary fs-5">
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
            <div class="alert alert-info alert-lg mb-4" v-if="!procesando && !resultado">
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

            <!-- Cámara -->
            <div class="camera-section">
              <div class="camera-container" :class="{ 'camera-success': resultado?.success }">
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
                </div>

                <!-- Resultado Exitoso -->
                <div v-if="resultado?.success" class="camera-overlay bg-success">
                  <i class="bi bi-check-circle-fill text-white" style="font-size: 8rem;"></i>
                  <h2 class="text-white mt-4">¡Marcaje Exitoso!</h2>
                  <h4 class="text-white">{{ resultado.funcionario }}</h4>
                  <p class="text-white fs-5">{{ resultado.tipo }} - {{ resultado.hora }}</p>
                  <p class="text-white fs-4" v-if="resultado.tardanza > 0">
                    ⏱️ Tardanza: {{ resultado.tardanza }} minutos
                  </p>
                  <p class="text-white fs-4" v-else>
                    ✅ A tiempo
                  </p>
                </div>

                <!-- Resultado Fallido -->
                <div v-if="resultado && !resultado.success" class="camera-overlay bg-danger">
                  <i class="bi bi-x-circle-fill text-white" style="font-size: 8rem;"></i>
                  <h2 class="text-white mt-4">No Reconocido</h2>
                  <p class="text-white fs-5">{{ resultado.message }}</p>
                  <button class="btn btn-light btn-lg mt-3" @click="reiniciar">
                    Intentar Nuevamente
                  </button>
                </div>

                <!-- Placeholder -->
                <div v-if="!cameraActive" class="camera-placeholder">
                  <i class="bi bi-camera fs-1 text-muted"></i>
                  <p class="text-muted mt-3 fs-5">Iniciando cámara...</p>
                </div>
              </div>
            </div>

            <!-- Botón Manual (emergencia) -->
            <div class="text-center mt-4" v-if="!procesando && !resultado">
              <button class="btn btn-outline-primary btn-lg" @click="capturarManual">
                <i class="bi bi-camera me-2"></i>
                Capturar Manualmente
              </button>
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
import { useFacialRecognitionStore } from '@/stores/facial-recognition';

const facialStore = useFacialRecognitionStore();

const videoElement = ref<HTMLVideoElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);
const cameraActive = ref(false);
const procesando = ref(false);
const resultado = ref<any>(null);
const horaActual = ref('');

let stream: MediaStream | null = null;
let verificacionInterval: any = null;

// Actualizar hora cada segundo
setInterval(() => {
  const now = new Date();
  horaActual.value = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}, 1000);

async function iniciarCamara() {
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

function detenerCamara() {
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

async function verificarRostroAutomatico() {
  if (procesando.value || resultado.value) return;

  await capturarYVerificar();
}

async function capturarManual() {
  await capturarYVerificar();
}

async function capturarYVerificar() {
  if (!videoElement.value || !canvasElement.value) return;

  procesando.value = true;

  try {
    // Capturar foto del video
    const video = videoElement.value;
    const canvas = canvasElement.value;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      // Convertir a Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
      });

      // Verificar rostro
      const verificacion = await facialStore.verificarRostro(blob);

      if (verificacion.success && verificacion.data.success) {
        // Reconocido - Registrar marcaje
        const marcaje = await registrarMarcaje(blob);
        
        if (marcaje) {
          resultado.value = {
            success: true,
            funcionario: `${marcaje.asistencia.funcionario.nombre} ${marcaje.asistencia.funcionario.apellido}`,
            tipo: formatTipoMarcaje(marcaje.asistencia.tipoMarcaje),
            hora: new Date(marcaje.asistencia.horaMarcaje).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            tardanza: marcaje.asistencia.minutosTardanza,
          };

          // Detener verificación automática
          if (verificacionInterval) {
            clearInterval(verificacionInterval);
            verificacionInterval = null;
          }

          // Reiniciar después de 5 segundos
          setTimeout(() => {
            reiniciar();
          }, 5000);
        }
      } else {
        // No reconocido
        resultado.value = {
          success: false,
          message: verificacion.data?.message || 'No se pudo reconocer el rostro',
        };

        // Reiniciar después de 3 segundos
        setTimeout(() => {
          reiniciar();
        }, 3000);
      }
    }
  } catch (error: any) {
    console.error('Error:', error);
    resultado.value = {
      success: false,
      message: error.message || 'Error al procesar',
    };

    setTimeout(() => {
      reiniciar();
    }, 3000);
  } finally {
    procesando.value = false;
  }
}

async function registrarMarcaje(fotoBlob: Blob): Promise<any> {
  const formData = new FormData();
  formData.append('foto', fotoBlob, 'marcaje.jpg');

  const response = await fetch(`${import.meta.env.VITE_API_URL}/facial-recognition/marcar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Error al registrar marcaje');
  }

  return await response.json();
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

function reiniciar() {
  resultado.value = null;
  
  // Reiniciar verificación automática
  if (!verificacionInterval) {
    verificacionInterval = setInterval(verificarRostroAutomatico, 2000);
  }
}

onMounted(() => {
  horaActual.value = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  iniciarCamara();
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
}

.camera-container.camera-success {
  border-color: #28a745;
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
}

@media (max-width: 768px) {
  .camera-container {
    height: 480px;
  }
}
</style>