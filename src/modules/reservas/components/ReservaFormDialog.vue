<template>
  <q-dialog v-model="show" persistent>
    <q-card class="reserva-form-card">
      <div class="dialog-header">
        <div class="dialog-title-group">
          <div class="dialog-icon">
            <q-icon name="event_available" size="22px" color="white" />
          </div>
          <div>
            <h2 class="dialog-title">Nueva Reserva</h2>
            <p class="dialog-subtitle">Completá los datos del turno</p>
          </div>
        </div>
        <q-btn flat round dense icon="close" color="grey-5" @click="close" />
      </div>

      <q-separator color="white" style="opacity: 0.05" />

      <q-card-section class="dialog-body">
        <q-form ref="formRef" @submit.prevent="submit" class="form-grid">

          <!-- Sección Turno -->
          <div class="form-section-label">📅 Datos del Turno</div>

          <div class="form-row-2">
            <div class="field-group">
              <label class="field-label">Cancha <span class="req">*</span></label>
              <q-select
                v-model="form.cancha_id"
                dark outlined dense
                :options="canchaOptions"
                option-value="id" option-label="label"
                emit-value map-options
                placeholder="Seleccionar..."
                :rules="[val => !!val || 'Requerido']"
                class="styled-input"
              />
            </div>
            <div class="field-group">
              <label class="field-label">Fecha <span class="req">*</span></label>
              <q-input
                v-model="form.fecha"
                dark outlined dense type="date"
                :rules="[val => !!val || 'Requerido']"
                class="styled-input"
              />
            </div>
          </div>

          <div class="form-row-2">
            <div class="field-group">
              <label class="field-label">Hora Inicio <span class="req">*</span></label>
              <q-input
                v-model="form.hora_inicio"
                dark outlined dense type="time"
                :rules="[val => !!val || 'Requerido']"
                class="styled-input"
              />
            </div>
            <div class="field-group">
              <label class="field-label">Hora Fin <span class="req">*</span></label>
              <q-input
                v-model="form.hora_fin"
                dark outlined dense type="time"
                :rules="[val => !!val || 'Requerido']"
                class="styled-input"
              />
            </div>
          </div>

          <q-separator color="white" style="opacity: 0.05; margin: 4px 0" />

          <!-- Sección Cliente -->
          <div class="form-section-label">👤 Datos del Cliente</div>

          <div class="form-row-2">
            <div class="field-group">
              <label class="field-label">Nombre <span class="req">*</span></label>
              <q-input v-model="form.nombre" dark outlined dense placeholder="Juan"
                :rules="[val => !!val || 'Requerido']" class="styled-input" />
            </div>
            <div class="field-group">
              <label class="field-label">Apellido <span class="req">*</span></label>
              <q-input v-model="form.apellido" dark outlined dense placeholder="Pérez"
                :rules="[val => !!val || 'Requerido']" class="styled-input" />
            </div>
          </div>

          <div class="form-row-2">
            <div class="field-group">
              <label class="field-label">Email <span class="req">*</span></label>
              <q-input v-model="form.email" dark outlined dense type="email" placeholder="juan@mail.com"
                :rules="[val => !!val || 'Requerido', val => /.+@.+/.test(val) || 'Email inválido']"
                class="styled-input" />
            </div>
            <div class="field-group">
              <label class="field-label">Documento <span class="req">*</span></label>
              <q-input v-model="form.documento" dark outlined dense placeholder="12345678"
                :rules="[val => !!val || 'Requerido']" class="styled-input" />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Teléfono <span class="optional-text">(opcional)</span></label>
            <q-input v-model="form.telefono" dark outlined dense placeholder="+54 9 11 1234-5678"
              class="styled-input" />
          </div>

        </q-form>
      </q-card-section>

      <q-separator color="white" style="opacity: 0.05" />

      <q-card-actions class="dialog-footer">
        <q-btn flat label="Cancelar" color="grey-5" @click="close" :disable="saving" />
        <q-btn unelevated color="primary" label="Crear Reserva"
          :loading="saving" icon-right="check"
          class="submit-btn" @click="submit"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  canchas: { type: Array, default: () => [] },  // [{ id, nombre }] plana
  sucursalId: { type: Number, default: null },
  fechaDefault: { type: String, default: '' },
  saving: { type: Boolean, default: false },
  initialData: { type: Object, default: null }, // { cancha_id, fecha, hora_inicio, hora_fin }
})
const emit = defineEmits(['update:modelValue', 'save'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
const formRef = ref(null)

// Aplanar canchas para el select
const canchaOptions = computed(() =>
  props.canchas.map(c => ({ id: c.id, label: c.nombre }))
)

const defaultForm = () => ({
  cancha_id: props.initialData?.cancha_id || null,
  fecha: props.initialData?.fecha || props.fechaDefault || new Date().toISOString().slice(0, 10),
  hora_inicio: props.initialData?.hora_inicio || '',
  hora_fin: props.initialData?.hora_fin || '',
  nombre: '',
  apellido: '',
  email: '',
  documento: '',
  telefono: '',
})

const form = ref(defaultForm())

watch(() => props.modelValue, (open) => {
  if (open) form.value = defaultForm()
})

function close() { show.value = false }

async function submit() {
  const ok = await formRef.value.validate()
  if (!ok) return
  const payload = { 
    ...form.value,
    estado: 'C' // Reserva::ESTADO_CONFIRMADA
  }
  if (!payload.telefono) delete payload.telefono
  emit('save', payload)
}
</script>

<style lang="scss" scoped>
.reserva-form-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  width: 600px;
  max-width: 95vw;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 20px;
  gap: 16px;
}

.dialog-title-group { display: flex; align-items: center; gap: 14px; }

.dialog-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
}

.dialog-title { margin: 0 0 2px; font-size: 1.1rem; font-weight: 700; color: $text-primary; }
.dialog-subtitle { margin: 0; font-size: 0.8rem; color: $text-muted; }
.dialog-body { padding: 20px 28px; }

.form-grid { display: flex; flex-direction: column; gap: 16px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }

.form-section-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 0 2px;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: $text-secondary;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.req { color: $negative; margin-left: 2px; }
.optional-text { color: $text-muted; font-weight: 400; font-size: 0.75rem; text-transform: none; }

.styled-input :deep(.q-field__control) {
  background: $bg-input !important; border-radius: 10px; border: 1px solid $border-color;
  &:before { border: none !important; }
  &:hover { border-color: rgba($primary, 0.5); }
}
.styled-input :deep(.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 2px rgba($primary, 0.25); border-color: $primary;
}

.dialog-footer { padding: 16px 28px 20px; display: flex; justify-content: flex-end; gap: 10px; }
.submit-btn { border-radius: 10px; padding: 8px 24px; font-weight: 600; box-shadow: 0 4px 16px rgba($primary, 0.3); }
</style>
