<template>
  <q-dialog v-model="show" persistent>
    <q-card class="cancha-form-card">
      <div class="dialog-header">
        <div class="dialog-title-group">
          <div class="dialog-icon">
            <q-icon name="sports_tennis" size="22px" color="white" />
          </div>
          <div>
            <h2 class="dialog-title">{{ isEdit ? 'Editar Cancha' : 'Nueva Cancha' }}</h2>
            <p class="dialog-subtitle">{{ sucursalNombre }}</p>
          </div>
        </div>
        <q-btn flat round dense icon="close" color="grey-5" @click="close" />
      </div>

      <q-separator color="white" style="opacity: 0.05" />

      <q-card-section class="dialog-body">
        <q-form ref="formRef" @submit.prevent="submit" class="form-grid">

          <div class="field-group">
            <label class="field-label">Nombre <span class="req">*</span></label>
            <q-input
              v-model="form.nombre"
              dark outlined dense
              placeholder="Ej: Cancha 1 - Pádel"
              :rules="[val => !!val || 'El nombre es requerido']"
              class="styled-input"
            />
          </div>

          <div class="field-group">
            <label class="field-label">Tipo de Cancha <span class="req">*</span></label>
            <q-select
              v-model="form.tipo_cancha_id"
              dark outlined dense
              :options="tipoOptions"
              option-value="id"
              option-label="nombre"
              emit-value map-options
              placeholder="Seleccionar tipo..."
              :rules="[val => !!val || 'El tipo es requerido']"
              class="styled-input"
            />
          </div>

          <div class="field-group">
            <label class="field-label">Precio Base ($ ARS) <span class="req">*</span></label>
            <q-input
              v-model.number="form.precio_base"
              dark outlined dense type="number" min="0" step="100"
              placeholder="40000"
              :rules="[val => val > 0 || 'El precio es requerido']"
              class="styled-input"
            >
              <template v-slot:prepend>
                <span style="color: #64748b; font-size:0.9rem">$</span>
              </template>
            </q-input>
          </div>

        </q-form>
      </q-card-section>

      <q-separator color="white" style="opacity: 0.05" />

      <q-card-actions class="dialog-footer">
        <q-btn flat label="Cancelar" color="grey-5" @click="close" :disable="saving" />
        <q-btn
          unelevated color="primary" :label="isEdit ? 'Actualizar' : 'Crear Cancha'"
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
  cancha: { type: Object, default: null },
  sucursalId: { type: Number, required: true },
  sucursalNombre: { type: String, default: '' },
  tipoCanchas: { type: Array, default: () => [] },
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'save'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
const isEdit = computed(() => !!props.cancha?.id)
const formRef = ref(null)

const tipoOptions = computed(() => props.tipoCanchas)

const defaultForm = () => ({
  nombre: '',
  tipo_cancha_id: null,
  precio_base: 40000,
})

const form = ref(defaultForm())

watch(() => props.modelValue, (open) => {
  if (open) {
    form.value = props.cancha
      ? { id: props.cancha.id, nombre: props.cancha.nombre, tipo_cancha_id: props.cancha.tipo_cancha_id, precio_base: parseFloat(props.cancha.precio_base) }
      : defaultForm()
  }
})

function close() { show.value = false }

async function submit() {
  const ok = await formRef.value.validate()
  if (!ok) return
  emit('save', { ...form.value, sucursal_id: props.sucursalId })
}
</script>

<style lang="scss" scoped>
.cancha-form-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  width: 480px;
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
.dialog-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}
.dialog-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, $positive, #059669);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba($positive, 0.35);
}
.dialog-title { margin: 0 0 2px; font-size: 1.1rem; font-weight: 700; color: $text-primary; }
.dialog-subtitle { margin: 0; font-size: 0.8rem; color: $text-muted; }
.dialog-body { padding: 24px 28px; }
.form-grid { display: flex; flex-direction: column; gap: 20px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.8rem; font-weight: 600; color: $text-secondary; text-transform: uppercase; letter-spacing: 0.05em; }
.req { color: $negative; margin-left: 2px; }
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
