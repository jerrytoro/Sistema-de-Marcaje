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
                Registro Facial Mejorado
              </h1>
              <p class="text-muted mb-0">
                Captura múltiples fotos para mayor precisión en el reconocimiento
              </p>
            </div>
          </div>

          <!-- Alert de Instrucciones -->
          <div class="alert alert-info mb-4">
            <h5 class="alert-heading">
              <i class="bi bi-info-circle me-2"></i>
              Instrucciones para mejor reconocimiento
            </h5>
            <ul class="mb-0">
              <li>Se capturarán <strong>5 fotos</strong> desde diferentes ángulos</li>
              <li>Mantén buena iluminación en tu rostro</li>
              <li>Mira directamente a la cámara en cada captura</li>
              <li>Evita usar lentes oscuros o gorras</li>
            </ul>
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
                    Captura Facial Múltiple
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Información del Funcionario Seleccionado -->
                  <div v-if="funcionarioSeleccionado" class="alert alert-success mb-3">
                    <strong>
                      <i class="bi bi-check-circle me-2"></i>
                      Registrando a: {{ funcionarioSeleccionado.nombre }} {{ funcionarioSeleccionado.apellido }}
                    </strong>
                  </div>

                  <!-- Progreso de Capturas -->
                  <div v-if="capturando" class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span>Progreso: {{ fotosCapturadas.length }} / 5 fotos</span>
                      <span class="badge bg-primary">{{ instruccionActual }}</span>
                    </div>
                    <div class="progress" style="height: 25px;">
                      <div 
                        class="progress-bar progress-bar-striped progress-bar-animated" 
                        :style="{ width: (fotosCapturadas.length / 5 * 100) + '%' }"
                      >
                        {{ Math.round(fotosCapturadas.length / 5 * 100) }}%
                      </div>
                    </div>
                  </div>

                  <!-- Video Preview -->
                  <div class="position-relative mb-3">
                    <video
                      ref="videoElement"
                      autoplay
                      playsinline
                      class="w-100 rounded"
                      :class="{ 'border-success': camaraActiva, 'border-secondary': !camaraActiva }"
                      style="max-height: 480px; border: 3px solid;"
                    ></video>
                    
                    <!-- Overlay de Instrucción -->
                    <div v-if="capturando" class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                         style="background: rgba(0,0,0,0.3); pointer-events: none;">
                      <div class="text-center text-white">
                        <h2><i class="bi bi-camera-fill"></i></h2>
                        <h4>{{ instruccionActual }}</h4>
                        <p>Captura en {{ countdown }}...</p>
                      </div>
                    </div>

                    <canvas ref="canvasElement" style="display: none;"></canvas>
                  </div>

                  <!-- Miniaturas de Fotos Capturadas -->
                  <div v-if="fotosCapturadas.length > 0" class="mb-3">
                    <h6>Fotos Capturadas:</h6>
                    <div class="d-flex gap-2 flex-wrap">
                      <div v-for="(foto, index) in fotosCapturadas" :key="index" class="position-relative">
                        <img :src="foto.dataUrl" class="rounded border" style="width: 100px; height: 100px; object-fit: cover;">
                        <span class="position-absolute top-0 start-0 badge bg-primary m-1">{{ index + 1 }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Botones de Control -->
                  <div class="d-flex gap-2">
                    <button
                      class="btn btn-success"
                      @click="activarCamara"
                      :disabled="!funcionarioSeleccionado || camaraActiva || cargando"
                      v-if="!capturando"
                    >
                      <i class="bi bi-camera-video me-2"></i>
                      Activar Cámara
                    </button>

                    <button
                      class="btn btn-primary"
                      @click="iniciarCaptura"
                      :disabled="!camaraActiva || capturando || cargando"
                      v-if="!capturando && fotosCapturadas.length === 0"
                    >
                      <i class="bi bi-play-circle me-2"></i>
                      Iniciar Registro
                    </button>

                    <button
                      class="btn btn-warning"
                      @click="reiniciarCaptura"
                      :disabled="cargando"
                      v-if="fotosCapturadas.length > 0 && fotosCapturadas.length < 5"
                    >
                      <i class="bi bi-arrow-counterclockwise me-2"></i>
                      Reiniciar
                    </button>

                    <button
                      class="btn btn-success"
                      @click="guardarRegistro"
                      :disabled="fotosCapturadas.length !== 5 || cargando"
                      v-if="fotosCapturadas.length === 5"
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
                      :disabled="cargando"
                      v-if="camaraActiva"
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
import { ref, computed, onUnmounted } from 'vue';
import Navbar from '@/components/layout/Navbar.vue';
import Sidebar from '@/components/layout/Sidebar.vue';
import api from '@/services/api';

// ✅ Interfaz para Funcionario
interface Funcionario {
  id: number;
  nombre: string;
  apellido: string;
  cargo: string;
  dependencia?: string;
  facialDataRegistered?: boolean;
  usuario?: any;
}

const sidebarOpen = ref(false);
const searchQuery = ref('');
const funcionarios = ref<Funcionario[]>([]);
const funcionarioSeleccionado = ref<Funcionario | null>(null);
const camaraActiva = ref(false);
const capturando = ref(false);
const cargando = ref(false);
const fotosCapturadas = ref<any[]>([]);
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

async function cargarFuncionarios() {
  try {
    const response = await api.get('/funcionarios') as any;
    
    // ✅ Manejar diferentes formatos de respuesta
    if (Array.isArray(response)) {
      funcionarios.value = response;
    } else if (response.data && Array.isArray(response.data)) {
      funcionarios.value = response.data;
    } else {
      funcionarios.value = [];
    }
  } catch (error) {
    console.error('Error al cargar funcionarios:', error);
    alert('Error al cargar la lista de funcionarios');
    funcionarios.value = [];
  }
}

function seleccionarFuncionario(func: Funcionario) {
  funcionarioSeleccionado.value = func;
  fotosCapturadas.value = [];
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
  capturarSiguienteFoto(0);
}

function capturarSiguienteFoto(index: number) {
  if (index >= 5) {
    capturando.value = false;
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
  const blob = await fetch(dataUrl).then(r => r.blob());
  
  fotosCapturadas.value.push({
    index,
    instruccion: instrucciones[index],
    dataUrl,
    blob
  });
}

function reiniciarCaptura() {
  fotosCapturadas.value = [];
  capturando.value = false;
  countdown.value = 3;
  if (countdownInterval) clearInterval(countdownInterval);
}

// async function guardarRegistro() {
//   if (!funcionarioSeleccionado.value || fotosCapturadas.value.length !== 5) return;

//   try {
//     cargando.value = true;

//     const formData = new FormData();
    
//     // Agregar cada foto con su índice
//     fotosCapturadas.value.forEach((foto, index) => {
//       formData.append(`foto${index + 1}`, foto.blob, `foto${index + 1}.jpg`);
//       formData.append(`instruccion${index + 1}`, foto.instruccion);
//     });

//     const response = await fetch(
//       `${import.meta.env.VITE_API_URL}/facial-recognition/register-multiple/${funcionarioSeleccionado.value.id}`,
//       {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: formData
//       }
//     );

//     if (!response.ok) {
//       throw new Error('Error al registrar datos faciales');
//     }

//     const result = await response.json();
    
//     alert(`✅ Registro facial completado exitosamente!\n\nSe guardaron ${result.registrosCreados || 5} fotos para mejor reconocimiento.`);
    
//     // Limpiar
//     fotosCapturadas.value = [];
//     funcionarioSeleccionado.value = null;
//     detenerCamara();
//     await cargarFuncionarios();
    
//   } catch (error: any) {
//     console.error('Error al guardar registro:', error);
//     alert('❌ Error al guardar el registro facial: ' + error.message);
//   } finally {
//     cargando.value = false;
//   }
// }
async function guardarRegistro() {
  if (!funcionarioSeleccionado.value || fotosCapturadas.value.length !== 5) return;

  try {
    cargando.value = true;

    const formData = new FormData();
    
    // ✅ CORRECTO: Todas las fotos con el mismo nombre "foto"
    fotosCapturadas.value.forEach((foto, index) => {
      formData.append('foto', foto.blob, `foto${index + 1}.jpg`);
    });
    
    // ✅ Agregar metadata como campos separados
    fotosCapturadas.value.forEach((foto, index) => {
      formData.append(`instruccion${index + 1}`, foto.instruccion);
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/facial-recognition/register-multiple/${funcionarioSeleccionado.value.id}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Error al registrar datos faciales');
    }

    const result = await response.json();
    
    alert(`✅ Registro facial completado exitosamente!\n\nSe guardaron ${result.registrosCreados || 5} fotos para mejor reconocimiento.`);
    
    fotosCapturadas.value = [];
    funcionarioSeleccionado.value = null;
    detenerCamara();
    await cargarFuncionarios();
    
  } catch (error: any) {
    console.error('Error al guardar registro:', error);
    alert('❌ Error al guardar el registro facial: ' + error.message);
  } finally {
    cargando.value = false;
  }
}
onUnmounted(() => {
  detenerCamara();
});

// Cargar funcionarios al montar
cargarFuncionarios();
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