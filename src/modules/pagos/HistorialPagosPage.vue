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
                  rgba(139, 92, 246, 0.2),
                  rgba(168, 85, 247, 0.2)
                );
                border-color: rgba(139, 92, 246, 0.3);
              "
            >
              <q-icon name="history" class="header-icon" style="color: #a78bfa" />
            </div>
            <div>
              <h1 class="page-title">Historial de Pagos</h1>
              <p class="page-subtitle">Consultá y administrá todos los cobros realizados.</p>
            </div>
          </div>
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
            :options="sucursales"
            option-value="id"
            option-label="nombre"
            emit-value
            map-options
            placeholder="Seleccionar sucursal..."
            class="filter-select"
            @update:model-value="onFilterChange"
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
            @update:model-value="onFilterChange"
          />
        </div>
        <q-btn
          flat
          dense
          icon="refresh"
          color="primary"
          round
          @click="cargarPagos"
          :disable="!sucursalId"
        >
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <!-- TABLA DE PAGOS -->
      <div v-if="!sucursalId" class="empty-state">
        <div class="empty-icon"><q-icon name="store" size="48px" /></div>
        <h3 class="empty-title">Seleccioná una sucursal</h3>
        <p class="empty-text">Elegí la sucursal para ver el historial de movimientos.</p>
      </div>

      <div v-else class="table-container">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          :loading="loading"
          dark
          flat
          bordered
          class="premium-table"
          v-model:pagination="pagination"
          @request="onRequest"
          :rows-per-page-options="[10, 15, 20, 50]"
        >
          <!-- Custom Body para expandir -->
          <template v-slot:body="props">
            <q-tr :props="props" class="parent-row">
              <q-td key="id" :props="props" class="text-bold text-primary">
                #{{ props.row.id }}
              </q-td>
              <q-td key="cliente" :props="props">
                <div class="client-info">
                  <div class="client-name">{{ props.row.cliente }}</div>
                  <div class="client-doc">{{ props.row.documento }}</div>
                </div>
              </q-td>
              <q-td key="cancha" :props="props">
                <div class="cancha-info">
                  <q-icon name="sports_tennis" size="14px" class="q-mr-xs" />
                  {{ props.row.cancha }}
                </div>
                <div class="hora-info text-caption text-grey-5">
                  {{ props.row.fecha }} | {{ props.row.hora }}
                </div>
              </q-td>
              <q-td key="total" :props="props" class="text-right">
                <div class="total-amount">
                  ${{ props.row.resumen_economico.total_general.toLocaleString('es-AR') }}
                </div>
              </q-td>
              <q-td key="pagado" :props="props" class="text-right">
                <q-chip
                  dense
                  :color="props.row.resumen_economico.saldo_pendiente === 0 ? 'positive' : 'warning'"
                  text-color="white"
                  size="sm"
                >
                  ${{ props.row.resumen_economico.total_pagado.toLocaleString('es-AR') }}
                </q-chip>
              </q-td>
              <q-td key="saldo" :props="props" class="text-right">
                <div :class="props.row.resumen_economico.saldo_pendiente > 0 ? 'text-negative text-bold' : 'text-grey-6'">
                  ${{ props.row.resumen_economico.saldo_pendiente.toLocaleString('es-AR') }}
                </div>
              </q-td>
              <q-td key="acciones" :props="props" class="text-center">
                <q-btn
                  flat
                  round
                  dense
                  :icon="props.expand ? 'expand_less' : 'expand_more'"
                  @click="props.expand = !props.expand"
                  color="grey-5"
                />
              </q-td>
            </q-tr>

            <!-- Detalle expandido -->
            <q-tr v-show="props.expand" :props="props" class="expand-row">
              <q-td colspan="100%">
                <div class="expanded-content">
                  <div class="row q-col-gutter-md">
                    <!-- Detalle de Ventas -->
                    <div class="col-12 col-md-6">
                      <div class="detail-section">
                        <div class="detail-header">
                          <q-icon name="shopping_bag" color="orange-4" />
                          <span>Ventas / Consumos</span>
                        </div>
                        <div v-if="props.row.ventas.length" class="ventas-list">
                          <div v-for="venta in props.row.ventas" :key="venta.id" class="venta-item">
                            <div class="venta-header-inner">
                              <div class="venta-id">Venta #{{ venta.id }}</div>
                              <div class="venta-subtotal">${{ venta.total.toLocaleString('es-AR') }}</div>
                            </div>
                            <div class="venta-products">
                              <span v-for="(p, idx) in venta.productos" :key="idx" class="product-tag">
                                {{ p.cantidad }}x {{ p.nombre }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div v-else class="text-grey-6 text-italic q-pa-sm">Sin ventas adicionales</div>
                      </div>
                    </div>

                    <!-- Detalle de Pagos -->
                    <div class="col-12 col-md-6">
                      <div class="detail-section">
                        <div class="detail-header">
                          <q-icon name="payments" color="positive" />
                          <span>Pagos Registrados</span>
                        </div>
                        <div class="pagos-list">
                          <div v-for="pago in props.row.pagos" :key="pago.id" class="pago-item">
                            <div class="pago-meta">
                              <span class="pago-metodo">{{ pago.metodo.toUpperCase() }}</span>
                              <span class="pago-fecha">{{ pago.fecha }}</span>
                            </div>
                            <div class="pago-monto text-positive text-bold">
                              + ${{ pago.monto.toLocaleString('es-AR') }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="resumen-final q-mt-md">
                    <div class="resumen-row">
                      <span>Precio Reserva:</span>
                      <span>${{ props.row.resumen_economico.precio_reserva.toLocaleString('es-AR') }}</span>
                    </div>
                    <div class="resumen-row">
                      <span>Total Ventas:</span>
                      <span>${{ props.row.resumen_economico.total_ventas.toLocaleString('es-AR') }}</span>
                    </div>
                    <div class="resumen-row total-row">
                      <span>Total General:</span>
                      <span>${{ props.row.resumen_economico.total_general.toLocaleString('es-AR') }}</span>
                    </div>
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { usePagos } from 'src/composables/usePagos'
import { getSucursales } from 'src/services/sucursalService'

const { loading, pagosData, fetchPagos } = usePagos()

const sucursalId = ref(null)
const sucursales = ref([])
const fecha = ref('')

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0
})

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left', sortable: true },
  { name: 'cancha', label: 'Cancha / Turno', field: 'cancha', align: 'left' },
  { name: 'total', label: 'Total', field: (row) => row.resumen_economico.total_general, align: 'right' },
  { name: 'pagado', label: 'Pagado', field: (row) => row.resumen_economico.total_pagado, align: 'right' },
  { name: 'saldo', label: 'Pendiente', field: (row) => row.resumen_economico.saldo_pendiente, align: 'right' },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' }
]

const rows = computed(() => pagosData.value?.data || [])

async function cargarPagos() {
  if (!sucursalId.value) return

  const params = {
    sucursal_id: sucursalId.value,
    page: pagination.value.page,
    per_page: pagination.value.rowsPerPage,
  }

  if (fecha.value) {
    params.fecha = fecha.value
  }

  try {
    const res = await fetchPagos(params)
    pagination.value.rowsNumber = res.pagination.total
    pagination.value.page = res.pagination.current_page
  } catch (e) {
    console.error(e)
  }
}

function onFilterChange() {
  pagination.value.page = 1
  cargarPagos()
}

function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending
  cargarPagos()
}

onMounted(async () => {
  sucursales.value = await getSucursales()
})
</script>

<style lang="scss" scoped>
@import 'src/css/module-page.scss';

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
    &:before { border: none !important; }
    &:hover { border-color: rgba($primary, 0.4); }
  }
}

.filter-date {
  width: 180px;
  :deep(.q-field__control) {
    background: $bg-card !important;
    border-radius: 12px;
    border: 1px solid $border-color;
    &:before { border: none !important; }
  }
}

.table-container {
  background: $bg-card;
  border-radius: 16px;
  border: 1px solid $border-color;
  overflow: hidden;
}

.premium-table {
  background: transparent !important;
  :deep(.q-table__card) {
    background: transparent !important;
    box-shadow: none !important;
  }
  :deep(thead tr) {
    background: rgba(0, 0, 0, 0.2);
    height: 50px;
  }
  :deep(thead th) {
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }
  :deep(tbody tr:hover) {
    background: rgba(255, 255, 255, 0.02) !important;
  }
}

.parent-row {
  height: 60px;
}

.client-info {
  .client-name {
    font-weight: 600;
    color: #f8fafc;
  }
  .client-doc {
    font-size: 0.75rem;
    color: #64748b;
  }
}

.total-amount {
  font-weight: 700;
  color: #f8fafc;
}

/* Expand area */
.expand-row {
  background: rgba(0, 0, 0, 0.15) !important;
}

.expanded-content {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  height: 100%;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ventas-list, .pagos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.venta-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.venta-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.venta-id {
  font-size: 0.8rem;
  font-weight: 700;
  color: $text-secondary;
}

.venta-subtotal {
  font-weight: 800;
  font-size: 0.9rem;
  color: #f8fafc;
}

.venta-products {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.product-tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.pago-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.03);
  border: 1px solid rgba(34, 197, 94, 0.1);
}

.pago-meta {
  display: flex;
  flex-direction: column;
}

.pago-metodo {
  font-weight: 700;
  font-size: 0.75rem;
  color: #4ade80;
}

.pago-fecha {
  font-size: 0.7rem;
  color: #64748b;
}

.pago-monto {
  font-size: 0.95rem;
}

.resumen-final {
  background: rgba(0, 0, 0, 0.2);
  padding: 16px;
  border-radius: 12px;
  max-width: 400px;
  margin-left: auto;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.resumen-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-bottom: 6px;
  color: #94a3b8;
  &:last-child { margin-bottom: 0; }
}

.total-row {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 8px;
  margin-top: 8px;
  font-weight: 800;
  color: #f8fafc;
  font-size: 1.1rem;
}
</style>
