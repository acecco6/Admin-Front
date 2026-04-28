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
                  rgba(56, 189, 248, 0.2),
                  rgba(2, 132, 199, 0.2)
                );
                border-color: rgba(56, 189, 248, 0.3);
              "
            >
              <q-icon name="payments" class="header-icon" style="color: #38bdf8" />
            </div>
            <div>
              <h1 class="page-title">Pagos</h1>
              <p class="page-subtitle">Registrá cobros de reservas y ventas de tienda.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- SELECTOR DE SUCURSAL -->
      <div class="filters-bar">
        <div class="filter-group">
          <label class="filter-label">Sucursal</label>
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
            class="filter-select"
            @update:model-value="onSucursalChange"
          />
        </div>
      </div>

      <!-- SIN SUCURSAL -->
      <div v-if="!sucursalId" class="empty-state">
        <div class="empty-icon"><q-icon name="store" size="48px" /></div>
        <h3 class="empty-title">Seleccioná una sucursal</h3>
        <p class="empty-text">
          Elegí la sucursal que querés administrar para ver las opciones de cobro.
        </p>
      </div>

      <!-- CONTENIDO CON SUCURSAL SELECCIONADA -->
      <template v-else>
        <!-- TABS de modo -->
        <div class="mode-tabs">
          <div
            class="mode-tab"
            :class="{ 'mode-tab--active': modoActivo === 'reservas' }"
            @click="modoActivo = 'reservas'"
          >
            <q-icon name="event" size="22px" />
            <span>Reservas</span>
          </div>
          <div
            class="mode-tab"
            :class="{ 'mode-tab--active': modoActivo === 'tienda' }"
            @click="activarTienda"
          >
            <q-icon name="shopping_bag" size="22px" />
            <span>Tienda</span>
          </div>
        </div>

        <!-- ══════════════════════════════════════
             TAB: RESERVAS
        ══════════════════════════════════════ -->
        <div v-if="modoActivo === 'reservas'" class="tab-content">
          <div class="filters-bar">
            <div class="filter-group">
              <label class="filter-label">Tipo de Cancha</label>
              <q-select
                v-model="tipoCanchaId"
                dark
                outlined
                dense
                :options="tipoCanchas"
                option-value="id"
                option-label="nombre"
                emit-value
                map-options
                placeholder="Tipo de cancha..."
                class="filter-select"
                @update:model-value="cargarReservas"
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
                @update:model-value="cargarReservas"
              />
            </div>
            <q-btn
              flat
              dense
              icon="refresh"
              color="primary"
              round
              @click="cargarReservas"
              :disable="!tipoCanchaId"
            >
              <q-tooltip>Actualizar</q-tooltip>
            </q-btn>
          </div>

          <!-- Necesita tipo de cancha -->
          <div v-if="!tipoCanchaId" class="empty-state">
            <div class="empty-icon"><q-icon name="sports_tennis" size="48px" /></div>
            <h3 class="empty-title">Seleccioná el tipo de cancha</h3>
            <p class="empty-text">
              Elegí el tipo de cancha y la fecha para ver las reservas del día.
            </p>
          </div>

          <!-- Loading -->
          <div v-else-if="loadingReservas" class="loading-state">
            <q-spinner-orbit color="primary" size="48px" />
            <p>Cargando reservas...</p>
          </div>

          <!-- Sin datos -->
          <div v-else-if="!reservasData" class="empty-state">
            <div class="empty-icon"><q-icon name="event_busy" size="48px" /></div>
            <h3 class="empty-title">Sin reservas</h3>
            <p class="empty-text">No hay reservas para esta selección.</p>
          </div>

          <!-- Grilla de canchas con reservas -->
          <template v-else>
            <div class="canchas-section">
              <div
                v-for="cancha in reservasData.reservas"
                :key="cancha.cancha_id"
                class="cancha-column-card"
              >
                <div class="cancha-col-header">
                  <div class="cancha-col-name">{{ cancha.nombre }}</div>
                  <q-chip dense color="negative" text-color="white" size="xs" icon="block">
                    {{ cancha.ocupadas?.length || 0 }} ocupadas
                  </q-chip>
                </div>
                <div class="turnos-list">
                  <div
                    v-for="turno in cancha.ocupadas"
                    :key="turno.reserva_id"
                    class="turno-pill"
                    @click="verDetalleReserva(turno.reserva_id)"
                  >
                    <div class="turno-time">{{ turno.hora_inicio }} — {{ turno.hora_fin }}</div>
                    <div class="turno-meta">
                      <q-icon name="receipt_long" size="12px" />
                      #{{ turno.reserva_id }}
                      <q-chip
                        v-if="turno.pago_monto"
                        dense
                        color="positive"
                        text-color="white"
                        size="xs"
                        >Pagado</q-chip
                      >
                    </div>
                    <q-tooltip>Cobrar reserva #{{ turno.reserva_id }}</q-tooltip>
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

        <!-- ══════════════════════════════════════
             TAB: TIENDA
        ══════════════════════════════════════ -->
        <div v-if="modoActivo === 'tienda'" class="tab-content">
          <!-- Loading -->
          <div v-if="loadingVentas" class="loading-state">
            <q-spinner-orbit color="primary" size="48px" />
            <p>Cargando ventas...</p>
          </div>

          <!-- Sin ventas -->
          <div v-else-if="!ventas.length" class="empty-state">
            <div class="empty-icon"><q-icon name="shopping_cart" size="48px" /></div>
            <h3 class="empty-title">Sin ventas pendientes</h3>
            <p class="empty-text">
              No hay ventas de tienda pendientes de cobro para esta sucursal.
            </p>
          </div>

          <!-- Lista de ventas -->
          <div v-else class="ventas-list">
            <div class="ventas-header-row">
              <span class="ventas-count">{{ ventas.length }} ventas pendientes</span>
            </div>
            <div
              v-for="venta in ventas"
              :key="venta.id"
              class="venta-card"
              @click="verDetalleVenta(venta)"
            >
              <div class="venta-icon-wrap">
                <q-icon name="shopping_bag" size="20px" style="color: #fb923c" />
              </div>
              <div class="venta-info">
                <div class="venta-title">Venta #{{ venta.id }}</div>
                <div class="venta-meta">
                  <span v-if="venta.nombre">{{ venta.nombre }}</span>
                  <span v-else class="venta-meta--sin-nombre">Sin nombre asociado</span>
                  <span v-if="venta.reserva_id" class="venta-reserva-badge">
                    <q-icon name="event" size="12px" /> Reserva #{{ venta.reserva_id }}
                  </span>
                </div>
              </div>
              <div class="venta-total-right">
                ${{ Number(venta.total).toLocaleString('es-AR') }}
              </div>
              <q-chip dense :color="estadoVentaColor(venta.estado)" text-color="white" size="xs">
                {{ estadoVentaLabel(venta.estado) }}
              </q-chip>
              <q-icon name="chevron_right" color="grey-6" />
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Dialog: Cobrar Reserva -->
    <PagoReservaDialog
      v-model="pagoReservaOpen"
      :reserva="reservaSeleccionada"
      :saving="savingPago"
      @cobrar="onCobrarReserva"
    />

    <!-- Dialog: Cobrar Venta Tienda -->
    <PagoTiendaDialog
      v-model="pagoTiendaOpen"
      :venta="ventaSeleccionada"
      :detalle="ventaDetalle"
      :loading-detalle="loadingVentaDetalle"
      :saving="savingPago"
      @cobrar="onCobrarTienda"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PagoReservaDialog from './components/PagoReservaDialog.vue'
import PagoTiendaDialog from './components/PagoTiendaDialog.vue'
import { usePagos } from 'src/composables/usePagos'
import { useReservas } from 'src/composables/useReservas'
import { getSucursales } from 'src/services/sucursalService'
import { getTipoCanchas } from 'src/services/tipoCanchaService'
import { getReserva } from 'src/services/reservaService'
import { getVentas, getVentaDetalle } from 'src/services/ventaService'

const { saving: savingPago, pagarReserva, pagarTienda } = usePagos()
const { reservasData, loading: loadingReservas, fetchReservas } = useReservas()

// State global
const sucursalId = ref(null)
const sucursales = ref([])
const tipoCanchas = ref([])
const modoActivo = ref('reservas')

// Reservas state
const tipoCanchaId = ref(null)
const fecha = ref(new Date().toISOString().slice(0, 10))
const pagoReservaOpen = ref(false)
const reservaSeleccionada = ref(null)

// Tienda state
const ventas = ref([])
const loadingVentas = ref(false)
const ventaSeleccionada = ref(null)
const ventaDetalle = ref(null)
const loadingVentaDetalle = ref(false)
const pagoTiendaOpen = ref(false)

// ── Métodos ──────────────────────────────

function onSucursalChange() {
  tipoCanchaId.value = null
  ventas.value = []
  reservasData.value = null
}

function activarTienda() {
  modoActivo.value = 'tienda'
  cargarVentas()
}

async function cargarReservas() {
  if (!sucursalId.value || !tipoCanchaId.value || !fecha.value) return
  await fetchReservas(sucursalId.value, fecha.value, tipoCanchaId.value)
}

async function cargarVentas() {
  if (!sucursalId.value) return
  loadingVentas.value = true
  try {
    ventas.value = await getVentas(sucursalId.value)
  } catch {
    ventas.value = []
  } finally {
    loadingVentas.value = false
  }
}

async function verDetalleReserva(reservaId) {
  reservaSeleccionada.value = null
  pagoReservaOpen.value = true
  try {
    reservaSeleccionada.value = await getReserva(reservaId)
  } catch {}
}

async function verDetalleVenta(venta) {
  ventaSeleccionada.value = venta
  ventaDetalle.value = null
  loadingVentaDetalle.value = true
  pagoTiendaOpen.value = true
  try {
    ventaDetalle.value = await getVentaDetalle(sucursalId.value, venta.id)
  } catch {
  } finally {
    loadingVentaDetalle.value = false
  }
}

async function onCobrarReserva(payload) {
  try {
    await pagarReserva(payload)
    pagoReservaOpen.value = false
    reservaSeleccionada.value = null
    await cargarReservas()
  } catch {}
}

async function onCobrarTienda(payload) {
  try {
    await pagarTienda(payload)
    pagoTiendaOpen.value = false
    ventaSeleccionada.value = null
    ventaDetalle.value = null
    await cargarVentas()
  } catch {}
}

function estadoVentaColor(estado) {
  if (estado === 1) return 'warning'
  if (estado === 2) return 'positive'
  return 'grey'
}

function estadoVentaLabel(estado) {
  if (estado === 1) return 'Pendiente'
  if (estado === 2) return 'Pagada'
  return 'Desconocido'
}

onMounted(async () => {
  const [suc, tipos] = await Promise.all([getSucursales(), getTipoCanchas()])
  sucursales.value = suc
  tipoCanchas.value = tipos
})
</script>

<style lang="scss" scoped>
@import 'src/css/module-page.scss';

/* ── Filtros ── */
.filters-bar {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 24px;
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
  width: 260px;
  :deep(.q-field__control) {
    background: $bg-card !important;
    border-radius: 12px;
    border: 1px solid $border-color;
    &:before {
      border: none !important;
    }
    &:hover {
      border-color: rgba($primary, 0.4);
    }
  }
}
.filter-date {
  width: 180px;
  :deep(.q-field__control) {
    background: $bg-card !important;
    border-radius: 12px;
    border: 1px solid $border-color;
    &:before {
      border: none !important;
    }
  }
}

/* ── Tabs de modo ── */
.mode-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}
.mode-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.25s;
  background: $bg-card;
  border: 1px solid $border-color;
  font-size: 0.95rem;
  font-weight: 600;
  color: $text-muted;
  user-select: none;

  &:hover {
    border-color: rgba($primary, 0.4);
    color: $text-secondary;
  }

  &--active {
    background: rgba(56, 189, 248, 0.1);
    border-color: rgba(56, 189, 248, 0.4);
    color: #38bdf8;
    box-shadow: 0 4px 20px rgba(56, 189, 248, 0.12);
  }
}

.tab-content {
  /* simplemente hereda */
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

/* ── Grilla de canchas (igual que ReservasPage) ── */
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
  background: rgba(56, 189, 248, 0.06);
  border: 1px solid rgba(56, 189, 248, 0.2);
  &:hover {
    background: rgba(56, 189, 248, 0.14);
    border-color: rgba(56, 189, 248, 0.45);
    transform: translateX(3px);
  }
}
.turno-time {
  font-size: 0.9rem;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 4px;
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

/* ── Ventas de tienda ── */
.ventas-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ventas-header-row {
  color: $text-muted;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 4px;
}
.ventas-count {
}

.venta-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  background: $bg-card;
  border: 1px solid $border-color;
  cursor: pointer;
  transition: all 0.22s;

  &:hover {
    border-color: rgba(251, 146, 60, 0.4);
    background: rgba(251, 146, 60, 0.05);
    transform: translateX(4px);
  }
}
.venta-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
  background: rgba(251, 146, 60, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.venta-info {
  flex: 1;
  min-width: 0;
}
.venta-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: $text-primary;
}
.venta-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: $text-muted;
  margin-top: 2px;
}
.venta-meta--sin-nombre {
  font-style: italic;
}
.venta-reserva-badge {
  display: flex;
  align-items: center;
  gap: 3px;
}
.venta-total-right {
  font-size: 1rem;
  font-weight: 800;
  color: $text-primary;
  white-space: nowrap;
}
</style>
