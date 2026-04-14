import { Notify } from 'quasar'
import { api } from './api'
import { clearAuthToken, getAuthToken } from './token'

export function installAuthRequestInterceptor() {
  api.interceptors.request.use((config) => {
    const token = getAuthToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  })
}

export function installErrorResponseInterceptor(router) {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status

      if (status === 401) {
        clearAuthToken()
        delete api.defaults.headers.common['Authorization']

        if (router.currentRoute.value.path !== '/login') {
          router.push('/login')
          Notify.create({
            type: 'negative',
            message: 'Sesión expirada. Por favor iniciá sesión nuevamente.',
            icon: 'lock',
            position: 'top-right',
            timeout: 4000,
          })
        }
      } else if (status === 403) {
        Notify.create({
          type: 'warning',
          message: 'No tenés permisos para realizar esta acción.',
          icon: 'block',
          position: 'top-right',
          timeout: 4000,
        })
      } else if (status === 422) {
        // Errores de validación — el componente los maneja
      } else if (status >= 500) {
        Notify.create({
          type: 'negative',
          message: 'Error del servidor. Intentá de nuevo más tarde.',
          icon: 'error',
          position: 'top-right',
          timeout: 4000,
        })
      }

      return Promise.reject(error)
    },
  )
}
