<template>
  <q-dialog v-model="show" persistent>
    <q-card class="buscar-card">
      <div class="card-header">
        <div class="header-icon-wrap">
          <q-icon name="search" size="22px" color="white" />
        </div>
        <div>
          <h2 class="card-title">Buscar Reserva</h2>
          <div class="card-subtitle">Ingresá el código de reserva para asociarla</div>
        </div>
        <q-btn flat round dense icon="close" color="grey-5" class="close-btn" @click="cerrar" />
      </div>

      <q-separator color="white" style="opacity:0.05" />

      <q-card-section class="card-body">
        <div class="form-field">
          <label class="field-label">Código de Reserva *</label>
          <q-input
            v-model="codigoReserva"
            dark outlined dense
            placeholder="Ej: QYMO69eff8ce..."
            class="field-input"
            @keyup.enter="buscar"
          />
        </div>

        <q-btn
          unelevated label="Buscar" icon="search" color="primary"
          class="buscar-btn"
          :loading="buscando"
          :disable="!codigoReserva.trim()"
          @click="buscar"
        />

        <!-- Resultado -->
        <div v-if="reservaEncontrada" class="resultado-card">
          <div class="resultado-header">
            <q-icon name="event_available" color="positive" size="20px" />
            <span class="resultado-title">Reserva encontrada</span>
          </div>
          <div class="resultado-grid">
            <div class="rg-item">
              <span class="rg-label">Código</span>
              <span class="rg-value monospace">{{ reservaEncontrada.codigo_reserva }}</span>
            </div>
            <div class="rg-item">
              <span class="rg-label">Cancha</span>
              <span class="rg-value">{{ reservaEncontrada.cancha?.nombre }}</span>
            </div>
            <div class="rg-item">
              <span class="rg-label">Cliente</span>
              <span class="rg-value">{{ reservaEncontrada.nombre }} {{ reservaEncontrada.apellido }}</span>
            </div>
            <div class="rg-item">
              <span class="rg-label">Fecha</span>
              <span class="rg-value">{{ reservaEncontrada.fecha }}</span>
            </div>
            <div class="rg-item">
              <span class="rg-label">Horario</span>
              <span class="rg-value">{{ reservaEncontrada.hora_inicio }} — {{ reservaEncontrada.hora_fin }}</span>
            </div>
            <div class="rg-item">
              <span class="rg-label">Estado</span>
              <q-chip dense :color="estadoColor(reservaEncontrada.estado)" text-color="white" size="sm">
                {{ reservaEncontrada.estado_nombre }}
              </q-chip>
            </div>
          </div>
        </div>

        <div v-if="errorMsg" class="error-msg">
          <q-icon name="error_outline" size="18px" />
          {{ errorMsg }}
        </div>
      </q-card-section>

      <q-separator color="white" style="opacity:0.05" />

      <q-card-actions class="card-footer">
        <q-btn flat label="Cancelar" color="grey-5" @click="cerrar" />
        <q-btn
          unelevated label="Asociar reserva" icon="link" color="positive"
          class="confirm-btn"
          :disable="!reservaEncontrada"
          @click="confirmar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from 'src/services/http/api'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue', 'selected'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const codigoReserva = ref('')
const buscando = ref(false)
const reservaEncontrada = ref(null)
const errorMsg = ref('')

async function buscar() {
  if (!codigoReserva.value.trim()) return
  buscando.value = true
  errorMsg.value = ''
  reservaEncontrada.value = null
  try {
    const r = await api.get('/api/reservas/search', { params: { codigo_reserva: codigoReserva.value.trim() } })
    reservaEncontrada.value = r.data.data
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'No se encontró la reserva con ese código.'
  } finally {
    buscando.value = false
  }
}

function estadoColor(estado) {
  if (estado === 'C') return 'positive'
  if (estado === 'P') return 'warning'
  return 'grey'
}

function confirmar() {
  if (!reservaEncontrada.value) return
  emit('selected', reservaEncontrada.value)
  cerrar()
}

function cerrar() {
  show.value = false
  codigoReserva.value = ''
  reservaEncontrada.value = null
  errorMsg.value = ''
}
</script>

<style lang="scss" scoped>
.buscar-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  width: 520px;
  max-width: 95vw;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
}

.card-header {
  display: flex; align-items: center; gap: 14px;
  padding: 24px 24px 20px;
}
.header-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, $primary, #7c3aed);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba($primary, 0.35);
}
.card-title { margin: 0 0 2px; font-size: 1.1rem; font-weight: 700; color: $text-primary; }
.card-subtitle { font-size: 0.82rem; color: $text-muted; }
.close-btn { margin-left: auto; }

.card-body {
  padding: 24px;
  display: flex; flex-direction: column; gap: 16px;
}

.form-field { display: flex; flex-direction: column; gap: 8px; }
.field-label {
  font-size: 0.78rem; font-weight: 600; color: $text-secondary;
}
.field-input {
  :deep(.q-field__control) {
    background: rgba(255,255,255,0.04) !important;
    border-radius: 12px; border: 1px solid $border-color;
    &:before { border: none !important; }
    &:hover { border-color: rgba($primary, 0.4); }
  }
}

.buscar-btn {
  width: 100%; border-radius: 12px; padding: 10px;
  font-weight: 600;
}

/* Resultado */
.resultado-card {
  background: rgba(16,185,129,0.06);
  border: 1px solid rgba(16,185,129,0.25);
  border-radius: 14px;
  padding: 16px;
}
.resultado-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 14px;
}
.resultado-title {
  font-weight: 700; font-size: 0.9rem; color: #10b981;
}
.resultado-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.rg-item {
  display: flex; flex-direction: column; gap: 3px;
}
.rg-label {
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: $text-muted;
}
.rg-value {
  font-size: 0.88rem; font-weight: 600; color: $text-primary;
}
.monospace { font-family: monospace; font-size: 0.78rem; }

.error-msg {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 10px;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.25);
  color: #ef4444; font-size: 0.87rem;
}

.card-footer {
  padding: 16px 24px;
  display: flex; justify-content: flex-end; gap: 10px;
}
.confirm-btn { border-radius: 10px; padding: 8px 24px; font-weight: 600; }
</style>
