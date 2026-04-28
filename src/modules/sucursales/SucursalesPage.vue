<template>
  <q-page class="module-page">
    <div class="page-container">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2)); border-color: rgba(16,185,129,0.3);">
              <q-icon name="store" class="header-icon" style="color: #10b981" />
            </div>
            <div>
              <h1 class="page-title">Sucursales</h1>
              <p class="page-subtitle">Gestioná las sucursales y sus canchas.</p>
            </div>
          </div>
          <div class="action-section">
            <q-input v-model="filter" dark outlined dense placeholder="Buscar..." class="search-input">
              <template v-slot:prepend><q-icon name="search" color="primary" /></template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
            <q-btn color="primary" icon="add" label="Nueva Sucursal" unelevated class="add-btn" @click="openDialog()" />
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
          dark flat class="custom-table"
          :pagination="{ rowsPerPage: 10 }"
          @row-click="(_, row) => openDetail(row)"
        >
          <!-- Nombre -->
          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <div class="row items-center gap-sm" style="gap:12px">
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
                {{ props.row.hora_apertura?.slice(0,5) }} — {{ props.row.hora_cierre?.slice(0,5) }}
              </div>
            </q-td>
          </template>

          <!-- Estado -->
          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.estado === 'A' ? 'positive' : 'negative'"
                text-color="white" size="sm" icon="circle" class="status-chip"
              >
                {{ props.row.estado === 'A' ? 'Activa' : 'Inactiva' }}
              </q-chip>
            </q-td>
          </template>

          <!-- Acciones -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-right" @click.stop>
              <div class="action-buttons">
                <q-btn flat round dense color="info" icon="open_in_new" class="action-btn view-btn" @click="openDetail(props.row)">
                  <q-tooltip>Ver Canchas</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="accent" icon="edit" class="action-btn edit-btn" @click="openDialog(props.row)">
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>
                <q-btn flat round dense class="action-btn toggle-btn"
                  :icon="props.row.estado === 'A' ? 'toggle_on' : 'toggle_off'"
                  :color="props.row.estado === 'A' ? 'positive' : 'grey'"
                  @click="cambiarEstado(props.row)"
                >
                  <q-tooltip>{{ props.row.estado === 'A' ? 'Desactivar' : 'Activar' }}</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="negative" icon="delete_outline" class="action-btn delete-btn" @click="eliminarSucursal(props.row)">
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
              <q-btn v-if="!filter" color="primary" outline icon="add" label="Crear primera sucursal" @click="openDialog()" />
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
    <q-dialog v-model="detailOpen" maximized>
      <q-card class="detail-card">
        <div class="detail-header">
          <div class="detail-title-group">
            <div class="detail-avatar">{{ detailSucursal?.nombre?.charAt(0) }}</div>
            <div>
              <h2 class="detail-title">{{ detailSucursal?.nombre }}</h2>
              <p class="detail-addr">{{ detailSucursal?.direccion }}</p>
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:center">
            <q-btn unelevated color="positive" icon="add" label="Agregar Cancha" size="sm"
              class="detail-add-btn"
              @click="openCanchaDialog()"
            />
            <q-btn flat round dense icon="close" color="grey-5" @click="detailOpen = false" />
          </div>
        </div>

        <q-separator color="white" style="opacity:0.05" />

        <q-card-section class="detail-body" v-if="detailSucursal">
          <!-- Info row -->
          <div class="detail-info-row">
            <div class="detail-info-item">
              <q-icon name="schedule" color="primary" size="16px" />
              <span>{{ detailSucursal.hora_apertura?.slice(0,5) }} — {{ detailSucursal.hora_cierre?.slice(0,5) }}</span>
            </div>
            <div class="detail-info-item">
              <q-icon name="circle" :color="detailSucursal.estado === 'A' ? 'positive' : 'negative'" size="12px" />
              <span>{{ detailSucursal.estado === 'A' ? 'Activa' : 'Inactiva' }}</span>
            </div>
          </div>

          <CanchasTab
            :canchas="canchasDeSucursal(detailSucursal.id)"
            :loading="loadingCanchas"
            @addCancha="openCanchaDialog()"
            @editCancha="openCanchaDialog"
            @toggleCancha="cambiarEstadoCancha"
            @deleteCancha="eliminarCancha"
          />
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

const { sucursales, loading, saving, fetchSucursales, saveSucursal, cambiarEstado, eliminarSucursal } = useSucursales()
const { fetchCanchas, canchasDeSucursal, saveCancha, cambiarEstadoCancha, eliminarCancha, loading: loadingCanchas, saving: savingCancha } = useCanchas()

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
  return sucursales.value.filter(s =>
    s.nombre.toLowerCase().includes(q) || s.direccion.toLowerCase().includes(q)
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
    getTipoCanchas().then(d => { tipoCanchasData.value = d }),
  ])
})
</script>

<style lang="scss" scoped>
@import 'src/css/module-page.scss';

.suc-avatar {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, $primary, $secondary);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; font-weight: 800; color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba($primary, 0.3);
}

.horario-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.83rem; color: $text-secondary;
  background: rgba(255,255,255,0.04);
  border: 1px solid $border-color;
  border-radius: 8px; padding: 3px 10px;
}

.status-chip { font-weight: 600; border-radius: 8px; }

/* ─── DETAIL DIALOG ─── */
.detail-card {
  background: $bg-deep;
  display: flex; flex-direction: column;
}

.detail-header {
  background: $bg-sidebar;
  padding: 24px 32px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 20px;
}

.detail-title-group {
  display: flex; align-items: center; gap: 16px;
}

.detail-avatar {
  width: 52px; height: 52px; border-radius: 14px;
  background: linear-gradient(135deg, $primary, $secondary);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 800; color: white;
  box-shadow: 0 4px 16px rgba($primary, 0.35);
}

.detail-title {
  margin: 0 0 2px; font-size: 1.3rem; font-weight: 700; color: $text-primary;
}

.detail-addr { margin: 0; font-size: 0.85rem; color: $text-muted; }

.detail-add-btn {
  border-radius: 10px; font-weight: 600;
  box-shadow: 0 4px 12px rgba($positive, 0.3);
}

.detail-body {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  background: $bg-deep;
}

.detail-info-row {
  display: flex; align-items: center; gap: 20px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: $bg-card;
  border-radius: 12px;
  border: 1px solid $border-color;
}

.detail-info-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.85rem; color: $text-secondary;
}
</style>
