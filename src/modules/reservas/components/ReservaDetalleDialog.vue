<template>
  <q-dialog v-model="show">
    <q-card class="detalle-card">
      <div class="detalle-header">
        <div class="detalle-title-group">
          <div class="detalle-icon">
            <q-icon name="receipt_long" size="22px" color="white" />
          </div>
          <div>
            <h2 class="detalle-title">Reserva #{{ reserva?.id }}</h2>
            <div class="detalle-code">{{ reserva?.codigo_reserva }}</div>
          </div>
        </div>
        <q-btn flat round dense icon="close" color="grey-5" @click="show = false" />
      </div>

      <q-separator color="white" style="opacity:0.05" />

      <q-card-section class="detalle-body" v-if="reserva">
        <div class="info-grid">

          <div class="info-block">
            <div class="info-label">Estado</div>
            <q-chip
              :color="reserva.estado === 'C' ? 'positive' : 'warning'"
              text-color="white" size="sm"
            >
              {{ reserva.estado === 'C' ? 'Confirmada' : reserva.estado }}
            </q-chip>
          </div>

          <div class="info-block">
            <div class="info-label">Cancha</div>
            <div class="info-value">{{ reserva.cancha?.nombre }}</div>
            <div class="info-sub">Precio base: ${{ Number(reserva.cancha?.precio_base).toLocaleString('es-AR') }}</div>
          </div>

          <div class="info-block">
            <div class="info-label">Fecha</div>
            <div class="info-value">{{ formatFecha(reserva.fecha) }}</div>
          </div>

          <div class="info-block">
            <div class="info-label">Horario</div>
            <div class="info-value">
              {{ reserva.hora_inicio?.slice(0,5) }} — {{ reserva.hora_fin?.slice(0,5) }}
            </div>
          </div>

          <div class="info-block">
            <div class="info-label">Cliente</div>
            <div class="info-value">{{ reserva.nombre }} {{ reserva.apellido }}</div>
            <div class="info-sub">{{ reserva.email }}</div>
            <div class="info-sub" v-if="reserva.documento">DNI: {{ reserva.documento }}</div>
            <div class="info-sub" v-if="reserva.telefono">Tel: {{ reserva.telefono }}</div>
          </div>

          <div class="info-block">
            <div class="info-label">Precio Final</div>
            <div class="info-value precio-value">
              ${{ Number(reserva.precio_final).toLocaleString('es-AR') }}
            </div>
          </div>

        </div>
      </q-card-section>

      <div v-else class="detalle-loading">
        <q-spinner-orbit color="primary" size="40px" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  reserva: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<style lang="scss" scoped>
.detalle-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  width: 500px;
  max-width: 95vw;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6);
}
.detalle-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 28px 20px; gap: 16px;
}
.detalle-title-group { display: flex; align-items: center; gap: 14px; }
.detalle-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, $info, #0284c7);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  box-shadow: 0 4px 16px rgba($info, 0.35);
}
.detalle-title { margin: 0 0 2px; font-size: 1.1rem; font-weight: 700; color: $text-primary; }
.detalle-code { font-size: 0.75rem; color: $text-muted; font-family: monospace; }
.detalle-body { padding: 24px 28px; }

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: $text-muted;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: $text-primary;
}

.info-sub {
  font-size: 0.78rem;
  color: $text-muted;
}

.precio-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: $positive;
}

.detalle-loading {
  display: flex; justify-content: center; padding: 48px;
}
</style>
