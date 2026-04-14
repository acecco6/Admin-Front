<template>
  <q-page class="dashboard-page">
    <div class="dashboard-inner">
      <!-- Encabezado -->
      <div class="dashboard-header">
        <div>
          <h1 class="dashboard-title">Dashboard</h1>
        </div>
        <div class="dashboard-date">
          {{ currentDate }}
        </div>
      </div>

      <!-- Cards de métricas — Completar con datos reales -->
      <div class="metrics-grid">
        <div v-for="card in metricCards" :key="card.label" class="metric-card">
          <div class="metric-card__icon" :style="{ background: card.gradient }">
            <q-icon :name="card.icon" size="22px" color="white" />
          </div>
          <div class="metric-card__body">
            <p class="metric-card__label">{{ card.label }}</p>
            <p class="metric-card__value">{{ card.value }}</p>
          </div>
          <div
            class="metric-card__badge"
            :style="{ color: card.trend > 0 ? '#34d399' : '#f87171' }"
          >
            <q-icon :name="card.trend > 0 ? 'trending_up' : 'trending_down'" size="16px" />
            {{ Math.abs(card.trend) }}%
          </div>
        </div>
      </div>

      <!-- Área de contenido — Agregar widgets aquí -->
      <div class="dashboard-grid">
        <div class="dashboard-widget">
          <div class="widget-header">
            <p class="widget-title">Actividad reciente</p>
            <q-btn flat dense size="sm" label="Ver todo" color="primary" />
          </div>
          <div class="widget-empty">
            <q-icon name="inbox" size="40px" color="grey-7" />
            <p>No hay actividad reciente</p>
          </div>
        </div>

        <div class="dashboard-widget">
          <div class="widget-header">
            <p class="widget-title">Resumen</p>
          </div>
          <div class="widget-empty">
            <q-icon name="bar_chart" size="40px" color="grey-7" />
            <p>Sin datos disponibles</p>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
// import { useAuthStore } from 'stores/auth'

// const authStore = useAuthStore()

const currentDate = computed(() => {
  return new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// ——— Completá con datos reales ———
const metricCards = [
  {
    label: 'Usuarios totales',
    value: '—',
    icon: 'people',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    trend: 0,
  },
  {
    label: 'Ingresos',
    value: '—',
    icon: 'attach_money',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    trend: 0,
  },
  {
    label: 'Pedidos',
    value: '—',
    icon: 'shopping_bag',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    trend: 0,
  },
  {
    label: 'Pendientes',
    value: '—',
    icon: 'pending_actions',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    trend: 0,
  },
]
</script>

<style lang="scss">
.dashboard-page {
  background: $bg-deep;
}

.dashboard-inner {
  padding: 0 32px 32px 32px; /* Top 0 para alineación geométrica */
  max-width: 1400px;
  margin: 0 auto; /* Centrar cuando el sidebar se achica en pantallas grandes */

  @media (max-width: 600px) {
    padding: 0 16px 16px 16px;
  }
}

// ——— ENCABEZADO ———
.dashboard-header {
  min-height: 90px;
  display: flex;
  flex-wrap: wrap; /* IMPRESCINDIBLE PARA QUE NO SE ROMPA */
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 12px;
}

.dashboard-title {
  margin: 0 0 4px;
  font-size: 1.6rem;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: -0.03em;
}

.dashboard-subtitle {
  margin: 0;
  font-size: 0.88rem;
  color: $text-muted;

  strong {
    color: $text-secondary;
  }
}

.dashboard-date {
  font-size: 0.82rem;
  color: $text-muted;
  text-transform: capitalize;
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 6px 12px;
}

// ——— MÉTRICAS ———
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__label {
    margin: 0 0 2px;
    font-size: 0.75rem;
    color: $text-muted;
    font-weight: 500;
  }

  &__value {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: $text-primary;
  }

  &__badge {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 0.75rem;
    font-weight: 600;
  }
}

// ——— WIDGETS ———
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.dashboard-widget {
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 14px;
  padding: 20px;
  min-height: 200px;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.widget-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: $text-primary;
}

.widget-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: $text-muted;
  font-size: 0.83rem;
}
</style>
