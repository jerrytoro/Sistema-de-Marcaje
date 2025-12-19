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
                <i class="bi bi-camera me-2"></i>
                Registro Facial
              </h1>
              <p class="text-muted mb-0">
                Captura y registra el rostro de los funcionarios para reconocimiento facial
              </p>
            </div>
          </div>

          <!-- Info Alert -->
          <div class="alert alert-info d-flex align-items-center mb-4">
            <i class="bi bi-info-circle-fill fs-4 me-3"></i>
            <div>
              <strong>Instrucciones:</strong><br>
              1. Selecciona un funcionario<br>
              2. Asegúrate de tener buena iluminación<br>
              3. Captura una foto clara de tu rostro mirando de frente<br>
              4. El sistema entrenará el reconocimiento facial automáticamente
            </div>
          </div>

          <div class="row">
            <!-- Columna Izquierda: Selección de Funcionario -->
            <div class="col-md-4 mb-4">
              <div class="card shadow-sm">
                <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">
                    <i class="bi bi-person me-2"></i>
                    Seleccionar Funcionario
                  </h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Buscar Funcionario</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="searchQuery"
                      placeholder="Nombre, apellido..."
                    />
                  </div>

                  <div class="list-group" style="max-height: 400px; overflow-y: auto;">
                    <button
                      v-for="func in funcionariosFiltrados"
                      :key="func.id"
                      class="list-group-item list-group-item-action"
                      :class="{ active: selectedFuncionario?.id === func.id }"
                      @click="selectFuncionario(func)"
                    >
                      <div class="d-flex align-items-center">
                        <div class="avatar-circle bg-primary text-white me-3">
                          {{ func.nombre[0] }}{{ func.apellido[0] }}
                        </div>
                        <div>
                          <h6 class="mb-0">{{ func.nombre }} {{ func.apellido }}</h6>
                          <small>{{ func.cargo }}</small>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div v-if="funcionariosFiltrados.length === 0" class="text-center py-4 text-muted">
                    No se encontraron funcionarios
                  </div>
                </div>
              </div>
            </div>

            <!-- Columna Derecha: Captura de Rostro -->
            <div class="col-md-8">
              <div class="card shadow-sm">
                <div class="card-header bg-success text-white">
                  <h5 class="mb-0">
                    <i class="bi bi-camera-video me-2"></i>
                    Captura de Rostro
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Funcionario Seleccionado -->
                  <div v-if="selectedFuncionario" class="alert alert-primary mb-4">
                    <strong>Funcionario seleccionado:</strong><br>
                    {{ selectedFuncionario.nombre }} {{ selectedFuncionario.apellido }} - {{ selectedFuncionario.cargo }}
                  </div>

                  <div v-else class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Selecciona un funcionario primero
                  </div>

                  <!-- Video Preview -->
                  <div class="text-center mb-4">
                    <div class="camera-container" :class="{ 'camera-active': cameraActive }">
                      <video
                        ref="videoElement"
                        autoplay
                        playsinline
                        :class="{ 'd-none': !cameraActive }"
                      ></video>
                      
                      <canvas
                        ref="canvasElement"
                        class="d-none"
                      ></canvas>

                      <div v-if="capturedImage" class="captured-preview">
                        <img :src="capturedImage" alt="Rostro capturado" />
                      </div>

                      <div v-if="!cameraActive && !capturedImage" class="camera-placeholder">
                        <i class="bi bi-camera fs-1 text-muted"></i>
                        <p class="text-muted mt-2">Cámara desactivada</p>
                      </div>
                    </div>
                  </div>

                  <!-- Controles -->
                  <div class="d-flex gap-2 justify-content-center">
                    <button
                      v-if="!cameraActive"
                      class="btn btn-primary"
                      @click="startCamera"
                      :disabled="!selectedFuncionario || loading"
                    >
                      <i class="bi bi-camera-video me-2"></i>
                      Activar Cámara
                    </button>

                    <button
                      v-if="cameraActive && !capturedImage"
                      class="btn btn-success btn-lg"
                      @click="capturePhoto"
                    >
                      <i class="bi bi-camera me-2"></i>
                      Capturar Foto
                    </button>

                    <button
                      v-if="capturedImage"
                      class="btn btn-warning"
                      @click="retakePhoto"
                    >
                      <i class="bi bi-arrow-counterclockwise me-2"></i>
                      Tomar Otra
                    </button>

                    <button
                      v-if="capturedImage"
                      class="btn btn-success"
                      @click="registrarRostro"
                      :disabled="loading"
                    >
                      <span v-if="loading">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Registrando...
                      </span>
                      <span v-else>
                        <i class="bi bi-check-circle me-2"></i>
                        Registrar Rostro
                      </span>
                    </button>

                    <button
                      v-if="cameraActive"
                      class="btn btn-danger"
                      @click="stopCamera"
                    >
                      <i class="bi bi-x-circle me-2"></i>
                      Detener Cámara
                    </button>
                  </div>

                  <!-- Resultado -->
                  <div v-if="facialStore.registroExitoso" class="alert alert-success mt-4">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    ¡Rostro registrado exitosamente! El funcionario ya puede usar reconocimiento facial.
                  </div>

                  <div v-if="facialStore.error" class="alert alert-danger mt-4">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    {{ facialStore.error }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useFuncionariosStore } from '@/stores/funcionarios';
import { useFacialRecognitionStore } from '@/stores/facial-recognition';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';

const funcionariosStore = useFuncionariosStore();
const facialStore = useFacialRecognitionStore();
const sidebarOpen = ref(false);

const searchQuery = ref('');
const selectedFuncionario = ref<any>(null);
const cameraActive = ref(false);
const capturedImage = ref<string | null>(null);
const loading = ref(false);

const videoElement = ref<HTMLVideoElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);
let stream: MediaStream | null = null;

const funcionariosFiltrados = computed(() => {
  if (!searchQuery.value) {
    return funcionariosStore.funcionarios;
  }

  const query = searchQuery.value.toLowerCase();
  return funcionariosStore.funcionarios.filter((f: any) =>
    f.nombre.toLowerCase().includes(query) ||
    f.apellido.toLowerCase().includes(query) ||
    f.cargo.toLowerCase().includes(query)
  );
});

function selectFuncionario(funcionario: any) {
  selectedFuncionario.value = funcionario;
  facialStore.registroExitoso = false;
  facialStore.error = null;
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user',
      },
    });

    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      cameraActive.value = true;
    }
  } catch (error) {
    console.error('Error al acceder a la cámara:', error);
    alert('No se pudo acceder a la cámara. Verifica los permisos.');
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  cameraActive.value = false;
  capturedImage.value = null;
}

function capturePhoto() {
  if (!videoElement.value || !canvasElement.value) return;

  const video = videoElement.value;
  const canvas = canvasElement.value;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(video, 0, 0);
    capturedImage.value = canvas.toDataURL('image/jpeg', 0.9);
  }
}

function retakePhoto() {
  capturedImage.value = null;
  facialStore.error = null;
}

async function registrarRostro() {
  if (!selectedFuncionario.value || !capturedImage.value) return;

  loading.value = true;

  // Convertir Data URL a Blob
  const response = await fetch(capturedImage.value);
  const blob = await response.blob();

  const result = await facialStore.registrarRostro(selectedFuncionario.value.id, blob);

  if (result.success) {
    stopCamera();
    setTimeout(() => {
      facialStore.registroExitoso = false;
      selectedFuncionario.value = null;
    }, 3000);
  }

  loading.value = false;
}

onMounted(() => {
  funcionariosStore.loadFuncionarios();
});

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<style scoped>
.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.camera-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  height: 480px;
  margin: 0 auto;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-active {
  border: 3px solid #28a745;
}

.captured-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>