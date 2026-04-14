<template>
  <q-layout view="lHh Lpr lFf" class="premium-layout">
    <!-- SIDEBAR ESTILO PIQUÉ / MODERNO -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :mini="miniState"
      class="premium-sidebar"
      :width="280"
    >
      <div class="brand-zone" :class="{ 'mini-mode': miniState }">
        <template v-if="!miniState">
          <div class="brand-icon-wrapper">
            <q-icon name="view_in_ar" class="brand-icon" />
          </div>
          <span class="brand-text">Pulse<span class="brand-highlight">Pro</span></span>
          <q-space />
        </template>
        <q-btn
          flat
          dense
          round
          :icon="miniState ? 'menu' : 'menu_open'"
          class="menu-toggle-btn-sidebar"
          @click="toggleLeftDrawer"
        />
      </div>

      <div class="menu-zone">
        <q-list class="premium-nav">
          <div class="nav-label" v-if="!miniState">MENÚ PRINCIPAL</div>

          <q-item
            clickable
            v-ripple
            :to="{ name: 'dashboard' }"
            exact
            active-class="nav-item--active"
            class="nav-item"
          >
            <q-item-section avatar>
              <q-icon name="grid_view" />
            </q-item-section>
            <q-item-section class="nav-text">Dashboard</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :to="{ name: 'profesiones' }"
            exact
            active-class="nav-item--active"
            class="nav-item"
          >
            <q-item-section avatar>
              <q-icon name="work_outline" />
            </q-item-section>
            <q-item-section class="nav-text">Profesiones</q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- ZONA DE USUARIO EN EL BOTTOM (ESTILO MODERNO) -->
      <div class="user-zone" v-if="!miniState">
        <div class="user-card" @click="logout">
          <q-avatar size="38px" class="user-avatar">
            <img src="https://ui-avatars.com/api/?name=Ad&background=6366f1&color=fff&bold=true" />
          </q-avatar>
          <div class="user-info">
            <div class="user-name">{{ authStore.user?.name || 'Administrador' }}</div>
            <div class="user-role">Cerrar Sesión</div>
          </div>
          <q-icon name="logout" color="negative" size="20px" class="logout-icon" />
        </div>
      </div>
      <!-- USUARIO MINI -->
      <div class="user-zone-mini" v-else @click="logout">
        <q-icon name="logout" color="negative" size="22px" />
      </div>
    </q-drawer>

    <!-- CONTENEDOR DE PÁGINAS -->
    <q-page-container class="premium-page-container">
      <div class="page-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="page-transition" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const leftDrawerOpen = ref(true)
const miniState = ref(false)
const router = useRouter()
const authStore = useAuthStore()

function toggleLeftDrawer() {
  if ($q.screen.lt.md) {
    leftDrawerOpen.value = !leftDrawerOpen.value
    miniState.value = false
  } else {
    miniState.value = !miniState.value
  }
}

function logout() {
  $q.dialog({
    title: 'Cerrar Sesión',
    message: '¿Estás seguro de que deseas salir del panel?',
    persistent: true,
    dark: true,
    ok: {
      label: 'Sí, Salir',
      push: true,
      color: 'negative',
    },
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'white',
    },
  }).onOk(async () => {
    $q.loading.show({
      message: 'Cerrando sesión...',
      spinnerColor: 'primary',
    })

    try {
      await authStore.logout()

      // Delay visual para suavizar la transición antes de redirigir
      setTimeout(() => {
        $q.loading.hide()
        router.push('/login')
      }, 700)
    } catch (error) {
      $q.loading.hide()
      $q.notify({
        type: 'negative',
        message: error.response.data.message,
        position: 'top-right',
      })
    }
  })
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* ══════════════════════════════════════
   REEMPLAZO TOTAL DEL LAYOUT AL ESTILO 2026 
   Inspirado en Vercel, Linear y Stripe
   ══════════════════════════════════════ */

.premium-layout {
  background-color: var(
    --q-dark-page,
    #0d0f1a
  ); /* Alineado exacto al fondo de los dashboards ($bg-deep) */
  color: #e2e8f0;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ════════════ SIDEBAR ULTRAPREMIUM ════════════ */
.premium-sidebar {
  background: #090b13 !important; /* Ligeramente gris azulado muy oscuro */
  border-right: 1px solid rgba(255, 255, 255, 0.04) !important;
  display: flex;
  flex-direction: column;
}

.brand-zone {
  height: 90px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 14px;
  transition: all 0.3s;

  &.mini-mode {
    justify-content: center;
    padding: 0;
  }
}

.brand-icon-wrapper {
  background: linear-gradient(135deg, #6366f1, #c084fc);
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.5);
  flex-shrink: 0;
}

.brand-icon {
  font-size: 20px;
  color: #ffffff;
}

.brand-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.04em;
}

.brand-highlight {
  color: #c084fc;
}

/* ════════════ MENU LIST ════════════ */
.menu-zone {
  flex: 1;
  padding: 12px;
  overflow-y: auto;

  /* Custom scrollbar para Webkit */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }
}

.nav-label {
  font-size: 0.65rem;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 12px 0 12px 14px;
}

.nav-item {
  border-radius: 10px;
  margin-bottom: 4px;
  color: #94a3b8;
  padding: 10px 14px;
  min-height: 44px;
  transition: all 0.2s ease-in-out;

  .q-item__section--avatar {
    min-width: 0;
    padding-right: 14px;
    .q-icon {
      font-size: 20px;
      transition: transform 0.2s;
    }
  }

  .nav-text {
    font-size: 0.9rem;
    font-weight: 600;
  }

  /* Hover apagado elegante */
  &:hover {
    color: #f1f5f9;
    background: rgba(255, 255, 255, 0.03);
    .q-icon {
      transform: scale(1.1);
      color: #f1f5f9;
    }
  }

  /* Estilo Pill con Glow en Active */
  &--active {
    background: rgba(99, 102, 241, 0.08); /* Fondo ínfimo primario */
    color: #e0e7ff; // Texto claro bluish

    /* Resplandor lateral izquierdo estilo stripe */
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 60%;
      width: 3px;
      background: #8b5cf6;
      border-radius: 0 4px 4px 0;
      box-shadow: 0 0 12px rgba(139, 92, 246, 0.8);
    }

    .q-icon {
      color: #8b5cf6;
    }
    .nav-text {
      color: #ffffff;
      font-weight: 700;
    }
  }
}

/* ════════════ ZONA DE USUARIO ════════════ */
.user-zone {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0%, transparent 100%);
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.08);
    .logout-icon {
      color: #ff3333;
      transform: translateX(2px);
    }
  }

  .user-avatar {
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .user-info {
    flex: 1;
    min-width: 0;
  }
  .user-name {
    font-size: 0.85rem;
    font-weight: 700;
    color: #f8fafc;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .user-role {
    font-size: 0.72rem;
    color: #f87171;
    font-weight: 600;
    margin-top: 1px;
    transition: color 0.2s;
  }
  .logout-icon {
    transition: all 0.2s;
  }
}

.user-zone-mini {
  display: flex;
  justify-content: center;
  padding: 24px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

/* BOTÓN TOGGLE DENTRO DEL SIDEBAR */
.menu-toggle-btn-sidebar {
  color: #64748b;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 4px;
  min-height: unset;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
    transform: scale(1.05);
  }
}

.premium-page-container {
  padding-top: 0 !important; /* Override quasar para usar verdaderamente fondo unificado */
}

.page-wrapper {
  padding: 0; /* Removido por completo, cada página (como el dashboard) ya tiene su propio padding. Esto arregla el borde negro vacío */
}

/* ════════════ ANIMACIÓN DE PAGINAS ════════════ */
.page-transition-enter-active,
.page-transition-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.page-transition-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.99);
}
.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.99);
  position: absolute;
}
</style>
