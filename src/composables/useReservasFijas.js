import { ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  getReservasFijas,
  createReservaFija,
} from 'src/services/reservaService'

// Mapeo de número de día a nombre en español
export const DIAS_SEMANA = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
  0: 'Dom',
}

export const DIAS_SEMANA_FULL = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  0: 'Domingo',
}

export function useReservasFijas() {
  const $q = useQuasar()
  const grilla = ref([]) // Array de { hora, dias_reservas: { 0..6: null | {...} } }
  const loading = ref(false)
  const saving = ref(false)

  /**
   * Carga la grilla de reservas fijas para una cancha
   * @param {number} sucursalId
   * @param {number} canchaId
   */
  async function fetchReservasFijas(sucursalId, canchaId) {
    if (!canchaId || !sucursalId) {
      grilla.value = []
      return
    }
    loading.value = true
    try {
      grilla.value = await getReservasFijas(sucursalId, canchaId)
    } catch (e) {
      $q.notify({ type: 'negative', message: e.response?.message || 'Error al cargar reservas fijas', icon: 'error' })
    } finally {
      loading.value = false
    }
  }

  async function guardarReservaFija(payload) {
    saving.value = true
    try {
      const resultado = await createReservaFija(payload)
      $q.notify({ type: 'positive', message: 'Reserva fija creada', icon: 'event_repeat' })
      return resultado
    } catch (e) {
      const errors = e.response?.data?.errors
      if (errors) {
        const firstError = Object.values(errors)[0]?.[0]
        $q.notify({ type: 'negative', message: firstError || 'Error de validación', icon: 'error' })
      } else {
        $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al crear reserva fija', icon: 'error' })
      }
      throw e
    } finally {
      saving.value = false
    }
  }

  return { grilla, loading, saving, fetchReservasFijas, guardarReservaFija, DIAS_SEMANA, DIAS_SEMANA_FULL }
}
