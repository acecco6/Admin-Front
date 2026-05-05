<template>
  <q-page class="dashboard-page">
    <div class="dashboard-inner">
      <!-- Encabezado -->
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Dashboard</h1>
        </div>
        <div class="dashboard-controls">
          <q-select
            v-model="sucursalId"
            dark
            outlined
            dense
            :options="sucursales"
            option-value="id"
            option-label="nombre"
            emit-value
            map-options
            placeholder="Seleccionar sucursal..."
            class="sucursal-select"
            @update:model-value="onSucursalChange"
          />
          <div class="dashboard-date">
            {{ currentDate }}
          </div>
        </div>
      </div>

      <!-- Cards de métricas — Completar con datos reales -->
      <div class="metrics-grid">
        <div v-for="card in metricCards" :key="card.label" class="metric-card">
          <div class="metric-card__icon" :style="{ background: card.gradient }">
            <q-icon :name="card.icon" size="22px" color="white" />
          </div>
          <div class="metric-card__body">
            <p class="metric-card__label">{{ card.label }}</p>
            <p class="metric-card__value">{{ card.value }}</p>
          </div>
          <!-- <div
            class="metric-card__badge"
            :style="{ color: card.trend > 0 ? '#34d399' : '#f87171' }"
          >
            <q-icon :name="card.trend > 0 ? 'trending_up' : 'trending_down'" size="16px" />
            {{ Math.abs(card.trend) }}%
          </div> -->
        </div>
      </div>

      <!-- Área de contenido — Agregar widgets aquí -->
      <div class="dashboard-grid">
        <!-- Reservas por finalizar -->
        <div class="dashboard-widget">
          <div class="widget-header">
            <div class="widget-title-group">
              <div class="widget-icon" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b">
                <q-icon name="schedule" size="20px" />
              </div>
              <p class="widget-title">Reservas por finalizar</p>
            </div>
            <q-chip dense outline color="warning" size="sm" class="widget-badge">
              &lt; 30 min
            </q-chip>
          </div>

          <div class="widget-content custom-scroll">
            <div v-if="loadingReservas" class="loading-state">
              <q-spinner-orbit color="primary" size="30px" />
            </div>
            <div v-else-if="!sucursalId" class="widget-empty">
              <q-icon name="store" size="40px" color="grey-7" />
              <p>Seleccioná una sucursal</p>
            </div>
            <div v-else-if="finalizarData.length === 0" class="widget-empty">
              <div class="empty-icon-circle">
                <q-icon name="check" size="24px" color="positive" />
              </div>
              <p>No hay reservas por finalizar</p>
            </div>
            <div v-else class="reserva-list">
              <div v-for="res in finalizarData" :key="res.id" class="reserva-item">
                <div
                  class="reserva-avatar"
                  style="
                    background: rgba(245, 158, 11, 0.1);
                    border: 1px solid rgba(245, 158, 11, 0.2);
                  "
                >
                  <span style="color: #f59e0b; font-weight: 700; font-size: 0.8rem">
                    {{ res.nombre.charAt(0).toUpperCase()
                    }}{{ res.apellido.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="reserva-info">
                  <div class="reserva-name">{{ res.nombre }} {{ res.apellido }}</div>
                  <div class="reserva-details">
                    <q-icon name="sports_tennis" size="14px" /> {{ res.cancha?.nombre }}
                    <span class="dot-separator">•</span>
                    <q-icon name="schedule" size="14px" /> {{ res.hora_inicio.slice(0, 5) }} -
                    {{ res.hora_fin.slice(0, 5) }}
                  </div>
                </div>
                <div class="reserva-price">
                  <div class="price-value">
                    ${{ Number(res.precio_final).toLocaleString('es-AR') }}
                  </div>
                  <div v-if="res.estado === 'P'" class="price-label">
                    <q-badge color="warning">POR COBRAR</q-badge>
                  </div>
                  <div v-else class="price-label">
                    <q-badge color="positive">COBRADO</q-badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reservas Pendientes de Pago -->
        <div class="dashboard-widget">
          <div class="widget-header">
            <div class="widget-title-group">
              <div class="widget-icon" style="background: rgba(239, 68, 68, 0.15); color: #ef4444">
                <q-icon name="payments" size="20px" />
              </div>
              <p class="widget-title">Pendientes de pago</p>
            </div>
            <q-chip
              dense
              outline
              color="negative"
              size="sm"
              class="widget-badge"
              v-if="pendientesData.length > 0"
            >
              {{ pendientesData.length }}
            </q-chip>
          </div>

          <div class="widget-content custom-scroll">
            <div v-if="loadingReservas" class="loading-state">
              <q-spinner-orbit color="primary" size="30px" />
            </div>
            <div v-else-if="!sucursalId" class="widget-empty">
              <q-icon name="store" size="40px" color="grey-7" />
              <p>Seleccioná una sucursal</p>
            </div>
            <div v-else-if="pendientesData.length === 0" class="widget-empty">
              <div class="empty-icon-circle">
                <q-icon name="task_alt" size="24px" color="positive" />
              </div>
              <p>No hay reservas pendientes</p>
            </div>
            <div v-else class="reserva-list">
              <div v-for="res in pendientesData" :key="res.id" class="reserva-item">
                <div
                  class="reserva-avatar"
                  style="
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                  "
                >
                  <span style="color: #ef4444; font-weight: 700; font-size: 0.8rem">
                    {{ res.nombre.charAt(0).toUpperCase()
                    }}{{ res.apellido.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="reserva-info">
                  <div class="reserva-name">{{ res.nombre }} {{ res.apellido }}</div>
                  <div class="reserva-details">
                    <q-icon name="sports_tennis" size="14px" /> {{ res.cancha?.nombre }}
                    <span class="dot-separator">•</span>
                    <q-icon name="calendar_today" size="14px" /> {{ res.fecha }}
                    {{ res.hora_inicio.slice(0, 5) }}
                  </div>
                </div>
                <div class="reserva-price">
                  <div class="price-value text-negative">
                    ${{ Number(res.precio_final).toLocaleString('es-AR') }}
                  </div>
                  <div class="price-label">Adeudado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSucursales } from 'src/services/sucursalService'
import { useDefaultSucursal } from 'src/composables/useDefaultSucursal'
import { useReservas } from 'src/composables/useReservas'
import {
  getIngresosTotales,
  getIngresosReservas,
  getIngresosTienda,
} from 'src/services/pagoService'

const { defaultSucursalId } = useDefaultSucursal()
const {
  pendientesData,
  finalizarData,
  loading: loadingReservas,
  fetchReservasPendientes,
  fetchReservasFinalizar,
} = useReservas()

const sucursales = ref([])
const sucursalId = ref(null)

// Métricas
const ingresosTotales = ref(0)
const ingresosReservas = ref(0)
const ingresosTienda = ref(0)
const loadingMetrics = ref(false)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

async function fetchMetrics(id) {
  if (!id) return
  loadingMetrics.value = true
  try {
    const [totales, reservas, tienda] = await Promise.all([
      getIngresosTotales(id),
      getIngresosReservas(id),
      getIngresosTienda(id),
    ])
    ingresosTotales.value = totales.data || 0
    ingresosReservas.value = reservas.data || 0
    ingresosTienda.value = tienda.data || 0
  } catch (error) {
    console.error('Error al obtener métricas:', error)
  } finally {
    loadingMetrics.value = false
  }
}

function onSucursalChange() {
  if (sucursalId.value) {
    fetchReservasPendientes(sucursalId.value)
    fetchReservasFinalizar(sucursalId.value)
    fetchMetrics(sucursalId.value)
  } else {
    pendientesData.value = []
    finalizarData.value = []
    ingresosTotales.value = 0
    ingresosReservas.value = 0
    ingresosTienda.value = 0
  }
}

onMounted(async () => {
  sucursales.value = await getSucursales()
  if (defaultSucursalId.value) {
    sucursalId.value = defaultSucursalId.value
    onSucursalChange()
  }
})

// ——— Cards de métricas dinámicas ———
const metricCards = computed(() => [
  {
    label: 'Usuarios totales',
    value: '—',
    icon: 'people',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  {
    label: 'Ingresos Totales',
    value: loadingMetrics.value ? '...' : `$${ingresosTotales.value.toLocaleString('es-AR')}`,
    icon: 'attach_money',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
  },
  {
    label: 'Ingresos Tienda',
    value: loadingMetrics.value ? '...' : `$${ingresosTienda.value.toLocaleString('es-AR')}`,
    icon: 'shopping_bag',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  {
    label: 'Ingresos Reservas',
    value: loadingMetrics.value ? '...' : `$${ingresosReservas.value.toLocaleString('es-AR')}`,
    icon: 'sports_tennis',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
  },
])
</script>

<style lang="scss">
.dashboard-page {
  background: $bg-deep;
}

.dashboard-inner {
  padding: 0 32px 32px 32px; /* Top 0 para alineación geométrica */
  max-width: 1400px;
  margin: 0 auto; /* Centrar cuando el sidebar se achica en pantallas grandes */

  @media (max-width: 600px) {
    padding: 0 16px 16px 16px;
  }
}

// ——— ENCABEZADO ———
.dashboard-header {
  min-height: 90px;
  display: flex;
  flex-wrap: wrap; /* IMPRESCINDIBLE PARA QUE NO SE ROMPA */
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 12px;
}

.dashboard-title {
  margin: 0 0 4px;
  font-size: 1.6rem;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: -0.03em;
}

.dashboard-subtitle {
  margin: 0;
  font-size: 0.88rem;
  color: $text-muted;

  strong {
    color: $text-secondary;
  }
}

.dashboard-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.sucursal-select {
  width: 250px;
  :deep(.q-field__control) {
    background: $bg-card !important;
    border-radius: 8px;
    border: 1px solid $border-color;
    &:before {
      border: none !important;
    }
  }
}

.dashboard-date {
  font-size: 0.82rem;
  color: $text-muted;
  text-transform: capitalize;
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 6px 12px;
}

// ——— MÉTRICAS ———
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__label {
    margin: 0 0 2px;
    font-size: 0.75rem;
    color: $text-muted;
    font-weight: 500;
  }

  &__value {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: $text-primary;
  }

  &__badge {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 0.75rem;
    font-weight: 600;
  }
}

// ——— WIDGETS ———
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.dashboard-widget {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  height: 400px; /* Altura fija para forzar el scroll */
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;
}

.widget-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.widget-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.widget-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: $text-primary;
}

.widget-badge {
  font-weight: 700;
}

.widget-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

/* Custom Scrollbar for widgets */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.widget-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: $text-muted;
  font-size: 0.85rem;
}

.empty-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.reserva-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reserva-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
}

.reserva-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reserva-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reserva-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reserva-details {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: $text-muted;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dot-separator {
  color: rgba(255, 255, 255, 0.2);
  margin: 0 2px;
}

.reserva-price {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.price-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: $text-primary;
}

.price-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $text-muted;
  font-weight: 600;
}
</style>
