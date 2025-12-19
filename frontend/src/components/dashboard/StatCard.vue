<template>
  <div class="card stat-card border-0 shadow-sm h-100">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <h6 class="text-muted text-uppercase mb-2" style="font-size: 0.75rem; letter-spacing: 0.5px;">
            {{ title }}
          </h6>
          <h2 class="mb-2 fw-bold">
            <span v-if="loading" class="text-muted">
              <span class="spinner-border spinner-border-sm me-2"></span>
              ...
            </span>
            <span v-else>{{ formattedValue }}</span>
          </h2>
          <div v-if="change !== undefined" class="d-flex align-items-center">
            <span :class="changeClass" class="small">
              <i :class="changeIcon" class="me-1"></i>
              {{ Math.abs(change) }}%
            </span>
            <span class="text-muted ms-2 small">vs mes anterior</span>
          </div>
        </div>
        <div :class="`stat-card-icon bg-${color} bg-opacity-10 text-${color}`">
          <i :class="`bi bi-${icon}`"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: number | string;
  icon: string;
  color?: string;
  change?: number;
  loading?: boolean;
  suffix?: string;
}>();

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString() + (props.suffix || '');
  }
  return props.value;
});

const changeClass = computed(() => {
  if (props.change === undefined) return '';
  return props.change >= 0 ? 'text-success' : 'text-danger';
});

const changeIcon = computed(() => {
  if (props.change === undefined) return '';
  return props.change >= 0 ? 'bi-arrow-up' : 'bi-arrow-down';
});
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.stat-card-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}
</style>