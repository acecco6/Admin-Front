<template>
  <q-page class="module-page">
    <div class="page-container">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper" style="background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(167,139,250,0.2)); border-color: rgba(139,92,246,0.3);">
              <q-icon name="event_repeat" class="header-icon" style="color: #8b5cf6" />
            </div>
            <div>
              <h1 class="page-title">Reservas Fijas</h1>
              <p class="page-subtitle">Turnos recurrentes semanales por cancha.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- SELECTOR DE CANCHA -->
      <div class="selector-bar">
        <div class="selector-group">
          <label class="selector-label">Sucursal</label>
          <q-select
            v-model="sucursalId"
            dark outlined dense
            :options="sucursales"
            option-value="id" option-label="nombre"
            emit-value map-options
            placeholder="Elegir sucursal..."
            class="selector-input"
            @update:model-value="onSucursalChange"
          />
        </div>

        <div class="selector-arrow">
          <q-icon name="chevron_right" color="grey-6" size="20px" />
        </div>

        <div class="selector-group">
          <label class="selector-label">Tipo de Cancha</label>
          <q-select
            v-model="tipoCanchaId"
            dark outlined dense
            :options="tiposCanchas"
            option-value="id" option-label="nombre"
            emit-value map-options
            placeholder="Elegir tipo de cancha..."
            class="selector-input"
            @update:model-value="onTipoCanchaChange"
          />
        </div>

        <div class="selector-arrow">
          <q-icon name="chevron_right" color="grey-6" size="20px" />
        </div>

        <div class="selector-group">
          <label class="selector-label">Cancha</label>
          <q-select
            v-model="canchaId"
            dark outlined dense
            :options="canchasOptions"
            option-value="id" option-label="nombre"
            emit-value map-options
            placeholder="Elegir cancha..."
            class="selector-input"
            :disable="!sucursalId"
            @update:model-value="fetchReservasFijas(sucursalId, canchaId)"
          />
        </div>

        <q-btn
          v-if="canchaId"
          unelevated color="secondary" icon="add" label="Nueva Reserva Fija"
          class="add-fija-btn"
          @click="openForm()"
        />
      </div>

      <!-- SIN SELECCIÓN -->
      <div v-if="!canchaId" class="empty-state">
        <div class="empty-icon"><q-icon name="event_repeat" size="48px" /></div>
        <h3 class="empty-title">Seleccioná una cancha</h3>
        <p class="empty-text">Elegí una sucursal y cancha para ver la grilla semanal de reservas fijas.</p>
      </div>

      <!-- LOADING -->
      <div v-else-if="loading" class="loading-state">
        <q-spinner-orbit color="secondary" size="48px" />
        <p>Cargando grilla...</p>
      </div>

      <!-- GRILLA SEMANAL -->
      <div v-else-if="grilla.length" class="grilla-wrapper">
        <div class="grilla-scroll">
          <table class="grilla-table">
            <thead>
              <tr>
                <th class="hora-col-header">Hora</th>
                <th v-for="(label, day) in DIAS_SEMANA" :key="day" class="dia-header">
                  <div class="dia-header-inner">
                    <span class="dia-short">{{ label }}</span>
                    <span class="dia-num">{{ getDayNumber(day) }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in grilla" :key="row.hora" class="grilla-row">
                <td class="hora-cell">{{ row.hora }}</td>
                <td
                  v-for="(label, day) in DIAS_SEMANA" :key="day"
                  class="slot-cell"
                  :class="row.dias_reservas[day] ? 'slot--ocupado' : 'slot--libre'"
                  @click="onCellClick(row, Number(day))"
                >
                  <template v-if="row.dias_reservas[day]">
                    <div class="slot-ocupado-inner">
                      <div class="slot-nombre">{{ row.dias_reservas[day].nombre }}</div>
                      <div class="slot-hour">{{ row.dias_reservas[day].hora_fin?.slice(0,5) }}</div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="slot-libre-inner">
                      <q-icon name="add" size="14px" class="slot-add-icon" />
                    </div>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Leyenda -->
        <div class="grilla-legend">
          <div class="legend-item">
            <div class="legend-dot" style="background: rgba(139,92,246,0.6); border: 1px solid rgba(139,92,246,0.8)"></div>
            <span>Ocupado — clic para ver detalle</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08)"></div>
            <span>Libre — clic para reservar</span>
          </div>
        </div>
      </div>

      <!-- SIN DATOS -->
      <div v-else-if="canchaId && !loading" class="empty-state">
        <div class="empty-icon"><q-icon name="calendar_today" size="48px" /></div>
        <h3 class="empty-title">Sin reservas fijas</h3>
        <p class="empty-text">Esta cancha no tiene turnos fijos registrados.</p>
        <q-btn color="secondary" outline icon="add" label="Agregar primera reserva fija" @click="openForm()" />
      </div>

    </div>

    <!-- Detail Popup (celda ocupada) -->
    <q-dialog v-model="detalleOpen">
      <q-card class="detalle-mini-card" v-if="detalleSlot">
        <div class="detalle-mini-header">
          <q-icon name="event_repeat" color="secondary" size="20px" />
          <span class="detalle-mini-title">Reserva Fija</span>
          <q-space />
          <q-btn flat round dense icon="close" color="grey-5" size="sm" @click="detalleOpen = false" />
        </div>
        <q-separator color="white" style="opacity:0.05" />
        <div class="detalle-mini-body">
          <div class="dm-row"><span class="dm-label">Cliente</span><span class="dm-value">{{ detalleSlot.nombre }} {{ detalleSlot.apellido }}</span></div>
          <div class="dm-row"><span class="dm-label">Email</span><span class="dm-value">{{ detalleSlot.email }}</span></div>
          <div class="dm-row"><span class="dm-label">Horario</span><span class="dm-value">{{ detalleSlot.hora_inicio?.slice(0,5) }} — {{ detalleSlot.hora_fin?.slice(0,5) }}</span></div>
          <div class="dm-row"><span class="dm-label">Día</span><span class="dm-value">{{ DIAS_SEMANA_FULL[detalleSlot.dia_semana] }}</span></div>
        </div>
      </q-card>
    </q-dialog>

    <!-- Form Dialog -->
    <ReservaFijaFormDialog
      v-model="formOpen"
      :cancha-id="canchaId"
      :dia-semana-default="formDia"
      :hora-default="formHora"
      :saving="saving"
      @save="onSave"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ReservaFijaFormDialog from './components/ReservaFijaFormDialog.vue'
import { useReservasFijas, DIAS_SEMANA, DIAS_SEMANA_FULL } from 'src/composables/useReservasFijas'
import { getSucursales } from 'src/services/sucursalService'
import { getCanchas } from 'src/services/canchaService'
import { getTipoCanchas } from 'src/services/tipoCanchaService'

const { grilla, loading, saving, fetchReservasFijas, guardarReservaFija } = useReservasFijas()

const sucursales = ref([])
const tiposCanchas = ref([])
const todasCanchas = ref([])
const sucursalId = ref(null)
const tipoCanchaId = ref(null)
const canchaId = ref(null)

const formOpen = ref(false)
const formDia = ref(null)
const formHora = ref('')

const detalleOpen = ref(false)
const detalleSlot = ref(null)

const canchasOptions = computed(() => {
  if (!sucursalId.value) return []

  const grupo = todasCanchas.value.find(
    g => g.id === sucursalId.value
  )

  if (!grupo) return []

  return grupo.canchas.filter(c =>
    tipoCanchaId.value === null ||
    c.tipo?.id === tipoCanchaId.value
  )
})



function onSucursalChange() {
  canchaId.value = null
  grilla.value = []
}

function onTipoCanchaChange() {
  canchaId.value = null
  grilla.value = []
}

function getDayNumber(dayKey) {
  const labels = { 1:'Lun',2:'Mar',3:'Mié',4:'Jue',5:'Vie',6:'Sáb',0:'Dom' }
  return labels[dayKey] ? '' : ''
}

function onCellClick(row, day) {
  const slot = row.dias_reservas[day]
  if (slot) {
    detalleSlot.value = { ...slot, dia_semana: day }
    detalleOpen.value = true
  } else {
    formDia.value = day
    formHora.value = row.hora
    formOpen.value = true
  }
}

function openForm() {
  formDia.value = null
  formHora.value = ''
  formOpen.value = true
}

async function onSave(payload) {
  try {
    await guardarReservaFija(payload)
    formOpen.value = false
    await fetchReservasFijas(sucursalId.value, canchaId.value, tipoCanchaId.value)
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  const [suc, canchas, tipos] = await Promise.all([getSucursales(), getCanchas(), getTipoCanchas()])
  sucursales.value = suc
  todasCanchas.value = canchas
  tiposCanchas.value = tipos
})
</script>

<style lang="scss" scoped>
@import 'src/css/module-page.scss';

/* ─── SELECTOR ─── */
.selector-bar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
  padding: 20px 24px;
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 16px;
}

.selector-group {
  display: flex; flex-direction: column; gap: 6px;
}

.selector-label {
  font-size: 0.72rem; font-weight: 700; color: $text-muted;
  text-transform: uppercase; letter-spacing: 0.07em;
}

.selector-input {
  width: 260px;
  :deep(.q-field__control) {
    background: $bg-input !important; border-radius: 12px; border: 1px solid $border-color;
    &:before { border: none !important; }
    &:hover { border-color: rgba($secondary, 0.5); }
  }
}

.selector-arrow { padding-bottom: 8px; }

.add-fija-btn {
  border-radius: 12px; font-weight: 600; padding: 10px 20px;
  align-self: flex-end;
  box-shadow: 0 4px 16px rgba($secondary, 0.3);
  &:hover { transform: translateY(-2px); }
}

/* ─── LOADING ─── */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 80px 20px;
  color: $text-muted; font-size: 0.9rem;
}

/* ─── GRILLA ─── */
.grilla-wrapper {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.grilla-scroll {
  overflow-x: auto;
}

.grilla-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.hora-col-header {
  width: 70px;
  padding: 14px 16px;
  background: rgba(0,0,0,0.3);
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: $text-muted;
  border-bottom: 2px solid $border-color;
  text-align: left;
}

.dia-header {
  padding: 14px 8px;
  background: rgba(0,0,0,0.3);
  border-bottom: 2px solid $border-color;
  border-left: 1px solid $border-color;
  text-align: center;
}

.dia-header-inner {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}

.dia-short {
  font-size: 0.85rem; font-weight: 800; color: $text-primary; letter-spacing: 0.05em;
}

.dia-num {
  font-size: 0.65rem; color: $text-muted;
}

.grilla-row {
  &:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,0.04); }
  &:hover .hora-cell { color: $text-primary; }
}

.hora-cell {
  padding: 0 16px;
  font-size: 0.78rem; font-weight: 600;
  color: $text-muted; white-space: nowrap;
  width: 70px;
  height: 52px;
}

.slot-cell {
  border-left: 1px solid rgba(255,255,255,0.04);
  height: 52px;
  padding: 4px 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  vertical-align: middle;

  &--ocupado {
    background: rgba(139, 92, 246, 0.12);
    border-left-color: rgba(139, 92, 246, 0.15);

    &:hover {
      background: rgba(139, 92, 246, 0.22);
    }
  }

  &--libre {
    &:hover {
      background: rgba(255, 255, 255, 0.04);

      .slot-add-icon { opacity: 1; color: $primary; }
    }
  }
}

.slot-ocupado-inner {
  display: flex; flex-direction: column; gap: 1px;
}

.slot-nombre {
  font-size: 0.75rem; font-weight: 700;
  color: #c4b5fd;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 110px;
}

.slot-hour {
  font-size: 0.65rem; color: rgba(196, 181, 253, 0.6);
}

.slot-libre-inner {
  display: flex; align-items: center; justify-content: center; height: 100%;
}

.slot-add-icon {
  opacity: 0;
  transition: opacity 0.15s;
  color: $text-muted;
}

/* ─── LEGEND ─── */
.grilla-legend {
  display: flex; gap: 20px; align-items: center;
  padding: 14px 20px;
  border-top: 1px solid $border-color;
  background: rgba(0,0,0,0.1);
}

.legend-item {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.78rem; color: $text-muted;
}

.legend-dot {
  width: 14px; height: 14px; border-radius: 4px;
}

/* ─── DETALLE MINI ─── */
.detalle-mini-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 16px;
  width: 380px; max-width: 95vw;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
}

.detalle-mini-header {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 20px;
}

.detalle-mini-title {
  font-size: 0.95rem; font-weight: 700; color: $text-primary;
}

.detalle-mini-body {
  padding: 16px 20px;
  display: flex; flex-direction: column; gap: 12px;
}

.dm-row {
  display: flex; flex-direction: column; gap: 2px;
}

.dm-label {
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: $text-muted;
}

.dm-value {
  font-size: 0.9rem; font-weight: 600; color: $text-primary;
}
</style>
