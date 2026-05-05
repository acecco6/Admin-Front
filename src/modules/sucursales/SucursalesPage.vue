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
              <q-icon name="store" class="header-icon" style="color: #10b981" />
            </div>
            <div>
              <h1 class="page-title">Sucursales</h1>
              <p class="page-subtitle">Gestioná las sucursales y sus canchas.</p>
            </div>
          </div>
          <div class="action-section">
            <q-input
              v-model="filter"
              dark
              outlined
              dense
              placeholder="Buscar..."
              class="search-input"
            >
              <template v-slot:prepend><q-icon name="search" color="primary" /></template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
            <q-btn
              color="primary"
              icon="add"
              label="Nueva Sucursal"
              unelevated
              class="add-btn"
              @click="openDialog()"
            />
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-container">
        <q-table
          :rows="filteredSucursales"
          :columns="columns"
          row-key="id"
          :loading="loading"
          dark
          flat
          class="custom-table"
          :pagination="{ rowsPerPage: 10 }"
          @row-click="(_, row) => openDetail(row)"
        >
          <!-- Nombre -->
          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <div class="row items-center gap-sm" style="gap: 12px">
                <div>
                  <div class="row-name">{{ props.row.nombre }}</div>
                  <div class="row-sub">{{ props.row.direccion }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Horario -->
          <template v-slot:body-cell-horario="props">
            <q-td :props="props">
              <div class="horario-badge">
                <q-icon name="schedule" size="14px" />
                {{ props.row.hora_apertura?.slice(0, 5) }} —
                {{ props.row.hora_cierre?.slice(0, 5) }}
              </div>
            </q-td>
          </template>

          <!-- Estado -->
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.estado === 'A' ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
                icon="circle"
                class="status-chip"
              >
                {{ props.row.estado === 'A' ? 'Activa' : 'Inactiva' }}
              </q-chip>
            </q-td>
          </template>

          <!-- Acciones -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-right" @click.stop>
              <div class="action-buttons">
                <q-btn
                  flat
                  round
                  dense
                  color="info"
                  icon="open_in_new"
                  class="action-btn view-btn"
                  @click="openDetail(props.row)"
                >
                  <q-tooltip>Ver Canchas</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="accent"
                  icon="edit"
                  class="action-btn edit-btn"
                  @click="openDialog(props.row)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  class="action-btn toggle-btn"
                  :icon="props.row.estado === 'A' ? 'toggle_on' : 'toggle_off'"
                  :color="props.row.estado === 'A' ? 'positive' : 'grey'"
                  @click="cambiarEstado(props.row)"
                >
                  <q-tooltip>{{ props.row.estado === 'A' ? 'Desactivar' : 'Activar' }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete_outline"
                  class="action-btn delete-btn"
                  @click="eliminarSucursal(props.row)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="empty-state">
              <div class="empty-icon"><q-icon name="store_mall_directory" size="48px" /></div>
              <h3 class="empty-title">Sin sucursales</h3>
              <p class="empty-text">Todavía no hay sucursales registradas.</p>
              <q-btn
                v-if="!filter"
                color="primary"
                outline
                icon="add"
                label="Crear primera sucursal"
                @click="openDialog()"
              />
            </div>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Sucursal Form Dialog -->
    <SucursalFormDialog
      v-model="dialogOpen"
      :sucursal="selectedSucursal"
      :saving="saving"
      @save="onSaveSucursal"
    />

    <!-- Sucursal Detail (con canchas) -->
    <q-dialog v-model="detailOpen" transition-show="scale" transition-hide="scale" backdrop-filter="blur(5px)">
      <q-card class="detail-card premium-modal">
        <!-- Banner Background -->
        <div class="detail-banner"></div>
        
        <div class="detail-header">
          <div class="detail-title-group">
            <div class="detail-avatar-wrapper">
              <div class="detail-avatar">{{ detailSucursal?.nombre?.charAt(0) }}</div>
              <div class="status-indicator" :class="detailSucursal?.estado === 'A' ? 'active' : 'inactive'"></div>
            </div>
            <div class="detail-text-content">
              <h2 class="detail-title">{{ detailSucursal?.nombre }}</h2>
              <div class="detail-subtitle">
                <q-icon name="location_on" size="16px" class="q-mr-xs" />
                {{ detailSucursal?.direccion }}
              </div>
            </div>
          </div>
          <div class="detail-header-actions">
            <q-btn
              unelevated
              color="positive"
              icon="add_circle"
              label="Nueva Cancha"
              class="btn-premium"
              @click="openCanchaDialog()"
            />
            <q-btn flat round dense icon="close" class="close-btn" @click="detailOpen = false" />
          </div>
        </div>

        <q-card-section class="detail-body" v-if="detailSucursal">
          <!-- Stats / Info Row -->
          <div class="stats-container">
             <div class="stat-box">
                <div class="stat-icon"><q-icon name="schedule" /></div>
                <div class="stat-content">
                  <div class="stat-label">Horario de Atención</div>
                  <div class="stat-value">
                    {{ detailSucursal.hora_apertura?.slice(0, 5) }} — {{ detailSucursal.hora_cierre?.slice(0, 5) }}
                  </div>
                </div>
             </div>
             <div class="stat-box">
                <div class="stat-icon"><q-icon name="sports_tennis" /></div>
                <div class="stat-content">
                  <div class="stat-label">Total Canchas</div>
                  <div class="stat-value">
                    {{ canchasDeSucursal(detailSucursal.id).length }}
                  </div>
                </div>
             </div>
             <div class="stat-box">
                <div class="stat-icon"><q-icon name="info" /></div>
                <div class="stat-content">
                  <div class="stat-label">Estado</div>
                  <div class="stat-value" :class="detailSucursal.estado === 'A' ? 'text-positive' : 'text-negative'">
                    {{ detailSucursal.estado === 'A' ? 'Operativa' : 'Inactiva' }}
                  </div>
                </div>
             </div>
          </div>

          <div class="canchas-section">
            <h3 class="section-title">Canchas Disponibles</h3>
            <CanchasTab
              :canchas="canchasDeSucursal(detailSucursal.id)"
              :loading="loadingCanchas"
              @addCancha="openCanchaDialog()"
              @editCancha="openCanchaDialog"
              @toggleCancha="cambiarEstadoCancha"
              @deleteCancha="eliminarCancha"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Cancha Form Dialog -->
    <CanchaFormDialog
      v-model="canchaDialogOpen"
      :cancha="selectedCancha"
      :sucursal-id="detailSucursal?.id"
      :sucursal-nombre="detailSucursal?.nombre"
      :tipo-canchas="tipoCanchasData"
      :saving="savingCancha"
      @save="onSaveCancha"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import SucursalFormDialog from './components/SucursalFormDialog.vue'
import CanchaFormDialog from './components/CanchaFormDialog.vue'
import CanchasTab from './components/CanchasTab.vue'
import { useSucursales } from 'src/composables/useSucursales'
import { useCanchas } from 'src/composables/useCanchas'
import { getTipoCanchas } from 'src/services/tipoCanchaService'

const {
  sucursales,
  loading,
  saving,
  fetchSucursales,
  saveSucursal,
  cambiarEstado,
  eliminarSucursal,
} = useSucursales()
const {
  fetchCanchas,
  canchasDeSucursal,
  saveCancha,
  cambiarEstadoCancha,
  eliminarCancha,
  loading: loadingCanchas,
  saving: savingCancha,
} = useCanchas()

const filter = ref('')
const dialogOpen = ref(false)
const selectedSucursal = ref(null)

const detailOpen = ref(false)
const detailSucursal = ref(null)

const canchaDialogOpen = ref(false)
const selectedCancha = ref(null)

const tipoCanchasData = ref([])

const filteredSucursales = computed(() => {
  if (!filter.value) return sucursales.value
  const q = filter.value.toLowerCase()
  return sucursales.value.filter(
    (s) => s.nombre.toLowerCase().includes(q) || s.direccion.toLowerCase().includes(q),
  )
})

const columns = [
  { name: 'nombre', label: 'SUCURSAL', align: 'left', field: 'nombre' },
  { name: 'horario', label: 'HORARIO', align: 'left', field: 'hora_apertura' },
  { name: 'estado', label: 'ESTADO', align: 'center', field: 'estado' },
  { name: 'acciones', label: 'ACCIONES', align: 'right', field: 'acciones' },
]

function openDialog(row = null) {
  selectedSucursal.value = row ? { ...row } : null
  dialogOpen.value = true
}

async function onSaveSucursal(payload) {
  try {
    await saveSucursal(payload)
    dialogOpen.value = false
  } catch {}
}

function openDetail(suc) {
  detailSucursal.value = suc
  detailOpen.value = true
}

function openCanchaDialog(cancha = null) {
  selectedCancha.value = cancha ? { ...cancha } : null
  canchaDialogOpen.value = true
}

async function onSaveCancha(payload) {
  try {
    await saveCancha(payload)
    canchaDialogOpen.value = false
  } catch {}
}

onMounted(async () => {
  await Promise.all([
    fetchSucursales(),
    fetchCanchas(),
    getTipoCanchas().then((d) => {
      tipoCanchasData.value = d
    }),
  ])
})
</script>

<style lang="scss" scoped>
@import 'src/css/module-page.scss';

.suc-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, $primary, $secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba($primary, 0.3);
}

.horario-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.83rem;
  color: $text-secondary;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 3px 10px;
}

.status-chip {
  font-weight: 600;
  border-radius: 8px;
}

/* ─── PREMIUM DETAIL DIALOG ─── */
.premium-modal {
  width: 90vw !important;
  max-width: 1100px !important;
  height: 85vh !important;
  max-height: 850px !important;
  border-radius: 20px;
  background: #111827; /* bg-gray-900 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.detail-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(135deg, rgba($primary, 0.15), rgba($secondary, 0.15));
  z-index: 0;
}

.detail-header {
  position: relative;
  z-index: 1;
  padding: 40px 40px 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: linear-gradient(to bottom, transparent, #111827 80%);
}

.detail-title-group {
  display: flex;
  align-items: center;
  gap: 24px;
}

.detail-avatar-wrapper {
  position: relative;
}

.detail-avatar {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, $primary, $secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 800;
  color: white;
  box-shadow: 0 8px 24px rgba($primary, 0.4);
  border: 3px solid #111827;
}

.status-indicator {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid #111827;
  
  &.active {
    background: $positive;
    box-shadow: 0 0 10px rgba($positive, 0.6);
  }
  
  &.inactive {
    background: $negative;
    box-shadow: 0 0 10px rgba($negative, 0.6);
  }
}

.detail-text-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
}

.detail-subtitle {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: $text-secondary;
}

.detail-header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.btn-premium {
  border-radius: 12px;
  font-weight: 700;
  padding: 8px 24px;
  text-transform: none;
  font-size: 0.95rem;
  box-shadow: 0 8px 16px rgba($positive, 0.25);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 20px rgba($positive, 0.35);
  }
}

.close-btn {
  background: rgba(255, 255, 255, 0.05);
  color: $text-secondary;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    transform: rotate(90deg);
  }
}

.detail-body {
  flex: 1;
  padding: 0 40px 40px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba($primary, 0.1);
  color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.85rem;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
}

.canchas-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  position: relative;
  padding-left: 16px;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 24px;
    background: $primary;
    border-radius: 4px;
  }
}

/* Custom Scrollbar */
.detail-body::-webkit-scrollbar {
  width: 8px;
}

.detail-body::-webkit-scrollbar-track {
  background: transparent;
}

.detail-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.detail-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
