<template>
  <q-page class="module-page">
    <div class="page-container">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border-color: rgba(99,102,241,0.3);">
              <q-icon name="event" class="header-icon" style="color: #6366f1" />
            </div>
            <div>
              <h1 class="page-title">Reservas</h1>
              <p class="page-subtitle">Visualizá y gestioná los turnos diarios por sucursal.</p>
            </div>
          </div>
          <q-btn color="primary" icon="add" label="Nueva Reserva" unelevated class="add-btn" @click="openForm()" />
        </div>
      </div>

      <!-- FILTROS -->
      <div class="filters-bar">
        <div class="filter-group">
          <label class="filter-label">Sucursal</label>
          <q-select
            v-model="sucursalId"
            dark outlined dense
            :options="sucursalOptions"
            option-value="id" option-label="nombre"
            emit-value map-options
            placeholder="Seleccionar sucursal..."
            class="filter-select"
            @update:model-value="cargarReservas"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Tipos de canchas</label>
          <q-select
            v-model="tipoCanchaId"
            dark outlined dense
            :options="tipoCanchaOptions"
            option-value="id" option-label="nombre"
            emit-value map-options
            placeholder="Seleccionar sucursal..."
            class="filter-select"
            @update:model-value="cargarReservas"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Fecha</label>
          <q-input
            v-model="fecha"
            dark outlined dense type="date"
            class="filter-date"
            @update:model-value="cargarReservas"
          />
        </div>
        <q-btn flat dense icon="refresh" color="primary" round @click="cargarReservas">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <!-- SIN SELECCIÓN -->
      <div v-if="!sucursalId" class="empty-state">
        <div class="empty-icon"><q-icon name="store" size="48px" /></div>
        <h3 class="empty-title">Seleccioná una sucursal</h3>
        <p class="empty-text">Elegí una sucursal y una fecha para ver los turnos del día.</p>
      </div>

      <!-- LOADING -->
      <div v-else-if="loading" class="loading-state">
        <q-spinner-orbit color="primary" size="48px" />
        <p>Cargando turnos...</p>
      </div>

      <!-- SIN DATOS -->
      <div v-else-if="!reservasData" class="empty-state">
        <div class="empty-icon"><q-icon name="event_busy" size="48px" /></div>
        <h3 class="empty-title">Sin datos</h3>
        <p class="empty-text">No hay información de reservas para esta selección.</p>
      </div>

      <!-- CONTENIDO -->
      <template v-else>
        <!-- Info header -->
        <div class="content-header">
          <div class="content-title">
            <span>{{ reservasData.canchas ? Object.keys(reservasData.canchas).length : 0 }} canchas</span>
            <span class="dot">·</span>
            <span>{{ fechaFormateada }}</span>
          </div>
          <div class="legend">
            <div class="legend-item">
              <div class="legend-dot" style="background: rgba(239,68,68,0.8)"></div>
              <span>Ocupado</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot" style="background: rgba(16,185,129,0.3); border: 1px solid rgba(16,185,129,0.5)"></div>
              <span>Libre</span>
            </div>
          </div>
        </div>

        <!-- GRILLA de canchas -->
        <div class="canchas-section">
          <div v-for="cancha in reservasData.reservas" :key="cancha.cancha_id" class="cancha-column-card">
            <div class="cancha-col-header">
              <div class="cancha-col-name">{{ cancha.nombre }}</div>
              <q-chip dense color="negative" text-color="white" size="xs" icon="block">
                {{ cancha.ocupadas?.length || 0 }} ocupadas
              </q-chip>
            </div>

            <div class="turnos-list">
              <div
                v-for="turno in cancha.ocupadas" :key="turno.reserva_id"
                class="turno-pill turno-pill--ocupado"
                @click="verDetalle(turno.reserva_id)"
              >
                <div class="turno-time">
                  {{ turno.hora_inicio }} — {{ turno.hora_fin }}
                </div>
                <div class="turno-meta">
                  <q-icon name="receipt_long" size="12px" />
                  #{{ turno.reserva_id }}
                  <q-chip v-if="turno.pago_monto" dense color="positive" text-color="white" size="xs" class="pago-chip">
                    Pagado
                  </q-chip>
                </div>
                <q-tooltip>Ver detalle de reserva #{{ turno.reserva_id }}</q-tooltip>
              </div>

              <div v-if="!cancha.ocupadas?.length" class="no-turnos">
                <q-icon name="check_circle_outline" color="positive" size="20px" />
                <span>Sin reservas</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Form Dialog -->
    <ReservaFormDialog
      v-model="formOpen"
      :canchas="canchasPlanas"
      :sucursal-id="sucursalId"
      :fecha-default="fecha"
      :saving="saving"
      @save="onSaveReserva"
    />

    <!-- Detalle Dialog -->
    <ReservaDetalleDialog
      v-model="detalleOpen"
      :reserva="detalleReserva"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ReservaFormDialog from './components/ReservaFormDialog.vue'
import ReservaDetalleDialog from './components/ReservaDetalleDialog.vue'
import { useReservas } from 'src/composables/useReservas'
import { getSucursales } from 'src/services/sucursalService'
import { getCanchas } from 'src/services/canchaService'
import { getTipoCanchas } from 'src/services/tipoCanchaService'

const { reservasData, loading, saving, fetchReservas, fetchDetalleReserva, guardarReserva } = useReservas()

const sucursalId = ref(null)
const tipoCanchaId = ref(null)
const fecha = ref(new Date().toISOString().slice(0, 10))
const sucursales = ref([])
const tipoCanchas = ref([])
const todasCanchas = ref([]) // grupos de canchas

const formOpen = ref(false)
const detalleOpen = ref(false)
const detalleReserva = ref(null)

const sucursalOptions = computed(() => sucursales.value)
const tipoCanchaOptions = computed(() => tipoCanchas.value)

// Canchas aplanadas de la sucursal seleccionada
const canchasPlanas = computed(() => {
  if (!sucursalId.value) return []
  const grupo = todasCanchas.value.find(g => g.id === sucursalId.value)
  return grupo?.canchas ?? []
})

const fechaFormateada = computed(() => {
  if (!fecha.value) return ''
  return new Date(fecha.value + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
})

async function cargarReservas() {
  if (!sucursalId.value || !fecha.value || !tipoCanchaId.value) return
  await fetchReservas(sucursalId.value, fecha.value, tipoCanchaId.value)
}

function openForm() {
  formOpen.value = true
}

async function verDetalle(reservaId) {
  detalleReserva.value = null
  detalleOpen.value = true
  try {
    detalleReserva.value = await fetchDetalleReserva(reservaId)
  } catch {}
}

async function onSaveReserva(payload) {
  try {
    await guardarReserva(payload)
    formOpen.value = false
    await cargarReservas()
  } catch {}
}

onMounted(async () => {
  const [suc, tipoCancha, canchas] = await Promise.all([
    getSucursales(),
    getTipoCanchas(),
    getCanchas(),
  ])
  sucursales.value = suc
  tipoCanchas.value = tipoCancha
  todasCanchas.value = canchas
})
</script>

<style lang="scss" scoped>
@import 'src/css/module-page.scss';

/* ─── FILTROS ─── */
.filters-bar {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.filter-select {
  width: 280px;
  :deep(.q-field__control) {
    background: $bg-card !important; border-radius: 12px; border: 1px solid $border-color;
    &:before { border: none !important; }
    &:hover { border-color: rgba($primary, 0.4); }
  }
}

.filter-date {
  width: 180px;
  :deep(.q-field__control) {
    background: $bg-card !important; border-radius: 12px; border: 1px solid $border-color;
    &:before { border: none !important; }
  }
}

/* ─── ESTADOS ─── */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 80px 20px;
  color: $text-muted; font-size: 0.9rem;
}

/* ─── CONTENT HEADER ─── */
.content-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap; gap: 12px;
}

.content-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.9rem; color: $text-secondary; font-weight: 600;

  .dot { color: $text-muted; }
}

.legend {
  display: flex; gap: 16px;
}

.legend-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.78rem; color: $text-muted;
}

.legend-dot {
  width: 12px; height: 12px; border-radius: 4px;
}

/* ─── CANCHAS GRID ─── */
.canchas-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.cancha-column-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 16px;
  overflow: hidden;
}

.cancha-col-header {
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.25);
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px;
  border-bottom: 1px solid $border-color;
}

.cancha-col-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: $text-primary;
}

.turnos-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 380px;
  overflow-y: auto;
}

.turno-pill {
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;

  &--ocupado {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.25);

    &:hover {
      background: rgba(239, 68, 68, 0.18);
      border-color: rgba(239, 68, 68, 0.5);
      transform: translateX(3px);
    }
  }
}

.turno-time {
  font-size: 0.9rem;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 4px;
}

.turno-meta {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.75rem; color: $text-muted;
}

.pago-chip { margin-left: 4px; }

.no-turnos {
  display: flex; align-items: center; gap: 8px;
  padding: 20px 8px;
  font-size: 0.83rem; color: $text-muted;
  justify-content: center;
}
</style>
