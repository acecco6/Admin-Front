import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { cobrarReserva, cobrarTienda } from 'src/services/pagoService'

export function usePagos() {
  const $q = useQuasar()
  const saving = ref(false)

  async function pagarReserva(payload) {
    saving.value = true
    try {
      const result = await cobrarReserva(payload)
      $q.notify({ type: 'positive', message: 'Pago registrado correctamente', icon: 'payments' })
      return result
    } catch (e) {
      const errors = e.response?.data?.errors
      const msg = errors ? Object.values(errors)[0]?.[0] : e.response?.data?.message || 'Error al registrar el pago'
      $q.notify({ type: 'negative', message: msg, icon: 'error' })
      throw e
    } finally {
      saving.value = false
    }
  }

  async function pagarTienda(payload) {
    saving.value = true
    try {
      const result = await cobrarTienda(payload)
      $q.notify({ type: 'positive', message: 'Pago registrado correctamente', icon: 'payments' })
      return result
    } catch (e) {
      const errors = e.response?.data?.errors
      const msg = errors ? Object.values(errors)[0]?.[0] : e.response?.data?.message || 'Error al registrar el pago'
      $q.notify({ type: 'negative', message: msg, icon: 'error' })
      throw e
    } finally {
      saving.value = false
    }
  }

  return { saving, pagarReserva, pagarTienda }
}
