<template>
  <div class="login-wrapper">
    <!-- ══ COLUMNA IZQUIERDA — Branding ══ -->
    <div class="login-brand">
      <div class="login-bg">
        <div class="login-bg__orb login-bg__orb--1"></div>
        <div class="login-bg__orb login-bg__orb--2"></div>
        <div class="login-bg__orb login-bg__orb--3"></div>
      </div>

      <div class="login-brand__content">
        <div class="login-logo">
          <div class="login-logo__icon">
            <q-icon name="hexagon" size="36px" color="primary" />
          </div>
          <span class="login-logo__text">Admin Panel</span>
        </div>

        <h2 class="login-brand__tagline">Gestioná todo<br />desde un solo lugar.</h2>
        <p class="login-brand__desc">
          Panel de administración seguro,<br />rápido y fácil de usar.
        </p>

        <!-- Decoración de tarjetas flotantes -->
        <div class="brand-cards">
          <div class="brand-card brand-card--1">
            <q-icon name="bar_chart" size="20px" color="primary" />
            <span>Reportes en tiempo real</span>
          </div>
          <div class="brand-card brand-card--2">
            <q-icon name="shield" size="20px" color="positive" />
            <span>Acceso seguro con token</span>
          </div>
          <div class="brand-card brand-card--3">
            <q-icon name="people" size="20px" color="warning" />
            <span>Gestión de usuarios</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ COLUMNA DERECHA — Formulario ══ -->
    <div class="login-form-panel">
      <div class="login-card" :class="{ 'login-card--shake': shake }">
        <h1 class="login-title">Bienvenido de nuevo</h1>
        <p class="login-subtitle">Iniciá sesión en tu cuenta</p>

        <!-- Formulario -->
        <q-form @submit.prevent="handleLogin" class="login-form">
          <!-- Email -->
          <div class="form-group" :class="{ 'form-group--error': errors.email }">
            <label class="form-label">Correo electrónico</label>
            <div class="form-input-wrap">
              <q-icon name="mail_outline" class="form-input-icon" />
              <input
                id="login-email"
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="tu@email.com"
                autocomplete="email"
                :disabled="loading"
              />
            </div>
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <!-- Contraseña -->
          <div class="form-group" :class="{ 'form-group--error': errors.password }">
            <label class="form-label">Contraseña</label>
            <div class="form-input-wrap">
              <q-icon name="lock_outline" class="form-input-icon" />
              <input
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="••••••••"
                autocomplete="current-password"
                :disabled="loading"
              />
              <button
                type="button"
                class="form-input-toggle"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" size="18px" />
              </button>
            </div>
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <!-- Recordarme -->
          <div class="form-remember">
            <label class="remember-check">
              <input
                id="login-remember"
                v-model="form.remember"
                type="checkbox"
                class="remember-check__input"
              />
              <span class="remember-check__box"></span>
              <span class="remember-check__label">Recordarme</span>
            </label>
          </div>

          <!-- Error general -->
          <transition name="slide-down">
            <div v-if="generalError" class="login-general-error">
              <q-icon name="error_outline" size="18px" />
              {{ generalError }}
            </div>
          </transition>

          <!-- Botón -->
          <button
            id="login-submit"
            type="submit"
            class="login-btn"
            :disabled="loading"
            :class="{ 'login-btn--loading': loading }"
          >
            <span v-if="!loading" class="login-btn__text">
              <q-icon name="login" size="18px" />
              Iniciar sesión
            </span>
            <span v-else class="login-btn__spinner">
              <span class="spinner-ring"></span>
            </span>
          </button>
        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'
const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const loading = ref(false)
const showPassword = ref(false)
const shake = ref(false)
const generalError = ref('')

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const errors = reactive({
  email: '',
  password: '',
})

function clearErrors() {
  errors.email = ''
  errors.password = ''
  generalError.value = ''
}

function triggerShake() {
  shake.value = true
  setTimeout(() => (shake.value = false), 600)
}

async function handleLogin() {
  clearErrors()

  // Validación básica client-side
  let hasError = false
  if (!form.email) {
    errors.email = 'El correo es requerido.'
    hasError = true
  }
  if (!form.password) {
    errors.password = 'La contraseña es requerida.'
    hasError = true
  }
  if (hasError) {
    triggerShake()
    return
  }

  loading.value = true

  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      remember: form.remember,
    })

    $q.notify({
      type: 'positive',
      message: `¡Bienvenido ${authStore.user}!`,
      icon: 'waving_hand',
      position: 'top-right',
      timeout: 3000,
    })

    await router.push('/dashboard')
  } catch (err) {
    const status = err.response?.status
    const data = err.response?.data

    if (status === 422 && data?.error) {
      // Errores de validación de Laravel
      if (data.error.email) errors.email = data.error.email[0]
      if (data.error.password) errors.password = data.error.password[0]
    } else if (status === 401 || status === 422) {
      generalError.value = data?.message || 'Credenciales incorrectas.'
    } else {
      generalError.value = 'Error al conectar con el servidor.'
    }

    triggerShake()

    $q.notify({
      type: 'negative',
      message: generalError.value || 'Error al iniciar sesión.',
      icon: 'lock',
      position: 'top-right',
      timeout: 4000,
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
// ══════════════════════════════════════
// LAYOUT DOS COLUMNAS
// ══════════════════════════════════════
.login-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: $bg-deep;
}

// ══ COLUMNA IZQUIERDA — Branding ══
.login-brand {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
  background: linear-gradient(145deg, #0d0f1a 0%, #131629 60%, #1a1040 100%);

  // Ocultar en pantallas pequeñas
  @media (max-width: 768px) {
    display: none;
  }
}

.login-brand__content {
  position: relative;
  z-index: 1;
  max-width: 440px;
  width: 100%;
}

.login-brand__tagline {
  margin: 32px 0 12px;
  font-size: 2.6rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.04em;
  color: $text-primary;
}

.login-brand__desc {
  margin: 0 0 48px;
  font-size: 1rem;
  color: $text-muted;
  line-height: 1.6;
}

// ── Tarjetas flotantes de features ──
.brand-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.brand-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $border-color;
  border-radius: 12px;
  font-size: 0.88rem;
  color: $text-secondary;
  // cambiar blur ocupa muchos recursos
  // backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.05);
  transition:
    background 0.25s,
    transform 0.25s;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
    transform: translateX(6px);
  }

  &--1 {
    animation-delay: 0.15s;
  }
  &--2 {
    animation-delay: 0.28s;
  }
  &--3 {
    animation-delay: 0.41s;
  }
}

// ══ COLUMNA DERECHA — Formulario ══
.login-form-panel {
  width: 100%;
  max-width: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 48px;
  background: $bg-sidebar;
  border-left: 1px solid $border-color;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 32px 20px;
    border-left: none;
    background: $bg-deep;
  }
}

// ══════════════════════════════════════
// FONDO ANIMADO (dentro del panel brand)
// ══════════════════════════════════════
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;

  &__orb {
    position: absolute;
    border-radius: 50%;
    // cambiar blur ocupa muchos recursos
    // filter: blur(80px);
    background-color: rgba(255, 255, 255, 0.05);
    opacity: 0.3;
    animation: orb-float 8s ease-in-out infinite;

    &--1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, #6366f1, transparent);
      top: -120px;
      left: -100px;
      animation-delay: 0s;
    }

    &--2 {
      width: 380px;
      height: 380px;
      background: radial-gradient(circle, #8b5cf6, transparent);
      bottom: -80px;
      right: -60px;
      animation-delay: 3s;
    }

    &--3 {
      width: 280px;
      height: 280px;
      background: radial-gradient(circle, #4f46e5, transparent);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 5s;
      opacity: 0.2;
    }
  }
}

@keyframes orb-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.05);
  }
}

// ══════════════════════════════════════
// CARD DEL FORMULARIO
// ══════════════════════════════════════
.login-card {
  width: 100%;
  max-width: 420px;
  backface-visibility: hidden;
  &--shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-8px);
  }
  40% {
    transform: translateX(8px);
  }
  60% {
    transform: translateX(-5px);
  }
  80% {
    transform: translateX(5px);
  }
}

// ══════════════════════════════════════
// LOGO
// ══════════════════════════════════════
.login-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0;

  &__icon {
    width: 46px;
    height: 46px;
    background: rgba($primary, 0.15);
    border: 1px solid rgba($primary, 0.3);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__text {
    font-size: 1.1rem;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: -0.02em;
  }
}

// ══════════════════════════════════════
// TÍTULOS
// ══════════════════════════════════════
.login-title {
  margin: 32px 0 6px;
  font-size: 1.8rem;
  font-weight: 800;
  color: $text-primary;
  letter-spacing: -0.04em;
}

.login-subtitle {
  margin: 0 0 32px;
  font-size: 0.9rem;
  color: $text-muted;
}

// ══════════════════════════════════════
// FORMULARIO
// ══════════════════════════════════════
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--error .form-input-wrap {
    border-color: rgba($negative, 0.6);
    background: rgba($negative, 0.05);
  }
}

.form-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: $text-secondary;
  letter-spacing: 0.02em;
}

.form-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: $bg-input;
  border: 1px solid $border-color;
  border-radius: 10px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.15);
  }
}

.form-input-icon {
  position: absolute;
  left: 12px;
  color: $text-muted;
  font-size: 18px;
  pointer-events: none;
}

.form-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  padding: 13px 40px 13px 40px;
  font-size: 0.9rem;
  color: $text-primary;
  font-family: 'Inter', sans-serif;

  &::placeholder {
    color: $text-muted;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.form-input-toggle {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: $text-muted;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s;

  &:hover {
    color: $text-primary;
  }
}

.form-error {
  font-size: 0.75rem;
  color: $negative;
  padding-left: 2px;
}

// ══════════════════════════════════════
// RECORDARME
// ══════════════════════════════════════
.form-remember {
  display: flex;
  align-items: center;
  margin-top: -4px;
}

.remember-check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &__input {
    display: none;

    &:checked ~ .remember-check__box {
      background: $primary;
      border-color: $primary;

      &::after {
        opacity: 1;
        transform: rotate(45deg) scale(1);
      }
    }
  }

  &__box {
    width: 17px;
    height: 17px;
    border: 1.5px solid $border-color;
    border-radius: 4px;
    background: $bg-input;
    position: relative;
    transition: all 0.2s;
    flex-shrink: 0;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 4px;
      width: 5px;
      height: 8px;
      border: 2px solid #fff;
      border-top: none;
      border-left: none;
      transform: rotate(45deg) scale(0.5);
      opacity: 0;
      transition: all 0.15s;
    }
  }

  &__label {
    font-size: 0.82rem;
    color: $text-secondary;
    user-select: none;
  }
}

// ══════════════════════════════════════
// ERROR GENERAL
// ══════════════════════════════════════
.login-general-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba($negative, 0.1);
  border: 1px solid rgba($negative, 0.3);
  border-radius: 10px;
  color: $negative;
  font-size: 0.83rem;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// ══════════════════════════════════════
// BOTÓN LOGIN
// ══════════════════════════════════════
.login-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  font-size: 0.94rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
  margin-top: 4px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(99, 102, 241, 0.45);
    filter: brightness(1.08);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &__text {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.login-btn__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;

  &__orb {
    position: absolute;
    border-radius: 50%;
    // cambiar blur ocupa muchos recursos
    // filter: blur(80px);
    background-color: rgba(255, 255, 255, 0.05);
    opacity: 0.25;
    animation: orb-float 8s ease-in-out infinite;

    &--1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, #6366f1, transparent);
      top: -150px;
      left: -100px;
      animation-delay: 0s;
    }

    &--2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #8b5cf6, transparent);
      bottom: -100px;
      right: -80px;
      animation-delay: 3s;
    }

    &--3 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, #4f46e5, transparent);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 5s;
    }
  }
}

@keyframes orb-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.05);
  }
}

@keyframes orb-float-3 {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -55%) scale(1.08);
  }
}

// ══════════════════════════════════════
// CARD
// ══════════════════════════════════════
.login-card {
  width: 100%;
  max-width: 420px;
  background: $bg-card;
  border: 1px solid $border-color;
  border-radius: 20px;
  padding: 40px 36px;
  position: relative;
  z-index: 1;
  box-shadow:
    0 0 0 1px rgba(99, 102, 241, 0.08),
    0 24px 64px rgba(0, 0, 0, 0.6);
  transition: transform 0.3s ease; // Suaviza cambios base
  backface-visibility: hidden; // Evita parpadeos en animaciones
  perspective: 1000px;
  background-color: rgba(255, 255, 255, 0.05);

  &--shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-8px);
  }
  40% {
    transform: translateX(8px);
  }
  60% {
    transform: translateX(-5px);
  }
  80% {
    transform: translateX(5px);
  }
}

// ══════════════════════════════════════
// LOGO
// ══════════════════════════════════════
.login-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;

  &__icon {
    width: 44px;
    height: 44px;
    background: rgba($primary, 0.15);
    border: 1px solid rgba($primary, 0.3);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__text {
    font-size: 1.1rem;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: -0.02em;
  }
}

// ══════════════════════════════════════
// TÍTULOS
// ══════════════════════════════════════
.login-title {
  margin: 0 0 6px;
  font-size: 1.6rem;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: -0.03em;
}

.login-subtitle {
  margin: 0 0 28px;
  font-size: 0.9rem;
  color: $text-muted;
}

// ══════════════════════════════════════
// FORMULARIO
// ══════════════════════════════════════
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &--error .form-input-wrap {
    border-color: rgba($negative, 0.6);
    background: rgba($negative, 0.05);
  }
}

.form-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: $text-secondary;
  letter-spacing: 0.02em;
}

.form-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: $bg-input;
  border: 1px solid $border-color;
  border-radius: 10px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.15);
  }
}

.form-input-icon {
  position: absolute;
  left: 12px;
  color: $text-muted;
  font-size: 18px;
  pointer-events: none;
}

.form-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  padding: 12px 40px 12px 40px;
  font-size: 0.9rem;
  color: $text-primary;
  font-family: 'Inter', sans-serif;

  &::placeholder {
    color: $text-muted;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.form-input-toggle {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: $text-muted;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s;

  &:hover {
    color: $text-primary;
  }
}

.form-error {
  font-size: 0.75rem;
  color: $negative;
  padding-left: 2px;
}

// ══════════════════════════════════════
// RECORDARME
// ══════════════════════════════════════
.form-remember {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -4px;
}

.remember-check {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &__input {
    display: none;

    &:checked ~ .remember-check__box {
      background: $primary;
      border-color: $primary;

      &::after {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  &__box {
    width: 16px;
    height: 16px;
    border: 1.5px solid $border-color;
    border-radius: 4px;
    background: $bg-input;
    position: relative;
    transition: all 0.2s;
    flex-shrink: 0;

    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 4px;
      width: 5px;
      height: 8px;
      border: 2px solid #fff;
      border-top: none;
      border-left: none;
      transform: rotate(45deg) scale(0.5);
      opacity: 0;
      transition: all 0.15s;
    }
  }

  &__label {
    font-size: 0.82rem;
    color: $text-secondary;
    user-select: none;
  }
}

// ══════════════════════════════════════
// ERROR GENERAL
// ══════════════════════════════════════
.login-general-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba($negative, 0.1);
  border: 1px solid rgba($negative, 0.3);
  border-radius: 10px;
  color: $negative;
  font-size: 0.83rem;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// ══════════════════════════════════════
// BOTÓN LOGIN
// ══════════════════════════════════════
.login-btn {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: #fff;
  font-size: 0.92rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
  margin-top: 4px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(99, 102, 241, 0.45);
    filter: brightness(1.08);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &__text {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

// ══════════════════════════════════════
// SPINNER DEL BOTÓN
// ══════════════════════════════════════
.login-btn__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// ══════════════════════════════════════
// RESPONSIVE
// ══════════════════════════════════════
@media (max-width: 480px) {
  .login-card {
    padding: 28px 20px;
    border-radius: 16px;
  }
}
</style>
