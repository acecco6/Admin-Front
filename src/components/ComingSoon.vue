<template>
  <q-page class="module-page">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <div class="title-section">
            <div class="icon-wrapper" :style="iconStyle">
              <q-icon :name="icon" class="header-icon" :style="{ color: iconColor }" />
            </div>
            <div>
              <h1 class="page-title">{{ title }}</h1>
              <p class="page-subtitle">{{ subtitle }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="coming-soon-card">
        <div class="cs-glow"></div>
        <div class="cs-content">
          <div class="cs-icon-wrapper">
            <q-icon :name="icon" size="56px" :style="{ color: iconColor }" />
          </div>
          <h2 class="cs-title">Próximamente</h2>
          <p class="cs-text">
            El módulo de <strong>{{ title }}</strong> está en desarrollo.
            Estará disponible en una próxima versión del sistema.
          </p>
          <div class="cs-badge">
            <q-icon name="construction" size="14px" />
            En construcción
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'construction' },
  iconColor: { type: String, default: '#6366f1' },
  iconStyle: { type: String, default: 'background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border-color: rgba(99,102,241,0.3)' },
})
</script>

<style lang="scss" scoped>
@import 'src/css/module-page.scss';

.coming-soon-card {
  position: relative;
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 24px;
  overflow: hidden;
  padding: 80px 40px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cs-glow {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
  pointer-events: none;
}

.cs-content {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  position: relative; z-index: 1;
}

.cs-icon-wrapper {
  width: 100px; height: 100px; border-radius: 28px;
  background: rgba(255,255,255,0.04);
  border: 1px solid $border-color;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
}

.cs-title {
  margin: 0; font-size: 2rem; font-weight: 800;
  color: $text-primary; letter-spacing: -0.04em;
}

.cs-text {
  margin: 0; color: $text-muted; max-width: 380px;
  font-size: 1rem; line-height: 1.6;
  strong { color: $text-secondary; }
}

.cs-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 99px;
  background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.3);
  color: #fbbf24; font-size: 0.8rem; font-weight: 700;
  margin-top: 8px;
}
</style>
