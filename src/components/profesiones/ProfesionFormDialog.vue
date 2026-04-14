<template>
  <q-dialog v-model="isOpen" persistent transition-show="scale" transition-hide="scale">
    <q-card class="profesion-dialog">
      <!-- HEADER -->
      <q-card-section class="dialog-header row items-center justify-between">
        <div class="row items-center gap-sm">
          <q-avatar icon="work" color="primary" text-color="white" size="42px" class="header-icon" />
          <div>
            <h2 class="dialog-title">{{ isEdit ? 'Editar Profesión' : 'Nueva Profesión' }}</h2>
            <p class="dialog-subtitle">{{ isEdit ? 'Modificar datos de la profesión' : 'Agregar una nueva profesión al sistema' }}</p>
          </div>
        </div>
        <q-btn icon="close" flat round dense class="close-btn" v-close-popup />
      </q-card-section>

      <!-- BODY / FORM -->
      <q-card-section class="dialog-body">
        <q-form @submit.prevent="submitForm" class="q-gutter-md form-content">
          <div class="input-group">
            <label class="input-label">Nombre de la Profesión <span class="text-negative">*</span></label>
            <q-input
              v-model="formData.nombre"
              dark
              outlined
              placeholder="Ej: Médico Clínico, Odontólogo..."
              lazy-rules
              :rules="[val => !!val || 'El nombre es obligatorio']"
              class="custom-input"
            >
              <template v-slot:prepend>
                <q-icon name="badge" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="input-group">
            <label class="input-label">Descripción</label>
            <q-input
              v-model="formData.descripcion"
              dark
              outlined
              type="textarea"
              placeholder="Breve descripción de la profesión..."
              rows="3"
              class="custom-input"
            />
          </div>

          <div class="input-group status-group">
            <q-toggle
              v-model="formData.activo"
              dark
              color="positive"
              icon="power_settings_new"
              class="custom-toggle"
            >
              <span class="toggle-label" :class="{ 'text-positive': formData.activo, 'text-muted': !formData.activo }">
                {{ formData.activo ? 'Profesión Activa' : 'Profesión Inactiva' }}
              </span>
            </q-toggle>
          </div>
        </q-form>
      </q-card-section>

      <!-- FOOTER / ACTIONS -->
      <q-card-actions align="right" class="dialog-footer">
        <q-btn
          flat
          label="Cancelar"
          color="white"
          class="btn-cancel"
          v-close-popup
        />
        <q-btn
          unelevated
          :label="isEdit ? 'Guardar Cambios' : 'Crear Profesión'"
          color="primary"
          class="btn-save"
          :loading="loading"
          @click="submitForm"
        >
          <template v-slot:loading>
            <q-spinner-tail class="on-left" />
            Guardando...
          </template>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  profesion: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = ref(props.modelValue)
const isEdit = ref(false)
const loading = ref(false)

const formData = ref({
  id: null,
  nombre: '',
  descripcion: '',
  activo: true
})

// Sync con v-model desde el padre
watch(() => props.modelValue, (val) => {
  isOpen.value = val
})

watch(isOpen, (val) => {
  emit('update:modelValue', val)
  if (val) {
    if (props.profesion) {
      isEdit.value = true
      formData.value = { ...props.profesion }
    } else {
      isEdit.value = false
      formData.value = { id: null, nombre: '', descripcion: '', activo: true }
    }
  }
})

const submitForm = async () => {
  if (!formData.value.nombre) return

  loading.value = true
  // Simular llamada a la API
  await new Promise(resolve => setTimeout(resolve, 800))
  
  emit('save', { ...formData.value })
  loading.value = false
  isOpen.value = false
}
</script>

<style lang="scss" scoped>
.profesion-dialog {
  width: 100%;
  max-width: 500px;
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

/* ════════════ HEADER ════════════ */
.dialog-header {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid $border-color;
  padding: 24px;
}

.header-icon {
  box-shadow: 0 0 15px rgba($primary, 0.4);
}

.dialog-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: -0.02em;
}

.dialog-subtitle {
  margin: 2px 0 0 0;
  font-size: 0.8rem;
  color: $text-muted;
}

.close-btn {
  color: $text-muted;
  transition: all 0.2s ease;
  &:hover {
    color: $negative;
    background: rgba($negative, 0.1);
    transform: rotate(90deg);
  }
}

/* ════════════ BODY ════════════ */
.dialog-body {
  padding: 24px;
}

.input-group {
  margin-bottom: 20px;
  
  .input-label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    color: $text-secondary;
  }
}

.status-group {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid $border-color;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
}

.toggle-label {
  font-weight: 600;
  font-size: 0.9rem;
  margin-left: 8px;
  transition: color 0.3s ease;
}

/* ════════════ INPUT ESTÉTICO ════════════ */
.custom-input {
  :deep(.q-field__control) {
    background: $bg-input !important;
    border-radius: 12px;
    transition: all 0.3s ease;

    &:before {
      border: 1px solid $border-color !important;
    }
    
    &:hover:before {
      border-color: rgba($primary, 0.5) !important;
    }
  }

  :deep(.q-field--focused) {
    .q-field__control {
      box-shadow: 0 0 0 3px rgba($primary, 0.15);
      
      &:after {
        border-color: $primary !important;
        border-width: 2px !important;
      }
    }
  }
}

/* ════════════ FOOTER ════════════ */
.dialog-footer {
  padding: 16px 24px;
  background: rgba(0,0,0,0.2);
  border-top: 1px solid $border-color;
  gap: 12px;
}

.btn-cancel {
  border-radius: 10px;
  font-weight: 600;
  color: $text-secondary !important;
  
  &:hover {
    background: rgba(255,255,255,0.05);
    color: $text-primary !important;
  }
}

.btn-save {
  border-radius: 10px;
  font-weight: 600;
  padding: 8px 24px;
  box-shadow: 0 4px 14px rgba($primary, 0.4);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba($primary, 0.6);
  }
  
  &:active {
    transform: translateY(0);
  }
}
</style>
