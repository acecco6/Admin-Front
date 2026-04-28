<template>
  <q-page class="module-page">
    <div class="page-container">
      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div
              class="icon-wrapper"
              style="
                background: linear-gradient(
                  135deg,
                  rgba(16, 185, 129, 0.2),
                  rgba(5, 150, 105, 0.2)
                );
                border-color: rgba(16, 185, 129, 0.3);
              "
            >
              <q-icon name="event_available" class="header-icon" style="color: #10b981" />
            </div>
            <div>
              <h1 class="page-title">Disponibilidad</h1>
              <p class="page-subtitle">Consultá los horarios libres para reservar.</p>
            </div>
          </div>
          <q-btn
            color="primary"
            icon="add"
            label="Nueva Reserva"
            unelevated
            class="add-btn"
            @click="openForm()"
          />
        </div>
      </div>

      <!-- FILTROS -->
      <div class="filters-bar">
        <div class="filter-group">
          <label class="filter-label">Sucursal</label>
          <q-select
            v-model="sucursalId"
            dark
            outlined
            dense
            :options="sucursalOptions"
            option-value="id"
            option-label="nombre"
            emit-value
            map-options
            placeholder="Seleccionar sucursal..."
            class="filter-select"
            @update:model-value="cargarDisponibilidad"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Tipos de canchas</label>
          <q-select
            v-model="tipoCanchaId"
            dark
            outlined
            dense
            :options="tipoCanchaOptions"
            option-value="id"
            option-label="nombre"
            emit-value
            map-options
            placeholder="Seleccionar tipo..."
            class="filter-select"
            @update:model-value="cargarDisponibilidad"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Fecha</label>
          <q-input
            v-model="fecha"
            dark
            outlined
            dense
            type="date"
            class="filter-date"
            @update:model-value="cargarDisponibilidad"
          />
        </div>
        <div class="filter-group">
          <label class="filter-label">Duración (min)</label>
          <q-select
            v-model="minutos"
            dark
            outlined
            dense
            :options="[30, 60, 90, 120]"
            class="filter-minutos"
            @update:model-value="cargarDisponibilidad"
          />
        </div>
        <q-btn flat dense icon="refresh" color="primary" round @click="cargarDisponibilidad">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <!-- SIN SELECCIÓN -->
      <div v-if="!sucursalId" class="empty-state">
        <div class="empty-icon"><q-icon name="store" size="48px" /></div>
        <h3 class="empty-title">Seleccioná una sucursal</h3>
        <p class="empty-text">Elegí una sucursal y parámetros para ver la disponibilidad.</p>
      </div>

      <!-- LOADING -->
      <div v-else-if="loading" class="loading-state">
        <q-spinner-orbit color="primary" size="48px" />
        <p>Buscando horarios disponibles...</p>
      </div>

      <!-- SIN DATOS -->
      <div v-else-if="!disponibilidadData" class="empty-state">
        <div class="empty-icon"><q-icon name="event_busy" size="48px" /></div>
        <h3 class="empty-title">Sin datos</h3>
        <p class="empty-text">No hay información de disponibilidad para esta selección.</p>
      </div>

      <!-- CONTENIDO -->
      <template v-else>
        <!-- Info header -->
        <div class="content-header">
          <div class="content-title">
            <span
              >{{
                disponibilidadData.reservas ? disponibilidadData.reservas.length : 0
              }}
              canchas</span
            >
            <span class="dot">·</span>
            <span>{{ fechaFormateada }}</span>
            <span class="dot">·</span>
            <span>Turnos de {{ minutos }} min</span>
          </div>
        </div>

        <!-- GRILLA de canchas -->
        <div class="canchas-section">
          <div
            v-for="cancha in disponibilidadData.reservas"
            :key="cancha.cancha_id"
            class="cancha-column-card"
          >
            <div class="cancha-col-header">
              <div class="cancha-col-name">{{ cancha.nombre }}</div>
              <q-chip dense color="positive" text-color="white" size="xs" icon="check_circle">
                {{ cancha.disponibles?.length || 0 }} libres
              </q-chip>
            </div>

            <div class="turnos-list">
              <div
                v-for="(turno, idx) in cancha.disponibles"
                :key="idx"
                class="turno-pill turno-pill--libre"
                @click="reservarTurno(cancha, turno)"
              >
                <div class="turno-time">{{ turno.inicio }} — {{ turno.fin }}</div>
                <div class="turno-meta">
                  <q-icon name="add_circle_outline" size="12px" />
                  Disponible
                </div>
                <q-tooltip>Reservar este horario</q-tooltip>
              </div>

              <div v-if="!cancha.disponibles?.length" class="no-turnos">
                <q-icon name="block" color="negative" size="20px" />
                <span>Sin disponibilidad</span>
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
      :initial-data="initialFormData"
      @save="onSaveReserva"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ReservaFormDialog from './components/ReservaFormDialog.vue'
import { useReservas } from 'src/composables/useReservas'
import { getSucursales } from 'src/services/sucursalService'
import { getCanchas } from 'src/services/canchaService'
import { getTipoCanchas } from 'src/services/tipoCanchaService'

const { disponibilidadData, loading, saving, fetchDisponibilidad, guardarReserva } = useReservas()

const sucursalId = ref(null)
const tipoCanchaId = ref(null)
const fecha = ref(new Date().toISOString().slice(0, 10))
const minutos = ref(60)
const sucursales = ref([])
const tipoCanchas = ref([])
const todasCanchas = ref([])

const formOpen = ref(false)
const initialFormData = ref(null)

const sucursalOptions = computed(() => sucursales.value)
const tipoCanchaOptions = computed(() => tipoCanchas.value)

const canchasPlanas = computed(() => {
  if (!sucursalId.value) return []
  const grupo = todasCanchas.value.find((g) => g.id === sucursalId.value)
  return grupo?.canchas ?? []
})

const fechaFormateada = computed(() => {
  if (!fecha.value) return ''
  return new Date(fecha.value + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

async function cargarDisponibilidad() {
  if (!sucursalId.value || !fecha.value || !tipoCanchaId.value || !minutos.value) return
  await fetchDisponibilidad(sucursalId.value, fecha.value, minutos.value, tipoCanchaId.value)
}

function openForm() {
  initialFormData.value = null
  formOpen.value = true
}

function reservarTurno(cancha, turno) {
  initialFormData.value = {
    cancha_id: cancha.cancha_id,
    fecha: fecha.value,
    hora_inicio: turno.inicio,
    hora_fin: turno.fin,
  }
  formOpen.value = true
}

async function onSaveReserva(payload) {
  try {
    await guardarReserva(payload)
    formOpen.value = false
    await cargarDisponibilidad()
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
  cargarDisponibilidad()
})
</script>

<style lang="scss" scoped>
@import 'src/css/module-page.scss';

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
  width: 250px;
  :deep(.q-field__control) {
    background: $bg-card !important;
    border-radius: 12px;
    border: 1px solid $border-color;
    &:before {
      border: none !important;
    }
  }
}

.filter-date {
  width: 160px;
  :deep(.q-field__control) {
    background: $bg-card !important;
    border-radius: 12px;
    border: 1px solid $border-color;
    &:before {
      border: none !important;
    }
  }
}

.filter-minutos {
  width: 100px;
  :deep(.q-field__control) {
    background: $bg-card !important;
    border-radius: 12px;
    border: 1px solid $border-color;
    &:before {
      border: none !important;
    }
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 20px;
  color: $text-muted;
  font-size: 0.9rem;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.content-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: $text-secondary;
  font-weight: 600;
  .dot {
    color: $text-muted;
  }
}

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
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  max-height: 400px;
  overflow-y: auto;
}

.turno-pill {
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s;

  &--libre {
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.2);

    &:hover {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.4);
      transform: translateX(3px);
    }
  }
}

.turno-time {
  font-size: 0.9rem;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 2px;
}

.turno-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: $text-muted;
}

.no-turnos {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 8px;
  font-size: 0.83rem;
  color: $text-muted;
  justify-content: center;
}
</style>
