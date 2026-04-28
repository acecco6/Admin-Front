<template>
  <q-dialog v-model="show" persistent>
    <q-card class="pago-card">
      <div class="card-header">
        <div class="header-icon-wrap">
          <q-icon name="shopping_bag" size="22px" color="white" />
        </div>
        <div>
          <h2 class="card-title">Cobrar Venta de Tienda</h2>
          <div class="card-subtitle" v-if="venta">Venta #{{ venta.id }}</div>
        </div>
        <q-btn flat round dense icon="close" color="grey-5" class="close-btn" @click="cerrar" />
      </div>

      <q-separator color="white" style="opacity:0.05" />

      <q-card-section class="card-body" v-if="venta">

        <!-- Detalle de productos -->
        <div class="detalle-section">
          <div class="section-label">Detalle de la venta</div>
          <div v-if="loadingDetalle" class="loading-detalle">
            <q-spinner-dots color="primary" size="24px" />
          </div>
          <template v-else-if="detalle">
            <div v-for="d in detalle.detalles" :key="d.id" class="detalle-item">
              <span class="di-qty">{{ d.cantidad }}x</span>
              <span class="di-name">{{ d.producto?.nombre }}</span>
              <span class="di-sub">${{ Number(d.subtotal).toLocaleString('es-AR') }}</span>
            </div>
            <div class="detalle-total">
              <span>Total</span>
              <span class="total-amount">${{ Number(detalle.total).toLocaleString('es-AR') }}</span>
            </div>
          </template>
        </div>

        <q-separator color="white" style="opacity:0.05; margin: 4px 0" />

        <!-- Formulario de pago -->
        <div class="form-section">
          <div class="form-row">
            <div class="form-field">
              <label class="field-label">Monto a cobrar *</label>
              <q-input
                v-model.number="form.monto"
                dark outlined dense type="number" min="0.01"
                placeholder="0.00"
                class="field-input"
                prefix="$"
              />
            </div>
            <div class="form-field">
              <label class="field-label">Método de pago *</label>
              <q-select
                v-model="form.metodo_pago"
                dark outlined dense
                :options="metodosPago"
                option-value="value" option-label="label"
                emit-value map-options
                class="field-input"
              />
            </div>
          </div>
          <div class="form-field">
            <label class="field-label">Referencia (opcional)</label>
            <q-input
              v-model="form.referencia"
              dark outlined dense
              placeholder="Nro. de transferencia, etc."
              class="field-input"
            />
          </div>
        </div>
      </q-card-section>

      <div v-else class="loading-pago">
        <q-spinner-orbit color="primary" size="40px" />
      </div>

      <q-separator color="white" style="opacity:0.05" />

      <q-card-actions class="card-footer">
        <q-btn flat label="Cancelar" color="grey-5" @click="cerrar" />
        <q-btn
          unelevated icon="payments" color="positive"
          class="cobrar-btn"
          :loading="saving"
          :disable="!form.monto || !form.metodo_pago || !venta"
          @click="cobrar"
        >
          Cobrar ${{ form.monto ? Number(form.monto).toLocaleString('es-AR') : '0' }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  venta: { type: Object, default: null },
  detalle: { type: Object, default: null },
  loadingDetalle: Boolean,
  saving: Boolean,
})
const emit = defineEmits(['update:modelValue', 'cobrar'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const metodosPago = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tarjeta', label: 'Tarjeta' },
]

const form = ref({ monto: null, metodo_pago: 'efectivo', referencia: '' })

watch(() => props.venta, (v) => {
  if (v) {
    form.value.monto = Number(v.total) || null
    form.value.metodo_pago = 'efectivo'
    form.value.referencia = ''
  }
}, { immediate: true })

function cobrar() {
  if (!form.value.monto || !form.value.metodo_pago) return
  emit('cobrar', {
    venta_id: props.venta.id,
    monto: form.value.monto,
    metodo_pago: form.value.metodo_pago,
    referencia: form.value.referencia || '',
  })
}

function cerrar() {
  show.value = false
}
</script>

<style lang="scss" scoped>
.pago-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  width: 500px; max-width: 95vw;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
}
.card-header {
  display: flex; align-items: center; gap: 14px; padding: 22px 24px 18px;
}
.header-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, #fb923c, #ea580c);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(251,146,60,0.35);
}
.card-title { margin: 0 0 2px; font-size: 1.1rem; font-weight: 700; color: $text-primary; }
.card-subtitle { font-size: 0.82rem; color: $text-muted; }
.close-btn { margin-left: auto; }

.card-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.loading-pago { display: flex; justify-content: center; padding: 48px; }

/* Detalle */
.detalle-section { display: flex; flex-direction: column; gap: 8px; }
.section-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: $text-muted; margin-bottom: 4px; }
.loading-detalle { display: flex; justify-content: center; padding: 16px; }
.detalle-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid $border-color;
}
.di-qty { font-size: 0.78rem; color: $text-muted; min-width: 22px; }
.di-name { flex: 1; font-size: 0.85rem; font-weight: 600; color: $text-primary; }
.di-sub { font-size: 0.85rem; font-weight: 700; color: $text-primary; }
.detalle-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; border-radius: 10px;
  background: rgba(251,146,60,0.08);
  border: 1px solid rgba(251,146,60,0.2);
  font-size: 0.88rem; font-weight: 700; color: $text-primary;
}
.total-amount { font-size: 1.1rem; font-weight: 800; color: #fb923c; }

/* Form */
.form-section { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.76rem; font-weight: 600; color: $text-secondary; }
.field-input {
  :deep(.q-field__control) {
    background: rgba(255,255,255,0.04) !important;
    border-radius: 12px; border: 1px solid $border-color;
    &:before { border: none !important; }
    &:hover { border-color: rgba(251,146,60,0.4); }
  }
}

.card-footer { padding: 16px 24px; display: flex; justify-content: flex-end; gap: 10px; }
.cobrar-btn { border-radius: 10px; padding: 8px 24px; font-weight: 700; }
</style>
