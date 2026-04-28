<template>
  <q-dialog v-model="show" persistent>
    <q-card class="buscar-card">
      <div class="card-header">
        <div class="header-icon-wrap">
          <q-icon name="search" size="22px" color="white" />
        </div>
        <div>
          <h2 class="card-title">Buscar Reserva</h2>
          <div class="card-subtitle">Buscá por código, nombre, apellido o documento</div>
        </div>
        <q-btn flat round dense icon="close" color="grey-5" class="close-btn" @click="cerrar" />
      </div>

      <q-separator color="white" style="opacity:0.05" />

      <q-card-section class="card-body">
        <!-- Formulario de búsqueda -->
        <div class="search-form-grid">
          <div class="form-field">
            <label class="field-label">Código de Reserva</label>
            <q-input
              v-model="filters.codigo_reserva"
              dark outlined dense
              placeholder="Ej: QYMO69..."
              class="field-input"
              @keyup.enter="buscar"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Documento</label>
            <q-input
              v-model="filters.documento"
              dark outlined dense
              placeholder="DNI / CUIT"
              class="field-input"
              @keyup.enter="buscar"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Nombre</label>
            <q-input
              v-model="filters.nombre"
              dark outlined dense
              placeholder="Nombre"
              class="field-input"
              @keyup.enter="buscar"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Apellido</label>
            <q-input
              v-model="filters.apellido"
              dark outlined dense
              placeholder="Apellido"
              class="field-input"
              @keyup.enter="buscar"
            />
          </div>

          <div class="form-field">
            <label class="field-label">Hora Inicio</label>
            <q-input
              v-model="filters.hora_inicio"
              dark outlined dense
              placeholder="HH:mm"
              mask="##:##"
              class="field-input"
              @keyup.enter="buscar"
            >
              <template #append>
                <q-icon name="access_time" class="cursor-pointer" />
              </template>
            </q-input>
          </div>

          <div class="form-field flex-end">
            <q-btn
              unelevated label="Buscar" icon="search" color="primary"
              class="buscar-btn"
              :loading="buscando"
              @click="buscar"
            />
          </div>
        </div>

        <div v-if="errorMsg" class="error-msg">
          <q-icon name="error_outline" size="18px" />
          {{ errorMsg }}
        </div>

        <!-- Resultados -->
        <div v-if="reservas.length > 0" class="resultados-section">
          <div class="section-label">Reservas Encontradas ({{ reservas.length }})</div>
          <div class="resultados-list scroll">
            <div
              v-for="res in reservas"
              :key="res.id"
              class="reserva-item"
              :class="{ selected: selectedReserva?.id === res.id }"
              @click="seleccionar(res)"
            >
              <div class="ri-main">
                <div class="ri-client">{{ res.nombre }} {{ res.apellido }}</div>
                <div class="ri-code">{{ res.codigo_reserva }}</div>
              </div>
              <div class="ri-details">
                <div class="ri-time">
                  <q-icon name="schedule" size="14px" />
                  {{ res.hora_inicio }} — {{ res.hora_fin }}
                </div>
                <div class="ri-doc">
                  <q-icon name="badge" size="14px" />
                  {{ res.documento || 'Sin doc.' }}
                </div>
              </div>
              <q-icon v-if="selectedReserva?.id === res.id" name="check_circle" color="positive" size="20px" />
            </div>
          </div>
        </div>

        <div v-else-if="buscado && !buscando" class="no-results">
          No se encontraron reservas con los criterios ingresados.
        </div>
      </q-card-section>

      <q-separator color="white" style="opacity:0.05" />

      <q-card-actions class="card-footer">
        <q-btn flat label="Cancelar" color="grey-5" @click="cerrar" />
        <q-btn
          unelevated label="Asociar seleccionada" icon="link" color="positive"
          class="confirm-btn"
          :disable="!selectedReserva"
          @click="confirmar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { api } from 'src/services/http/api'

const props = defineProps({
  modelValue: Boolean,
  sucursalId: [Number, String]
})
const emit = defineEmits(['update:modelValue', 'selected'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const filters = reactive({
  codigo_reserva: '',
  nombre: '',
  apellido: '',
  documento: '',
  hora_inicio: ''
})

const buscando = ref(false)
const buscado = ref(false)
const reservas = ref([])
const selectedReserva = ref(null)
const errorMsg = ref('')

async function buscar() {
  if (!props.sucursalId) {
    errorMsg.value = 'Por favor selecciona una sucursal primero.'
    return
  }

  buscando.value = true
  buscado.value = true
  errorMsg.value = ''
  reservas.value = []
  selectedReserva.value = null

  try {
    const params = {
      ...filters,
      sucursal_id: props.sucursalId
    }

    // Limpiar campos vacíos
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })

    const r = await api.get('/api/reservas/ventas/search', { params })
    reservas.value = r.data.data
    
    if (reservas.value.length === 0) {
      errorMsg.value = 'No se encontraron reservas.'
    }
  } catch (e) {
    errorMsg.value = e.response?.data?.message || 'Error al buscar reservas.'
  } finally {
    buscando.value = false
  }
}

function seleccionar(res) {
  selectedReserva.value = res
}

function confirmar() {
  if (!selectedReserva.value) return
  emit('selected', selectedReserva.value)
  cerrar()
}

function cerrar() {
  show.value = false
  Object.keys(filters).forEach(k => filters[k] = '')
  reservas.value = []
  selectedReserva.value = null
  errorMsg.value = ''
  buscado.value = false
}
</script>

<style lang="scss" scoped>
.buscar-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  width: 650px;
  max-width: 95vw;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
}

.card-header {
  display: flex; align-items: center; gap: 14px;
  padding: 24px 24px 20px;
}
.header-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, $primary, #7c3aed);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba($primary, 0.35);
}
.card-title { margin: 0 0 2px; font-size: 1.1rem; font-weight: 700; color: $text-primary; }
.card-subtitle { font-size: 0.82rem; color: $text-muted; }
.close-btn { margin-left: auto; }

.card-body {
  padding: 24px;
  display: flex; flex-direction: column; gap: 20px;
}

.search-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.flex-end {
  display: flex;
  align-items: flex-end;
}

.form-field { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: 0.75rem; font-weight: 600; color: $text-secondary;
}
.field-input {
  :deep(.q-field__control) {
    background: rgba(255,255,255,0.04) !important;
    border-radius: 12px; border: 1px solid $border-color;
    &:before { border: none !important; }
    &:hover { border-color: rgba($primary, 0.4); }
  }
}

.buscar-btn {
  width: 100%; border-radius: 12px; height: 40px;
  font-weight: 600;
}

/* Resultados */
.resultados-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: $text-muted;
}

.resultados-list {
  max-height: 280px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

.reserva-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid $border-color;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba($primary, 0.3);
  }

  &.selected {
    background: rgba($primary, 0.08);
    border-color: $primary;
  }
}

.ri-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ri-client {
  font-weight: 700; font-size: 0.9rem; color: $text-primary;
}

.ri-code {
  font-family: monospace; font-size: 0.75rem; color: $text-muted;
}

.ri-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.ri-time, .ri-doc {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: $text-secondary;
}

.no-results {
  text-align: center;
  padding: 30px;
  color: $text-muted;
  background: rgba(255,255,255,0.02);
  border-radius: 14px;
  border: 1px dashed $border-color;
}

.error-msg {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 10px;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.25);
  color: #ef4444; font-size: 0.87rem;
}

.card-footer {
  padding: 16px 24px;
  display: flex; justify-content: flex-end; gap: 10px;
}
.confirm-btn { border-radius: 10px; padding: 8px 24px; font-weight: 600; }
</style>
