<template>
  <div class="card shadow-sm">
    <div class="card-header bg-info text-white">
      <h5 class="mb-0">
        <i class="bi bi-telegram me-2"></i>
        Notificaciones Telegram
      </h5>
    </div>
    <div class="card-body">
      <!-- Bot no disponible -->
      <div v-if="!botDisponible" class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        El bot de Telegram no está configurado. Contacta al administrador.
      </div>

      <!-- No vinculado -->
      <div v-else-if="!notifStore.telegramVinculado">
        <div class="alert alert-primary">
          <strong>¿Qué son las notificaciones Telegram?</strong><br>
          Recibirás mensajes automáticos en Telegram cuando:
          <ul class="mb-0 mt-2">
            <li>Marques tu asistencia</li>
            <li>No registres tu salida</li>
            <li>Tengas recordatorios pendientes</li>
            <li>Tengas alertas de asistencia</li>
          </ul>
        </div>

        <div class="text-center py-4">
          <div v-if="notifStore.qrDataUrl" class="mb-4">
            <img :src="notifStore.qrDataUrl" alt="QR Telegram" class="qr-code" />
            <p class="text-muted mt-3">
              Escanea este código con tu cámara para vincular Telegram
            </p>
            <small class="text-muted">
              <i class="bi bi-clock me-1"></i>
              Expira en 24 horas
            </small>
          </div>

          <button
            v-if="!notifStore.qrDataUrl"
            class="btn btn-primary btn-lg"
            @click="generarQR"
            :disabled="notifStore.loading"
          >
            <span v-if="notifStore.loading">
              <span class="spinner-border spinner-border-sm me-2"></span>
              Generando...
            </span>
            <span v-else>
              <i class="bi bi-qr-code me-2"></i>
              Generar Código QR
            </span>
          </button>

          <button
            v-if="notifStore.qrDataUrl"
            class="btn btn-outline-secondary"
            @click="generarQR"
            :disabled="notifStore.loading"
          >
            <i class="bi bi-arrow-clockwise me-2"></i>
            Generar Nuevo Código
          </button>
        </div>

        <div class="alert alert-info mt-3">
          <strong>Pasos para vincular:</strong>
          <ol class="mb-0 mt-2">
            <li>Genera el código QR</li>
            <li>Escanea con tu cámara del teléfono</li>
            <li>Se abrirá Telegram automáticamente</li>
            <li>El bot te confirmará la vinculación</li>
          </ol>
        </div>
      </div>

      <!-- Vinculado -->
      <div v-else>
        <div class="alert alert-success">
          <i class="bi bi-check-circle-fill me-2"></i>
          <strong>Telegram vinculado correctamente</strong>
        </div>

        <div class="vinculacion-info">
          <div class="d-flex align-items-center mb-3">
            <i class="bi bi-telegram fs-1 text-info me-3"></i>
            <div>
              <h6 class="mb-0">Bot: @{{ notifStore.botUsername }}</h6>
              <small class="text-muted">Chat ID: {{ notifStore.telegramChatId }}</small>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button
              class="btn btn-outline-primary"
              @click="enviarPrueba"
              :disabled="notifStore.loading"
            >
              <i class="bi bi-send me-2"></i>
              Enviar Prueba
            </button>

            <button
              class="btn btn-outline-danger"
              @click="confirmarDesvincular"
              :disabled="notifStore.loading"
            >
              <i class="bi bi-x-circle me-2"></i>
              Desvincular
            </button>
          </div>
        </div>

        <div class="alert alert-info mt-3">
          <i class="bi bi-info-circle me-2"></i>
          Ahora recibirás notificaciones automáticas de tus marcajes y alertas en Telegram.
        </div>
      </div>

      <!-- Error -->
      <div v-if="notifStore.error" class="alert alert-danger mt-3">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ notifStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNotificationsStore } from '@/stores/notifications';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  funcionarioId: number;
}>();

const notifStore = useNotificationsStore();
const authStore = useAuthStore();
const botDisponible = ref(true);

async function generarQR() {
  const result = await notifStore.generarQR(props.funcionarioId);
  if (!result.success) {
    alert('Error al generar código QR');
  }
}

async function enviarPrueba() {
  const result = await notifStore.enviarPrueba(props.funcionarioId);
  if (result.success) {
    alert('Notificación de prueba enviada. Revisa tu Telegram.');
  } else {
    alert('Error al enviar notificación');
  }
}

async function confirmarDesvincular() {
  if (!confirm('¿Estás seguro de desvincular Telegram? Ya no recibirás notificaciones.')) {
    return;
  }

  const result = await notifStore.desvincular(props.funcionarioId);
  if (result.success) {
    alert('Telegram desvinculado exitosamente');
  } else {
    alert('Error al desvincular');
  }
}

onMounted(async () => {
  // Verificar estado actual
  await notifStore.verificarEstado(props.funcionarioId);
});
</script>

<style scoped>
.qr-code {
  max-width: 300px;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}

.vinculacion-info {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}
</style>