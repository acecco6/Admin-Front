<template>
  <q-page class="module-page">
    <div class="page-container">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border-color: rgba(99,102,241,0.3);">
              <q-icon name="category" class="header-icon" style="color: #6366f1" />
            </div>
            <div>
              <h1 class="page-title">Tipos de Cancha</h1>
              <p class="page-subtitle">Administrá los tipos de cancha disponibles en el sistema.</p>
            </div>
          </div>
          <div class="action-section">
            <q-input v-model="filter" dark outlined dense placeholder="Buscar..." class="search-input">
              <template v-slot:prepend><q-icon name="search" color="primary" /></template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
            <q-btn color="primary" icon="add" label="Nuevo Tipo" unelevated class="add-btn" @click="openDialog()" />
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-container">
        <q-table
          :rows="tipoCanchas" :columns="columns" row-key="id"
          :filter="filter" :loading="loading"
          dark flat class="custom-table"
          :pagination="{ rowsPerPage: 12 }"
        >
          <!-- Nombre -->
          <template v-slot:body-cell-nombre="props">
            <q-td :props="props">
              <div class="row items-center gap-sm">
                <div>
                  <div class="row-name">{{ props.row.nombre }}</div>
                  <div class="row-sub">ID #{{ props.row.id }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Duracion -->
          <template v-slot:body-cell-duracion_minima_minutos="props">
            <q-td :props="props">
              <q-chip dense color="info" text-color="white" size="md" icon="timer" class="info-chip">
                {{ props.row.duracion_minima_minutos }} min
              </q-chip>
            </q-td>
          </template>

          <!-- Intervalo -->
          <template v-slot:body-cell-intervalo_minutos="props">
            <q-td :props="props">
              <q-chip dense color="secondary" text-color="white" size="md" icon="schedule" class="info-chip">
                {{ props.row.intervalo_minutos }} min
              </q-chip>
            </q-td>
          </template>

          <!-- Acciones -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-right">
              <div class="action-buttons">
                <q-btn flat round dense color="accent" icon="edit" class="action-btn edit-btn" @click="openDialog(props.row)">
                  <q-tooltip class="bg-accent">Editar</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="negative" icon="delete_outline" class="action-btn delete-btn" @click="eliminarTipoCancha(props.row)">
                  <q-tooltip class="bg-negative">Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- Empty state -->
          <template v-slot:no-data>
            <div class="empty-state">
              <div class="empty-icon"><q-icon name="category" size="48px" /></div>
              <h3 class="empty-title">Sin tipos de cancha</h3>
              <p class="empty-text">Todavía no hay tipos registrados.</p>
              <q-btn v-if="!filter" color="primary" outline icon="add" label="Crear primer tipo" @click="openDialog()" />
            </div>
          </template>
        </q-table>
      </div>
    </div>

    <!-- Dialog -->
    <TipoCanchaFormDialog
      v-model="dialogOpen"
      :tipo="selectedRow"
      :saving="saving"
      @save="onSave"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TipoCanchaFormDialog from './components/TipoCanchaFormDialog.vue'
import { useTipoCanchas } from 'src/composables/useTipoCanchas'

const { tipoCanchas, loading, saving, fetchTipoCanchas, saveTipoCancha, eliminarTipoCancha } = useTipoCanchas()

const filter = ref('')
const dialogOpen = ref(false)
const selectedRow = ref(null)

const columns = [
  { name: 'nombre', label: 'TIPO', align: 'left', field: 'nombre', sortable: true },
  { name: 'duracion_minima_minutos', label: 'DURACIÓN MÍN.', align: 'left', field: 'duracion_minima_minutos', sortable: true },
  { name: 'intervalo_minutos', label: 'INTERVALO', align: 'left', field: 'intervalo_minutos', sortable: true },
  { name: 'acciones', label: 'ACCIONES', align: 'right', field: 'acciones' },
]

const GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #10b981, #059669)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #ef4444, #dc2626)',
  'linear-gradient(135deg, #38bdf8, #0284c7)',
]
const getGradient = (id) => GRADIENTS[id % GRADIENTS.length]

function openDialog(row = null) {
  selectedRow.value = row ? { ...row } : null
  dialogOpen.value = true
}

async function onSave(payload) {
  try {
    await saveTipoCancha(payload)
    dialogOpen.value = false
  } catch {
  }
}

onMounted(fetchTipoCanchas)
</script>

<style lang="scss" scoped>
@import 'src/css/module-page.scss';

.tipo-avatar {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.info-chip {
  font-weight: 600;
  border-radius: 8px;
  padding-top: 16px; 
  padding-bottom: 16px; 
}
</style>
