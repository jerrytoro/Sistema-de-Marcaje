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
                <i class="bi bi-camera-video me-2"></i>
                Registro Facial (Procesamiento en Navegador)
              </h1>
              <p class="text-muted mb-0">
                Captura 5 fotos para mayor precisión - Todo se procesa en tu navegador
              </p>
            </div>
          </div>

          <!-- Alert de Instrucciones -->
          <div class="alert alert-info mb-4">
            <h5 class="alert-heading">
              <i class="bi bi-info-circle me-2"></i>
              Instrucciones
            </h5>
            <ul class="mb-0">
              <li>Se capturarán <strong>5 fotos</strong> desde diferentes ángulos</li>
              <li>El reconocimiento facial se procesa <strong>en tu navegador</strong></li>
              <li>Solo se envían datos numéricos al servidor (no imágenes)</li>
              <li>Mantén buena iluminación y mira a la cámara</li>
            </ul>
          </div>

          <!-- Estado de Carga de Modelos -->
          <div v-if="cargandoModelos" class="alert alert-warning">
            <div class="d-flex align-items-center">
              <div class="spinner-border spinner-border-sm me-3"></div>
              <div>
                <strong>Cargando modelos de IA...</strong><br>
                <small>Por favor espera, esto solo ocurre la primera vez</small>
              </div>
            </div>
          </div>

          <div class="row">
            <!-- Selección de Funcionario -->
            <div class="col-md-4">
              <div class="card shadow-sm mb-4">
                <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">
                    <i class="bi bi-person-badge me-2"></i>
                    Seleccionar Funcionario
                  </h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Buscar</label>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Nombre o apellido..."
                      v-model="searchQuery"
                    />
                  </div>

                  <div class="list-group" style="max-height: 400px; overflow-y: auto;">
                    <button
                      v-for="func in funcionariosFiltrados"
                      :key="func.id"
                      class="list-group-item list-group-item-action"
                      :class="{ 'active': funcionarioSeleccionado?.id === func.id }"
                      @click="seleccionarFuncionario(func)"
                    >
                      <div class="d-flex align-items-center">
                        <div class="avatar me-2">
                          {{ func.nombre[0] }}{{ func.apellido[0] }}
                        </div>
                        <div>
                          <strong>{{ func.nombre }} {{ func.apellido }}</strong>
                          <br>
                          <small class="text-muted">{{ func.cargo }}</small>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Captura Facial -->
            <div class="col-md-8">
              <div class="card shadow-sm">
                <div class="card-header" :class="camaraActiva ? 'bg-success text-white' : 'bg-secondary text-white'">
                  <h5 class="mb-0">
                    <i class="bi bi-camera-video-fill me-2"></i>
                    Captura Facial - Procesamiento Local
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Información del Funcionario -->
                  <div v-if="funcionarioSeleccionado" class="alert alert-success mb-3">
                    <strong>
                      <i class="bi bi-check-circle me-2"></i>
                      Registrando a: {{ funcionarioSeleccionado.nombre }} {{ funcionarioSeleccionado.apellido }}
                    </strong>
                  </div>

                  <!-- Progreso -->
                  <div v-if="capturando || procesandoFotos" class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span v-if="!procesandoFotos">Capturando: {{ fotosCapturadas.length }} / 5</span>
                      <span v-else>Procesando descriptores faciales: {{ descriptoresProcesados.length }} / 5</span>
                      <span class="badge bg-primary">{{ instruccionActual }}</span>
                    </div>
                    <div class="progress" style="height: 25px;">
                      <div 
                        class="progress-bar progress-bar-striped progress-bar-animated" 
                        :style="{ width: progresoTotal + '%' }"
                      >
                        {{ progresoTotal }}%
                      </div>
                    </div>
                  </div>

                  <!-- Video -->
                  <div class="position-relative mb-3">
                    <video
                      ref="videoElement"
                      autoplay
                      playsinline
                      class="w-100 rounded"
                      :class="{ 'border-success': camaraActiva, 'border-secondary': !camaraActiva }"
                      style="max-height: 480px; border: 3px solid;"
                    ></video>
                    
                    <!-- Overlay -->
                    <div v-if="capturando" class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                         style="background: rgba(0,0,0,0.3); pointer-events: none;">
                      <div class="text-center text-white">
                        <h2><i class="bi bi-camera-fill"></i></h2>
                        <h4>{{ instruccionActual }}</h4>
                        <p>Captura en {{ countdown }}...</p>
                      </div>
                    </div>

                    <!-- Overlay Procesando -->
                    <div v-if="procesandoFotos" class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                         style="background: rgba(0,0,0,0.7); pointer-events: none;">
                      <div class="text-center text-white">
                        <div class="spinner-border mb-3" style="width: 4rem; height: 4rem;"></div>
                        <h4>Procesando reconocimiento facial...</h4>
                        <p>{{ descriptoresProcesados.length }} / 5 completados</p>
                      </div>
                    </div>

                    <canvas ref="canvasElement" style="display: none;"></canvas>
                  </div>

                  <!-- Miniaturas -->
                  <div v-if="fotosCapturadas.length > 0 && !procesandoFotos" class="mb-3">
                    <h6>Fotos Capturadas:</h6>
                    <div class="d-flex gap-2 flex-wrap">
                      <div v-for="(foto, index) in fotosCapturadas" :key="index" class="position-relative">
                        <img :src="foto.dataUrl" class="rounded border" style="width: 100px; height: 100px; object-fit: cover;">
                        <span class="position-absolute top-0 start-0 badge bg-primary m-1">{{ index + 1 }}</span>
                        <span v-if="descriptoresProcesados[index]" class="position-absolute bottom-0 end-0 badge bg-success m-1">
                          <i class="bi bi-check-circle"></i>
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Botones -->
                  <div class="d-flex gap-2">
                    <button
                      class="btn btn-success"
                      @click="activarCamara"
                      :disabled="!funcionarioSeleccionado || camaraActiva || cargandoModelos || cargando"
                      v-if="!capturando && !procesandoFotos"
                    >
                      <i class="bi bi-camera-video me-2"></i>
                      Activar Cámara
                    </button>

                    <button
                      class="btn btn-primary"
                      @click="iniciarCaptura"
                      :disabled="!camaraActiva || capturando || cargandoModelos || cargando"
                      v-if="!capturando && !procesandoFotos && fotosCapturadas.length === 0"
                    >
                      <i class="bi bi-play-circle me-2"></i>
                      Iniciar Registro
                    </button>

                    <button
                      class="btn btn-warning"
                      @click="reiniciarCaptura"
                      :disabled="cargando || procesandoFotos"
                      v-if="fotosCapturadas.length > 0 && descriptoresProcesados.length < 5"
                    >
                      <i class="bi bi-arrow-counterclockwise me-2"></i>
                      Reiniciar
                    </button>

                    <button
                      class="btn btn-success"
                      @click="guardarRegistro"
                      :disabled="descriptoresProcesados.length !== 5 || cargando"
                      v-if="descriptoresProcesados.length === 5 && !procesandoFotos"
                    >
                      <span v-if="cargando">
                        <span class="spinner-border spinner-border-sm me-2"></span>
                        Guardando...
                      </span>
                      <span v-else>
                        <i class="bi bi-save me-2"></i>
                        Guardar Registro (5/5)
                      </span>
                    </button>

                    <button
                      class="btn btn-danger"
                      @click="detenerCamara"
                      :disabled="cargando || procesandoFotos"
                      v-if="camaraActiva && !capturando"
                    >
                      <i class="bi bi-camera-video-off me-2"></i>
                      Detener Cámara
                    </button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import * as faceapi from 'face-api.js';
import api from '@/services/api';

interface Funcionario {
  id: number;
  nombre: string;
  apellido: string;
  cargo: string;
  dependencia?: string;
}

const sidebarOpen = ref(false);
const searchQuery = ref('');
const funcionarios = ref<Funcionario[]>([]);
const funcionarioSeleccionado = ref<Funcionario | null>(null);
const camaraActiva = ref(false);
const capturando = ref(false);
const procesandoFotos = ref(false);
const cargando = ref(false);
const cargandoModelos = ref(true);

const fotosCapturadas = ref<any[]>([]);
const descriptoresProcesados = ref<any[]>([]);
const instruccionActual = ref('');
const countdown = ref(3);

const videoElement = ref<HTMLVideoElement | null>(null);
const canvasElement = ref<HTMLCanvasElement | null>(null);
let stream: MediaStream | null = null;
let countdownInterval: any = null;

const instrucciones = [
  'Mira al frente',
  'Gira ligeramente a la izquierda',
  'Gira ligeramente a la derecha',
  'Inclina un poco la cabeza hacia arriba',
  'Posición normal - última foto'
];

const funcionariosFiltrados = computed(() => {
  if (!searchQuery.value) return funcionarios.value;
  const query = searchQuery.value.toLowerCase();
  return funcionarios.value.filter(f => 
    f.nombre.toLowerCase().includes(query) ||
    f.apellido.toLowerCase().includes(query) ||
    f.cargo.toLowerCase().includes(query)
  );
});

const progresoTotal = computed(() => {
  if (procesandoFotos.value) {
    return Math.round((descriptoresProcesados.value.length / 5) * 100);
  }
  return Math.round((fotosCapturadas.value.length / 5) * 100);
});

// Cargar modelos de face-api.js
async function cargarModelos() {
  try {
    cargandoModelos.value = true;
    console.log('🔄 Cargando modelos de face-api.js...');
    
    const MODEL_URL = '/models'; // Debes copiar los modelos a public/models
    
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    
    console.log('✅ Modelos cargados exitosamente');
    cargandoModelos.value = false;
  } catch (error) {
    console.error('❌ Error al cargar modelos:', error);
    alert('Error al cargar modelos de reconocimiento facial. Verifica que los modelos estén en /public/models');
    cargandoModelos.value = false;
  }
}

async function cargarFuncionarios() {
  try {
    const response = await api.get('/funcionarios') as any;
    funcionarios.value = Array.isArray(response) ? response : (response.data || []);
  } catch (error) {
    console.error('Error al cargar funcionarios:', error);
    alert('Error al cargar la lista de funcionarios');
  }
}

function seleccionarFuncionario(func: Funcionario) {
  funcionarioSeleccionado.value = func;
  fotosCapturadas.value = [];
  descriptoresProcesados.value = [];
}

async function activarCamara() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      }
    });

    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      camaraActiva.value = true;
    }
  } catch (error) {
    console.error('Error al activar la cámara:', error);
    alert('No se pudo acceder a la cámara. Verifica los permisos.');
  }
}

function detenerCamara() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
  camaraActiva.value = false;
  capturando.value = false;
  countdown.value = 3;
  if (countdownInterval) clearInterval(countdownInterval);
}

function iniciarCaptura() {
  capturando.value = true;
  fotosCapturadas.value = [];
  descriptoresProcesados.value = [];
  capturarSiguienteFoto(0);
}

function capturarSiguienteFoto(index: number) {
  if (index >= 5) {
    capturando.value = false;
    procesarTodasLasFotos();
    return;
  }

  instruccionActual.value = instrucciones[index];
  countdown.value = 3;

  countdownInterval = setInterval(() => {
    countdown.value--;
    
    if (countdown.value === 0) {
      clearInterval(countdownInterval);
      capturarFoto(index);
      
      setTimeout(() => {
        capturarSiguienteFoto(index + 1);
      }, 500);
    }
  }, 1000);
}

async function capturarFoto(index: number) {
  if (!videoElement.value || !canvasElement.value) return;

  const video = videoElement.value;
  const canvas = canvasElement.value;
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.drawImage(video, 0, 0);
  
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  
  fotosCapturadas.value.push({
    index,
    instruccion: instrucciones[index],
    dataUrl,
  });
}

async function procesarTodasLasFotos() {
  procesandoFotos.value = true;
  descriptoresProcesados.value = [];
  
  console.log('🔄 Procesando fotos con face-api.js...');
  
  for (let i = 0; i < fotosCapturadas.value.length; i++) {
    try {
      const foto = fotosCapturadas.value[i];
      
      // Crear imagen desde dataUrl
      const img = await faceapi.fetchImage(foto.dataUrl);
      
      // Detectar rostro y extraer descriptor
      const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      
      if (!detection) {
        throw new Error(`No se detectó rostro en foto ${i + 1}`);
      }
      
      // Convertir Float32Array a Array normal
      const descriptor = Array.from(detection.descriptor);
      
      descriptoresProcesados.value.push({
        descriptor,
        instruccion: foto.instruccion
      });
      
      console.log(`✅ Foto ${i + 1}/5 procesada`);
      
    } catch (error: any) {
      console.error(`❌ Error en foto ${i + 1}:`, error);
      alert(`Error al procesar foto ${i + 1}: ${error.message}`);
      procesandoFotos.value = false;
      return;
    }
  }
  
  procesandoFotos.value = false;
  console.log('✅ Todas las fotos procesadas');
}

async function guardarRegistro() {
  if (!funcionarioSeleccionado.value || descriptoresProcesados.value.length !== 5) return;

  try {
    cargando.value = true;

    console.log('📤 Enviando descriptores al servidor...');
    
    const response = await api.post(
      `/facial-recognition/registrar-descriptores/${funcionarioSeleccionado.value.id}`,
      { descriptores: descriptoresProcesados.value }
    );
    
    console.log('✅ Respuesta del servidor:', response);
    
    alert(`✅ Registro facial completado!\n\nSe guardaron 5 descriptores faciales.`);
    
    fotosCapturadas.value = [];
    descriptoresProcesados.value = [];
    funcionarioSeleccionado.value = null;
    detenerCamara();
    await cargarFuncionarios();
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    alert('❌ Error al guardar: ' + (error.response?.data?.message || error.message));
  } finally {
    cargando.value = false;
  }
}

function reiniciarCaptura() {
  fotosCapturadas.value = [];
  descriptoresProcesados.value = [];
  capturando.value = false;
  procesandoFotos.value = false;
  countdown.value = 3;
  if (countdownInterval) clearInterval(countdownInterval);
}

onMounted(async () => {
  await cargarModelos();
  await cargarFuncionarios();
});

onUnmounted(() => {
  detenerCamara();
});
</script>

<style scoped>
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}
</style>