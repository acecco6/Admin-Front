<template>
  <q-page class="module-page">
    <div class="page-container">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(251,146,60,0.2), rgba(234,88,12,0.2)); border-color: rgba(251,146,60,0.3);">
              <q-icon name="storefront" class="header-icon" style="color: #fb923c" />
            </div>
            <div>
              <h1 class="page-title">Tienda</h1>
              <p class="page-subtitle">Creá ventas de productos para una sucursal.</p>
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
            @update:model-value="onSucursalChange"
          />
        </div>
      </div>

      <!-- SIN SELECCIÓN -->
      <div v-if="!sucursalId" class="empty-state">
        <div class="empty-icon"><q-icon name="storefront" size="48px" /></div>
        <h3 class="empty-title">Seleccioná una sucursal</h3>
        <p class="empty-text">Elegí una sucursal para comenzar a crear ventas.</p>
      </div>

      <!-- LOADING -->
      <div v-else-if="loading" class="loading-state">
        <q-spinner-orbit color="primary" size="48px" />
        <p>Cargando productos...</p>
      </div>

      <!-- CONTENIDO PRINCIPAL -->
      <div v-else class="tienda-layout">

        <!-- ── Panel izquierdo: catálogo de productos ── -->
        <div class="catalog-panel">
          <div class="panel-header">
            <span class="panel-title">Catálogo de Productos</span>
            <q-input
              v-model="busqueda"
              dark outlined dense
              placeholder="Buscar..."
              class="catalog-search"
            >
              <template #prepend><q-icon name="search" size="18px" /></template>
            </q-input>
          </div>

          <div v-if="!productosFiltrados.length" class="empty-catalog">
            <q-icon name="inbox" size="32px" color="grey-7" />
            <span>Sin productos</span>
          </div>

          <div class="products-grid">
            <div
              v-for="prod in productosFiltrados"
              :key="prod.id"
              class="product-card"
              @click="agregarAlCarrito(prod)"
            >
              <div class="prod-icon">
                <q-icon name="shopping_bag" size="24px" style="color: #fb923c" />
              </div>
              <div class="prod-info">
                <div class="prod-name">{{ prod.nombre }}</div>
                <div class="prod-code">{{ prod.codigo_barras }}</div>
              </div>
              <div class="prod-price">${{ Number(prod.precio).toLocaleString('es-AR') }}</div>
              <q-btn flat round dense icon="add_circle" color="primary" size="sm" @click.stop="agregarAlCarrito(prod)">
                <q-tooltip>Agregar al carrito</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <!-- ── Panel derecho: carrito ── -->
        <div class="cart-panel">
          <div class="panel-header">
            <span class="panel-title">Carrito</span>
            <q-chip dense color="primary" text-color="white" size="sm">
              {{ carrito.length }} items
            </q-chip>
          </div>

          <!-- Reserva asociada -->
          <div class="reserva-section">
            <div v-if="reservaAsociada" class="reserva-badge">
              <q-icon name="event_available" color="positive" size="18px" />
              <div class="reserva-info">
                <span class="reserva-name">{{ reservaAsociada.nombre }} {{ reservaAsociada.apellido }}</span>
                <span class="reserva-code">{{ reservaAsociada.codigo_reserva }}</span>
              </div>
              <q-btn flat round dense icon="close" color="negative" size="xs" @click="quitarReserva" />
            </div>
            <q-btn
              v-else
              flat dense icon="link" label="Asociar a reserva"
              color="grey-5" class="link-btn"
              @click="buscarReservaOpen = true"
            />
          </div>

          <!-- Items del carrito -->
          <div class="cart-items">
            <div v-if="!carrito.length" class="empty-cart">
              <q-icon name="shopping_cart" size="32px" color="grey-7" />
              <span>El carrito está vacío</span>
              <span class="empty-cart-hint">Hacé click en un producto para agregarlo</span>
            </div>

            <div v-for="item in carrito" :key="item.id" class="cart-item">
              <div class="ci-name">{{ item.nombre }}</div>
              <div class="ci-controls">
                <q-btn flat round dense icon="remove" size="xs" color="negative"
                  @click="decrementarItem(item)" />
                <span class="ci-qty">{{ item.cantidad }}</span>
                <q-btn flat round dense icon="add" size="xs" color="positive"
                  @click="incrementarItem(item)" />
              </div>
              <div class="ci-subtotal">${{ Number(item.precio * item.cantidad).toLocaleString('es-AR') }}</div>
              <q-btn flat round dense icon="delete" size="xs" color="negative"
                @click="quitarDelCarrito(item)" />
            </div>
          </div>

          <!-- Total y acción -->
          <div class="cart-footer">
            <div class="total-row">
              <span class="total-label">Total</span>
              <span class="total-value">${{ totalCarrito.toLocaleString('es-AR') }}</span>
            </div>
            <q-btn
              unelevated label="Crear Venta" icon="point_of_sale" color="positive"
              class="crear-venta-btn"
              :loading="saving"
              :disable="!carrito.length"
              @click="crearVenta"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog buscar reserva -->
    <BuscarReservaDialog
      v-model="buscarReservaOpen"
      :sucursal-id="sucursalId"
      @selected="onReservaSeleccionada"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BuscarReservaDialog from './components/BuscarReservaDialog.vue'
import { useTienda } from 'src/composables/useTienda'
import { getSucursales } from 'src/services/sucursalService'

const { productos, loading, saving, fetchProductos, guardarVenta } = useTienda()

const sucursalId = ref(null)
const sucursales = ref([])
const busqueda = ref('')
const carrito = ref([])
const reservaAsociada = ref(null)
const buscarReservaOpen = ref(false)

const productosFiltrados = computed(() => {
  if (!busqueda.value) return productos.value
  const q = busqueda.value.toLowerCase()
  return productos.value.filter(
    (p) => p.nombre?.toLowerCase().includes(q) || p.codigo_barras?.toLowerCase().includes(q)
  )
})

const totalCarrito = computed(() =>
  carrito.value.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
)

function onSucursalChange() {
  carrito.value = []
  reservaAsociada.value = null
  fetchProductos()
}

function agregarAlCarrito(prod) {
  const existing = carrito.value.find((i) => i.id === prod.id)
  if (existing) {
    existing.cantidad++
  } else {
    carrito.value.push({ ...prod, cantidad: 1 })
  }
}

function incrementarItem(item) { item.cantidad++ }

function decrementarItem(item) {
  if (item.cantidad <= 1) {
    quitarDelCarrito(item)
  } else {
    item.cantidad--
  }
}

function quitarDelCarrito(item) {
  carrito.value = carrito.value.filter((i) => i.id !== item.id)
}

function onReservaSeleccionada(reserva) {
  reservaAsociada.value = reserva
}

function quitarReserva() {
  reservaAsociada.value = null
}

async function crearVenta() {
  if (!carrito.value.length) return
  const payload = {
    sucursal_id: sucursalId.value,
    reserva_id: reservaAsociada.value?.id ?? null,
    productos: carrito.value.map((item) => ({
      producto_id: item.id,
      cantidad: item.cantidad,
    })),
  }
  try {
    await guardarVenta(payload)
    carrito.value = []
    reservaAsociada.value = null
  } catch {}
}

onMounted(async () => {
  sucursales.value = await getSucursales()
})
</script>

<style lang="scss" scoped>
@import 'src/css/module-page.scss';

.filters-bar {
  display: flex; align-items: flex-end; gap: 16px; margin-bottom: 28px; flex-wrap: wrap;
}
.filter-group { display: flex; flex-direction: column; gap: 6px; }
.filter-label {
  font-size: 0.75rem; font-weight: 600; color: $text-muted;
  text-transform: uppercase; letter-spacing: 0.06em;
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
  gap: 16px; padding: 80px 20px; color: $text-muted; font-size: 0.9rem;
}

/* ── Layout principal ── */
.tienda-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

/* ── Paneles ── */
.catalog-panel, .cart-panel {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  overflow: hidden;
}

.panel-header {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 18px 20px;
  background: rgba(0,0,0,0.2);
  border-bottom: 1px solid $border-color;
}
.panel-title {
  font-size: 0.95rem; font-weight: 700; color: $text-primary;
}
.catalog-search {
  width: 200px;
  :deep(.q-field__control) {
    background: rgba(255,255,255,0.04) !important;
    border-radius: 10px; border: 1px solid $border-color;
    &:before { border: none !important; }
  }
}

/* ── Grilla de productos ── */
.products-grid {
  padding: 12px;
  display: flex; flex-direction: column; gap: 6px;
  max-height: calc(100vh - 320px);
  overflow-y: auto;
}
.empty-catalog {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; padding: 40px; color: $text-muted; font-size: 0.85rem;
}

.product-card {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(251,146,60,0.07);
    border-color: rgba(251,146,60,0.25);
    transform: translateX(3px);
  }
}
.prod-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(251,146,60,0.1);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.prod-info { flex: 1; min-width: 0; }
.prod-name {
  font-size: 0.88rem; font-weight: 600; color: $text-primary;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.prod-code { font-size: 0.72rem; color: $text-muted; }
.prod-price { font-size: 0.9rem; font-weight: 700; color: $text-primary; white-space: nowrap; }

/* ── Carrito ── */
.reserva-section { padding: 12px 16px; border-bottom: 1px solid $border-color; }
.reserva-badge {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 12px;
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.25);
}
.reserva-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.reserva-name { font-size: 0.85rem; font-weight: 600; color: $text-primary; }
.reserva-code { font-size: 0.72rem; color: $text-muted; font-family: monospace; }
.link-btn {
  width: 100%; border-radius: 10px;
  border: 1px dashed rgba(255,255,255,0.15);
  font-size: 0.83rem;
}

.cart-items {
  padding: 12px 16px;
  min-height: 200px;
  max-height: calc(100vh - 440px);
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 8px;
}
.empty-cart {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; padding: 40px 20px; color: $text-muted; font-size: 0.85rem;
  text-align: center;
}
.empty-cart-hint { font-size: 0.75rem; color: rgba(255,255,255,0.2); }

.cart-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid $border-color;
}
.ci-name { flex: 1; font-size: 0.83rem; font-weight: 600; color: $text-primary; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ci-controls { display: flex; align-items: center; gap: 4px; }
.ci-qty { font-size: 0.9rem; font-weight: 700; color: $text-primary; min-width: 20px; text-align: center; }
.ci-subtotal { font-size: 0.83rem; font-weight: 700; color: $text-primary; white-space: nowrap; }

.cart-footer {
  padding: 16px;
  border-top: 1px solid $border-color;
  display: flex; flex-direction: column; gap: 12px;
}
.total-row {
  display: flex; justify-content: space-between; align-items: center;
}
.total-label { font-size: 0.85rem; color: $text-muted; font-weight: 600; }
.total-value { font-size: 1.4rem; font-weight: 800; color: $text-primary; }
.crear-venta-btn { width: 100%; border-radius: 12px; padding: 12px; font-weight: 700; font-size: 1rem; }
</style>
