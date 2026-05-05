<template>
  <!-- Tab de canchas dentro de una sucursal -->
  <div class="canchas-tab">
    <!-- Toolbar -->
    <div class="tab-toolbar">
      <div class="tab-info">
        <q-icon name="sports_tennis" color="positive" size="18px" />
        <span class="tab-count"
          >{{ canchas.length }} cancha{{ canchas.length !== 1 ? 's' : '' }}</span
        >
      </div>
    </div>

    <!-- Sin canchas -->
    <div v-if="!canchas.length" class="no-canchas">
      <q-icon name="sports_tennis" size="36px" color="grey-7" />
      <p>Esta sucursal no tiene canchas registradas.</p>
      <q-btn
        outline
        color="positive"
        icon="add"
        label="Agregar primera cancha"
        size="sm"
        @click="$emit('addCancha')"
      />
    </div>

    <!-- Grid de canchas -->
    <div v-else class="canchas-grid">
      <div
        v-for="cancha in canchas"
        :key="cancha.id"
        class="cancha-card"
        :class="{ 'cancha-card--inactive': !cancha.activa }"
      >
        <!-- Estado badge -->
        <div class="cancha-status" :class="cancha.activa ? 'status--active' : 'status--inactive'">
          {{ cancha.activa ? 'Activa' : 'Inactiva' }}
        </div>

        <!-- Nombre cancha -->
        <div class="cancha-card__name">{{ cancha.nombre }}</div>

        <!-- Tipo -->
        <div class="cancha-card__tipo">
          <q-icon name="category" size="14px" />
          {{ cancha.tipo?.nombre || `Tipo #${cancha.tipo_cancha_id}` }}
        </div>

        <!-- Precio -->
        <div class="cancha-card__precio">
          $ {{ Number(cancha.precio_base).toLocaleString('es-AR') }}
          <span class="precio-label">/ hora</span>
        </div>

        <!-- Acciones -->
        <div class="cancha-card__actions">
          <q-btn
            flat
            round
            dense
            icon="edit"
            color="accent"
            size="sm"
            @click="$emit('editCancha', cancha)"
          >
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            size="sm"
            :icon="cancha.activa ? 'visibility_off' : 'visibility'"
            :color="cancha.activa ? 'warning' : 'positive'"
            @click="$emit('toggleCancha', cancha)"
          >
            <q-tooltip>{{ cancha.activa ? 'Desactivar' : 'Activar' }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="delete_outline"
            color="negative"
            size="sm"
            @click="$emit('deleteCancha', cancha)"
          >
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  canchas: { type: Array, default: () => [] },
})
defineEmits(['addCancha', 'editCancha', 'toggleCancha', 'deleteCancha'])
</script>

<style lang="scss" scoped>
.canchas-tab {
  padding: 20px 0 4px;
}

.tab-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.tab-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: $text-secondary;
}

.tab-count {
  font-weight: 600;
}

.add-cancha-btn {
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba($positive, 0.25);
}

.no-canchas {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 20px;
  color: $text-muted;
  font-size: 0.88rem;
  text-align: center;
}

/* ════ CANCHAS GRID ════ */
.canchas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.cancha-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid $border-color;
  border-radius: 14px;
  padding: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba($primary, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  &--inactive {
    opacity: 0.55;
    filter: grayscale(0.4);
  }

  &__name {
    font-weight: 700;
    font-size: 0.93rem;
    color: $text-primary;
    margin-bottom: 6px;
    margin-top: 8px;
  }

  &__tipo {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.78rem;
    color: $text-muted;
    margin-bottom: 10px;
  }

  &__precio {
    font-size: 1rem;
    font-weight: 700;
    color: $positive;
    margin-bottom: 14px;

    .precio-label {
      font-size: 0.72rem;
      color: $text-muted;
      font-weight: 400;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 4px;
    border-top: 1px solid $border-color;
    padding-top: 10px;
  }
}

.cancha-status {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 99px;

  &--active {
    background: rgba($positive, 0.15);
    color: $positive;
  }

  &--inactive {
    background: rgba($negative, 0.12);
    color: $negative;
  }
}
</style>
