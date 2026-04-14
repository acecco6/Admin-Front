<template>
  <q-page class="profesiones-page">
    <div class="page-container">
      
      <!-- HEADER DE LA PÁGINA -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper">
              <q-icon name="work" class="header-icon" />
            </div>
            <div>
              <h1 class="page-title">Profesiones</h1>
              <p class="page-subtitle">Gestiona las diferentes especialidades de los profesionales.</p>
            </div>
          </div>
          
          <div class="action-section">
            <q-input
              v-model="filter"
              dark
              outlined
              dense
              placeholder="Buscar profesión..."
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>

            <q-btn
              color="primary"
              icon="add"
              label="Nueva Profesión"
              unelevated
              class="add-btn"
              @click="openDialog()"
            />
          </div>
        </div>
      </div>

      <!-- TABLA DE DATOS -->
      <div class="table-container">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          :filter="filter"
          :loading="loading"
          dark
          flat
          class="custom-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <!-- Slots personalizados para el renderizado -->
          
          <!-- Nombre principal -->
          <template v-slot:body-cell-nombre="props">
            <q-td :props="props" class="col-nombre">
              <div class="row items-center gap-sm">
                <q-avatar size="32px" :color="getAvatarColor(props.row.id)" text-color="white" class="profesion-avatar">
                  {{ props.row.nombre.charAt(0).toUpperCase() }}
                </q-avatar>
                <div class="profesion-info">
                  <span class="profesion-name">{{ props.row.nombre }}</span>
                  <span class="profesion-id">ID: #{{ props.row.id }}</span>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Estado (Badges) -->
          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.activo ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
                class="status-chip"
                icon="circle"
              >
                {{ props.row.activo ? 'Activo' : 'Inactivo' }}
              </q-chip>
            </q-td>
          </template>

          <!-- Acciones -->
          <template v-slot:body-cell-acciones="props">
            <q-td :props="props" class="text-right">
              <div class="action-buttons">
                <q-btn
                  flat
                  round
                  dense
                  color="accent"
                  icon="edit"
                  class="action-btn edit-btn"
                  @click="openDialog(props.row)"
                >
                  <q-tooltip class="bg-accent">Editar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete_outline"
                  class="action-btn delete-btn"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip class="bg-negative">Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
          
          <!-- Estado vacío -->
          <template v-slot:no-data>
            <div class="empty-state">
              <div class="empty-icon">
                <q-icon name="work_off" size="48px" />
              </div>
              <h3 class="empty-title">No hay profesiones</h3>
              <p class="empty-text">Aún no has registrado ninguna profesión o tu búsqueda no dio resultados.</p>
              <q-btn
                v-if="!filter"
                color="primary"
                outline
                icon="add"
                label="Crear primera profesión"
                class="mt-md"
                @click="openDialog()"
              />
            </div>
          </template>
        </q-table>
      </div>

    </div>

    <!-- DIALOG COMPONENT -->
    <ProfesionFormDialog 
      v-model="dialogOpen"
      :profesion="selectedRow"
      @save="onSaveProfesion"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import ProfesionFormDialog from 'components/profesiones/ProfesionFormDialog.vue'

const $q = useQuasar()

// Estado
const filter = ref('')
const loading = ref(false)
const dialogOpen = ref(false)
const selectedRow = ref(null)
const rows = ref([])

// Columnas de la tabla
const columns = [
  { name: 'nombre', label: 'PROFESIÓN', align: 'left', field: 'nombre', sortable: true },
  { name: 'descripcion', label: 'DESCRIPCIÓN', align: 'left', field: 'descripcion', sortable: true, style: 'max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;' },
  { name: 'activo', label: 'ESTADO', align: 'center', field: 'activo', sortable: true },
  { name: 'acciones', label: 'ACCIONES', align: 'right', field: 'acciones' }
]

// Mock data inicial (idealmente esto viene de tu API via axios)
const loadData = async () => {
  loading.value = true
  
  // Simular request a la API
  setTimeout(() => {
    rows.value = [
      { id: 1, nombre: 'Médico Clínico', descripcion: 'Atención primaria y general integral de pacientes adultos.', activo: true },
      { id: 2, nombre: 'Odontólogo', descripcion: 'Tratamiento y prevención de enfermedades bucodentales.', activo: true },
      { id: 3, nombre: 'Kinesiólogo', descripcion: 'Rehabilitación y terapia física enfocada a la recuperación muscular.', activo: false },
      { id: 4, nombre: 'Psicólogo', descripcion: 'Atención de salud mental y apoyo emocional.', activo: true },
    ]
    loading.value = false
  }, 600)
}

onMounted(() => {
  loadData()
})

// Control de Dialog
const openDialog = (row = null) => {
  selectedRow.value = row ? { ...row } : null
  dialogOpen.value = true
}

const onSaveProfesion = (profesionData) => {
  if (profesionData.id) {
    // Editar existente
    const index = rows.value.findIndex(r => r.id === profesionData.id)
    if (index !== -1) {
      rows.value[index] = profesionData
      
      $q.notify({
        type: 'positive',
        message: 'Profesión actualizada con éxito',
        icon: 'check_circle'
      })
    }
  } else {
    // Crear nueva
    const newId = rows.value.length ? Math.max(...rows.value.map(r => r.id)) + 1 : 1
    rows.value.unshift({ ...profesionData, id: newId })
    
    $q.notify({
      type: 'positive',
      message: 'Profesión creada con éxito',
      icon: 'add_task'
    })
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que deseas eliminar la profesión de "${row.nombre}"? Esta acción no se puede deshacer.`,
    persistent: true,
    dark: true,
    color: 'negative',
    ok: {
      label: 'Eliminar',
      push: true,
      color: 'negative'
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'white'
    }
  }).onOk(() => {
    // Borrar elemento
    rows.value = rows.value.filter(r => r.id !== row.id)
    $q.notify({
      type: 'info',
      message: 'Profesión eliminada',
      icon: 'delete',
      color: 'negative'
    })
  })
}

// Helper para colores
const colors = ['primary', 'secondary', 'accent', 'info', 'warning']
const getAvatarColor = (id) => {
  return colors[id % colors.length]
}
</script>

<style lang="scss" scoped>
.profesiones-page {
  padding: 0 32px 32px 32px; /* Top 0 para alinear geométricamente con el sidebar */
  background: $bg-deep;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 0 16px 16px 16px;
  }
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* ════════════ HEADER PAGE ════════════ */
.page-header {
  min-height: 90px; /* Igual que el sidebar .brand-zone, pero dinámico */
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  flex-wrap: wrap; /* CRÍTICO PARA RESPONSIVO Y ANIMACIÓN */
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .icon-wrapper {
    background: linear-gradient(135deg, rgba($primary, 0.2), rgba($secondary, 0.2));
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba($primary, 0.3);
    box-shadow: 0 4px 20px rgba($primary, 0.15);
    
    .header-icon {
      font-size: 28px;
      color: $primary;
    }
  }

  .page-title {
    margin: 0 0 4px 0;
    font-size: 2rem;
    font-weight: 800;
    color: $text-primary;
    letter-spacing: -1px;
    line-height: 1;
  }
  
  .page-subtitle {
    margin: 0;
    color: $text-muted;
    font-size: 0.95rem;
  }
}

.action-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  
  .search-input {
    width: 250px;
    
    :deep(.q-field__control) {
      background: $bg-card !important;
      border-radius: 12px;
      border: 1px solid $border-color;
      
      &:before { border: none !important; }
      
      &:hover {
        border-color: rgba($primary, 0.5);
      }
    }
    :deep(.q-field--focused .q-field__control) {
      box-shadow: 0 0 0 2px rgba($primary, 0.2);
      border-color: $primary;
    }
  }
  
  .add-btn {
    border-radius: 12px;
    padding: 10px 24px;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: 0 4px 15px rgba($primary, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba($primary, 0.4);
    }
  }
}

/* ════════════ TABLE MODERN ════════════ */
.table-container {
  background: $bg-card;
  border-radius: 20px;
  border: 1px solid $border-color;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.custom-table {
  background: transparent;
  
  /* Cabecera de la tabla */
  :deep(thead tr th) {
    background: rgba(0, 0, 0, 0.2) !important;
    color: $text-secondary;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 16px 24px;
    border-bottom: 2px solid $border-color;
  }

  /* Filas */
  :deep(tbody tr) {
    transition: all 0.2s ease;
    border-bottom-color: rgba(255,255,255,0.03);
    
    &:hover {
      background: $bg-hover !important;
    }
  }

  /* Celdas */
  :deep(tbody td) {
    padding: 16px 24px;
    font-size: 0.9rem;
    color: $text-primary;
    border-bottom-color: $border-color;
  }
  
  /* Quitar sombras de paginador quasar */
  :deep(.q-table__bottom) {
    border-top: 1px solid $border-color;
    background: rgba(0, 0, 0, 0.1);
  }
}

/* Datos de la columna Nombre */
.col-nombre {
  .profesion-info {
    display: flex;
    flex-direction: column;
  }
  .profesion-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: $text-primary;
  }
  .profesion-id {
    font-size: 0.7rem;
    color: $text-muted;
    font-weight: 500;
  }
}

.profesion-avatar {
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* Chips / Badges */
.status-chip {
  font-weight: 600;
  border-radius: 8px;
  padding: 4px 10px;
  
  :deep(.q-icon) {
    font-size: 10px;
    margin-right: 4px;
  }
}

/* Botones de acción incrustados */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-btn {
  background: rgba(255,255,255,0.03);
  transition: all 0.2s ease;
  
  &.edit-btn:hover {
    background: rgba($accent, 0.15);
    color: $accent !important;
    transform: scale(1.1);
  }
  
  &.delete-btn:hover {
    background: rgba($negative, 0.15);
    color: $negative !important;
    transform: scale(1.1) rotate(5deg);
  }
}

/* ════════════ EMPTY STATE ════════════ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  width: 100%;
  
  .empty-icon {
    width: 80px;
    height: 80px;
    background: rgba(255,255,255,0.03);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    color: $text-muted;
  }
  
  .empty-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: $text-primary;
    margin: 0 0 8px 0;
  }
  
  .empty-text {
    color: $text-muted;
    max-width: 400px;
    margin: 0 0 24px 0;
    line-height: 1.5;
  }
}

.mt-md {
  margin-top: 16px;
}
</style>
