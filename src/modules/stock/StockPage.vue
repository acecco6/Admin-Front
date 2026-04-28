<template>
  <q-page class="module-page">
    <div class="page-container">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2)); border-color: rgba(16,185,129,0.3);">
              <q-icon name="inventory_2" class="header-icon" style="color: #10b981" />
            </div>
            <div>
              <h1 class="page-title">Stock</h1>
              <p class="page-subtitle">Gestioná el inventario de productos por sucursal.</p>
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
            dark outlined dense
            :options="sucursales"
            option-value="id" option-label="nombre"
            emit-value map-options
            placeholder="Seleccionar sucursal..."
            class="filter-select"
            @update:model-value="cargarStock"
          />
        </div>
        <q-btn flat dense icon="refresh" color="primary" round @click="cargarStock" :disable="!sucursalId">
          <q-tooltip>Actualizar</q-tooltip>
        </q-btn>
      </div>

      <!-- SIN SELECCIÓN -->
      <div v-if="!sucursalId" class="empty-state">
        <div class="empty-icon"><q-icon name="inventory_2" size="48px" /></div>
        <h3 class="empty-title">Seleccioná una sucursal</h3>
        <p class="empty-text">Elegí una sucursal para ver y gestionar su inventario.</p>
      </div>

      <!-- LOADING -->
      <div v-else-if="loading" class="loading-state">
        <q-spinner-orbit color="primary" size="48px" />
        <p>Cargando stock...</p>
      </div>

      <!-- SIN DATOS -->
      <div v-else-if="!stockItems.length" class="empty-state">
        <div class="empty-icon"><q-icon name="remove_shopping_cart" size="48px" /></div>
        <h3 class="empty-title">Sin productos</h3>
        <p class="empty-text">No hay productos registrados en el stock de esta sucursal.</p>
      </div>

      <!-- TABLA DE STOCK -->
      <div v-else class="table-container">
        <!-- Buscador interno -->
        <div class="table-toolbar">
          <q-input
            v-model="busqueda"
            dark outlined dense
            placeholder="Buscar producto..."
            class="search-input"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <div class="stock-summary">
            <span class="summary-text">{{ stockFiltrado.length }} productos</span>
          </div>
        </div>

        <q-table
          :rows="stockFiltrado"
          :columns="columnas"
          row-key="producto_id"
          dark flat
          class="custom-table"
          :rows-per-page-options="[15, 25, 50]"
          rows-per-page-label="Filas por página"
        >
          <!-- Nombre del producto -->
          <template #body-cell-nombre="props">
            <q-td :props="props">
              <div class="row-name">{{ props.row.nombre }}</div>
              <div class="row-sub">{{ props.row.codigo_barras }}</div>
            </q-td>
          </template>

          <!-- Cantidad con badge de color -->
          <template #body-cell-cantidad="props">
            <q-td :props="props">
              <div class="cantidad-badge" :class="cantidadClass(props.row.cantidad)">
                {{ props.row.cantidad }}
              </div>
            </q-td>
          </template>

          <!-- Precio formateado -->
          <template #body-cell-precio="props">
            <q-td :props="props">
              <span class="precio-text">${{ Number(props.row.precio).toLocaleString('es-AR') }}</span>
            </q-td>
          </template>

          <!-- Acciones -->
          <template #body-cell-acciones="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn
                  flat round dense icon="edit"
                  color="accent"
                  class="action-btn edit-btn"
                  @click="abrirEdicion(props.row)"
                >
                  <q-tooltip>Actualizar cantidad</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Dialog de actualización -->
    <StockUpdateDialog
      v-model="dialogOpen"
      :item="itemSeleccionado"
      :sucursal-id="sucursalId"
      :saving="saving"
      @saved="onStockSaved"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StockUpdateDialog from './components/StockUpdateDialog.vue'
import { useStock } from 'src/composables/useStock'
import { getSucursales } from 'src/services/sucursalService'

const { stockItems, loading, saving, fetchStock, actualizarStock } = useStock()

const sucursalId = ref(null)
const sucursales = ref([])
const busqueda = ref('')
const dialogOpen = ref(false)
const itemSeleccionado = ref(null)

const columnas = [
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left', sortable: true },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center', sortable: true },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'right', sortable: true },
  { name: 'acciones', label: '', field: 'acciones', align: 'center' },
]

const stockFiltrado = computed(() => {
  if (!busqueda.value) return stockItems.value
  const q = busqueda.value.toLowerCase()
  return stockItems.value.filter(
    (item) =>
      item.nombre?.toLowerCase().includes(q) ||
      item.codigo_barras?.toLowerCase().includes(q)
  )
})

function cantidadClass(cantidad) {
  if (cantidad < 5) return 'cantidad--critico'
  if (cantidad < 10) return 'cantidad--bajo'
  return 'cantidad--ok'
}

async function cargarStock() {
  if (!sucursalId.value) return
  await fetchStock(sucursalId.value)
}

function abrirEdicion(item) {
  itemSeleccionado.value = item
  dialogOpen.value = true
}

async function onStockSaved(payload) {
  const ok = await actualizarStock(payload)
  if (ok) {
    dialogOpen.value = false
    await cargarStock()
  }
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

.loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 80px 20px;
  color: $text-muted; font-size: 0.9rem;
}

/* ── Toolbar ── */
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 280px;
  :deep(.q-field__control) {
    background: rgba(255,255,255,0.04) !important;
    border-radius: 12px;
    border: 1px solid $border-color;
    &:before { border: none !important; }
  }
}

.stock-summary { color: $text-muted; font-size: 0.85rem; }
.summary-text { font-weight: 600; }

/* ── Cantidad badges ── */
.cantidad-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;

  &--ok {
    background: rgba(16,185,129,0.15);
    color: #10b981;
    border: 1px solid rgba(16,185,129,0.3);
  }
  &--bajo {
    background: rgba(245,158,11,0.15);
    color: #f59e0b;
    border: 1px solid rgba(245,158,11,0.3);
  }
  &--critico {
    background: rgba(239,68,68,0.15);
    color: #ef4444;
    border: 1px solid rgba(239,68,68,0.3);
  }
}

.precio-text {
  font-weight: 600;
  color: $text-primary;
}
</style>
