<template>
  <q-dialog v-model="show" persistent>
    <q-card class="pago-card">
      <div class="card-header">
        <div class="header-icon-wrap">
          <q-icon name="payments" size="22px" color="white" />
        </div>
        <div>
          <h2 class="card-title">Cobrar Reserva</h2>
          <div class="card-subtitle" v-if="reserva">{{ reserva.codigo_reserva }}</div>
        </div>
        <q-btn flat round dense icon="close" color="grey-5" class="close-btn" @click="cerrar" />
      </div>

      <q-separator color="white" style="opacity:0.05" />

      <q-card-section class="card-body" v-if="reserva">

        <!-- Info del cliente y cancha -->
        <div class="info-grid">
          <div class="info-block">
            <div class="info-label">Cliente</div>
            <div class="info-value">{{ reserva.nombre }} {{ reserva.apellido }}</div>
            <div class="info-sub" v-if="reserva.documento">DNI: {{ reserva.documento }}</div>
          </div>
          <div class="info-block">
            <div class="info-label">Cancha</div>
            <div class="info-value">{{ reserva.cancha?.nombre }}</div>
            <div class="info-sub">{{ reserva.fecha }} · {{ reserva.hora_inicio }} — {{ reserva.hora_fin }}</div>
          </div>
        </div>

        <!-- Resumen financiero -->
        <div class="finance-grid">
          <div class="finance-item">
            <div class="finance-label">Precio Cancha + Productos</div>
            <div class="finance-value">${{ Number(reserva.total_cancha_producto || 0).toLocaleString('es-AR') }}</div>
          </div>
          <div class="finance-item">
            <div class="finance-label">Ya Pagado</div>
            <div class="finance-value finance-ok">${{ Number(reserva.total_pagado || 0).toLocaleString('es-AR') }}</div>
          </div>
          <div class="finance-item finance-item--deuda">
            <div class="finance-label">Deuda</div>
            <div class="finance-value finance-deuda">${{ Number(reserva.deuda || 0).toLocaleString('es-AR') }}</div>
          </div>
        </div>

        <!-- Pagos previos -->
        <div v-if="reserva.pagos?.length" class="pagos-previos">
          <div class="section-label">Pagos registrados</div>
          <div v-for="p in reserva.pagos" :key="p.id" class="pago-pill">
            <q-icon name="check_circle" color="positive" size="14px" />
            <span>${{ Number(p.monto).toLocaleString('es-AR') }}</span>
            <q-chip dense color="grey-8" text-color="white" size="xs">{{ p.metodo_pago }}</q-chip>
          </div>
        </div>

        <!-- Ventas asociadas -->
        <div v-if="reserva.ventas?.length" class="ventas-section">
          <div class="section-label">Ventas de tienda asociadas</div>
          <div v-for="v in reserva.ventas" :key="v.id" class="venta-item">
            <div class="venta-header">
              <q-icon name="shopping_bag" size="14px" color="warning" />
              <span class="venta-total">Venta · ${{ Number(v.total).toLocaleString('es-AR') }}</span>
            </div>
            <div v-for="d in v.detalles" :key="d.id" class="venta-detalle">
              <span class="vd-qty">{{ d.cantidad }}x</span>
              <span class="vd-name">{{ d.producto?.nombre }}</span>
              <span class="vd-sub">${{ Number(d.subtotal).toLocaleString('es-AR') }}</span>
              <q-btn flat round dense icon="delete" color="negative" size="sm" @click="confirmarEliminarProducto(v.id, d.id, d.cantidad)" />
            </div>
          </div>
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
          :disable="!form.monto || !form.metodo_pago || !reserva"
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
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: Boolean,
  reserva: { type: Object, default: null },
  saving: Boolean,
})
const emit = defineEmits(['update:modelValue', 'cobrar', 'remove-producto'])
const $q = useQuasar()

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

watch(() => props.reserva, (r) => {
  if (r) {
    form.value.monto = Number(r.deuda) || null
    form.value.metodo_pago = 'efectivo'
    form.value.referencia = ''
  }
}, { immediate: true })

function cobrar() {
  if (!form.value.monto || !form.value.metodo_pago) return
  emit('cobrar', {
    reserva_id: props.reserva.id,
    monto: form.value.monto,
    metodo_pago: form.value.metodo_pago,
    referencia: form.value.referencia || '',
  })
}

function cerrar() {
  show.value = false
}

function confirmarEliminarProducto(ventaId, detalleId, cantidadMax) {
  $q.dialog({
    title: 'Eliminar Producto',
    message: `¿Cuántas unidades deseas eliminar? (Máximo: ${cantidadMax})`,
    prompt: {
      model: cantidadMax,
      type: 'number',
      min: 1,
      max: cantidadMax
    },
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk((data) => {
    emit('remove-producto', {
      venta_id: ventaId,
      venta_detalle_id: detalleId,
      cantidad: Number(data)
    })
  })
}
</script>

<style lang="scss" scoped>
.pago-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  width: 560px; max-width: 95vw;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
}
.card-header {
  display: flex; align-items: center; gap: 14px; padding: 22px 24px 18px;
}
.header-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(16,185,129,0.35);
}
.card-title { margin: 0 0 2px; font-size: 1.1rem; font-weight: 700; color: $text-primary; }
.card-subtitle { font-size: 0.78rem; color: $text-muted; font-family: monospace; }
.close-btn { margin-left: auto; }

.card-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.loading-pago { display: flex; justify-content: center; padding: 48px; }

/* Info grid */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.info-block { display: flex; flex-direction: column; gap: 4px; }
.info-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: $text-muted; }
.info-value { font-size: 0.9rem; font-weight: 600; color: $text-primary; }
.info-sub { font-size: 0.75rem; color: $text-muted; }

/* Finance grid */
.finance-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
.finance-item {
  background: rgba(255,255,255,0.03);
  border: 1px solid $border-color;
  border-radius: 12px; padding: 12px 14px;

  &--deuda {
    background: rgba(239,68,68,0.06);
    border-color: rgba(239,68,68,0.2);
  }
}
.finance-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: $text-muted; margin-bottom: 6px; }
.finance-value { font-size: 1rem; font-weight: 800; color: $text-primary; }
.finance-ok { color: #10b981; }
.finance-deuda { color: #ef4444; }

/* Pagos previos */
.pagos-previos { display: flex; flex-direction: column; gap: 6px; }
.section-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: $text-muted; margin-bottom: 4px; }
.pago-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 10px;
  background: rgba(16,185,129,0.07);
  border: 1px solid rgba(16,185,129,0.2);
  font-size: 0.85rem; font-weight: 600; color: $text-primary;
}

/* Ventas */
.ventas-section { display: flex; flex-direction: column; gap: 8px; }
.venta-item {
  background: rgba(251,146,60,0.05);
  border: 1px solid rgba(251,146,60,0.15);
  border-radius: 10px; padding: 10px 12px;
}
.venta-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.venta-total { font-size: 0.83rem; font-weight: 700; color: $text-primary; }
.venta-detalle { display: flex; align-items: center; gap: 6px; padding: 2px 0; }
.vd-qty { font-size: 0.75rem; color: $text-muted; min-width: 22px; }
.vd-name { flex: 1; font-size: 0.78rem; color: $text-secondary; }
.vd-sub { font-size: 0.78rem; font-weight: 600; color: $text-primary; }

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
    &:hover { border-color: rgba(16,185,129,0.4); }
  }
}

.card-footer { padding: 16px 24px; display: flex; justify-content: flex-end; gap: 10px; }
.cobrar-btn { border-radius: 10px; padding: 8px 24px; font-weight: 700; }
</style>
