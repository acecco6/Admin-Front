<template>
  <q-dialog v-model="show" persistent>
    <q-card class="update-card">
      <div class="card-header">
        <div class="header-icon-wrap">
          <q-icon name="inventory_2" size="22px" color="white" />
        </div>
        <div>
          <h2 class="card-title">Actualizar Stock</h2>
          <div class="card-subtitle">{{ item?.nombre }}</div>
        </div>
        <q-btn flat round dense icon="close" color="grey-5" class="close-btn" @click="show = false" />
      </div>

      <q-separator color="white" style="opacity:0.05" />

      <q-card-section class="card-body">
        <div class="current-info">
          <div class="info-label">Stock actual</div>
          <div class="current-qty" :class="cantidadClass(item?.cantidad)">
            {{ item?.cantidad ?? 0 }} unidades
          </div>
        </div>

        <div class="form-field">
          <label class="field-label">Nueva cantidad *</label>
          <q-input
            v-model.number="nuevaCantidad"
            dark outlined dense type="number" min="0"
            placeholder="Ingresá la nueva cantidad"
            class="qty-input"
            @keyup.enter="guardar"
          />
        </div>
      </q-card-section>

      <q-separator color="white" style="opacity:0.05" />

      <q-card-actions class="card-footer">
        <q-btn flat label="Cancelar" color="grey-5" @click="show = false" />
        <q-btn
          unelevated label="Guardar" icon="save" color="positive"
          class="save-btn"
          :loading="saving"
          :disable="nuevaCantidad === null || nuevaCantidad < 0"
          @click="guardar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  item: { type: Object, default: null },
  sucursalId: { type: Number, default: null },
  saving: Boolean,
})
const emit = defineEmits(['update:modelValue', 'saved'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const nuevaCantidad = ref(null)

watch(() => props.item, (item) => {
  nuevaCantidad.value = item?.cantidad ?? 0
}, { immediate: true })

function cantidadClass(cantidad) {
  if (!cantidad && cantidad !== 0) return ''
  if (cantidad < 5) return 'qty--critico'
  if (cantidad < 10) return 'qty--bajo'
  return 'qty--ok'
}

function guardar() {
  if (nuevaCantidad.value === null || nuevaCantidad.value < 0) return
  emit('saved', {
    producto_id: props.item.producto_id,
    sucursal_id: props.sucursalId,
    cantidad: nuevaCantidad.value,
  })
}
</script>

<style lang="scss" scoped>
.update-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  width: 420px;
  max-width: 95vw;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 24px 24px 20px;
  position: relative;
}

.header-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(16,185,129,0.35);
}

.card-title { margin: 0 0 2px; font-size: 1.1rem; font-weight: 700; color: $text-primary; }
.card-subtitle { font-size: 0.82rem; color: $text-muted; }
.close-btn { margin-left: auto; }

.card-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }

.current-info { display: flex; flex-direction: column; gap: 6px; }

.info-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: $text-muted;
}

.current-qty {
  font-size: 1.4rem;
  font-weight: 800;

  &.qty--ok { color: #10b981; }
  &.qty--bajo { color: #f59e0b; }
  &.qty--critico { color: #ef4444; }
}

.form-field { display: flex; flex-direction: column; gap: 8px; }

.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: $text-secondary;
}

.qty-input {
  :deep(.q-field__control) {
    background: rgba(255,255,255,0.04) !important;
    border-radius: 12px;
    border: 1px solid $border-color;
    &:before { border: none !important; }
    &:hover { border-color: rgba(16,185,129,0.4); }
  }
  :deep(.q-field--focused .q-field__control) {
    border-color: #10b981;
    box-shadow: 0 0 0 2px rgba(16,185,129,0.2);
  }
}

.card-footer {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-btn {
  border-radius: 10px;
  padding: 8px 24px;
  font-weight: 600;
}
</style>
