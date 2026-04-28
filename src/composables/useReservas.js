import { ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  getReservasCancha,
  getReserva,
  createReserva,
} from 'src/services/reservaService'

export function useReservas() {
  const $q = useQuasar()
  const reservasData = ref(null) // respuesta completa de /api/reservas/cancha
  const loading = ref(false)
  const saving = ref(false)

  /**
   * Carga ocupaciones de canchas para una sucursal y fecha
   * @param {number} sucursalId
   * @param {string} fecha  - "YYYY-MM-DD"
   */
  async function fetchReservas(sucursalId, fecha, tipoCanchaId) {
    loading.value = true
    try {
      reservasData.value = await getReservasCancha(sucursalId, fecha, tipoCanchaId)
    } catch (e) {
      $q.notify({ type: 'negative', message: e.response?.message || 'Error al cargar reservas', icon: 'error' })
    } finally {
      loading.value = false
    }
  }

  /**
   * Carga detalle de una reserva específica
   * @param {number} id
   */
  async function fetchDetalleReserva(id) {
    try {
      return await getReserva(id)
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al cargar detalle', icon: 'error' })
      throw e
    }
  }

  async function guardarReserva(payload) {
    saving.value = true
    try {
      const resultado = await createReserva(payload)
      $q.notify({ type: 'positive', message: 'Reserva creada exitosamente', icon: 'event_available' })
      return resultado
    } catch (e) {
      const errors = e.response?.data?.errors
      if (errors) {
        const firstError = Object.values(errors)[0]?.[0]
        $q.notify({ type: 'negative', message: firstError || 'Error de validación', icon: 'error' })
      } else {
        $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al crear reserva', icon: 'error' })
      }
      throw e
    } finally {
      saving.value = false
    }
  }

  return { reservasData, loading, saving, fetchReservas, fetchDetalleReserva, guardarReserva }
}
