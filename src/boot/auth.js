import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'stores/auth'

export default boot(({ router }) => {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const isGuestOnly = to.matched.some((record) => record.meta.guestOnly)

    // Ruta pública que NO requiere autenticación
    if (!requiresAuth && !isGuestOnly) {
      return next()
    }

    // Ruta exclusiva de invitados (login) — si ya está autenticado, ir al dashboard
    if (isGuestOnly) {
      if (authStore.isAuthenticated) {
        return next('/dashboard')
      }
      return next()
    }

    // Ruta que requiere autenticación
    if (!authStore.isAuthenticated) {
      return next('/login')
    }

    // Si tiene token pero aún no cargó el usuario, intentar cargarlo
    if (authStore.isAuthenticated && !authStore.user) {
      await authStore.fetchUser()
      // Si fetchUser falló, limpió el token y redirigió a login
      if (!authStore.isAuthenticated) {
        return next('/login')
      }
    }

    return next()
  })
})
