import { ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  getCanchas,
  createCancha,
  updateCancha,
  toggleCanchaEstado,
  deleteCancha,
} from 'src/services/canchaService'

export function useCanchas() {
  const $q = useQuasar()
  const grupos = ref([]) // Array de { id, nombre, canchas[] }
  const loading = ref(false)
  const saving = ref(false)

  /** Carga todas las canchas agrupadas por sucursal */
  async function fetchCanchas() {
    loading.value = true
    try {
      grupos.value = await getCanchas()
    } catch (e) {
      $q.notify({ type: 'negative', message: e.response?.message || 'Error al cargar las canchas', icon: 'error' })
    } finally {
      loading.value = false
    }
  }

  /**
   * Retorna las canchas de una sucursal específica
   * @param {number} sucursalId
   */
  function canchasDeSucursal(sucursalId) {
    const grupo = grupos.value.find((g) => g.id === sucursalId)
    return grupo?.canchas ?? []
  }

  async function saveCancha(payload) {
    saving.value = true
    try {
      let resultado
      if (payload.id) {
        resultado = await updateCancha(payload)
        $q.notify({ type: 'positive', message: 'Cancha actualizada', icon: 'check_circle' })
      } else {
        resultado = await createCancha(payload)
        $q.notify({ type: 'positive', message: 'Cancha creada', icon: 'add_task' })
      }
      // Refrescar para mantener consistencia
      await fetchCanchas()
      return resultado
    } catch (e) {
      const msg = e.response?.message || 'Error al guardar la cancha'
      $q.notify({ type: 'negative', message: msg, icon: 'error' })
      throw e
    } finally {
      saving.value = false
    }
  }

  async function cambiarEstadoCancha(cancha) {
    try {
      await toggleCanchaEstado(cancha.id)
      await fetchCanchas()
      $q.notify({ type: 'info', message: 'Estado de cancha actualizado', icon: 'swap_horiz' })
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al cambiar estado', icon: 'error' })
      throw e
    }
  }

  async function eliminarCancha(cancha) {
    return new Promise((resolve, reject) => {
      $q.dialog({
        title: 'Eliminar Cancha',
        message: `¿Confirmas la eliminación de "${cancha.nombre}"?`,
        persistent: true,
        dark: true,
        ok: { label: 'Eliminar', push: true, color: 'negative' },
        cancel: { label: 'Cancelar', flat: true, color: 'white' },
      }).onOk(async () => {
        try {
          await deleteCancha(cancha.id)
          await fetchCanchas()
          $q.notify({ type: 'negative', message: 'Cancha eliminada', icon: 'delete' })
          resolve()
        } catch (e) {
          $q.notify({ type: 'negative', message: 'Error al eliminar', icon: 'error' })
          reject(e)
        }
      }).onCancel(() => resolve())
    })
  }

  return { grupos, loading, saving, fetchCanchas, canchasDeSucursal, saveCancha, cambiarEstadoCancha, eliminarCancha }
}
